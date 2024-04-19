import OpenAI from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import Irys from "@irys/sdk";
import fs from "fs";

const privateKey = process.env.PRIVATE_KEY;
const infuraId = process.env.INFURA_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

const irys = new Irys({
  url: "https://devnet.irys.xyz",
  token: "ethereum",
  key: privateKey,
  config: {
    providerUrl: `https://sepolia.infura.io/v3/${infuraId}`,
  },
});

async function generateImage(prompt) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create an image that visually represents this story: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    // log the prompt passed to the image generation API
    console.log(
      "Prompt passed to the IMAGE generation API:",
      `Create an image that visually represents this story: ${prompt}`
    );
    return response.data[0].url; // Returning URL of the generated image
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw new Error("Image generation failed.");
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText, page = 1, forkId = "main" } = req.body;

    try {
      let storyContent = "";
      let pageIndex = 1;
      let currentForkId = forkId;

      while (true) {
        try {
          const prevContent = await readFile(
            join(
              process.cwd(),
              "story",
              `story-${currentForkId}-${pageIndex}.json`
            ),
            "utf8"
          );
          const prevData = JSON.parse(prevContent);
          storyContent += `${prevData.content}\n\n`;
          pageIndex++;
        } catch (error) {
          break;
        }
      }

      console.log("PAGEINDEX:", pageIndex);

      const promptText =
        pageIndex > 1
          ? `Your role is to continue the story inspired by the following user input. The story already has started and it currently has ${
              pageIndex - 1
            } pages. Here are the current entire story text:\n\n${storyContent}. ##### Continue the story inspired by the following user input, ensuring your output has a limit of 300 characters:\n\n${inputText}`
          : `Your role is to create a story inspired by an input from the user, your output should have a limit of 300 characters. The input from the user is:\n\n${inputText}`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: promptText },
          { role: "user", content: inputText },
        ],
        model: "gpt-4-turbo",
      });

      // log the prompt passed to the generate the text story
      console.log("Prompt passed to the TEXT generation API:", promptText);

      storyContent = completion.choices[0].message.content;
      const imagePrompt = `${storyContent}`;
      const imageUrl = await generateImage(imagePrompt);

      const storyData = {
        content: storyContent,
        page: pageIndex,
        forkId: currentForkId,
        image: imageUrl, // Add the image URL to the story data
        timestamp: new Date().toISOString(),
      };

      const filePath = join(
        process.cwd(),
        "story",
        `story-${currentForkId}-${pageIndex}.json`
      );
      await writeFile(filePath, JSON.stringify(storyData, null, 2));

      const dataBuffer = Buffer.from(JSON.stringify(storyData));
      const transaction = await irys.upload(dataBuffer, {
        tags: { "Content-Type": "application/json" },
      });

      if (transaction && transaction.id) {
        console.log("Upload successful. Transaction ID:", transaction.id);
        res.status(200).json({
          result: storyContent,
          image: imageUrl,
          page: pageIndex,
          forkId: currentForkId,
          arweaveId: transaction.id,
          arweaveLink: `https://arweave.net/${transaction.id}`,
        });
      } else {
        console.error("Upload to Arweave failed.");
        res.status(500).json({ error: "Upload to Arweave failed." });
      }
    } catch (error) {
      console.error("Error in processing:", error);
      res.status(500).json({ error: "Failed to process your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

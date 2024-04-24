import OpenAI from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import Irys from "@irys/sdk";

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
      prompt: `Create an image that visually represents that: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    console.log(
      "Prompt passed to the IMAGE generation API:",
      `Create an image that visually represents that: ${prompt}`
    );

    // log response
    console.log("Image generation response:", response);
    return response.data[0].url;
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw new Error("Image generation failed.");
  }
}

export default async function handler(req, res) {
  const { inputText, page = 1, forkId = "main", isNewFork = false } = req.body;
  let storyContent = "";
  let pageIndex = page;
  let currentForkId = forkId;

  // Fetch previous story parts until the current page or the last existing page
  for (let i = 1; i < pageIndex; i++) {
    const filePath = join(
      process.cwd(),
      "story",
      `story-${currentForkId}-${i}.json`
    );
    try {
      const prevContent = await readFile(filePath, "utf8");
      const prevData = JSON.parse(prevContent);
      storyContent += `${prevData.content}\n\n`;
    } catch (error) {
      // Log and continue if reading fails
      console.error("Error reading previous pages:", error);
      break;
    }
  }

  // print page index
  console.log("Page index:", pageIndex);

  // Determine if this is a new fork and handle `forkId` appropriately
  if (isNewFork) {
    currentForkId = `${forkId}-fork${new Date().getTime()}`;
  }

  let promptText =
    pageIndex === 1
      ? `Your role is to create a story inspired by an input from the user, your output should have a limit of 300 characters. The input from the user is:\n\n${inputText}`
      : `Your role is to continue a story. Here are the current entire story text:\n\n${storyContent}##### Continue the story inspired by the following user input, ensuring your output has a limit of 300 characters:\n\n${inputText}`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: promptText },
        { role: "user", content: inputText },
      ],
      model: "gpt-4-turbo",
    });

    const newStoryContent = completion.choices[0].message.content;
    const imageUrl = await generateImage(newStoryContent);

    const newStoryData = {
      content: newStoryContent,
      page: pageIndex,
      forkId: currentForkId,
      image: imageUrl,
      timestamp: new Date().toISOString(),
    };

    const newFilePath = join(
      process.cwd(),
      "story",
      `story-${currentForkId}-${pageIndex}.json`
    );
    await writeFile(newFilePath, JSON.stringify(newStoryData, null, 2));

    const dataBuffer = Buffer.from(JSON.stringify(newStoryData));
    const transaction = await irys.upload(dataBuffer, {
      tags: { "Content-Type": "application/json" },
    });

    if (transaction && transaction.id) {
      res.status(200).json({
        result: newStoryContent,
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
}

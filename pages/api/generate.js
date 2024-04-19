import OpenAI from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import Irys from "@irys/sdk";
import fs from "fs";

const privateKey = process.env.PRIVATE_KEY;
const infuraId = process.env.INFURA_ID;

const irys = new Irys({
  url: "https://devnet.irys.xyz",
  token: "ethereum",
  key: privateKey,
  config: {
    providerUrl: `https://sepolia.infura.io/v3/${infuraId}`,
  },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText, page = 1, forkId = "main" } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
          storyContent += `Page ${pageIndex}: ${prevData.content}\n\n`;
          pageIndex++;
        } catch (error) {
          break;
        }
      }

      const prompt =
        pageIndex > 1
          ? `The story already has started and it currently has ${
              pageIndex - 1
            } pages. Here are the current pages of the story:\n\n${storyContent}Your role is to continue the story inspired by the following user input, ensuring your output has a limit of 200 characters:\n\n${inputText}`
          : `Your role is to create a history inspired by an input from the user, your output should have a limit of 200 characters. The input from the user is:\n\n${inputText}`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: inputText },
        ],
        model: "gpt-4-turbo",
      });

      storyContent = completion.choices[0].message.content;
      const filename = `story-${currentForkId}-${pageIndex}.json`;
      const storyData = { content: storyContent, page: pageIndex };

      const filePath = join(process.cwd(), "story", filename);
      await writeFile(filePath, JSON.stringify(storyData, null, 2));

      const dataBuffer = Buffer.from(JSON.stringify(storyData));
      const transaction = await irys.upload(dataBuffer, {
        tags: { "Content-Type": "application/json" },
      });

      // Log transaction details
      console.log("Upload successful. Transaction ID:", transaction.id);

      res.status(200).json({
        result: storyContent,
        page: pageIndex,
        forkId: currentForkId,
        arweaveId: transaction.id,
      });
    } catch (error) {
      console.error("Error in processing:", error);
      res.status(500).json({ error: "Failed to process your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

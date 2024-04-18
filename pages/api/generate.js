import OpenAI from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText, page = 1 } = req.body; // Now accept 'inputText' and 'page'

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      // Load all previous pages if they exist
      let storyContent = "";
      for (let i = 1; i < page; i++) {
        try {
          const prevContent = await readFile(
            join(process.cwd(), "story", `story-${i}.json`),
            "utf8"
          );
          const prevData = JSON.parse(prevContent);
          storyContent += `Page ${i}: ${prevData.content}\n\n`;
        } catch (error) {
          console.log(`Failed to read previous page ${i}:`, error);
        }
      }

      // Build a new prompt including all previous pages
      const prompt = `Your role is to create a history inspired by an input from the user, your output should have a limit of 200 characters. The story already has started and it currently has ${
        page - 1
      } pages. Here are the current pages of the story:\n\n${storyContent}Continue the story inspired by the following user input: ${inputText}`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: inputText,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      storyContent = completion.choices[0].message.content;
      const filename = `story-${page}.json`;
      const storyData = {
        content: storyContent,
        page: page,
      };

      // Save the story as a JSON file in the 'story' directory
      await writeFile(
        join(process.cwd(), "story", filename),
        JSON.stringify(storyData, null, 2)
      );

      res.status(200).json({ result: storyContent, page: page });
    } catch (error) {
      console.error("Error calling OpenAI or writing file:", error);
      res.status(500).json({ error: "Failed to process your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

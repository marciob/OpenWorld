import OpenAI from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText, page = 1, forkId = "main" } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      let storyContent = "";
      let pageIndex = 1;
      let currentForkId = forkId;

      // Attempt to load previous pages for the current fork
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
          break; // No more pages are found, break the loop
        }
      }

      // Generate the appropriate prompt based on the story context
      let prompt = "";
      if (pageIndex > 1) {
        // Continue an existing story
        prompt = `The story already has started and it currently has ${
          pageIndex - 1
        } pages. Here are the current pages of the story:\n\n${storyContent}Your role is to continue the story inspired by the following user input, ensuring your output has a limit of 200 characters:\n\n${inputText}`;
      } else {
        // Start a new story
        prompt = `Your role is to create a history inspired by an input from the user, your output should have a limit of 200 characters. The input from the user is:\n\n${inputText}`;
      }

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: inputText },
        ],
        model: "gpt-3.5-turbo",
      });

      storyContent = completion.choices[0].message.content;
      const filename = `story-${currentForkId}-${pageIndex}.json`;
      const storyData = {
        content: storyContent,
        page: pageIndex,
      };

      // Save the story as a JSON file in the 'story' directory
      await writeFile(
        join(process.cwd(), "story", filename),
        JSON.stringify(storyData, null, 2)
      );

      res
        .status(200)
        .json({ result: storyContent, page: pageIndex, forkId: currentForkId });
    } catch (error) {
      console.error("Error calling OpenAI or writing file:", error);
      res.status(500).json({ error: "Failed to process your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { prompt } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Your role is to create a history inspired by an input from the user, with a limit of 200 characters. The input from the user is:",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
      });

      res.status(200).json({ result: completion.choices[0].message.content });
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      res.status(500).json({ error: "Failed to fetch response from OpenAI" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

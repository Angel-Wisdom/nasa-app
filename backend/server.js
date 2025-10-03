import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Summarizer route
app.post("/api/summarize", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ error: "No content provided" });

    const prompt = `
    Summarize the following NASA bioscience publication text into 3-5 bullet points.
    Each point must be a clear scientific insight.

    Title: ${title}
    Text: ${content}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json({ title, summary: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

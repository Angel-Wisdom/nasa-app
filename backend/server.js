import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Load service account JSON
const serviceAccountPath = path.resolve("./serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // OR uncomment and use a service account:
    // credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

// ✅ Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* -------------------------
   📘 ROUTES
--------------------------*/

// ✅ 1. Get all publications
app.get("/api/publications", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const snapshot = await db.collection("publications").limit(limit).get();

    const papers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(papers);
  } catch (err) {
    console.error("Error fetching publications:", err);
    res.status(500).json({ error: "Failed to fetch publications" });
  }
});

// ✅ 2. Get paper details by ID
app.get("/api/paper/:id", async (req, res) => {
  try {
    const doc = await db.collection("publications").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching paper:", err);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// ✅ 3. Generate personalized summary
app.post("/api/summarize", async (req, res) => {
  try {
    const { keyword, level, purpose, paperId } = req.body;
    if (!paperId) return res.status(400).json({ error: "Missing paperId" });

    const doc = await db.collection("publications").doc(paperId).get();
    if (!doc.exists) return res.status(404).json({ error: "Paper not found" });

    const { title, excerpt, summary } = doc.data();

    const prompt = `
You are an AI assistant helping users explore NASA bioscience research.
Generate a **personalized summary** for the following user context:

User input:
- Keyword/topic of interest: ${keyword || "general"}
- Level of detail: ${level || "general audience"}
- Purpose: ${purpose || "general learning"}

Paper title: ${title}

Paper content:
${excerpt || summary || "No excerpt available"}

Instructions:
- Write 3–6 bullet points.
- Adjust technical depth according to user level.
- Focus on content relevant to the keyword and purpose.
- Keep language clear and engaging.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content.trim();
    res.json({ summary: aiResponse });
  } catch (err) {
    console.error("Error generating summary:", err);
    res.status(500).json({ error: "Failed to generate personalized summary" });
  }
});

// ✅ Server start
app.listen(5001, () => console.log("✅ Server running on port 5001"));

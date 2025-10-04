// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Firebase admin init (same serviceAccount file)
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve("./serviceAccountKey.json"), "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// GET /api/publications  (paged)
app.get("/api/publications", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "50", 10);
    const snapshot = await db.collection("publications").orderBy("createdAt", "desc").limit(limit).get();
    const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/paper/:id
app.get("/api/paper/:id", async (req, res) => {
  try {
    const doc = await db.collection("publications").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

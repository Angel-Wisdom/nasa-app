// backend/import.js
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import fetch from "node-fetch";
import * as pdf from "pdf-parse";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import dotenv from "dotenv";
import OpenAI from "openai";
import admin from "firebase-admin";

dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

const CONCURRENCY = parseInt(process.env.CONCURRENCY || "3", 10);

// Initialize OpenAI client
const client = new OpenAI({ apiKey: OPENAI_KEY });

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Missing serviceAccountKey.json at backend/serviceAccountKey.json");
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const limit = pLimit(CONCURRENCY);

function loadCSV(csvPath) {
  const raw = fs.readFileSync(csvPath, "utf8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  return records;
}

async function fetchUrlText(url) {
  try {
    const res = await fetch(url, { timeout: 30000 });
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const buffer = await res.arrayBuffer();
    if (contentType.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
      const data = await pdf(Buffer.from(buffer));
      return { text: data.text, type: "pdf" };
    } else {
      const html = Buffer.from(buffer).toString("utf8");
      return { text: html, type: "html" };
    }
  } catch (err) {
    console.warn(`Failed fetch ${url}: ${err.message}`);
    return { text: null, type: null };
  }
}

function extractFromHtml(html) {
  const $ = cheerio.load(html);

  // First try headings that match Results / Conclusion
  const wantedHeadings = ["results", "result", "discussion", "conclusion", "conclusions", "results and discussion"];
  let collected = [];

  $("h1,h2,h3,h4,h5").each((i, el) => {
    const h = $(el).text().trim().toLowerCase();
    if (wantedHeadings.some(w => h.includes(w))) {
      // collect following sibling paragraphs until next heading
      let chunk = $(el).text().trim() + "\n";
      let node = el.next;
      while (node) {
        const tag = node.tagName ? node.tagName.toLowerCase() : "";
        if (["h1","h2","h3","h4","h5"].includes(tag)) break;
        chunk += $(node).text ? $(node).text() + "\n" : "";
        node = node.next;
      }
      collected.push(chunk);
    }
  });

  if (collected.length > 0) return collected.join("\n\n");

  // fallback: use last several paragraphs
  const paragraphs = $("p").toArray().map(p => $(p).text()).filter(Boolean);
  if (paragraphs.length) {
    const last = paragraphs.slice(-8).join("\n\n");
    if (last.length > 200) return last;
  }

  // last fallback: whole text
  return $.root().text().slice(-8000) || "";
}

function extractFromPdfText(text) {
  const lines = text.split("\n");
  const wanted = ["results", "result", "discussion", "conclusion", "conclusions"];
  let collecting = false;
  let buffer = [];
  let sections = [];

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim();
    const low = ln.toLowerCase();
    if (wanted.some(w => low === w || low.startsWith(w + " ") || low.includes(w + ":"))) {
      collecting = true;
      buffer = [ln];
      continue;
    }
    if (collecting) {
      if (ln && ln === ln.toUpperCase() && ln.length < 120 && ln.length > 1) {
        sections.push(buffer.join("\n"));
        buffer = [];
        collecting = false;
        if (wanted.some(w => ln.toLowerCase().includes(w))) { collecting = true; buffer.push(ln); }
      } else {
        buffer.push(ln);
      }
    }
  }
  if (buffer.length) sections.push(buffer.join("\n"));
  const joined = sections.join("\n\n");
  return (joined && joined.length > 200) ? joined : text.slice(-4000);
}

async function summarizeWithOpenAI(title, snippet) {
  const cut = snippet.length > 20000 ? snippet.slice(0, 20000) : snippet;
  const prompt = `You are an assistant that summarizes NASA bioscience publications for mission planners and scientists.
Summarize the following Results + Conclusions into 3-5 short actionable bullet points (8-18 words each). Keep bullets concise and focused on actionable outcomes.

Title: ${title}

Text:
${cut}

Output format:
- Bullet 1
- Bullet 2
- Bullet 3
`;
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 400,
  });
  return resp.choices[0].message.content.trim();
}

async function processRow(row, idx) {
  const title = row.Title || row.title || Object.values(row)[0] || `paper-${idx+1}`;
  const link = row.Link || row.link || row.URL || row.Url;
  if (!link) {
    console.warn(`Row ${idx+1} missing Link - skipping`);
    return;
  }

  // Check if already in Firestore by link
  const coll = db.collection("publications");
  const q = await coll.where("link", "==", link).limit(1).get();
  if (!q.empty) {
    console.log(`Already processed: ${title}`);
    return;
  }

  console.log(`Fetching: ${title} → ${link}`);
  const fetched = await fetchUrlText(link);
  if (!fetched.text) {
    console.warn(`Failed to fetch ${link}`);
    await coll.add({ title, link, fetched: false, updatedAt: new Date().toISOString() });
    return;
  }

  let excerpt = "";
  if (fetched.type === "html") excerpt = extractFromHtml(fetched.text);
  else if (fetched.type === "pdf") excerpt = extractFromPdfText(fetched.text);
  else excerpt = fetched.text.slice(0, 8000);

  if (!excerpt || excerpt.length < 80) excerpt = (fetched.text || "").slice(-3000);

  try {
    const summary = await summarizeWithOpenAI(title, excerpt);
    // save to Firestore
    const doc = {
      title,
      link,
      summary,
      excerpt: excerpt.slice(0, 4000),
      fetched: true,
      createdAt: new Date().toISOString(),
    };
    await db.collection("publications").add(doc);
    console.log(`Saved: ${title}`);
  } catch (err) {
    console.error("OpenAI error:", err.message || err);
    await db.collection("publications").add({
      title, link, fetched: true, error: String(err), createdAt: new Date().toISOString()
    });
  }
}

async function main() {
  const csvArg = process.argv[2];
  if (!csvArg) {
    console.error("Usage: node import.js path/to/publications.csv");
    process.exit(1);
  }
  const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(process.cwd(), csvArg);
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    process.exit(1);
  }

  const records = parse(fs.readFileSync(csvPath, "utf8"), { columns: true, skip_empty_lines: true });

  const tasks = records.map((r, i) => limit(() => processRow(r, i)));
  await Promise.all(tasks);
  console.log("Import complete.");
}

main().catch(err => {
  console.error("Fatal:", err);
});

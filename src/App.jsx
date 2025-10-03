import { useState } from "react";
import axios from "axios";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!content) {
      alert("Please enter text to summarize.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const res = await axios.post("/api/summarize", { title, content });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      alert("Error fetching summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>🚀 NASA AI Summarizer</h1>

      <input
        type="text"
        placeholder="Enter paper title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Paste Results + Conclusion here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", height: "150px", padding: "10px", marginBottom: "10px" }}
      />

      <button
        onClick={handleSummarize}
        style={{ padding: "10px 20px", background: "blue", color: "white", border: "none" }}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {summary && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f4f4f4" }}>
          <h2>Summary</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{summary}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

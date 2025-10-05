import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import KeywordPapersList from "./KeywordPapersList";
import "./KeywordExplorer.css";

export default function KeywordExplorer() {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://keyword-backend-4na7.onrender.com/api";

  // Fetch all keywords
  useEffect(() => {
    fetch(`${API_BASE}/keywords`)
      .then((res) => res.json())
      .then(setKeywords)
      .catch((err) => console.error("Error fetching keywords:", err));
  }, []);

  // Fetch papers by keyword
  const fetchPapers = async () => {
    if (!selectedKeyword) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/papers?keyword=${selectedKeyword}`);
      const data = await res.json();
      setPapers(data);
    } catch (err) {
      console.error("Error fetching papers:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="keyword-explorer">
      <h1 className="page-title">🔎 Keyword Explorer</h1>
      <p className="page-subtitle">
        Choose a keyword to view related research papers from the NASA
        BioScience dataset.
      </p>

      <div className="search-bar">
        <select
          className="keyword-select"
          value={selectedKeyword}
          onChange={(e) => setSelectedKeyword(e.target.value)}
        >
          <option value="">-- Select a Keyword --</option>
          {keywords.map((k, i) => (
            <option key={i} value={k}>
              {k}
            </option>
          ))}
        </select>

        <button className="search-btn" onClick={fetchPapers}>
          <Search className="icon" />
          Search
        </button>
      </div>

      {loading && <p className="loading">Fetching research papers...</p>}
      {!loading && papers.length > 0 && <KeywordPapersList papers={papers} />}
      {!loading && selectedKeyword && papers.length === 0 && (
        <p className="no-results">No papers found for "{selectedKeyword}".</p>
      )}
    </div>
  );
}

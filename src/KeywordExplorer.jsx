import React, { useEffect, useState } from "react";
import { Search, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./KeywordExplorer.css";

export default function KeywordExplorer() {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Use your deployed API here
  const API_URL = "https://keyword-backend-4na7.onrender.com/api";

  // Fetch all keywords on load
  useEffect(() => {
    fetch(`${API_URL}/keywords`)
      .then((res) => res.json())
      .then((data) => setKeywords(data))
      .catch((err) => console.error("Error loading keywords:", err));
  }, []);

  const handleSearch = () => {
    if (!selectedKeyword) return;
    setLoading(true);
    setHasSearched(true);
    setPapers([]);

    fetch(`${API_URL}/papers?keyword=${encodeURIComponent(selectedKeyword)}`)
      .then((res) => res.json())
      .then((data) => {
        setPapers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Search failed:", error);
        setLoading(false);
      });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="app-header"
      >
        <h1 className="header-title">
          <Rocket />
          Cosmic Discoveries
        </h1>
        <button className="sign-in-button">Sign In</button>
      </motion.header>

      {/* Main Content */}
      <motion.main initial="hidden" animate="visible" className="main-content">
        <motion.div className="hero-section">
          <h2 className="hero-title">Unlock the Secrets of the Cosmos</h2>
          <p className="hero-subtitle">
            Dive into a galaxy of NASA bioscience experiments. Choose a keyword
            to begin your journey.
          </p>
        </motion.div>

        {/* Dropdown + Search */}
        <motion.div className="search-section">
          <select
            className="keyword-select"
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
          >
            <option value="">Select a research keyword...</option>
            {keywords.length > 0 ? (
              keywords.map((k, i) => (
                <option key={i} value={k}>
                  {k}
                </option>
              ))
            ) : (
              <option disabled>Loading keywords...</option>
            )}
          </select>

          <motion.button
            onClick={handleSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="search-button"
          >
            <Search size={18} /> Search
          </motion.button>
        </motion.div>

        {/* Results */}
        <div className="results-container">
          {loading && (
            <div className="loading-spinner-container">
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          )}

          <AnimatePresence>
            {!loading && hasSearched && papers.length === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginTop: "2.5rem", fontSize: "1.25rem" }}
              >
                No papers found for this keyword. 🔭
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div className="results-grid">
            <AnimatePresence>
              {papers.map((p, i) => (
                <motion.div
                  key={i}
                  className="paper-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <h3 className="paper-title">{p.Title}</h3>
                  <a
                    href={p.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-link"
                  >
                    View Paper →
                  </a>
                  <div className="keywords-container">
                    {p.Keywords.map((k, j) => (
                      <span key={j} className="keyword-tag">
                        {k}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

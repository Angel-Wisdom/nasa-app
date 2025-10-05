import { useEffect, useState } from "react";
import axios from "axios";
import "./PapersPage.css";

export default function PapersPage() {
  const [papers, setPapers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("beginner");
  const [purpose, setPurpose] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingList(true);
      try {
        const res = await axios.get("http://localhost:5001/api/publications?limit=100");
        setPapers(res.data);
      } catch (err) {
        console.error("Error fetching publications:", err);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  async function generateSummary() {
    if (!selected) return;
    setLoadingCustom(true);
    try {
      const res = await axios.post("http://localhost:5001/api/summarize", {
        keyword,
        level,
        purpose,
        paperId: selected.id
      });
      setCustomSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCustom(false);
    }
  }

  async function openPaper(id) {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/paper/${id}`);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="papers-page">
      <div className="papers-container">
        {/* Sidebar - Paper List */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>📚 NASA Papers</h2>
            <div className="paper-count">{papers.length} papers</div>
          </div>
          
          <div className="paper-list-container">
            {loadingList ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading publications...</span>
              </div>
            ) : (
              <div className="paper-list">
                {papers.map(paper => (
                  <div 
                    key={paper.id} 
                    className={`paper-item ${selected?.id === paper.id ? 'active' : ''}`}
                    onClick={() => openPaper(paper.id)}
                  >
                    <div className="paper-header">
                      <h3 className="paper-title">{paper.title}</h3>
                      <div className="paper-badge">NEW</div>
                    </div>
                    <div className="paper-link">{paper.link}</div>
                    <button className="paper-open-btn">
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Paper Details Section */}
          <div className="content-section">
            <h2>Paper Details</h2>
            {loadingDetail ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading paper details...</span>
              </div>
            ) : selected ? (
              <div className="paper-detail">
                <div className="detail-header">
                  <h3 className="detail-title">{selected.title}</h3>
                  <a 
                    href={selected.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="original-link"
                  >
                    Open Original Paper
                    <svg viewBox="0 0 24 24" fill="none" className="link-icon">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>

                <div className="detail-section">
                  <h4>AI Summary</h4>
                  <div className="summary-box">
                    {selected.summary || "No summary available for this paper."}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Excerpt (truncated)</h4>
                  <div className="excerpt-box">
                    {selected.excerpt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No Paper Selected</h3>
                <p>Select a paper from the sidebar to view its details and generate personalized summaries.</p>
              </div>
            )}
          </div>

          {/* Personalized Summary Generator */}
          <div className="content-section">
            <h2>Personalized Summary Generator</h2>
            <div className="generator-card">
              <div className="input-grid">
                <div className="input-group">
                  <label>Keyword Focus</label>
                  <input 
                    type="text" 
                    placeholder="Enter specific keyword or topic"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label>Expertise Level</label>
                  <select 
                    value={level} 
                    onChange={e => setLevel(e.target.value)}
                    className="input-field"
                  >
                    <option value="beginner">👶 Beginner</option>
                    <option value="intermediate">🎓 Intermediate</option>
                    <option value="expert">🔬 Expert</option>
                  </select>
                </div>

                <div className="input-group full-width">
                  <label>Purpose/Context</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Research proposal, Literature review, Educational material"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <button 
                onClick={generateSummary}
                disabled={!selected || loadingCustom}
                className="generate-btn"
              >
                {loadingCustom ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate Personalized Summary
                  </>
                )}
              </button>

              {customSummary && (
                <div className="custom-summary">
                  <h4>Your Personalized Summary</h4>
                  <div className="summary-content">
                    {customSummary}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
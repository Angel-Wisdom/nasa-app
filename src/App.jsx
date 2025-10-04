// frontend/src/App.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [papers, setPapers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingList(true);
      try {
        const res = await axios.get("http://localhost:5000/api/publications?limit=100");
        setPapers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  async function openPaper(id) {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/paper/${id}`);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      <div style={{ width: 360 }}>
        <h2>NASA Papers</h2>
        {loadingList ? <div>Loading...</div> : (
          <div style={{ maxHeight: "80vh", overflow: "auto" }}>
            {papers.map(p => (
              <div key={p.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "#444" }}>{p.link}</div>
                <button onClick={() => openPaper(p.id)} style={{ marginTop: 6 }}>Open</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h2>Paper Detail</h2>
        {loadingDetail ? <div>Loading...</div> : selected ? (
          <div>
            <h3>{selected.title}</h3>
            <a href={selected.link} target="_blank" rel="noreferrer">Open original</a>
            <h4>AI Summary</h4>
            <pre style={{ whiteSpace: "pre-wrap" }}>{selected.summary || "No summary."}</pre>
            <h4>Excerpt (truncated)</h4>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}>{selected.excerpt}</pre>
          </div>
        ) : <div>Select a paper.</div>}
      </div>
    </div>
  );
}

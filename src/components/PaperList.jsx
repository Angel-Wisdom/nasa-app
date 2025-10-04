/* eslint-disable react/prop-types */
function PaperList({ papers }) {
  return (
    <div>
      {papers.map((paper) => (
        <div
          key={paper.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          <h3>{paper.title}</h3>
          <a href={paper.link} target="_blank" rel="noreferrer">
            View Paper
          </a>
          <p><strong>Summary:</strong></p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{paper.summary}</pre>
        </div>
      ))}
    </div>
  );
}

export default PaperList;

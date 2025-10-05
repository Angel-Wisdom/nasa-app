import React from "react";
import "./KeywordPapersList.css";

export default function KeywordPapersList({ papers }) {
  return (
    <div className="papers-grid">
      {papers.map((paper, index) => (
        <div key={index} className="paper-item">
          <h3>{paper.Title}</h3>
          <p>
            <strong>Author:</strong> {paper.Author || "Unknown"}
          </p>
          <p>
            <strong>Year:</strong> {paper.Year || "N/A"}
          </p>
          <p>
            <strong>Keywords:</strong> {paper.Keywords?.join(", ")}
          </p>
          {paper.Link && (
            <a href={paper.Link} target="_blank" rel="noopener noreferrer">
              🔗 View Paper
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="nasa-badge">
            <span className="nasa-text">NASA</span>
            <span className="bioscience-text">BioScience</span>
          </div>
          <h1 className="hero-title">
            Explore the Universe of
            <span className="gradient-text"> Bioscience Research</span>
          </h1>
          <p className="hero-description">
            Discover groundbreaking NASA research papers and generate personalized summaries 
            tailored to your expertise level and interests.
          </p>
          <button 
            className="cta-button"
            onClick={() => navigate("/papers")}
          >
            <span>Explore Research Papers</span>
            <svg className="button-icon" viewBox="0 0 24 24" fill="none">
              <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="hero-visual">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="features-title">Research Tools</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Paper Library</h3>
            <p>Access comprehensive collection of NASA bioscience publications and research papers.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Summaries</h3>
            <p>Get intelligent summaries of complex research papers powered by advanced AI.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Insights</h3>
            <p>Customize summaries based on your expertise level and specific research interests.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Research Papers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">AI Analysis</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Expertise Levels</div>
          </div>
        </div>
      </section>
    </div>
  );
}
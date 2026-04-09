// frontend/src/pages/Dashboard.jsx
import { useState, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setResult(null);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setResult(null);
      setError('');
    } else {
      setError('Only PDF files are accepted');
    }
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF first'); return; }
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return { text: '🔥 Excellent', bg: 'rgba(0,255,136,0.1)', color: 'var(--success)', border: 'rgba(0,255,136,0.3)' };
    if (score >= 50) return { text: '⚡ Good', bg: 'rgba(255,184,0,0.1)', color: 'var(--warning)', border: 'rgba(255,184,0,0.3)' };
    return { text: '💪 Needs Work', bg: 'rgba(255,68,102,0.1)', color: 'var(--danger)', border: 'rgba(255,68,102,0.3)' };
  };

  return (
    <>
      {/* Background */}
      <div className="bg-animated">
        <div className="bg-orb3" />
        <div className="bg-grid" />
      </div>

      <div className="page">

        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-logo">ResumeAI ✦</div>
          <div className="navbar-right">
            <span className="navbar-user">👤 {user?.name}</span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main */}
        <div className="dashboard">

          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              AI Resume<br />Analyzer ✦
            </h1>
            <p className="dashboard-subtitle">
              Upload your resume and get instant AI-powered feedback
            </p>
          </div>

          {/* Upload Zone */}
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden-input"
            />

            <div className="upload-icon">📄</div>

            {file ? (
              <>
                <div className="upload-file-name">
                  <span>✅</span>
                  <span>{file.name}</span>
                </div>
                <p className="upload-subtitle">
                  Click to change file
                </p>
              </>
            ) : (
              <>
                <p className="upload-title">Drop your resume here</p>
                <p className="upload-subtitle">
                  Drag & drop or click to browse — PDF only, max 5MB
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 24 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Analyze Button */}
          {file && !loading && !result && (
            <button
              className="btn btn-primary btn-full"
              onClick={handleUpload}
              style={{ marginBottom: 32, padding: '18px', fontSize: 16 }}
            >
              🤖 Analyze My Resume
            </button>
          )}

          {/* Loading State */}
          {loading && (
            <div className="glass loading-container" style={{ marginBottom: 32 }}>
              <div className="loading-spinner" />
              <p className="loading-text">Analyzing your resume...</p>
              <p className="loading-sub">Our AI is reading and scoring your resume</p>
              <div className="loading-dots" style={{ marginTop: 16 }}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="results">
              <div className="section-divider">
                <div className="section-divider-line" />
                <span className="section-divider-text">Analysis Results</span>
                <div className="section-divider-line" />
              </div>

              {/* Score Card */}
              <div className="score-card glass" style={{ marginBottom: 24 }}>
                <p className="score-label">Overall Score</p>
                <div className="score-number">
                  {result.score}
                  <span className="score-max">/100</span>
                </div>

                <div className="score-bar-wrap">
                  <div className="score-bar-bg">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${result.score}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(result.score)}, var(--glow-purple))`
                      }}
                    />
                  </div>
                </div>

                {(() => {
                  const label = getScoreLabel(result.score);
                  return (
                    <span className="score-tag" style={{
                      background: label.bg,
                      color: label.color,
                      border: `1px solid ${label.border}`
                    }}>
                      {label.text}
                    </span>
                  );
                })()}
              </div>

              {/* Summary */}
              <div className="summary-card glass" style={{ borderRadius: 20, marginBottom: 20 }}>
                <div className="result-card-header">
                  <div className="result-card-icon" style={{ background: 'rgba(0,245,255,0.1)' }}>
                    📝
                  </div>
                  <span className="result-card-title" style={{ color: 'var(--glow-cyan)' }}>
                    Summary
                  </span>
                </div>
                <p className="summary-text">"{result.summary}"</p>
              </div>

              {/* 2-column grid */}
              <div className="result-grid">

                {/* Strengths */}
                <div className="result-card card-strengths">
                  <div className="result-card-header">
                    <div className="result-card-icon">✅</div>
                    <span className="result-card-title">Strengths</span>
                  </div>
                  <ul className="result-list">
                    {result.strengths.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="result-card card-weaknesses">
                  <div className="result-card-header">
                    <div className="result-card-icon">⚠️</div>
                    <span className="result-card-title">Weaknesses</span>
                  </div>
                  <ul className="result-list">
                    {result.weaknesses.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="result-card card-suggestions" style={{ gridColumn: '1 / -1' }}>
                  <div className="result-card-header">
                    <div className="result-card-icon">💡</div>
                    <span className="result-card-title">Action Items</span>
                  </div>
                  <ul className="result-list">
                    {result.suggestions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="result-card keywords-card">
                <div className="result-card-header">
                  <div className="result-card-icon" style={{ background: 'rgba(191,0,255,0.15)' }}>
                    🔑
                  </div>
                  <span className="result-card-title" style={{ color: '#d88aff' }}>
                    Missing Keywords
                  </span>
                </div>
                <div className="keywords-wrap">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>

              {/* Analyze Another */}
              <button
                className="btn btn-ghost btn-full"
                onClick={() => { setResult(null); setFile(null); }}
                style={{ marginTop: 8, marginBottom: 40 }}
              >
                ↩ Analyze Another Resume
              </button>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
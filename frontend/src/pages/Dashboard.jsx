// frontend/src/pages/Dashboard.jsx
import { useState, useRef, useEffect } from 'react';
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
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (result?.score) {
      let start = 0;
      const end = result.score;
      const duration = 800;
      const increment = end / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(counter);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }
  }, [result]);

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
      setError(err.response?.data?.message || 'Analysis failed.');
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

  return (
    <>
      <div className="bg-animated">
        <div className="bg-orb3" />
        <div className="bg-grid" />
      </div>

      <div className="page">

        {/* Navbar */}
        <nav className="navbar">
          <div
            className="navbar-logo"
            onClick={() => {
              setResult(null);
              setFile(null);
              navigate('/dashboard');
            }}
            style={{ cursor: 'pointer' }}
          >
            ResumeAI ✦
          </div>

          <div className="navbar-links">
            <span className="navbar-user">👤 {user?.name}</span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>

        <div className="dashboard">

          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              AI Resume<br />Analyzer ✦
            </h1>
            <p className="dashboard-subtitle">
              🚀 Improve your resume and boost your chances of getting hired with AI-powered insights
            </p>
          </div>

          {/* Upload */}
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
                <p className="upload-subtitle">Click to change file</p>
              </>
            ) : (
              <>
                <p className="upload-title">Drop your resume here</p>
                <p className="upload-subtitle">
                  Drag & drop or click to browse — PDF only
                </p>
              </>
            )}
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {/* CTA Button */}
          {file && !loading && !result && (
            <button className="btn btn-primary btn-full" onClick={handleUpload}>
              ✦ Analyze My Resume
            </button>
          )}

          {/* FEATURES (Homepage Section) */}
          {!result && !loading && (
            <>
              <div style={{ marginTop: 50 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 30 }}>
                  🚀 Why ResumeAI?
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 20
                }}>

                  <div className="result-card">
                    ⚡ <h3>Instant Analysis</h3>
                    <p>Get resume feedback instantly</p>
                  </div>

                  <div className="result-card">
                    🎯 <h3>ATS Score</h3>
                    <p>Know how your resume performs</p>
                  </div>

                  <div className="result-card">
                    💡 <h3>Smart Suggestions</h3>
                    <p>Improve your resume easily</p>
                  </div>

                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 30 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current.click()}
                >
                  🚀 Start Analyzing Now
                </button>
              </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="glass loading-container">
              <div className="loading-spinner" />
              <p>Analyzing your resume...</p>
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div className="results">

              <div className="score-card glass">
                <p>Overall Score</p>
                <h2>{animatedScore}/100</h2>

                <div style={{ marginTop: 10 }}>
                  🎯 Recommended Role: {
                    result.missingKeywords.includes("React")
                      ? "Frontend Developer"
                      : "Software Engineer"
                  }
                </div>

                <div style={{
                  width: '100%',
                  height: '10px',
                  background: '#333',
                  borderRadius: '10px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    width: `${result.score}%`,
                    height: '100%',
                    background: getScoreColor(result.score),
                    borderRadius: '10px'
                  }} />
                </div>
              </div>

              <div className="result-card">
                <h3>📝 Summary</h3>
                <p>{result.summary}</p>
              </div>

              <div className="result-card">
                <h3>✅ Strengths</h3>
                <ul>{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              <div className="result-card">
                <h3>⚠️ Weakness</h3>
                <ul>{result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>

              <div className="result-card">
                <h3>💡 Suggestions</h3>
                <ul>{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              <div className="result-card">
                <h3>🔑 Missing Keywords</h3>
                <div>
                  {result.missingKeywords.map((k, i) => (
                    <span key={i} style={{ marginRight: 8 }}>{k}</span>
                  ))}
                </div>
              </div>

              <button onClick={() => window.print()} className="btn btn-primary">
                📄 Download Report
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => { setResult(null); setFile(null); }}
              >
                ↩ Analyze Another
              </button>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
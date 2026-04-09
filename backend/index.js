// index.js

// ─────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

// Database
const connectDB = require('./config/database');

// ─────────────────────────────────────
// APP SETUP
// ─────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────
// CONNECT DATABASE
// ─────────────────────────────────────
connectDB();

// ─────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────
app.use(cors());            // allow frontend requests
app.use(express.json());    // read JSON data from requests

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────

// Test route (check if server is working)
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 AI Resume Analyzer API is running!'
  });
});

// Auth routes (signup, login)
app.use('/api/auth', authRoutes);

// Resume routes (upload, analyze)
app.use('/api/resume', resumeRoutes);

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});   
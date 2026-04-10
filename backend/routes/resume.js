const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const analyzeResume = require('../services/resumeAnalyzer');
const Resume = require('../models/Resume');
const protect = require('../middleware/authMiddleware');

// ── UPLOAD + ANALYZE ──
router.post('/upload', protect, (req, res) => {
  upload.single('resume')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a PDF file' });
    }
    try {
      console.log('📄 PDF received:', req.file.originalname);
      console.log('🤖 Analyzing with AI...');

      const result = await analyzeResume(req.file.buffer);

      const savedResume = await Resume.create({
        fileName:        req.file.originalname,
        score:           result.analysis.score,
        strengths:       result.analysis.strengths,
        weaknesses:      result.analysis.weaknesses,
        suggestions:     result.analysis.suggestions,
        missingKeywords: result.analysis.missingKeywords,
        summary:         result.analysis.summary
      });

      console.log('💾 Saved to MongoDB!');

      res.json({
        status:   'success',
        message:  'Resume analyzed and saved!',
        id:       savedResume._id,
        fileName: savedResume.fileName,
        analysis: result.analysis,
        savedAt:  savedResume.createdAt
      });

    } catch (error) {
      console.error('❌ Error:', error.message);
      res.status(500).json({
        status:  'error',
        message: 'Something went wrong.',
        detail:  error.message
      });
    }
  });
});

// ── GET ALL HISTORY ──
router.get('/history', protect, async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json({ status: 'success', count: resumes.length, data: resumes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ── GET ONE BY ID ──
router.get('/history/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found' });
    }
    res.json({ status: 'success', data: resume });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
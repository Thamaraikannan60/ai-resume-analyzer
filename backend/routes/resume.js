// backend/routes/resume.js

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const analyzeResume = require('../services/resumeAnalyzer');
const fs = require('fs');

// POST /api/resume/upload
router.post('/upload', (req, res) => {
  upload.single('resume')(req, res, async function (err) {

    // Handle multer errors
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    // Handle missing file
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }

    try {
      // req.file.path = where multer saved the file
      // e.g. "uploads/resume-1234567890.pdf"
      const filePath = req.file.path;

      console.log('📄 PDF received:', req.file.originalname);
      console.log('🤖 Sending to AI for analysis...');

      // Analyze the resume
      const result = await analyzeResume(filePath);

      console.log('✅ Analysis complete!');

      // Delete the file after analysis
      // We don't need to store PDFs — just the analysis result
      fs.unlinkSync(filePath);
      // unlinkSync = delete this file

      // Send the result back
      res.json({
        status: 'success',
        message: 'Resume analyzed successfully!',
        fileName: req.file.originalname,
        ...result
        // ...result spreads: analysis + textLength into response
      });

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Failed to analyze resume. Please try again.',
        detail: error.message
      });
    }
  });
});

module.exports = router;
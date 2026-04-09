// backend/services/resumeAnalyzer.js

const fs = require('fs');
const groq = require('../config/groq');

// ───────────────────────────────────────
// FUNCTION 1: Extract text from PDF
// ───────────────────────────────────────
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        let fullText = '';
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(r => {
              try {
                fullText += decodeURIComponent(r.T) + ' ';
              } catch (e) {
                fullText += r.T + ' ';
              }
            });
          });
          fullText += '\n';
        });
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      reject(error);
    });

    pdfParser.loadPDF(filePath);
  });
};

// ───────────────────────────────────────
// FUNCTION 2: Send text to Groq AI
// ───────────────────────────────────────
const analyzeWithAI = async (resumeText) => {
  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    // ↑ Very powerful free model
    // Alternative: 'mixtral-8x7b-32768'

    messages: [
      {
        role: 'system',
        content: `You are an expert resume reviewer and career coach.
        Always respond with ONLY a valid JSON object.
        Never add markdown, backticks, or any extra text.`
      },
      {
        role: 'user',
        content: `Analyze this resume and return a JSON object with exactly these fields:
        {
          "score": (number 0-100),
          "strengths": (array of 3 strings),
          "weaknesses": (array of 3 strings),
          "suggestions": (array of 3 strings),
          "missingKeywords": (array of 5-6 strings),
          "summary": (string, 2 sentences)
        }
        
        Resume:
        ${resumeText}`
      }
    ],

    temperature: 0.7,
    max_tokens: 1024,
  });

  // Get the response text
  const responseText = chatCompletion.choices[0].message.content;

  // Clean and parse JSON
  const cleaned = responseText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const result = JSON.parse(cleaned);
  return result;
};

// ───────────────────────────────────────
// MAIN FUNCTION
// ───────────────────────────────────────
const analyzeResume = async (filePath) => {
  console.log('📖 Reading PDF...');
  const resumeText = await extractTextFromPDF(filePath);

  console.log(`📝 Extracted ${resumeText.length} characters`);

  if (resumeText.length < 50) {
    throw new Error('Could not extract enough text. Try a different PDF.');
  }

  const analysis = await analyzeWithAI(resumeText);

  return {
    analysis,
    textLength: resumeText.length
  };
};

module.exports = analyzeResume;
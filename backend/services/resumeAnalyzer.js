const groq = require('../config/groq');

const extractTextFromPDF = (fileBuffer) => {
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

    pdfParser.parseBuffer(fileBuffer);
  });
};

const analyzeWithAI = async (resumeText) => {
  const cleanText = resumeText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .substring(0, 3000);

  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume reviewer.
        Respond with ONLY a valid JSON object.
        No markdown, no backticks, no extra text whatsoever.`
      },
      {
        role: 'user',
        content: `Analyze this resume. Return ONLY this JSON:
        {
          "score": 75,
          "strengths": ["point1", "point2", "point3"],
          "weaknesses": ["point1", "point2", "point3"],
          "suggestions": ["point1", "point2", "point3"],
          "missingKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
          "summary": "Two sentence summary here."
        }
        
        Resume: ${cleanText}`
      }
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const responseText = chatCompletion.choices[0].message.content;
  const cleaned = responseText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
};

const analyzeResume = async (fileBuffer) => {
  console.log('📖 Reading PDF from memory...');
  const resumeText = await extractTextFromPDF(fileBuffer);
  console.log(`📝 Extracted ${resumeText.length} characters`);

  if (resumeText.length < 50) {
    throw new Error('Could not extract enough text.');
  }

  const analysis = await analyzeWithAI(resumeText);
  return { analysis, textLength: resumeText.length };
};

module.exports = analyzeResume;
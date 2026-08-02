const Recommendation = require('../models/Recommendation');
const Submission = require('../models/Submission');
const ai = require('../config/geminiConfig');

// @desc    Get student's personalized recommendations from past quiz attempts
// @route   GET /api/recommendations/my
// @access  Private (Student)
const getMyRecommendations = async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user._id,
      'geminiAnalysis.gaps.0': { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const data = submissions.map((s) => {
      const gaps = s.geminiAnalysis?.gaps || [];
      return {
        _id: s._id,
        generatedAt: s.createdAt,
        weakTopics: gaps.map((g) => g.topic).filter(Boolean),
        recommendations: gaps.map((g) => ({
          topic: g.topic,
          priority: g.severity || 'medium',
          suggestion: g.description || '',
          resources: g.recommendations || [],
        })),
        studyPlan: s.geminiAnalysis?.encouragement
          ? `${s.geminiAnalysis.overallStrength || ''}\n\n${s.geminiAnalysis.encouragement}`.trim()
          : s.geminiAnalysis?.overallStrength || null,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate customized flashcards and study notes for a specific topic using Gemini AI
// @route   POST /api/recommendations/generate
// @access  Private (Student)
const generateStudyMaterials = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please provide a target topic for remediation.' });
    }

    // 1. Check cache to avoid hitting Gemini API quota
    const existingMaterial = await Recommendation.findOne({ student: req.user._id, topic: topic });
    if (existingMaterial) {
      return res.status(200).json({ success: true, source: 'cache', data: existingMaterial });
    }

    // 2. Prompt engineering for strictly structured JSON output
    const prompt = `
      You are an elite computer science educator.
      The student has a knowledge gap in: "${topic}".
      
      Generate a remedial study guide structured strictly as a valid JSON object matching this schema:
      {
        "studyNotes": "3-4 clean bullet points highlighting core rules.",
        "flashcards": [
          { "front": "High-yield conceptual question about this topic.", "back": "Direct and accurate answer." },
          { "front": "Technical query focusing on a common mistake or edge case.", "back": "Precise resolution." },
          { "front": "Architecture or syntax specific query.", "back": "Clear explanation." }
        ]
      }
      
      Return ONLY valid JSON. No markdown code blocks, no preamble, no tripeticks.
    `;

    // 3. Invoke Gemini API safely with internal try/catch for rate limits/quota/model errors
    let rawText = "";

    try {
      if (typeof ai.getGenerativeModel === 'function') {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawText = typeof response.text === 'function' ? response.text() : (response.text || "");
      } else if (ai.models && typeof ai.models.generateContent === 'function') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        throw new Error("Gemini AI client instance configuration invalid.");
      }
    } catch (aiError) {
      console.warn("⚠️ Gemini API Call / Quota Exception, proceeding with structured fallback assets:", aiError.message);
      rawText = ""; // Empty rawText safely triggers fallback structured content below
    }

    // Clean Markdown code block artifacts (```json ... ```)
    let cleanedText = rawText.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

    // 4. Safe JSON Parsing
    let parsedData = null;
    if (cleanedText) {
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("❌ Gemini Raw Output Parse Failed, using fallback structured content:", rawText);
        parsedData = null;
      }
    }

    // 🟢 SAFE TYPE-PARSING: Handle both String and Array types returned by AI for studyNotes
    let finalStudyNotes = "";
    if (parsedData && typeof parsedData.studyNotes === 'string' && parsedData.studyNotes.trim().length > 0) {
      finalStudyNotes = parsedData.studyNotes.trim();
    } else if (parsedData && Array.isArray(parsedData.studyNotes) && parsedData.studyNotes.length > 0) {
      finalStudyNotes = parsedData.studyNotes.map(note => typeof note === 'string' ? `• ${note}` : String(note)).join('\n');
    } else {
      finalStudyNotes = `• Core concepts of ${topic}.\n• Review execution lifecycles and thread context isolation.\n• Focus on architectural boundaries and memory regions.`;
    }

    // 🟢 SAFE TYPE-PARSING: Flashcards array mapping
    let finalFlashcards = [];
    if (parsedData && Array.isArray(parsedData.flashcards) && parsedData.flashcards.length > 0) {
      finalFlashcards = parsedData.flashcards.map(fc => ({
        front: typeof fc?.front === 'string' ? fc.front : String(fc?.front || `Core concept query on ${topic}`),
        back: typeof fc?.back === 'string' ? fc.back : String(fc?.back || `Direct explanation for ${topic}`)
      }));
    } else {
      finalFlashcards = [
        { front: `What is the primary role of ${topic}?`, back: "It manages execution context boundaries and runtime lifecycle memory." },
        { front: "What is a common architectural pitfall?", back: "Confusing thread-safe stack frames with shared heap storage objects." },
        { front: "How to master this specific area?", back: "Practice trace analysis and review thread-dump memory profiles." }
      ];
    }

    // 5. Save to MongoDB Atlas
    const newRecommendation = await Recommendation.create({
      student: req.user._id,
      topic,
      flashcards: finalFlashcards,
      studyNotes: finalStudyNotes
    });

    return res.status(201).json({
      success: true,
      source: rawText ? 'live_ai_engine' : 'fallback_engine',
      data: newRecommendation
    });

  } catch (error) {
    console.error("❌ Error generating study materials:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server-side error compiling remedial assets.', 
      error: error.message 
    });
  }
};

module.exports = { generateStudyMaterials, getMyRecommendations };
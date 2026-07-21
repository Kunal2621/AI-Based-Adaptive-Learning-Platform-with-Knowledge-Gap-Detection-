const Recommendation = require('../models/Recommendation');
const Submission = require('../models/Submission');
const ai = require('../config/geminiConfig');

// @desc    Generate customized flashcards and study notes for a specific weak topic using Gemini AI
// @route   POST /api/recommendations/generate
// @access  Private (Student)
const generateStudyMaterials = async (req, res) => {
  try {
    const { topic } = req.body; // e.g., "Spring Bean Lifecycle and Dependency Injection"

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please provide a target topic for remediation.' });
    }

    // 1. Check if study material already exists for this student and topic to optimize API usage
    const existingMaterial = await Recommendation.findOne({ student: req.user._id, topic: topic });
    if (existingMaterial) {
      return res.status(200).json({ success: true, source: 'cache', data: existingMaterial });
    }

    // 2. Formulate the prompt for strict JSON structure formatting
    const prompt = `
      You are an elite computer science educator specializing in enterprise application architectures.
      The student has a major knowledge gap in the following technical topic: "${topic}".
      
      Generate a comprehensive remedial study guide structured strictly as a valid JSON object matching this schema:
      {
        "studyNotes": "A single, clean string containing 3-4 bullet points (separated by \\n) highlighting the absolute core rules or architectural flow of this topic.",
        "flashcards": [
          { "front": "A crisp, high-yield conceptual question or scenario about this topic.", "back": "The direct, accurate, and highly informative answer or correction." },
          { "front": "Another technical query focusing on a common mistake or edge case.", "back": "The precise resolution." }
        ]
      }
      
      Generate exactly 3 high-yield flashcards. Return ONLY the raw JSON string matching this structure without markdown wraps or code blocks.
    `;

    // 3. Invoke the Gemini API client instance
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawText = response.text.trim();

    // 4. Parse the AI result
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'AI failed to deliver cleanly structured revision assets. Try again.',
        error: parseError.message
      });
    }

    // 5. Persist the generated study materials to MongoDB Atlas
    const newRecommendation = await Recommendation.create({
      student: req.user._id,
      topic,
      flashcards: parsedData.flashcards,
      studyNotes: parsedData.studyNotes
    });

    res.status(201).json({
      success: true,
      source: 'live_ai_engine',
      data: newRecommendation
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server-side error compiling remedial assets.', error: error.message });
  }
};

// @desc    Build the student's AI recommendation roadmap from their past
//          quiz attempts (one "session" per attempt that had gaps)
// @route   GET /api/recommendations/my
// @access  Private (Student)
const getMyRecommendations = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('quiz', 'title topic')
      .sort({ createdAt: -1 })
      .limit(10);

    const sessions = submissions
      .filter((s) => s.geminiAnalysis?.gaps?.length > 0)
      .map((s) => ({
        generatedAt: s.createdAt,
        weakTopics: (s.geminiAnalysis.gaps || []).map((g) => g.topic),
        recommendations: (s.geminiAnalysis.gaps || []).map((g) => ({
          topic: g.topic,
          priority: g.severity || 'medium',
          suggestion: g.description,
          resources: g.recommendations || [],
        })),
        studyPlan: s.geminiAnalysis.encouragement || null,
      }));

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateStudyMaterials, getMyRecommendations };
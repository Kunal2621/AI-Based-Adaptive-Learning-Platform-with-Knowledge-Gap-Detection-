const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const ai = require('../config/geminiConfig');
const mongoose = require('mongoose');

// @desc    Automatically generate 100% Live Dynamic Quiz questions using Gemini AI
// @route   POST /api/quiz/generate
// @access  Private (Teacher or Admin)
const generateAIQuiz = async (req, res) => {
  try {
    const { title, topic, courseId, difficulty, numberOfQuestions } = req.body;

    // 1. Authorization Guard
    if (!req.user || !req.user.role || (req.user.role.toLowerCase() !== 'teacher' && req.user.role.toLowerCase() !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied. Unauthorized role.' });
    }

    // 2. Validate course selection
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Please select a valid target course.' });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Target course not found in database.' });
    }

    const currentTopic = topic || title || "Computer Science Core";
    const qCount = numberOfQuestions || 4;

    // 3. Strict Prompt for Practical Code Snippets + Conceptual Theory
    const prompt = `
      You are an expert Computer Science professor and assessment engineer.
      Generate exactly ${qCount} technical multiple-choice questions dynamically for the topic: "${currentTopic}".
      Target Difficulty Level: "${difficulty || 'Medium'}".

      CRITICAL FORMATTING & QUESTION CONTENT RULES:
      1. DO NOT return pre-written or static templates. Every question MUST be specific to "${currentTopic}".
      2. Provide a 50-50 mix of:
         - Practical Coding Questions (e.g., Predict output of code snippets, find bugs, syntax evaluation).
         - Theoretical / Conceptual Questions (e.g., Memory allocation, scope, performance, rules).
      3. For coding questions, format short readable code snippets inside the "questionText" string using standard line breaks (\\n).
      4. Each question MUST contain exactly 4 option choices under "answerOptions".
      5. Exactly ONE option must have "isCorrect": true, and all 4 options MUST have a detailed "rationale" explaining why the option is correct or incorrect.

      Return ONLY a raw valid JSON array matching this exact schema:
      [
        {
          "questionText": "Question statement or code snippet prediction here",
          "answerOptions": [
            { "text": "Option A text", "isCorrect": false, "rationale": "Detailed explanation why wrong" },
            { "text": "Option B text", "isCorrect": true, "rationale": "Detailed explanation why correct" },
            { "text": "Option C text", "isCorrect": false, "rationale": "Detailed explanation why wrong" },
            { "text": "Option D text", "isCorrect": false, "rationale": "Detailed explanation why wrong" }
          ],
          "hint": "Strategic conceptual hint for the student",
          "difficulty": "${difficulty || 'Medium'}"
        }
      ]
    `;

    // 4. Invoke Live Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Higher rate limits & faster output
      contents: prompt,
    });

    // 5. Extract raw response text safely
    let rawText = "";
    if (typeof response.text === 'function') {
      rawText = response.text();
    } else if (response.text) {
      rawText = response.text;
    } else if (response.response && typeof response.response.text === 'function') {
      rawText = response.response.text();
    }

    // Clean JSON string using Regex extraction
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    } else {
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    }

    // Parse AI Questions Payload
    const parsedQuestions = JSON.parse(rawText);

    // 6. Save Live Generated Quiz into MongoDB Atlas
    const newQuiz = await Quiz.create({
      title: title || `${currentTopic} AI Quiz`,
      topic: currentTopic,
      courseId,
      creator: req.user._id,
      questions: parsedQuestions,
      isAssigned: false
    });

    return res.status(201).json({
      success: true,
      message: '100% Dynamic AI Quiz generated successfully!',
      data: newQuiz
    });

  } catch (error) {
    console.error("Gemini AI Quiz Generation Error:", error);

    // Friendly message if API key hits Quota Limits
    if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      return res.status(429).json({
        success: false,
        message: 'Gemini AI API rate limit reached. Please update GEMINI_API_KEY in .env or try again in a minute.',
        error: error.message
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error generating AI quiz.',
      error: error.message 
    });
  }
};

module.exports = { generateAIQuiz };
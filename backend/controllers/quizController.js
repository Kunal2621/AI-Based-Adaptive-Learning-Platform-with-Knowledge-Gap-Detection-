const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const ai = require('../config/geminiConfig');

// @desc    Generate a completely dynamic AI Quiz based on parameters
// @route   POST /api/quiz/generate
// @access  Private
const generateAIQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numberOfQuestions, courseId } = req.body;

    if (!topic || !courseId) {
      return res.status(400).json({ success: false, message: "Missing topic or course context parameters." });
    }

    const count = numberOfQuestions || 3;
    const targetDiff = difficulty || "Intermediate";

    const prompt = `
      You are an elite technical examination software engine.
      Generate exactly ${count} distinct multiple choice questions covering the topic cluster: "${topic}".
      Difficulty Tier: "${targetDiff}".

      Return ONLY a raw valid JSON array matching this strict schema layout without markdown wraps, backticks, or code blocks:
      [
        {
          "questionText": "Clear technical question string?",
          "answerOptions": [
            { "text": "Option A text content", "rationale": "Why this is correct/incorrect" },
            { "text": "Option B text content", "rationale": "Why this is correct/incorrect" },
            { "text": "Option C text content", "rationale": "Why this is correct/incorrect" },
            { "text": "Option D text content", "rationale": "Why this is correct/incorrect" }
          ],
          "correctAnswerIndex": 0,
          "hint": "Strategic conceptual hint.",
          "difficulty": "${targetDiff}"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(response.text.trim());
    } catch (parseError) {
      return res.status(500).json({ success: false, message: "AI formatting sync issue. Retry generation." });
    }

    const quiz = await Quiz.create({
      title: `AI Track: ${topic}`,
      topic,
      courseId,
      creator: req.user._id,
      questions: parsedQuestions
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit dynamic answers, calculate scores and evaluate adaptive knowledge gaps
// @route   POST /api/quiz/submit/:id
// @access  Private (Student only)
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body; // Array of chosen indexes: [0, 2, 1]
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz evaluation track not found." });

    let correctAnswersCount = 0;
    const totalQuestions = quiz.questions.length;

    // Loop and evaluate metrics
    quiz.questions.forEach((q, index) => {
      // Safely fetch if matching the programmatic schemas index matrix
      const studentAnswer = answers[index];
      // Supposing schemas support direct index tracking fallback fields
      const correctIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0; 
      
      if (studentAnswer === correctIndex) {
        correctAnswersCount++;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

    // Save final analytical telemetry inside MongoDB Atlas
    const submission = await Submission.create({
      student: studentId,
      quiz: quizId,
      score: correctAnswersCount,
      totalQuestions,
      percentage,
      answersSummary: answers
    });

    res.status(200).json({
      success: true,
      message: percentage >= 60 ? "Evaluation passed!" : "Knowledge Gap Detected in core track.",
      data: submission
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error running quiz submission engine.", error: error.message });
  }
};

module.exports = {
  generateAIQuiz,
  submitQuiz
};
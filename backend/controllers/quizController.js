const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Get all quizzes (e.g. GET /api/quizzes or /api/quizzes?courseId=xxx)
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.query;
    let filter = {};
    if (courseId) {
      filter.courseId = courseId;
    }

    const quizzes = await Quiz.find(filter).lean();

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error fetching quizzes.", 
      error: error.message 
    });
  }
};

// @desc    Get single quiz by ID (Required by Frontend /student/quiz/:id)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz not found." 
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error fetching quiz details.", 
      error: error.message 
    });
  }
};

// @desc    Submit dynamic answers, calculate scores and evaluate adaptive knowledge gaps
// @route   POST /api/quizzes/submit/:id
// @access  Private (Student only)
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers = {}, timeTaken = 0 } = req.body || {};
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz evaluation track not found." });
    }

    let correctAnswersCount = 0;
    const questionsList = quiz.questions || [];
    const totalQuestions = questionsList.length;
    const answerDetails = [];
    const weakTopics = [];

    questionsList.forEach((q, index) => {
      let selectedIndex = undefined;

      // Check both Object Map { [qId]: index } AND Array Map [ index1, index2 ]
      if (answers) {
        if (q._id && answers[q._id] !== undefined) {
          selectedIndex = answers[q._id];
        } else if (answers[index] !== undefined) {
          selectedIndex = answers[index];
        }
      }

      const options = q.answerOptions || q.options || [];
      const selectedOption = options[selectedIndex];
      const isCorrect = !!selectedOption && !!selectedOption.isCorrect;

      if (isCorrect) {
        correctAnswersCount++;
      } else {
        const topicName = q.questionText || q.topic || "Core Concept";
        weakTopics.push(topicName);
      }

      // Ensure questionId is ALWAYS a valid ObjectId (never null/undefined)
      const validQuestionId = q._id || new mongoose.Types.ObjectId();

      answerDetails.push({
        questionId: validQuestionId,
        selectedOptionText: selectedOption ? (selectedOption.text || String(selectedOption)) : "No answer selected",
        isCorrect: isCorrect
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

    const knowledgeGapFeedback = percentage >= 60
      ? "Strong grasp of this topic overall - keep practicing to maintain retention."
      : `Knowledge gap detected. Review: ${weakTopics.slice(0, 3).join('; ') || quiz.topic || 'Core concepts'}.`;

    // 🟢 CRITICAL FIX: Build Gemini Analysis Gaps for AI Recommendations Engine
    const gapsData = weakTopics.slice(0, 5).map((topicName) => ({
      topic: topicName,
      severity: percentage < 40 ? 'high' : percentage < 70 ? 'medium' : 'low',
      description: `Knowledge gap detected in "${topicName}". Focus on syntax rules and structural logic.`,
      recommendations: [
        `Practice key concepts for ${topicName}`,
        `Review technical documentation and core patterns`
      ]
    }));

    // 🟢 Build Valid Payload matching Submission Schema
    const submissionData = {
      student: studentId,
      quiz: quizId,
      answers: answerDetails,
      score: correctAnswersCount,
      totalQuestions: totalQuestions,
      percentage: percentage,
      knowledgeGapFeedback: knowledgeGapFeedback,
      timeTaken: timeTaken,
      
      // ATTACH GEMINI ANALYSIS FOR /api/recommendations/my ENDPOINT
      geminiAnalysis: {
        overallStrength: percentage >= 60
          ? "Good performance! Keep maintaining key retention."
          : "Knowledge gaps detected. Review weak areas to boost comprehension.",
        encouragement: "Consistency is key. Focus on high-priority topics first!",
        gaps: gapsData
      }
    };

    // Attach courseId ONLY if valid on Quiz doc
    if (quiz.courseId) {
      submissionData.courseId = quiz.courseId;
    }

    const submission = await Submission.create(submissionData);

    return res.status(200).json({
      success: true,
      message: percentage >= 60 ? "Evaluation passed!" : "Knowledge Gap Detected in core track.",
      data: submission
    });

  } catch (error) {
    console.error("❌ Submission Error Log:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error running quiz submission engine.", 
      error: error.message 
    });
  }
};

// @desc    Get user's previous quiz submissions / attempts
// @route   GET /api/quizzes/my-results
// @access  Private
const getMyResults = async (req, res) => {
  try {
    const studentId = req.user?._id;
    const submissions = await Submission.find({ student: studentId })
      .populate('quiz', 'title topic questions')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single attempt details by ID
// @route   GET /api/quizzes/attempts/:id
// @access  Private
const getAttemptById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('quiz', 'title topic questions')
      .lean();

    if (!submission) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error("Error fetching attempt by ID:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getMyResults,
  getAttemptById
};
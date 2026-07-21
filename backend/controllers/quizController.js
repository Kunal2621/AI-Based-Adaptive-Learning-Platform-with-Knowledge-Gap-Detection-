const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// NOTE: This file previously had its own `generateAIQuiz` here that used a
// "correctAnswerIndex" question schema. That schema never matched the actual
// Quiz/Question mongoose model (which stores per-option `isCorrect` flags),
// so any quiz generated through it would silently fail to grade correctly
// and the teacher's quiz-preview modal (which reads `opt.isCorrect`) would
// never show which option was right. That duplicate function has been
// removed - all AI quiz generation now goes through
// controllers/aiController.js, which matches the real schema and is what
// server.js actually wires up to POST /api/quiz/generate.

// @desc    Submit dynamic answers, calculate scores and evaluate adaptive knowledge gaps
// @route   POST /api/quiz/submit/:id
// @access  Private (Student only)
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body; // Array of chosen option indexes: [0, 2, 1]
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz evaluation track not found." });

    let correctAnswersCount = 0;
    const totalQuestions = quiz.questions.length;
    const answerDetails = [];
    const weakTopics = [];

    // 🟢 FIX: the question schema stores correctness per-option
    // (answerOptions[].isCorrect), not a top-level "correctAnswerIndex" that
    // never existed on saved documents. Also build the `answers` array in the
    // shape Submission requires (questionId, selectedOptionText, isCorrect),
    // since the model marks those fields as required - without them this
    // Submission.create() call always threw a validation error.
    quiz.questions.forEach((q, index) => {
      const selectedIndex = answers ? answers[index] : undefined;
      const selectedOption = (q.answerOptions || [])[selectedIndex];
      const isCorrect = !!selectedOption && !!selectedOption.isCorrect;

      if (isCorrect) correctAnswersCount++;
      else if (q.questionText) weakTopics.push(q.questionText);

      answerDetails.push({
        questionId: q._id,
        selectedOptionText: selectedOption ? selectedOption.text : "No answer selected",
        isCorrect
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

    const knowledgeGapFeedback = percentage >= 60
      ? "Strong grasp of this topic overall - keep practicing to maintain retention."
      : `Knowledge gap detected. Review: ${weakTopics.slice(0, 3).join('; ') || quiz.topic}.`;

    // Save final analytical telemetry inside MongoDB Atlas
    const submission = await Submission.create({
      student: studentId,
      quiz: quizId,
      courseId: quiz.courseId,
      answers: answerDetails,
      score: correctAnswersCount,
      totalQuestions,
      percentage,
      knowledgeGapFeedback
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
  submitQuiz
};

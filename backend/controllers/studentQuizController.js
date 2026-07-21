const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const ai = require('../config/geminiConfig');

// Shapes a raw question subdocument into the format the student quiz-taking
// UI expects: `options` as a flat array of strings, no correct-answer info
// leaked to the client before submission.
const mapQuestionForStudent = (q, quizTopic) => ({
  _id: q._id,
  questionText: q.questionText,
  type: q.type || 'mcq',
  options: (q.answerOptions || []).map((o) => o.text),
  topic: q.topic || quizTopic,
  marks: q.marks || 1,
});

const mapQuizForStudent = (quiz, attempted = false) => ({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  topic: quiz.topic,
  courseId: quiz.courseId,
  timeLimit: quiz.timeLimit,
  totalMarks: (quiz.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0),
  questions: (quiz.questions || []).map((q) => mapQuestionForStudent(q, quiz.topic)),
  attempted,
});

// @desc    List quizzes, optionally filtered by course, flagged with whether
//          the current student has already attempted each one
// @route   GET /api/quizzes?courseId=xxx
// @access  Private (Student)
const getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId } : {};
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

    const attemptedIds = new Set(
      (await Submission.distinct('quiz', { student: req.user._id })).map((id) => id.toString())
    );

    const data = quizzes.map((q) => mapQuizForStudent(q, attemptedIds.has(q._id.toString())));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single quiz ready for attempting (no correct answers leaked)
// @route   GET /api/quizzes/:id
// @access  Private (Student)
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const attempted = await Submission.exists({ student: req.user._id, quiz: quiz._id });
    res.status(200).json({ success: true, data: mapQuizForStudent(quiz, !!attempted) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit answers for a quiz, auto-grade, and generate an AI
//          knowledge-gap analysis for the attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Frontend sends: { answers: { [questionId]: selectedOptionText }, timeTaken }
    const answers = req.body.answers || {};
    const timeTaken = req.body.timeTaken || 0;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const answerRecords = [];
    const topicTotals = {};
    const missedForAI = [];

    quiz.questions.forEach((q) => {
      const selectedText = answers[q._id.toString()];
      const topic = q.topic || quiz.topic;

      if (!topicTotals[topic]) topicTotals[topic] = { score: 0, total: 0 };
      topicTotals[topic].total += 1;

      if (selectedText === undefined || selectedText === null || selectedText === '') {
        skipped += 1;
        answerRecords.push({ questionId: q._id, selectedOptionText: '', isCorrect: false });
        missedForAI.push({ questionText: q.questionText, selectedText: 'No answer provided', hint: q.hint });
        return;
      }

      const matchedOption = (q.answerOptions || []).find((o) => o.text === selectedText);
      const optionIndex = (q.answerOptions || []).findIndex((o) => o.text === selectedText);
      const isCorrect = matchedOption
        ? matchedOption.isCorrect === true || (q.correctAnswerIndex !== undefined && q.correctAnswerIndex === optionIndex)
        : false;

      if (isCorrect) {
        correct += 1;
        topicTotals[topic].score += 1;
      } else {
        incorrect += 1;
        missedForAI.push({ questionText: q.questionText, selectedText, hint: q.hint });
      }

      answerRecords.push({ questionId: q._id, selectedOptionText: selectedText, isCorrect });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const topicScores = Object.keys(topicTotals).map((topic) => ({
      topic,
      score: topicTotals[topic].score,
      total: topicTotals[topic].total,
    }));

    // Default AI analysis (used if Gemini call fails or nothing was missed)
    let geminiAnalysis = {
      overallStrength: percentage >= 90
        ? 'Outstanding performance across the board — this topic is well mastered.'
        : `You scored ${percentage}% on "${quiz.topic}".`,
      strongTopics: topicScores.filter((t) => t.total > 0 && t.score / t.total >= 0.75).map((t) => t.topic),
      gaps: [],
      encouragement: 'Keep up the momentum — consistent practice compounds fast!',
    };

    if (missedForAI.length > 0) {
      try {
        const prompt = `
          You are an adaptive AI learning assistant. A student completed a quiz on "${quiz.topic}"
          and scored ${correct}/${totalQuestions} (${percentage}%).

          Here are the questions they missed or skipped:
          ${JSON.stringify(missedForAI, null, 2)}

          Return ONLY a raw JSON object (no markdown, no code fences) matching exactly this schema:
          {
            "overallStrength": "1-2 sentence overall assessment",
            "strongTopics": ["topic1", "topic2"],
            "gaps": [
              { "topic": "string", "severity": "high|medium|low", "description": "1 sentence", "recommendations": ["short actionable tip", "short actionable tip"] }
            ],
            "encouragement": "1 short encouraging sentence"
          }
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const parsed = JSON.parse(response.text.trim());
        geminiAnalysis = { ...geminiAnalysis, ...parsed };
      } catch (aiErr) {
        // Keep the deterministic fallback above if the AI call/parse fails
        geminiAnalysis.gaps = [{
          topic: quiz.topic,
          severity: percentage < 50 ? 'high' : 'medium',
          description: `Review the questions you missed on ${quiz.topic}.`,
          recommendations: ['Revisit the course materials for this topic', 'Retake the quiz once you feel ready'],
        }];
      }
    }

    const submission = await Submission.create({
      student: req.user._id,
      quiz: quiz._id,
      courseId: quiz.courseId,
      answers: answerRecords,
      score: correct,
      totalQuestions,
      percentage,
      correct,
      incorrect,
      skipped,
      timeTaken,
      topicScores,
      geminiAnalysis,
      knowledgeGapFeedback: geminiAnalysis.overallStrength,
    });

    res.status(200).json({
      success: true,
      message: percentage >= 60 ? 'Evaluation passed!' : 'Knowledge gap detected.',
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error running quiz submission engine.', error: error.message });
  }
};

// @desc    Get a single quiz attempt (result) in full detail
// @route   GET /api/quizzes/attempts/:id
// @access  Private (Student)
const getResultById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('quiz', 'title topic');
    if (!submission) return res.status(404).json({ success: false, message: 'Result not found' });

    const course = submission.courseId ? await Course.findById(submission.courseId).select('title') : null;

    res.status(200).json({
      success: true,
      data: {
        _id: submission._id,
        score: submission.percentage,
        correct: submission.correct,
        incorrect: submission.incorrect,
        skipped: submission.skipped,
        timeTaken: submission.timeTaken,
        topicScores: submission.topicScores,
        geminiAnalysis: submission.geminiAnalysis,
        quiz: submission.quiz,
        course,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all quiz attempts for the logged-in student
// @route   GET /api/quizzes/my-results
// @access  Private (Student)
const getMyResults = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });

    const courseIds = [...new Set(submissions.filter((s) => s.courseId).map((s) => s.courseId.toString()))];
    const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
    const courseMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c]));

    const data = submissions.map((s) => ({
      _id: s._id,
      quiz: s.quiz,
      course: s.courseId ? courseMap[s.courseId.toString()] : null,
      score: s.percentage,
      correct: s.correct,
      incorrect: s.incorrect,
      skipped: s.skipped,
      createdAt: s.createdAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuizzes, getQuizById, submitQuiz, getResultById, getMyResults };

const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Full performance report for the logged-in student
// @route   GET /api/reports/student
// @access  Private (Student)
const getStudentReport = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('quiz', 'title topic')
      .sort({ createdAt: 1 });

    const totalAttempts = submissions.length;
    const avgScore = totalAttempts > 0
      ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / totalAttempts)
      : 0;

    const courseIds = [...new Set(submissions.filter((s) => s.courseId).map((s) => s.courseId.toString()))];
    const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
    const courseMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c]));
    const enrolledCourses = await Course.countDocuments({ students: req.user._id });

    // Score trend over time
    const quizHistory = submissions.map((s, i) => ({
      day: new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: s.percentage,
    }));

    // Topic performance rollup across all attempts
    const topicMap = {};
    submissions.forEach((s) => {
      (s.topicScores || []).forEach((ts) => {
        if (!topicMap[ts.topic]) topicMap[ts.topic] = { total: 0, score: 0, questionTotal: 0 };
        topicMap[ts.topic].total += 1;
        topicMap[ts.topic].score += ts.total > 0 ? (ts.score / ts.total) * 100 : 0;
      });
    });
    const topicPerformance = Object.keys(topicMap).map((topic) => ({
      topic,
      avgScore: Math.round(topicMap[topic].score / topicMap[topic].total),
    }));

    const weakTopics = topicPerformance.filter((t) => t.avgScore < 60).map((t) => t.topic);
    const knowledgeGaps = weakTopics.length;

    const recentAttempts = submissions
      .slice(-10)
      .reverse()
      .map((s) => ({
        _id: s._id,
        quizTitle: s.quiz?.title || 'Quiz',
        courseTitle: s.courseId ? courseMap[s.courseId.toString()]?.title || '' : '',
        score: s.percentage,
        correct: s.correct,
        incorrect: s.incorrect,
        createdAt: s.createdAt,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        avgScore,
        enrolledCourses,
        knowledgeGaps,
        quizHistory,
        topicPerformance,
        weakTopics,
        recentAttempts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Performance report scoped to a single course
// @route   GET /api/reports/course/:courseId
// @access  Private (Student)
const getCourseReport = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id, courseId: req.params.courseId })
      .populate('quiz', 'title topic')
      .sort({ createdAt: 1 });

    const totalAttempts = submissions.length;
    const avgScore = totalAttempts > 0
      ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / totalAttempts)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        avgScore,
        attempts: submissions.map((s) => ({
          _id: s._id,
          quizTitle: s.quiz?.title,
          score: s.percentage,
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentReport, getCourseReport };

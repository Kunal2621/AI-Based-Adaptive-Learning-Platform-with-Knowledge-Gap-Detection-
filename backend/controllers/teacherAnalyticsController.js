const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

// @desc    Get Analytics summary for Teacher Dashboard
// @route   GET /api/teacher/analytics
// @access  Private (Teacher only)
const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // 1. Fetch Teacher's Courses and Quizzes
    const teacherCourses = await Course.find({ teacher: teacherId });
    const teacherQuizzes = await Quiz.find({ teacher: teacherId }).select('_id');
    const quizIds = teacherQuizzes.map(q => q._id);

    // 2. Fetch submissions for teacher's quizzes
    const submissions = await Submission.find({ quizId: { $in: quizIds } });

    // 3. Knowledge Gap Analysis (Weak Topics Aggregation)
    const knowledgeGapStats = await Submission.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      { $unwind: "$topicPerformance" }, 
      {
        $group: {
          _id: "$topicPerformance.topic",
          avgAccuracy: { $avg: "$topicPerformance.accuracy" },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { avgAccuracy: 1 } } // Lowest accuracy topics come first
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalCourses: teacherCourses.length,
        totalQuizzes: teacherQuizzes.length,
        totalSubmissions: submissions.length,
        knowledgeGaps: knowledgeGapStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Teacher analytics computation failed.', 
      error: error.message 
    });
  }
};

// @desc    Get Detailed Performance Reports for Export
// @route   GET /api/teacher/reports
// @access  Private (Teacher only)
const getTeacherReports = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const teacherQuizzes = await Quiz.find({ teacher: teacherId }).select('_id');
    const quizIds = teacherQuizzes.map(q => q._id);

    // Fetch student performance records for reports
    const reports = await Submission.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name email')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: reports.length, 
      data: reports 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Teacher reports generation failed.', 
      error: error.message 
    });
  }
};

module.exports = {
  getTeacherAnalytics,
  getTeacherReports
};
const User = require('../models/User');
const Course = require('../models/Course');
const Submission = require('../models/Submission');

// @desc    Get Platform-wide Analytics for Admin
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAdminAnalytics = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // 1. Monthly User Registrations (User Growth)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Platform-wide Top Knowledge Gaps
    const globalKnowledgeGaps = await Submission.aggregate([
      { $unwind: "$weakAreas" },
      {
        $group: {
          _id: "$weakAreas",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userGrowth,
        globalKnowledgeGaps
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Admin analytics compilation failed.', 
      error: error.message 
    });
  }
};

// @desc    Get System Health & Usage Reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getAdminReports = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const totalSubmissions = await Submission.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      success: true,
      reports: {
        generatedAt: new Date(),
        totalStudents,
        totalTeachers,
        totalCourses,
        totalExamAttempts: totalSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Admin system report generation failed.', 
      error: error.message 
    });
  }
};

module.exports = {
  getAdminAnalytics,
  getAdminReports
};
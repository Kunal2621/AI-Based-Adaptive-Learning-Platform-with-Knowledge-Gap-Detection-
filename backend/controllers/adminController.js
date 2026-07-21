const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

// @desc    Get global analytics summary for Admin Control Center
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Management tier only.' });
    }

    // 1. Fetch cross-collection live counters
    const totalUsers = await User.countDocuments({});
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const totalCourses = await Course.countDocuments({});
    const totalQuizzes = await Quiz.countDocuments({});
    const totalSubmissions = await Submission.countDocuments({});

    // 🧠 2. ADVANCED AI METRIC: Global Platform Knowledge Gap Insight Summary
    const avgScoreAggregation = await Submission.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    const platformAverageScore = avgScoreAggregation.length > 0 ? avgScoreAggregation[0].avgScore.toFixed(2) : 0;

    // 3. Fetch recent user registrations
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
        totalQuizzes,
        totalSubmissions,
        platformAverageScore: parseFloat(platformAverageScore)
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Administrative aggregation failure.', error: error.message });
  }
};

// @desc    Fetch list of all active registered system profiles
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const users = await User.find().select('-password').sort({ name: 1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed fetching profile indexes.', error: error.message });
  }
};

// @desc    Modify user access role permissions
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Target role parameter required.' });

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role: role.toLowerCase() }, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User profile target missing.' });

    res.status(200).json({ success: true, message: 'Access node mutated successfully.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Role mutation exception occurred.', error: error.message });
  }
};

// @desc    Hard purge a user profile registry from database + Cascade Delete Data
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const userId = req.params.id;

    // 🔒 PROTECTION: Admin khud ko delete na kar sake
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Security Breach: Self-deletion is prohibited.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User profile target missing.' });

    const userRole = user.role.toLowerCase();

    // 🧹 CASCADE CLEANUP
    if (userRole === 'teacher') {
      await Course.deleteMany({ teacher: userId });
      await Quiz.deleteMany({ creator: userId });
    } else if (userRole === 'student') {
      await Submission.deleteMany({ studentId: userId });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Account context and relative collections purged permanently.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Purge script crashed.', error: error.message });
  }
};

// @desc    Get all courses across platform for moderation
// @route   GET /api/admin/courses
// @access  Private (Admin only)
const getAllCoursesAdmin = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const courses = await Course.find().populate('teacher', 'name email');
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Moderation index fetch failed.', error: error.message });
  }
};

// 🆕 @desc  Delete a course (Admin Moderation)
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin only)
const deleteCourseAdmin = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const courseId = req.params.id;
    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Target course missing.' });
    }

    // 🧹 Course ke sath uske quizzes bhi delete kar do
    await Quiz.deleteMany({ courseId: courseId });

    res.status(200).json({ success: true, message: 'Course and related quizzes purged successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Course deletion failed.', error: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCoursesAdmin,
  deleteCourseAdmin
};
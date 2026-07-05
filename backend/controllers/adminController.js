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

    // 2. Fetch recent user registrations to display in administrative tables
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
        totalQuizzes,
        totalSubmissions
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

    const { role } = req.body; // Expecting: 'student', 'teacher', or 'admin'
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

// @desc    Hard purge a user profile registry from database
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User profile target missing.' });

    res.status(200).json({ success: true, message: 'Account context purged permanently from global schema logs.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Purge script crashed.', error: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser
};
const express = require('express');
const router = express.Router();

// 💡 Corrected: getAllCoursesAdmin ko bhi destructure import me add kar diya hai
const { 
  getAdminDashboard, 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getAllCoursesAdmin,
  deleteCourseAdmin 
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');

// 1. Dashboard Metrics
router.get('/dashboard', protect, getAdminDashboard);

// 2. User Management Routes
router.get('/users', protect, getAllUsers);
router.put('/users/:id/role', protect, updateUserRole);
router.delete('/users/:id', protect, deleteUser);

// 3. Course Moderation Route
router.get('/courses', protect, getAllCoursesAdmin);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getNotifications,
  markAllNotificationsRead,
} = require('../controllers/studentController');
const { getEnrolledCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getStudentDashboard);
router.get('/enrolled-courses', protect, getEnrolledCourses);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;

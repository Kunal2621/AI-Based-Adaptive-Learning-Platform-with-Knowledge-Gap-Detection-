const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getTeacherAnalytics, 
  getTeacherReports 
} = require('../controllers/teacherAnalyticsController');

// Teacher Analytics & Reports Endpoints
router.get('/analytics', protect, getTeacherAnalytics);
router.get('/reports', protect, getTeacherReports);

module.exports = router;
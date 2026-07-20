const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getAdminAnalytics, 
  getAdminReports 
} = require('../controllers/adminAnalyticsController');

// Admin Analytics & Reports Endpoints
router.get('/analytics', protect, getAdminAnalytics);
router.get('/reports', protect, getAdminReports);

module.exports = router;
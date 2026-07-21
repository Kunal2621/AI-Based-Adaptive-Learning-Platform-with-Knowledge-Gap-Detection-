const express = require('express');
const router = express.Router();
const { getStudentReport, getCourseReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentReport);
router.get('/course/:courseId', protect, getCourseReport);

module.exports = router;

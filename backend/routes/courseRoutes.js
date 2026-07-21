const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, enrollCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;

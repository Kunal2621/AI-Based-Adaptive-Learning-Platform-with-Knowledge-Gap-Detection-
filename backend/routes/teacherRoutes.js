const express = require("express");
const router = express.Router();

const { 
  getTeacherDashboard, 
  getTeacherAnalytics, 
  createCourse, 
  getTeacherCourses,
} = require('../controllers/teacherController');

const { protect } = require('../middleware/authMiddleware');

// Mount Dashboard and Visual Chart analytics channels
router.get('/dashboard', protect, getTeacherDashboard);
router.get('/analytics', protect, getTeacherAnalytics);

// Mount course orchestration endpoints matching form submissions
router.route('/courses')
  .post(protect, createCourse)
  .get(protect, getTeacherCourses);



const {
  getCourseById,
  updateCourse,
  deleteCourse,
  getTeacherStudents,
  getTeacherProfile,
  updateTeacherProfile,
  getQuizPerformanceReport,
  updateLessonContent
} = require("../controllers/teacherController");


// Courses
router
  .route("/courses")
  .post(protect, createCourse)
  .get(protect, getTeacherCourses);

router
  .route("/courses/:id")
  .get(protect, getCourseById)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

// 🟢 FIX: was missing entirely - LessonContent.jsx's "Save Changes" button
// PUTs to this exact path and always 404'd.
router.put("/courses/:id/modules/:moduleId/lessons/:lessonId", protect, updateLessonContent);

// Students
router.get("/students", protect, getTeacherStudents);

// Analytics
router.get("/analytics", protect, getTeacherAnalytics);

// Teacher Profile
router
  .route("/profile")
  .get(protect, getTeacherProfile)
  .put(protect, updateTeacherProfile);

// Quiz Report
router.get(
  "/quiz-reports/:quizId",
  protect,
  getQuizPerformanceReport
);


module.exports = router;
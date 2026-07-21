const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

// Shapes a raw Course document into what the student frontend expects:
// `subject` (from `category`) and `topics[].materials` (from `modules[].lessons`).
// Also attaches a best-effort `progress` percentage based on quiz attempts.
const mapCourseForStudent = (course, progress = 0) => ({
  _id: course._id,
  title: course.title,
  description: course.description,
  subject: course.category,
  category: course.category,
  level: course.level,
  teacher: course.teacher,
  thumbnail: course.thumbnail || null,
  topics: (course.modules || []).map((m) => ({
    title: m.moduleName,
    materials: (m.lessons || []).map((l) => ({
      type: 'note',
      title: l.title,
      content: l.content || '',
    })),
  })),
  videos: [],
  progress,
  createdAt: course.createdAt,
});

const computeProgress = async (courseId, studentId) => {
  try {
    const totalQuizzes = await Quiz.countDocuments({ courseId });
    if (totalQuizzes === 0) return 0;
    const attemptedQuizIds = await Submission.distinct('quiz', { student: studentId, courseId });
    return Math.min(100, Math.round((attemptedQuizIds.length / totalQuizzes) * 100));
  } catch (e) {
    return 0;
  }
};

// @desc    Get all active courses on the platform
// @route   GET /api/courses
// @access  Private (Student)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'fullName email');
    const studentId = req.user._id;
    const mapped = await Promise.all(
      courses.map(async (c) => mapCourseForStudent(c, await computeProgress(c._id, studentId)))
    );
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single course with full topic/module breakdown
// @route   GET /api/courses/:id
// @access  Private (Student)
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'fullName email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const progress = await computeProgress(course._id, req.user._id);
    res.status(200).json({ success: true, data: mapCourseForStudent(course, progress) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll the logged-in student in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const studentId = req.user._id.toString();
    const alreadyEnrolled = (course.students || []).some((s) => s.toString() === studentId);
    if (!alreadyEnrolled) {
      course.students.push(req.user._id);
      await course.save();
    }

    res.status(200).json({ success: true, message: 'Enrolled successfully', data: { courseId: course._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses the logged-in student is enrolled in
// @route   GET /api/student/enrolled-courses
// @access  Private (Student)
const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id }).populate('teacher', 'fullName email');
    const mapped = await Promise.all(
      courses.map(async (c) => mapCourseForStudent(c, await computeProgress(c._id, req.user._id)))
    );
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCourses, getCourseById, enrollCourse, getEnrolledCourses, mapCourseForStudent, computeProgress };

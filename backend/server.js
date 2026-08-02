// MUST BE AT THE VERY TOP OF SERVER.JS
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Imported Routes Layers
const authRoutes = require('./routes/authRoutes'); 
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes'); // 🟢 Main Unified Quiz Router

// Load controllers and middleware
const { protect } = require('./middleware/authMiddleware');
const { generateAIQuiz } = require('./controllers/aiController');
const { getEnrolledCourses } = require('./controllers/courseController');

// Analytics & Reports Routes
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const teacherAnalyticsRoutes = require('./routes/teacherAnalyticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Models Import for Compatibility
const Course = require('./models/Course'); 
const Quiz = require('./models/Quiz');
const User = require('./models/User'); 

// Connect to Database
connectDB();

const app = express();

// Standard Production Middlewares
app.use(cors());
app.use(express.json());

// =========================================================================
// 🛠️ COMPATIBILITY & AUTH ROUTES
// =========================================================================

// Handle GET /api/auth/me
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User profile not found' });
    
    res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Auth error.', error: err.message });
  }
});

// 🟢 DIRECT AI QUIZ GENERATION ALIASES
app.post('/api/quiz/generate', protect, generateAIQuiz);
app.post('/api/quizzes/generate', protect, generateAIQuiz);
app.post('/api/ai/generate-quiz', protect, generateAIQuiz);

// Notifications Route
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const Submission = require('./models/Submission');

    const teacherCourses = await Course.find({ teacher: req.user._id });
    const courseIds = teacherCourses.map(c => c._id);
    const courseMap = new Map(teacherCourses.map(c => [c._id.toString(), c]));

    const submissions = await Submission.find({ courseId: { $in: courseIds } })
      .populate('student', 'name email')
      .populate('quiz', 'title topic')
      .sort({ createdAt: -1 })
      .limit(50);

    const notifications = submissions.map((s) => {
      const course = courseMap.get(s.courseId?.toString());
      let type = 'ASSIGNMENT';
      let priority = 'Medium';
      let title = 'Quiz Submitted';

      if (s.percentage >= 85) {
        type = 'HIGH_SCORE';
        priority = 'Low';
        title = 'Excellent Performance';
      } else if (s.percentage < 60) {
        type = 'KNOWLEDGE_GAP';
        priority = 'High';
        title = 'Knowledge Gap Detected';
      } else {
        type = 'LOW_SCORE';
        priority = 'Medium';
        title = 'Quiz Completed';
      }

      return {
        _id: s._id,
        type,
        priority,
        title,
        message: s.knowledgeGapFeedback || `${s.student?.name || 'A student'} scored ${s.percentage}% on "${s.quiz?.title || 'a quiz'}".`,
        student: s.student ? { name: s.student.name, email: s.student.email } : null,
        course: course ? { title: course.title } : null,
        isRead: false,
        createdAt: s.createdAt
      };
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications.', error: err.message });
  }
});

// Assign Quiz To Students Route
app.put('/api/quizzes/:id/assign', protect, async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isAssigned: true },
      { new: true }
    );
    
    if (!updatedQuiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz assigned successfully to students!',
      data: updatedQuiz
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 🚀 ROUTE BINDINGS
// =========================================================================

app.use('/api/auth', authRoutes); 
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

// Courses & Enrollment APIs
app.use('/api/courses', require('./routes/courseRoutes'));
app.get('/api/student/enrolled-courses', protect, getEnrolledCourses);

// Student Reports, Recommendations, & Users APIs
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 🟢 FIX: UNIFIED QUIZ MANAGEMENT ROUTES (Points both singular & plural endpoints to updated quizRoutes)
app.use('/api/quiz', quizRoutes);
app.use('/api/quizzes', quizRoutes);

// Analytics & Chatbot Routes
app.use('/api/admin', adminAnalyticsRoutes);   
app.use('/api/teacher', teacherAnalyticsRoutes); 
app.use('/api/chatbot', chatbotRoutes);

// Base Route Test
app.get('/', (req, res) => {
  res.send('Knowledge Guru API running smoothly with Complete AI Integration...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🖥️  Server triggered successfully on port ${PORT}`);
});
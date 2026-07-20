const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// Imported Routes Layers
const authRoutes = require('./routes/authRoutes'); 
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load controllers and middleware for the proxy intercept handler
const { interceptAndGenerateAIQuiz } = require('./controllers/teacherController');
const { protect } = require('./middleware/authMiddleware');
// Analytics & Reports Routes
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const teacherAnalyticsRoutes = require('./routes/teacherAnalyticsRoutes');

// Models Import for Compatibility
const Course = require('./models/Course'); 
const Quiz = require('./models/Quiz');
const User = require('./models/User'); 

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Production Middlewares
app.use(cors());
app.use(express.json());

// 🔥 INTERCEPTOR HOOK: Frontend Teammate ke CreateQuiz manual payload ko handle karega
app.post('/api/quiz', protect, interceptAndGenerateAIQuiz);

// =========================================================================
// 🛠️ FIXES: Added Missing Compatibility Routes to Fix 404 Errors
// =========================================================================

// Handle GET /api/auth/me for frontend auth context state persistent
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
        role: user.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Auth persistent loop crack.', error: err.message });
  }
});

// 👉 NEW COMPATIBILITY ROUTE: Fix 404 /api/student/enrolled-courses
app.get('/api/student/enrolled-courses', protect, async (req, res) => {
  try {
    // Abhi ke liye platform ke courses hi return kar rahe hain taaki blank na dikhe
    const courses = await Course.find().populate('teacher', 'name');
    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 NEW COMPATIBILITY ROUTE: Fix 404 /api/courses (All active courses)
app.get('/api/courses', protect, async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name');
    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🛠️ Updated Single Course Fetching Route with Multi-Format Support
app.get('/api/courses/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    // Dono formats bhej rahe hain taaki agar frontend res.data.data dhoonde ya res.data.course, dono chal jayein!
    res.status(200).json({ 
      success: true, 
      data: course,
      course: course,
      modules: course.modules || [],
      topicsCount: course.modules ? course.modules.length : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quiz by Course ID Filtering Route (404 /api/quizzes Fix)
app.get('/api/quizzes', protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId } : {};
    const quizzes = await Quiz.find(query);
    res.status(200).json({ success: true, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// =========================================================================

// Base Router Bindings
app.use('/api/auth', authRoutes); 
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

// Fallback/Core dynamic quiz pipeline channel
app.use('/api/quiz', require('./routes/quizRoutes'));

// Analytics & Reports Endpoints Mount
app.use('/api/admin', adminAnalyticsRoutes);   // Handles /api/admin/analytics & /api/admin/reports
app.use('/api/teacher', teacherAnalyticsRoutes); // Handles /api/teacher/analytics & /api/teacher/reports

// Base Route Test
app.get('/', (req, res) => {
  res.send('Knowledge Guru API running smoothly with Complete AI Integration...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🖥️  Server triggered successfully on port ${PORT}`);
});
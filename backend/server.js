const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// Imported Routes Layers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentQuizRoutes = require('./routes/studentQuizRoutes');
const reportRoutes = require('./routes/reportRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Load controller + middleware for the teacher's manual quiz-create endpoint
const { interceptAndGenerateAIQuiz } = require('./controllers/teacherController');
const { protect } = require('./middleware/authMiddleware');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Production Middlewares
app.use(cors());
app.use(express.json());

// Teacher's manual "Create Quiz" form posts here (kept as a singular /api/quiz
// route so it never collides with the plural /api/quizzes student routes below)
app.post('/api/quiz', protect, interceptAndGenerateAIQuiz);
app.use('/api/quiz', require('./routes/quizRoutes'));

// Base Router Bindings
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', studentQuizRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Base Route Test
app.get('/', (req, res) => {
  res.send('Knowledge Guru API running smoothly with Complete AI Integration...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🖥️  Server triggered successfully on port ${PORT}`);
});

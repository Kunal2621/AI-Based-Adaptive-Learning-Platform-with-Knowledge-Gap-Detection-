const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitQuiz } = require('../controllers/quizController');
const { interceptAndGenerateAIQuiz } = require('../controllers/teacherController');
const { generateAIQuiz } = require('../controllers/aiController');

// 🟢 FIX: "Create Quiz" (manual form, CreateQuiz.jsx) posts to POST /api/quiz.
// No route ever existed for this -> always returned 404. Wired it to the AI
// interceptor so the manual form still produces a full AI-generated quiz
// saved against the selected course.
router.post('/', protect, interceptAndGenerateAIQuiz);

// Standard endpoint for baseline core generation pipeline.
// NOTE: server.js also registers app.post('/api/quiz/generate', ...) directly
// using controllers/aiController.js BEFORE this router is mounted, so that
// handler wins in practice for real traffic. This route is kept as a fallback
// using the SAME controller (previously it used quizController's version,
// which returns a different, incompatible question schema - see fix notes).
router.post('/generate', protect, generateAIQuiz);
router.post('/submit/:id', protect, submitQuiz);

module.exports = router;
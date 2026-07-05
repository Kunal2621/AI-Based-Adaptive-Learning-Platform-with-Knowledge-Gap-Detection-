const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateAIQuiz ,submitQuiz } = require('../controllers/quizController');

// Standard endpoint for baseline core generation pipeline
router.post('/generate', protect, generateAIQuiz);
router.post('/submit/:id', protect, submitQuiz);

module.exports = router;
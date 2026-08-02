const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// 🟢 Controllers import
const { 
  submitQuiz, 
  getQuizById, 
  getQuizzes, 
  getMyResults, 
  getAttemptById 
} = require('../controllers/quizController'); 

const { interceptAndGenerateAIQuiz } = require('../controllers/teacherController');
const { generateAIQuiz } = require('../controllers/aiController');

// -------------------------------------------------------------
// 1. SPECIFIC / STATIC GET ROUTES (Pehle aani chahiye)
// -------------------------------------------------------------

// 🟢 GET All Quizzes (e.g., GET /api/quizzes or /api/quizzes?courseId=xxx)
router.get('/', protect, getQuizzes);

// 🟢 GET Student Quiz Results/Attempts List (MUST BE ABOVE /:id)
router.get('/my-results', protect, getMyResults);

// 🟢 GET Single Attempt Analysis Details by Submission ID
router.get('/attempts/:id', protect, getAttemptById);

// -------------------------------------------------------------
// 2. DYNAMIC PARAMETER GET ROUTES (Hamesha static routes ke neeche)
// -------------------------------------------------------------

// 🟢 GET Single Quiz Details by Quiz ID
router.get('/:id', protect, getQuizById);

// -------------------------------------------------------------
// 3. POST ROUTES (Actions & Submissions)
// -------------------------------------------------------------

// 🟢 "Create Quiz" manual form
router.post('/', protect, interceptAndGenerateAIQuiz);

// 🟢 AI Generation endpoint
router.post('/generate', protect, generateAIQuiz);

// 🟢 Submit Quiz
router.post('/submit/:id', protect, submitQuiz);

module.exports = router;
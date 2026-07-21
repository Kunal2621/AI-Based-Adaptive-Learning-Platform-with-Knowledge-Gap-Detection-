const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getResultById,
  getMyResults,
} = require('../controllers/studentQuizController');

// NOTE: order matters — /my-results and /attempts/:id must be declared
// before the generic /:id route or Express will try to treat "my-results"
// and "attempts" as quiz ids.
router.get('/my-results', protect, getMyResults);
router.get('/attempts/:id', protect, getResultById);

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;

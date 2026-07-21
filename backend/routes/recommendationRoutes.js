const express = require('express');
const router = express.Router();
const { generateStudyMaterials, getMyRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyRecommendations);
router.post('/generate', protect, generateStudyMaterials);

module.exports = router;

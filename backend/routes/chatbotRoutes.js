const express = require('express');
const router = express.Router();
const { getSessions, getSessionById, postMessage, deleteSession } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sessions', protect, getSessions);
router.get('/sessions/:id', protect, getSessionById);
router.delete('/sessions/:id', protect, deleteSession);
router.post('/message', protect, postMessage);

module.exports = router;

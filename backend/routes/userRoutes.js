const express = require('express');
const router = express.Router();
const multer = require('multer');
const { updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// In-memory storage — avatar is persisted as a base64 data URL on the User
// document (no external file storage is configured for this project).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

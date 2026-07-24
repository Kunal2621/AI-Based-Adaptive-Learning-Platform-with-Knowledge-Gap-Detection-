// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, verifyRegisterOTP, loginUser, googleAuth, forgotPassword, resetPassword} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-otp', verifyRegisterOTP); // Make sure this route exists!
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAllUsers, updateUserRole, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getAdminDashboard);
router.get('/users', protect, getAllUsers);
router.put('/users/:id/role', protect, updateUserRole);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
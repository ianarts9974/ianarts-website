const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

// Public login route
router.post('/login', authController.login);

// Protected token verification & profile route
router.get('/verify', requireAdmin, authController.verify);

// Protected password change route
router.post('/change-password', requireAdmin, authController.changePassword);

module.exports = router;

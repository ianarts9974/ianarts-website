const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAdmin } = require('../middleware/auth');

// Admin dashboard KPI summary (Protected)
router.get('/', requireAdmin, statsController.getDashboardStats);

module.exports = router;

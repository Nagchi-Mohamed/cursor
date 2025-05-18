const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuth');
const { getPlatformStats } = require('../controllers/adminStatsController');

// GET /api/v1/admin/stats - Get platform statistics
router.get('/stats', isAdmin, getPlatformStats);

module.exports = router; 
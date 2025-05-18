const express = require('express');
const router = express.Router();
const solverController = require('../controllers/solverController');
const { protect } = require('../middleware/auth');

// POST /api/solver/query-wolfram
router.post('/query-wolfram', protect, solverController.queryWolframAlpha);

module.exports = router; 
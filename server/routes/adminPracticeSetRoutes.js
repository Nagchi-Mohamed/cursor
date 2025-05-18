const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { 
  getPracticeSets,
  getPracticeSet,
  createPracticeSet,
  updatePracticeSet,
  deletePracticeSet
} = require('../controllers/adminPracticeSetController');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(isAdmin);

// GET /api/admin/practice-sets
router.get('/', getPracticeSets);

// GET /api/admin/practice-sets/:id
router.get('/:id', getPracticeSet);

// POST /api/admin/practice-sets
router.post('/', createPracticeSet);

// PUT /api/admin/practice-sets/:id
router.put('/:id', updatePracticeSet);

// DELETE /api/admin/practice-sets/:id
router.delete('/:id', deletePracticeSet);

module.exports = router; 
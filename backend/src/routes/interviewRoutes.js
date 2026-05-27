const express = require('express');
const {
  createInterview,
  getInterviews,
  getInterviewById,
  saveAnswer,
  submitEvaluation,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createInterview);
router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterviewById);
router.put('/:id/answer', protect, saveAnswer);
router.post('/:id/evaluate', protect, submitEvaluation);

module.exports = router;

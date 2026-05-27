const express = require('express');
const multer = require('multer');
const {
  uploadResume,
  getResumes,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for memory uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/upload', protect, upload.single('file'), uploadResume);
router.get('/', protect, getResumes);
router.delete('/:id', protect, deleteResume);

module.exports = router;

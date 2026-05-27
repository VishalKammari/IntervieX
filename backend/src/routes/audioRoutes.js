const express = require('express');
const multer = require('multer');
const { textToSpeech, speechToText } = require('../controllers/audioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage config for audio files (stored in memory as buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/tts', protect, textToSpeech);
router.post('/stt', protect, upload.single('file'), speechToText);

module.exports = router;

const express = require('express');
const {
	getSpeechConfig,
	transcribeSpeech,
} = require('../controllers/transcriptionController');

const router = express.Router();

router.get('/speech/config', getSpeechConfig);
router.post('/speech/transcribe', transcribeSpeech);

module.exports = router;

const express = require('express');
const { getTranslationConfig } = require('../controllers/translationController');

const router = express.Router();

router.get('/translation/config', getTranslationConfig);

module.exports = router;

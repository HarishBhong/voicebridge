const express = require('express');
const { generateSummary } = require('../controllers/summaryController');

const router = express.Router();

router.post('/summary', generateSummary);

module.exports = router;

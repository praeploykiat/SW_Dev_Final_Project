const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../controller/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateAIResponse);

module.exports = router;
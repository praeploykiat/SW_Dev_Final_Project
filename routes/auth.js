const express = require('express');
const { register, login, getMe, logout } = require('../controller/auth');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/resume');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const { requestPasswordReset, resetPassword } = require('../controller/passwordReset');

// Route to request password reset
router.post('/requestPasswordReset', requestPasswordReset);

// Route to reset password using token and user ID
router.put('/resetPassword/:id/:token', resetPassword);

module.exports = router;

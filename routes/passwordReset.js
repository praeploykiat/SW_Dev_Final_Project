const express = require('express');
const router = express.Router();
const { requestPasswordReset, resetPassword } = require('../controller/passwordReset.js');

//const {getBookings,getBooking,addBooking,updateBooking,deleteBooking} = require('../controller/bookings');
//const { protect } = require('../middleware/auth');

// Route to request password reset
router.post('/requestPasswordReset', requestPasswordReset);

// Route to reset password
// router.post('/requestPassword', protect, resetPassword);
router.put('/resetPassword/:id/:token', resetPassword);

module.exports = router;
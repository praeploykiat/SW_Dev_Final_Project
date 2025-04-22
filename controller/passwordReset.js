const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// @desc    Send password reset link
// @route   POST /api/v1/auth/requestPasswordReset
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User doesn't exist" });

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });

    const resetURL = `http://localhost:5000/api/v1/auth/resetPassword/${user._id}/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      text: `Click the link below to reset your password:\n\n${resetURL}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Password reset link sent' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset user password using token in URL
// @route   PUT /api/v1/auth/resetPassword/:id/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
  
    try {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
      const secret = process.env.JWT_SECRET + user.password;
  
      // Must verify token BEFORE modifying password
      try {
        jwt.verify(token, secret);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token', detail: err.message });
      }
  
      user.password = password; // Pre-save hook will hash it
      await user.save();
  
      console.log("✅ Password reset for:", user.email);
  
      res.status(200).json({ success: true, message: 'Password has been reset' });
    } catch (err) {
      console.error(err.stack);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
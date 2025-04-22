const jwt = require('jsonwebtoken');        // For generating a secure, time-limited token
const nodemailer = require('nodemailer');   // For sending password reset emails
const User = require('../models/User');     // User model (MongoDB)
const fs = require('fs');                   // For reading the HTML email template
const path = require('path');               // To help build cross-platform file paths


// @desc    Send password reset link via email
// @route   POST /api/v1/auth/requestPasswordReset
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

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

    const filePath = path.join(__dirname, '../utils/resetPasswordEmail.html');
    let emailHTML = fs.readFileSync(filePath, 'utf8');
    emailHTML = emailHTML
      .replace('{{name}}', user.name)
      .replace('{{resetURL}}', resetURL);

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Reset Your Password - Online Job Fair',
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset link sent' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset user password using token from email
// @route   PUT /api/v1/auth/resetPassword/:id/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token', detail: err.message });
    }

    user.password = password; // Will be hashed by Mongoose pre-save hook
    await user.save();

    console.log('✅ Password reset for:', user.email);

    res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

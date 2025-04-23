const fs = require('fs');
const path = require('path');
const User = require('../models/User');

exports.updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    user.resume = req.file.path;
    await user.save();

    res.status(200).json({ success: true, message: 'Resume uploaded successfully', resume: user.resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.resume) return res.status(400).json({ success: false, message: 'No resume to delete' });

    const resumePath = path.resolve(user.resume);
    if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);

    user.resume = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads/resumes', `resume-${req.user.id}.pdf`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'No resume uploaded yet' });

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to retrieve resume' });
  }
};

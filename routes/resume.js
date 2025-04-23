const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/resume');

const {
  updateResume,
  deleteResume,
  getResume
} = require('../controller/resumeController');

router.put('/', protect, upload.single('resume'), updateResume);
router.delete('/', protect, deleteResume);
router.get('/', protect, getResume);

module.exports = router;

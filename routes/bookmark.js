const express = require('express');
const router = express.Router();
const { addBookmark, getBookmarks, removeBookmark } = require('../controller/bookmark');
const { protect } = require('../middleware/auth');

router.post('/', protect, addBookmark);
router.get('/', protect, getBookmarks);
router.delete('/:companyId', protect, removeBookmark);

module.exports = router;

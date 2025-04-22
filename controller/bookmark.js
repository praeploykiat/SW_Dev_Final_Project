const Bookmark = require('../models/Bookmark');
const Company = require('../models/Company');

// ✅ Add bookmark using companyId only
exports.addBookmark = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      company: company._id
    });

    res.status(201).json({ success: true, data: bookmark });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already bookmarked' });
    }

    console.error('❌ Bookmark creation failed:', err);
    res.status(500).json({ success: false, message: 'Failed to bookmark' });
  }
};

// ✅ Get all bookmarks for current user
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate('company', 'name address tel website description');

    res.status(200).json({ success: true, data: bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookmarks' });
  }
};

// ✅ Remove bookmark using companyId only (via URL param)
exports.removeBookmark = async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const result = await Bookmark.findOneAndDelete({
      user: req.user.id,
      company: companyId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.status(200).json({ success: true, message: 'Bookmark removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove bookmark' });
  }
};

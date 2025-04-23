const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/resumes/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `resume-${req.user.id}${ext}`;
    const filePath = path.join('uploads/resumes/', filename);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // ✅ ลบไฟล์เก่าก่อน

    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: {
    files: 1 // ✅ ไม่ให้เกิน 1 ไฟล์
  }

});

module.exports = upload;

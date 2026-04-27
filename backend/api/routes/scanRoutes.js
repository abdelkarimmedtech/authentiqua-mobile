const express = require('express');
const multer = require('multer');
const { scanPdf } = require('../controllers/scanController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are supported.'));
      return;
    }

    cb(null, true);
  },
});

router.post('/pdf', upload.single('file'), scanPdf);

module.exports = router;


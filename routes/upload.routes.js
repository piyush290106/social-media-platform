// routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Use memory storage to handle uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Validate if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided (field "image")' });
    }

    // Convert buffer to data URI
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const out = await cloudinary.uploader.upload(dataUri, { folder: 'social_media_posts' });

    // Send response
    res.status(201).json({ url: out.secure_url, publicId: out.public_id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(err.http_code || 500).json({
      message: err.message || 'Image upload failed',
    });
  }
});

module.exports = router;

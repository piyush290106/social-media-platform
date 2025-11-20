const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
    if (!ok) return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PNG/JPG/JPEG/WEBP/GIF allowed"));
    cb(null, true);
  }
});

router.post("/image", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file received" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "social_media_uploads", resource_type: "image" },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    next(err);
  }
});

// Multer errors → clean messages
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "Image is larger than 10MB." });
    return res.status(400).json({ message: err.message || "Invalid image upload." });
  }
  res.status(500).json({ message: "Cloud upload failed" });
});

module.exports = router;

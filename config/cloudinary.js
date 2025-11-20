// config/cloudinary.js
const { v2: cloudinary } = require("cloudinary");
const path = require("path");

// Loads ../config.env (env file in project root)
require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });

// Basic sanity checks so we fail fast if envs are missing
["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].forEach((key) => {
  const val = process.env[key];
  if (!val || /your_|xxxx/i.test(val)) {
    throw new Error(`Cloudinary config error: ${key} is missing or looks like a placeholder`);
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;

// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

function must(name) {
  const v = process.env[name];
  if (!v || v.trim() === '' || /your_?api_?key|xxxx/i.test(v)) {
    throw new Error(`Cloudinary config error: ${name} is missing or placeholder`);
  }
  return v.trim();
}

cloudinary.config({
  cloud_name: must('CLOUDINARY_CLOUD_NAME'),
  api_key:    must('CLOUDINARY_API_KEY'),
  api_secret: must('CLOUDINARY_API_SECRET'),
  secure: true,
});

const mask = s => (typeof s === 'string' && s.length > 6 ? s.slice(0,3)+'***'+s.slice(-3) : s);

// Optional ping helper that logs instead of throwing
async function pingCloudinary() {
  try {
    const res = await cloudinary.api.ping();
    console.log('🌥️ Cloudinary ping OK:', res.status);
  } catch (e) {
    console.error('❌ Cloudinary ping failed:', {
      message: e?.message,
      http_code: e?.http_code,
      details: e
    });
  } finally {
    console.log('Cloudinary config:', {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: mask(process.env.CLOUDINARY_API_KEY)
    });
  }
}

module.exports = cloudinary;
module.exports.pingCloudinary = pingCloudinary;

// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
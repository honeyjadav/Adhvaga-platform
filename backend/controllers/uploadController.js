// backend/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'adhvaga-tours' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.json({ url: result.secure_url });
});

module.exports = { uploadImage };
const { body, validationResult } = require('express-validator');
const { ApiError } = require('../errorMiddleware');

// Runs after the body(...) chains below; turns express-validator's
// error collection into our standard ApiError shape.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const messages = result.array().map((e) => e.msg);
    return next(new ApiError(400, messages.join(', ')));
  }
  next();
};

// ~2.7 million characters ≈ 2MB base64 image (accounting for ~33% base64 overhead)
const MAX_IMAGE_SIZE = 2700000;

const createTourValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tour title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Tour title must be between 3 and 200 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  body('maxTravelers')
    .isInt({ min: 1 })
    .withMessage('Max travelers must be at least 1'),
  body('heroImage')
    .notEmpty()
    .withMessage('Hero image is required')
    .isString()
    .withMessage('Hero image must be a string')
    .custom((value) => {
      if (value.length > MAX_IMAGE_SIZE) {
        throw new Error('Each image must be under 2MB');
      }
      return true;
    }),
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array')
    .custom((value) => {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] !== 'string') {
            throw new Error(`Gallery item ${i + 1} must be a string`);
          }
          if (value[i].length > MAX_IMAGE_SIZE) {
            throw new Error('Each image must be under 2MB');
          }
        }
      }
      return true;
    }),
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Tour summary is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Summary must be between 10 and 1000 characters'),
  body('itinerary')
    .optional()
    .isArray()
    .withMessage('Itinerary must be an array'),
  validate,
];

const updateTourValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Tour title must be between 3 and 200 characters'),
  body('category')
    .optional()
    .trim(),
  body('destination')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  body('maxTravelers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max travelers must be at least 1'),
  body('heroImage')
    .optional()
    .isString()
    .withMessage('Hero image must be a string')
    .custom((value) => {
      if (value.length > MAX_IMAGE_SIZE) {
        throw new Error('Each image must be under 2MB');
      }
      return true;
    }),
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array')
    .custom((value) => {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] !== 'string') {
            throw new Error(`Gallery item ${i + 1} must be a string`);
          }
          if (value[i].length > MAX_IMAGE_SIZE) {
            throw new Error('Each image must be under 2MB');
          }
        }
      }
      return true;
    }),
  body('summary')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Summary must be between 10 and 1000 characters'),
  body('itinerary')
    .optional()
    .isArray()
    .withMessage('Itinerary must be an array'),
  validate,
];

module.exports = {
  createTourValidation,
  updateTourValidation,
};

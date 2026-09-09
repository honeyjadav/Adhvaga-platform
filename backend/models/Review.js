const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

reviewSchema.virtual('id').get(function getId() {
  return this._id.toString();
});
reviewSchema.virtual('tourId').get(function getTourId() {
  return this.tour?._id?.toString() || this.tour?.toString();
});

module.exports = mongoose.model('Review', reviewSchema);
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    tourTitle: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departureId: { type: mongoose.Schema.Types.ObjectId, required: true },
    travelers: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    paymentIntentId: { type: String, default: '' },
    paidAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

bookingSchema.virtual('id').get(function getId() {
  return this._id.toString();
});
bookingSchema.virtual('userId').get(function getUserId() {
  return this.user?._id?.toString() || this.user?.toString();
});
bookingSchema.virtual('tourId').get(function getTourId() {
  return this.tour?._id?.toString() || this.tour?.toString();
});

module.exports = mongoose.model('Booking', bookingSchema);
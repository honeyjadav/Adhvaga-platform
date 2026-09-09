const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const departureSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    maxTravelers: { type: Number, required: true, min: 1 },
    availableSlots: { type: Number, required: true, min: 0 },
  },
  { timestamps: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    departures: { type: [departureSchema], default: [] },
    heroImage: { type: String, required: true, trim: true },
    gallery: { type: [String], default: [] },
    summary: { type: String, required: true, trim: true },
    itinerary: { type: [itineraryItemSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

tourSchema.virtual('id').get(function getId() {
  return this._id.toString();
});

module.exports = mongoose.model('Tour', tourSchema);
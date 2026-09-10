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

    // Determines which booking flow applies to this tour.
    // 'fixed'    -> operator-defined departures[] with shared capacity per date
    // 'flexible' -> user picks any date; capacity checked against dailyCapacity
    bookingType: {
      type: String,
      enum: ['fixed', 'flexible'],
      required: true,
      default: 'fixed',
    },

    // --- Fixed-departure fields (used when bookingType === 'fixed') ---
    departures: { type: [departureSchema], default: [] },

    // --- Flexible-booking fields (used when bookingType === 'flexible') ---
    dailyCapacity: { type: Number, min: 1 },
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    blackoutDates: { type: [Date], default: [] },

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

// Guard against saving a tour with the wrong fields for its bookingType.
tourSchema.pre('validate', function validateBookingTypeFields(next) {
  if (this.bookingType === 'fixed') {
    if (!this.departures || this.departures.length === 0) {
      return next(new Error('Fixed tours require at least one departure date'));
    }
  }
  if (this.bookingType === 'flexible') {
    if (!this.dailyCapacity || this.dailyCapacity < 1) {
      return next(new Error('Flexible tours require a dailyCapacity of at least 1'));
    }
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
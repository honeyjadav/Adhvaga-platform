// One-time database seeding script — NOT imported anywhere in the app.
// Run manually with: node backend/utils/seedTours.js
// Populates the database so the app has real data to read — the app
// itself never contains hardcoded tour/departure data.

const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Tour = require('../models/Tour');

const sampleTours = [
  {
    title: 'Himalayan Base Camp Trek',
    category: 'Adventure',
    destination: 'Himachal Pradesh',
    price: 12999,
    duration: 6,
    bookingType: 'fixed',
    departures: [
      { date: new Date('2026-10-15'), maxTravelers: 20, availableSlots: 20 },
      { date: new Date('2026-10-22'), maxTravelers: 20, availableSlots: 20 },
      { date: new Date('2026-11-01'), maxTravelers: 15, availableSlots: 15 },
    ],
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    summary: 'A guided group trek through Himalayan base camp routes.',
  },
  {
    title: 'Old City Walking Tour',
    category: 'Culture',
    destination: 'Jaipur',
    price: 799,
    duration: 1,
    bookingType: 'flexible',
    dailyCapacity: 15,
    availableFrom: new Date('2026-09-01'),
    availableUntil: new Date('2027-03-31'),
    blackoutDates: [new Date('2026-12-25')],
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    summary: 'A daily guided walk through Jaipur\'s historic old city.',
  },
];

async function seed() {
  await connectDB();
  await Tour.deleteMany({});
  await Tour.insertMany(sampleTours);
  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
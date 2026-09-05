// Run with: npm run seed
// Creates a default admin account (from .env) and a demo regular user,
// so the frontend's "demo credentials" login hint has real accounts to use.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@adhvaga.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'Adhvaga Admin';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const demoEmail = 'demo@adhvaga.com';
  const existingDemo = await User.findOne({ email: demoEmail });
  if (!existingDemo) {
    await User.create({
      name: 'Demo Traveler',
      email: demoEmail,
      password: 'Demo@12345',
      role: 'user',
    });
    console.log(`Demo user created: ${demoEmail} / Demo@12345`);
  } else {
    console.log('Demo user already exists, skipping.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

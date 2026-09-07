import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
}

const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
  throw new Error('ADMIN_EMAIL must be a valid email address');
}

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

try {
  await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/enigma-grid');

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    existingUser.name = ADMIN_NAME?.trim() || existingUser.name;
    existingUser.passwordHash = passwordHash;
    existingUser.role = 'ADMIN';
    await existingUser.save();
    console.log(`Admin account updated for ${normalizedEmail}`);
  } else {
    await User.create({
      name: ADMIN_NAME?.trim() || 'Administrator',
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
    });
    console.log(`Admin account created for ${normalizedEmail}`);
  }
} finally {
  await mongoose.disconnect();
}
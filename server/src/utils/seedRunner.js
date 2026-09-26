import dotenv from 'dotenv';
dotenv.config();
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDemoData } from './seedDemoData.js';

const run = async () => {
  try {
    await connectDB();
    await seedDemoData();
    console.log('Seed runner completed successfully.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seed runner failed:', err);
    process.exit(1);
  }
};

run();

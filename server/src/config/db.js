import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    // Already connected or connecting
    return;
  }

  const uri = process.env.MONGODB_URI;

  // On Vercel / production, connect directly to MongoDB Atlas
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (!uri || uri.trim() === '') {
      throw new Error('MONGODB_URI environment variable is required on Vercel.');
    }
    console.log('Connecting to MongoDB Atlas on Vercel...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}`);
    return;
  }

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas / configured URI...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`Connected to MongoDB Atlas successfully: host=${mongoose.connection.host}, database=${mongoose.connection.name}`);
      return;
    } catch (err) {
      console.warn(`Failed to connect to configured MONGODB_URI: ${err.message}`);
      console.log('Falling back to local in-memory MongoDB server for testing/development...');
    }
  } else {
    console.log('No MONGODB_URI provided. Initializing in-memory MongoDB server for local development...');
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`Connected to in-memory MongoDB at: ${mongoUri}`);
  } catch (err) {
    console.error('Failed to initialize in-memory MongoDB server:', err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

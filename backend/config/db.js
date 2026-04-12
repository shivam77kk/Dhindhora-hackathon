import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB unavailable (${error.message}). Booting Memory Server fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Memory Server connected: ${conn.connection.host} (Hackathon Fallback Mode)`);
    } catch (memError) {
      console.error(`❌ MongoDB Memory fallback also failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

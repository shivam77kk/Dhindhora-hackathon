import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, 
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection Failed:`);
    console.error(`   - Error: ${error.message}`);
    console.error(`   - Code: ${error.code}`);
    console.warn(`🔄 Booting Memory Server fallback for hackathon stability...`);
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

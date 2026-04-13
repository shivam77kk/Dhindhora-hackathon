import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { setupSocketHandlers } from './services/socketService.js';
import { errorHandler } from './middleware/errorMiddleware.js';

import musicRoutes from './routes/musicRoutes.js';
import airDrawRoutes from './routes/airDrawRoutes.js';
import roastRoutes from './routes/roastRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import webreelRoutes from './routes/webreelRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, slow down!' },
});
app.use('/api/', limiter);

app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/music', musicRoutes);
app.use('/api/air-draw', airDrawRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/webreels', webreelRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 Dhindhora Anti-Gravity AI is LIVE!', timestamp: new Date() });
});

app.use(errorHandler);

configureCloudinary();
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Dhindhora Anti-Gravity AI server running on port ${PORT}`);
    console.log(`🌐 Client: ${process.env.CLIENT_URL}`);
    console.log(`⚡ WebGPU galaxy: 1,000,000 stars`);
    console.log(`🎰 Prediction market: LIVE`);
    console.log(`🎵 AI Music Generation: ENABLED`);
  });
};

startServer();

export { io };

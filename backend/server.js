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
import universalRoutes from './routes/universalRoutes.js';

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
import globeRoutes from './routes/globeRoutes.js';
import photoboothRoutes from './routes/photoboothRoutes.js';
import fortuneRoutes from './routes/fortuneRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS: Accept all frontend origins (localhost ports + Vercel URLs)
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
  'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005',
  'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008',
  'http://localhost:3009', 'http://localhost:3010', 'http://localhost:5173',
  'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176',
  'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179',
  'http://localhost:5180', 'http://localhost:5181', 'http://localhost:5182',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow listed origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(null, true); // Allow all for hackathon
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
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
app.use('/api/globe', globeRoutes);
app.use('/api/photobooth', photoboothRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/game', gameRoutes);

// Universal routes for multi-frontend system
app.use('/api/v1', universalRoutes);

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

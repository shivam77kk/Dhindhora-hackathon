import express from 'express';
import { getLeaderboard, updateScore } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', getLeaderboard);
router.post('/score', protect, updateScore);
export default router;

import express from 'express';
import { createMarket, getMarket, placeBet, getUserBets } from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/', protect, createMarket);
router.get('/user/bets', protect, getUserBets);
router.get('/:webreelId', getMarket);
router.post('/:marketId/bet', protect, placeBet);
export default router;

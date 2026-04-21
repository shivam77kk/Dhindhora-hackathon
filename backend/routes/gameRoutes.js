import express from 'express';
import { submitScore, getLeaderboard, getGameStats } from '../controllers/gameController.js';

const router = express.Router();

router.post('/score', submitScore);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getGameStats);

export default router;

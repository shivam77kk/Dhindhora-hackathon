import express from 'express';
import { generateRoast, getRoastLeaderboard, roastBattle } from '../controllers/roastController.js';

const router = express.Router();

router.post('/generate', generateRoast);
router.get('/leaderboard', getRoastLeaderboard);
router.post('/battle', roastBattle);

export default router;

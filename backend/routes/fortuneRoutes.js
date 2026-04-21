import express from 'express';
import { generateFortune, getRecentReadings, likeFortune } from '../controllers/fortuneController.js';

const router = express.Router();

router.post('/generate', generateFortune);
router.get('/recent', getRecentReadings);
router.post('/:id/like', likeFortune);

export default router;

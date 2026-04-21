import express from 'express';
import { getVisitors, trackVisitor, getGlobalStats } from '../controllers/globeController.js';

const router = express.Router();

router.get('/visitors/:webreelId', getVisitors);
router.post('/track', trackVisitor);
router.get('/stats', getGlobalStats);

export default router;

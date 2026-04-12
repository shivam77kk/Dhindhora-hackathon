import express from 'express';
import { generateMusic } from '../controllers/musicController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/generate', protect, generateMusic);
export default router;

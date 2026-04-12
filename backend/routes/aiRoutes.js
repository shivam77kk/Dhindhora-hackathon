import express from 'express';
import {
  getEmotionTheme, evaluateStartup, continueStory,
  analyzePersonality, generateWebreelContent, getRoast, aiChat, streamPoem,
  multimodalCreate,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
const router = express.Router();
router.post('/emotion-theme', getEmotionTheme);
router.post('/startup-evaluate', evaluateStartup);
router.post('/story-continue', continueStory);
router.post('/personality', analyzePersonality);
router.post('/generate-webreel-content', protect, generateWebreelContent);
router.post('/roast', getRoast);
router.post('/chat', aiChat);
router.post('/stream-poem', streamPoem);
router.post('/multimodal-create', protect, uploadMiddleware.single('file'), multimodalCreate);
export default router;

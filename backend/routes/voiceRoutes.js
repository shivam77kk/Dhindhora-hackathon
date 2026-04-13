import express from 'express';
import { interpretVoiceCommand } from '../controllers/voiceController.js';

const router = express.Router();

router.post('/interpret', interpretVoiceCommand);

export default router;

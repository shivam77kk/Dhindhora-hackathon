import express from 'express';
import { describePhoto, getStyles } from '../controllers/photoboothController.js';

const router = express.Router();

router.get('/styles', getStyles);
router.post('/describe', describePhoto);

export default router;

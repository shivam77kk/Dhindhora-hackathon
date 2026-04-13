import express from 'express';
import { recognizeShape, clearDrawingRoom } from '../controllers/airDrawController.js';

const router = express.Router();

router.post('/recognize-shape', recognizeShape);
router.post('/clear', clearDrawingRoom);

export default router;

import express from 'express';
import {
  createWebreel, getWeboreels, getMyWeboreels, getWebreel,
  updateWebreel, deleteWebreel, publishWebreel, uploadThumbnail,
} from '../controllers/webreelController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
const router = express.Router();
router.route('/').get(getWeboreels).post(protect, createWebreel);
router.get('/my/reels', protect, getMyWeboreels);
router.route('/:id').get(getWebreel).put(protect, updateWebreel).delete(protect, deleteWebreel);
router.post('/:id/publish', protect, publishWebreel);
router.post('/:id/thumbnail', protect, uploadMiddleware.single('thumbnail'), uploadThumbnail);
export default router;

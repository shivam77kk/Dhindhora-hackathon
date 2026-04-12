import express from 'express';
import { getReactions, createPoll, votePoll } from '../controllers/reactionController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/:id', getReactions);
router.post('/:id/polls', protect, createPoll);
router.post('/:id/polls/:pollId/vote', votePoll);
export default router;

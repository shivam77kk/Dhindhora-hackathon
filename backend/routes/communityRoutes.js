import express from 'express';
import { getNotes, addNote } from '../controllers/communityController.js';
const router = express.Router();
router.get('/notes', getNotes);
router.post('/notes', addNote);
export default router;

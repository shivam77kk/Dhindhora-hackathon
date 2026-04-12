import CommunityNote from '../models/CommunityNote.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getNotes = async (req, res) => {
  try {
    const notes = await CommunityNote.find().sort('-createdAt').limit(50);
    res.json(apiSuccess(notes));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const addNote = async (req, res) => {
  try {
    const { content, author, color, position } = req.body;
    const note = await CommunityNote.create({ content, author, color, position });
    if (req.io) req.io.emit('note:new', note);
    res.status(201).json(apiSuccess(note));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

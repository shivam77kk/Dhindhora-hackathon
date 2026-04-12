import Reaction from '../models/Reaction.js';
import Prediction from '../models/Prediction.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getReactions = async (req, res) => {
  try {
    const reactions = await Reaction.find({ webreelId: req.params.id });
    res.json(apiSuccess(reactions));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = await Prediction.create({
      webreelId: req.params.id,
      question,
      options: options.map(o => ({ text: o, votes: 0 })),
      createdBy: req.user._id,
    });
    res.status(201).json(apiSuccess(poll));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Prediction.findById(req.params.pollId);
    if (!poll) return res.status(404).json(apiError('Poll not found'));
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();
    if (req.io) {
      req.io.to(poll.webreelId.toString()).emit('poll:updated', poll);
    }
    res.json(apiSuccess(poll));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

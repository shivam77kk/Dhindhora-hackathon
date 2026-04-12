import LeaderboardEntry from '../models/LeaderboardEntry.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getLeaderboard = async (req, res) => {
  try {
    const entries = await LeaderboardEntry.find()
      .populate('user', 'name username avatar level dhinCoins')
      .sort('-totalScore')
      .limit(50);
    res.json(apiSuccess(entries));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const updateScore = async (req, res) => {
  try {
    const { webreelScore } = req.body;
    const entry = await LeaderboardEntry.findOneAndUpdate(
      { user: req.user._id },
      {
        $inc: { totalScore: webreelScore || 10, webreelsPublished: 1 },
        user: req.user._id,
      },
      { upsert: true, new: true }
    );
    res.json(apiSuccess(entry));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

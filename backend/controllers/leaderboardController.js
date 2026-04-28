import LeaderboardEntry from '../models/LeaderboardEntry.js';
import User from '../models/User.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getLeaderboard = async (req, res) => {
  try {
    // First try to get entries from the LeaderboardEntry collection
    let entries = await LeaderboardEntry.find()
      .populate('user', 'name username avatar level dhinCoins points')
      .sort('-totalScore')
      .limit(50);

    // If leaderboard is empty, fallback to User model sorted by points
    if (!entries || entries.length === 0) {
      const users = await User.find({})
        .select('name username avatar level dhinCoins points')
        .sort('-points -dhinCoins')
        .limit(50);

      // Transform users into leaderboard-like entries
      entries = users.map((u, index) => ({
        _id: u._id,
        user: {
          _id: u._id,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
          level: u.level,
          dhinCoins: u.dhinCoins,
          points: u.points,
        },
        totalScore: u.points || u.dhinCoins || 0,
        webreelsPublished: Math.floor(Math.random() * 10) + 1,
        reactionsReceived: Math.floor(Math.random() * 50),
        predictionsWon: Math.floor(Math.random() * 5),
        rank: index + 1,
      }));
    }

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

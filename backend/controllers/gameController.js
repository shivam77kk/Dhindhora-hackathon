import { apiSuccess, apiError } from '../utils/apiResponse.js';
import GameScore from '../models/GameScore.js';

// POST /api/game/score
export const submitScore = async (req, res) => {
  try {
    const { playerName, score, level, duration, gestures, stars } = req.body;

    if (!playerName?.trim()) return res.status(400).json(apiError('Player name required'));
    if (typeof score !== 'number' || score < 0) return res.status(400).json(apiError('Valid score required'));

    const entry = await GameScore.create({
      playerName: playerName.trim().substring(0, 30),
      score: Math.round(score),
      level:    level    || 1,
      duration: duration || 0,
      gestures: gestures || 0,
      stars:    stars    || 0,
    });

    // Get rank for this score
    const rank = await GameScore.countDocuments({ score: { $gt: Math.round(score) } }) + 1;

    // Broadcast new entry to all connected users
    if (req.io) {
      req.io.emit('game:new-score', {
        _id:        entry._id,
        playerName: entry.playerName,
        score:      entry.score,
        level:      entry.level,
        stars:      entry.stars,
        rank,
        createdAt:  entry.createdAt,
      });
    }

    return res.json(apiSuccess({ ...entry.toObject(), rank }, 'Score submitted!'));
  } catch (err) {
    console.error('submitScore error:', err.message);
    return res.status(500).json(apiError(err.message));
  }
};

// GET /api/game/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const entries = await GameScore.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(25)
      .select('playerName score level duration stars createdAt')
      .lean();

    // Add rank
    const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    return res.json(apiSuccess(ranked, 'Leaderboard fetched'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};

// GET /api/game/stats
export const getGameStats = async (req, res) => {
  try {
    const totalGames    = await GameScore.countDocuments();
    const topScore      = await GameScore.findOne().sort({ score: -1 }).select('playerName score').lean();
    const avgScoreData  = await GameScore.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]);
    const avgScore      = Math.round(avgScoreData[0]?.avg || 0);
    return res.json(apiSuccess({ totalGames, topScore, avgScore }));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};

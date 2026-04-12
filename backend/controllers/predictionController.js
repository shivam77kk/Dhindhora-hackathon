import PredictionMarket from '../models/PredictionMarket.js';
import UserBet from '../models/UserBet.js';
import User from '../models/User.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const createMarket = async (req, res) => {
  try {
    const { webreelId, question, options, closesAt } = req.body;
    const market = await PredictionMarket.create({
      webreelId, question,
      options: options.map(o => ({ text: o, votes: 0, totalCoins: 0 })),
      closesAt: closesAt ? new Date(closesAt) : null,
      createdBy: req.user._id,
    });
    res.status(201).json(apiSuccess(market));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const getMarket = async (req, res) => {
  try {
    const market = await PredictionMarket.findOne({ webreelId: req.params.webreelId })
      .populate('createdBy', 'name username');
    if (!market) return res.json(apiSuccess(null));
    const odds = market.options.map((opt, i) => ({
      index: i, text: opt.text, votes: opt.votes, coins: opt.totalCoins,
      percentage: market.totalVotes > 0 ? Math.round((opt.votes / market.totalVotes) * 100) : Math.round(100 / market.options.length),
      multiplier: market.totalCoins > 0 && opt.totalCoins > 0
        ? (market.totalCoins / opt.totalCoins).toFixed(2)
        : market.options.length.toFixed(2),
    }));
    res.json(apiSuccess({ market, odds }));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const placeBet = async (req, res) => {
  try {
    const { optionIndex, coins } = req.body;
    const { marketId } = req.params;
    const user = await User.findById(req.user._id);
    if (user.dhinCoins < coins) return res.status(400).json(apiError('Insufficient DhinCoins'));
    const market = await PredictionMarket.findById(marketId);
    if (!market || !market.isOpen) return res.status(400).json(apiError('Market is closed'));
    await User.findByIdAndUpdate(req.user._id, { $inc: { dhinCoins: -coins } });
    await PredictionMarket.findByIdAndUpdate(marketId, {
      $inc: {
        [`options.${optionIndex}.votes`]: 1,
        [`options.${optionIndex}.totalCoins`]: coins,
        totalVotes: 1, totalCoins: coins,
      },
    });
    const bet = await UserBet.create({ user: req.user._id, market: marketId, optionIndex, coins });
    const updatedMarket = await PredictionMarket.findById(marketId);
    req.io.to(updatedMarket.webreelId.toString()).emit('prediction:update', updatedMarket);
    res.json(apiSuccess({ bet, newBalance: user.dhinCoins - coins }));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const getUserBets = async (req, res) => {
  try {
    const bets = await UserBet.find({ user: req.user._id })
      .populate('market', 'question options webreelId isOpen resolvedOption')
      .sort('-createdAt').limit(20);
    res.json(apiSuccess(bets));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

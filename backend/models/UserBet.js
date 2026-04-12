import mongoose from 'mongoose';

const userBetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictionMarket', required: true },
  optionIndex: { type: Number, required: true },
  coins: { type: Number, required: true, min: 1 },
  settled: { type: Boolean, default: false },
  won: { type: Boolean, default: null },
  coinsWon: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('UserBet', userBetSchema);

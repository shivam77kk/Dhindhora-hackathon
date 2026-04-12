import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  totalCoins: { type: Number, default: 0 },
});

const predictionMarketSchema = new mongoose.Schema({
  webreelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webreel', required: true },
  question: { type: String, required: true },
  options: [optionSchema],
  totalVotes: { type: Number, default: 0 },
  totalCoins: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  closesAt: { type: Date },
  resolvedOption: { type: Number, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('PredictionMarket', predictionMarketSchema);

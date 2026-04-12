import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalScore: { type: Number, default: 0 },
  webreelsPublished: { type: Number, default: 0 },
  reactionsReceived: { type: Number, default: 0 },
  predictionsWon: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
}, { timestamps: true });

leaderboardEntrySchema.index({ totalScore: -1 });

export default mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

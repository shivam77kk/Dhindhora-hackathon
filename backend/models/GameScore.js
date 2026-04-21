import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true, maxlength: 30 },
    score:      { type: Number, required: true, min: 0 },
    level:      { type: Number, default: 1 },
    duration:   { type: Number, default: 0 }, // seconds survived
    gestures:   { type: Number, default: 0 }, // total gestures used
    stars:      { type: Number, default: 0 }, // stars collected
  },
  { timestamps: true }
);

gameScoreSchema.index({ score: -1 });
gameScoreSchema.index({ createdAt: -1 });

export default mongoose.model('GameScore', gameScoreSchema);

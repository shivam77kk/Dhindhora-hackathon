import mongoose from 'mongoose';

/**
 * NEW MODEL ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Global Activity Feed
 * Tracks events across all features for the Hub's live feed
 */
const activitySchema = new mongoose.Schema({
  type:      { type: String, required: true, enum: ['roast', 'fortune', 'game', 'webreel', 'prediction', 'photobooth', 'drawing', 'story', 'community', 'auth'] },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  featureId: { type: String, required: true },
  data:      { type: Object, default: {} },
  message:   { type: String, default: '' },
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });
activitySchema.index({ featureId: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);

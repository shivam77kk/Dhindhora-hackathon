import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  webreelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webreel', required: true },
  emoji: { type: String, required: true },
  count: { type: Number, default: 0 },
}, { timestamps: true });

reactionSchema.index({ webreelId: 1, emoji: 1 });

export default mongoose.model('Reaction', reactionSchema);

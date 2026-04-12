import mongoose from 'mongoose';

const webreelSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  tagline: { type: String, maxlength: 200 },
  category: {
    type: String,
    enum: ['startup', 'story', 'portfolio', 'campaign', 'product', 'personal'],
    default: 'personal',
  },
  content: { type: Object, default: {} },
  colorPalette: [String],
  musicMood: { type: String },
  isPublished: { type: Boolean, default: false },
  thumbnailUrl: { type: String },
  cloudinaryId: { type: String },
  views: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  splatUrl: { type: String, default: null },
  splatStatus: { type: String, enum: ['none', 'processing', 'ready', 'failed'], default: 'none' },
  musicUrl: { type: String, default: null },
  musicPrompt: { type: String, default: null },
  musicStatus: { type: String, enum: ['none', 'generating', 'ready', 'failed'], default: 'none' },
  predictionMarket: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictionMarket', default: null },
  createdFrom: { type: String, enum: ['manual', 'photo', 'voice', 'video'], default: 'manual' },
  sourceFileUrl: { type: String, default: null },
}, { timestamps: true });

webreelSchema.index({ creator: 1 });
webreelSchema.index({ isPublished: 1, createdAt: -1 });
webreelSchema.index({ score: -1 });

export default mongoose.model('Webreel', webreelSchema);

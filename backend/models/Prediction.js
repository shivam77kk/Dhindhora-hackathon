import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const predictionSchema = new mongoose.Schema({
  webreelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webreel', required: true },
  question: { type: String, required: true },
  options: [pollOptionSchema],
  totalVotes: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Prediction', predictionSchema);

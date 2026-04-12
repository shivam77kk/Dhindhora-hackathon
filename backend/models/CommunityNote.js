import mongoose from 'mongoose';

const communityNoteSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 280 },
  author: { type: String, default: 'Anonymous' },
  color: { type: String, default: '#6C63FF' },
  position: {
    x: { type: Number, default: Math.random() * 80 },
    y: { type: Number, default: Math.random() * 80 },
  },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('CommunityNote', communityNoteSchema);

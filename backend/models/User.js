import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 200 },
  points: { type: Number, default: 0 },
  dhinCoins: { type: Number, default: 100 },
  level: { type: Number, default: 1 },
  badges: [String],
  socialLinks: {
    twitter: String,
    instagram: String,
    linkedin: String,
    website: String,
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

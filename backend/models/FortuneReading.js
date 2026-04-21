import mongoose from 'mongoose';

const fortuneReadingSchema = new mongoose.Schema(
  {
    answers:        { type: [String], required: true },
    archetype:      { type: String, default: 'MYSTIC' },
    spiritAnimal:   { type: String, default: '' },
    cosmicElement:  { type: String, default: '' },
    destinyQuote:   { type: String, default: '' },
    hiddenPower:    { type: String, default: '' },
    fatalFlaw:      { type: String, default: '' },
    lifeQuest:      { type: String, default: '' },
    luckyNumber:    { type: Number, default: 7 },
    auraColor:      { type: String, default: '#a855f7' },
    cardEmoji:      { type: String, default: '🔮' },
    likes:          { type: Number, default: 0 },
    shares:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

fortuneReadingSchema.index({ createdAt: -1 });
fortuneReadingSchema.index({ likes: -1 });

export default mongoose.model('FortuneReading', fortuneReadingSchema);

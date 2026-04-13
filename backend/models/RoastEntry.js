import mongoose from 'mongoose';

const roastEntrySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true, maxlength: 60 },
    roast:         { type: String, required: true },
    praise:        { type: String, default: '' },
    roastScore:    { type: Number, default: 50, min: 1, max: 100 },
    verdict:       { type: String, default: 'ICONIC' },
    funnyNickname: { type: String, default: '' },
    superpower:    { type: String, default: '' },
    weakness:      { type: String, default: '' },
    shareText:     { type: String, default: '' },
    emoji:         { type: String, default: '🔥' },
    roastLevel:    { type: String, enum: ['mild', 'medium', 'savage'], default: 'medium' },
  },
  { timestamps: true }
);

roastEntrySchema.index({ roastScore: -1 });
roastEntrySchema.index({ createdAt: -1 });

export default mongoose.model('RoastEntry', roastEntrySchema);

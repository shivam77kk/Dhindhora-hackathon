import mongoose from 'mongoose';

const visitorLogSchema = new mongoose.Schema(
  {
    webreelId:  { type: String, required: true, index: true },
    ip:         { type: String, default: 'unknown' },
    country:    { type: String, default: 'Unknown' },
    countryCode:{ type: String, default: 'XX' },
    city:       { type: String, default: '' },
    lat:        { type: Number, default: 0 },
    lng:        { type: Number, default: 0 },
    socketId:   { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-delete entries older than 24 hours
visitorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
visitorLogSchema.index({ webreelId: 1, createdAt: -1 });

export default mongoose.model('VisitorLog', visitorLogSchema);

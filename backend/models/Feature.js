import mongoose from 'mongoose';

/**
 * NEW MODEL ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Feature Directory
 * Used by the Hub frontend to auto-populate navigation
 * Seeded on first startup if collection is empty
 */
const featureSchema = new mongoose.Schema({
  featureId:   { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  description: { type: String, required: true },
  frontendUrl: { type: String, default: '' },
  icon:        { type: String, default: '🌟' },
  color:       { type: String, default: '#6C63FF' },
  theme:       { type: String, default: 'Cosmic Portal' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Feature', featureSchema);

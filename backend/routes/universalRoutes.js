import express from 'express';
import Feature from '../models/Feature.js';
import Activity from '../models/Activity.js';
import { getMusicTrack } from '../config/musicTracks.js';
import FEATURES_SEED from '../config/featuresSeed.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Universal Health Check
 * Frontend: All (Hub + every feature frontend)
 * Added: Required for deployment verification and monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      version: '2.0.0',
      name: 'Dhindhora Anti-Gravity AI',
    },
    message: '🚀 Dhindhora Anti-Gravity AI is LIVE!',
  });
});

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Feature Directory
 * Frontend: dhindhora-hub
 * Added: Hub frontend calls this to dynamically build navigation portals
 */
router.get('/features', async (req, res) => {
  try {
    // Seed features if collection is empty
    const count = await Feature.countDocuments();
    if (count === 0) {
      await Feature.insertMany(FEATURES_SEED);
      console.log('🌱 Features seeded successfully');
    }

    const features = await Feature.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    return res.json(apiSuccess(features, 'Features fetched'));
  } catch (err) {
    console.error('getFeatures error:', err.message);
    return res.status(500).json(apiError(err.message));
  }
});

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Update Feature URL
 * Frontend: Admin use — set the deployed Vercel URL for a feature
 * Added: Needed to populate frontendUrl after each deployment
 */
router.put('/features/:featureId', async (req, res) => {
  try {
    const { frontendUrl, isActive } = req.body;
    const update = {};
    if (frontendUrl !== undefined) update.frontendUrl = frontendUrl;
    if (isActive !== undefined) update.isActive = isActive;

    const feature = await Feature.findOneAndUpdate(
      { featureId: req.params.featureId },
      update,
      { new: true }
    );
    if (!feature) return res.status(404).json(apiError('Feature not found'));
    return res.json(apiSuccess(feature, 'Feature updated'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
});

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Music Tracks per Feature
 * Frontend: All (floating music player in every frontend)
 * Added: Each frontend loads its background track from this route
 */
router.get('/music/track/:featureId', (req, res) => {
  const track = getMusicTrack(req.params.featureId);
  return res.json(apiSuccess(track, 'Track fetched'));
});

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Global Activity Feed
 * Frontend: dhindhora-hub (live "what's happening" feed)
 * Added: Returns latest 50 events across all features
 */
router.get('/activity', async (req, res) => {
  try {
    const events = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name username avatar')
      .lean();

    return res.json(apiSuccess(events, 'Activity fetched'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
});

/**
 * NEW ROUTE ADDED FOR DHINDHORA MULTI-FRONTEND
 * Feature: Log Activity
 * Frontend: All (each frontend logs notable events)
 * Added: Any frontend can POST activity events
 */
router.post('/activity', async (req, res) => {
  try {
    const { type, featureId, data, message, userId } = req.body;
    if (!type || !featureId) {
      return res.status(400).json(apiError('type and featureId required'));
    }
    const event = await Activity.create({
      type,
      featureId,
      data: data || {},
      message: message || '',
      userId: userId || null,
    });
    // Broadcast to hub
    if (req.io) {
      req.io.emit('activity:new', event);
    }
    return res.status(201).json(apiSuccess(event, 'Activity logged'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
});

export default router;

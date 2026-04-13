import Webreel from '../models/Webreel.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const createWebreel = async (req, res) => {
  try {
    const { title, tagline, category, content, colorPalette, musicMood, createdFrom } = req.body;
    
    const safeTitle = title && title.length > 100 ? title.substring(0, 97) + '...' : title || 'Untitled';
    const safeTagline = tagline && tagline.length > 200 ? tagline.substring(0, 197) + '...' : tagline;

    const webreel = await Webreel.create({
      creator: req.user._id, 
      title: safeTitle, 
      tagline: safeTagline, 
      category, 
      content,
      colorPalette, 
      musicMood, 
      createdFrom: createdFrom || 'manual',
    });
    res.status(201).json(apiSuccess(webreel));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const getWeboreels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;

    const weboreels = await Webreel.find(filter)
      .populate('creator', 'name username avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    const total = await Webreel.countDocuments(filter);
    res.json(apiSuccess({ weboreels, total, page, pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const getMyWeboreels = async (req, res) => {
  try {
    const weboreels = await Webreel.find({ creator: req.user._id })
      .sort('-createdAt')
      .populate('predictionMarket');
    res.json(apiSuccess(weboreels));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const getWebreel = async (req, res) => {
  try {
    const webreel = await Webreel.findById(req.params.id)
      .populate('creator', 'name username avatar bio points dhinCoins')
      .populate('predictionMarket');
    if (!webreel) return res.status(404).json(apiError('Webreel not found'));
    webreel.views += 1;
    await webreel.save();
    res.json(apiSuccess(webreel));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const updateWebreel = async (req, res) => {
  try {
    const webreel = await Webreel.findById(req.params.id);
    if (!webreel) return res.status(404).json(apiError('Webreel not found'));
    if (webreel.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json(apiError('Not authorized'));
    }
    const updates = req.body;
    Object.assign(webreel, updates);
    await webreel.save();
    res.json(apiSuccess(webreel));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const deleteWebreel = async (req, res) => {
  try {
    const webreel = await Webreel.findById(req.params.id);
    if (!webreel) return res.status(404).json(apiError('Webreel not found'));
    if (webreel.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json(apiError('Not authorized'));
    }
    await webreel.deleteOne();
    res.json(apiSuccess(null, 'Webreel deleted'));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const publishWebreel = async (req, res) => {
  try {
    const webreel = await Webreel.findById(req.params.id);
    if (!webreel) return res.status(404).json(apiError('Webreel not found'));
    if (webreel.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json(apiError('Not authorized'));
    }
    webreel.isPublished = true;
    await webreel.save();
    res.json(apiSuccess(webreel, 'Webreel published to the galaxy!'));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json(apiError('No file uploaded'));
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'dhindhora/thumbnails',
    });
    const webreel = await Webreel.findByIdAndUpdate(
      req.params.id,
      { thumbnailUrl: result.secure_url, cloudinaryId: result.public_id },
      { new: true }
    );
    res.json(apiSuccess(webreel));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

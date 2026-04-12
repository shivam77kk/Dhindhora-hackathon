import User from '../models/User.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(apiSuccess(user));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, socialLinks } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, socialLinks },
      { new: true, runValidators: true }
    );
    res.json(apiSuccess(user));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json(apiError('No file uploaded'));
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'dhindhora/avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );
    res.json(apiSuccess(user));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json(apiError('User not found'));
    res.json(apiSuccess({
      _id: user._id, name: user.name, username: user.username,
      avatar: user.avatar, bio: user.bio, points: user.points,
      level: user.level, badges: user.badges, dhinCoins: user.dhinCoins,
    }));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

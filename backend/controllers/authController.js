import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json(apiError('All fields are required'));
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json(apiError('Email or username already taken'));
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name, username: username.toLowerCase(), email: email.toLowerCase(), password: hashedPassword,
    });
    const token = generateToken(user._id, res);
    res.status(201).json(apiSuccess({
      _id: user._id, name: user.name, username: user.username, email: user.email,
      avatar: user.avatar, bio: user.bio, points: user.points, dhinCoins: user.dhinCoins,
      level: user.level, badges: user.badges, role: user.role, token,
    }));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(apiError('Email and password required'));
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json(apiError('Invalid credentials'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(apiError('Invalid credentials'));
    }
    const token = generateToken(user._id, res);
    res.json(apiSuccess({
      _id: user._id, name: user.name, username: user.username, email: user.email,
      avatar: user.avatar, bio: user.bio, points: user.points, dhinCoins: user.dhinCoins,
      level: user.level, badges: user.badges, role: user.role, token,
    }));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json(apiSuccess(null, 'Logged out successfully'));
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(apiSuccess(user));
  } catch (error) {
    res.status(500).json(apiError(error.message));
  }
};

import UserProfile from '../models/UserProfile.js';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await UserProfile.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email;

    const user = await UserProfile.create({
      username,
      name,
      email,
      password: hashedPassword,
      role: role || 'User',
    });

    if (user) {
      const { accessToken, refreshToken } = generateTokens(res, user._id);
      
      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        token: accessToken, // Keeping 'token' key for backward compatibility for now
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Strict validation for production (email/password only)
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await UserProfile.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { accessToken, refreshToken } = generateTokens(res, user._id);

      // Save refresh token to DB
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        token: accessToken,
        achievementPoints: user.achievementPoints,
        earnedBadges: user.earnedBadges,
        preferredDifficulty: user.preferredDifficulty,
        preferredTheme: user.preferredTheme,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private (or Public, but usually we clear cookies regardless)
export const logoutUser = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.sendStatus(204); // No content
    }

    const refreshToken = cookies.refreshToken;

    // Is refresh token in db?
    const user = await UserProfile.findOne({ refreshToken });
    if (user) {
      // Delete refresh token in db
      user.refreshToken = '';
      await user.save();
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (needs valid cookie)
export const refreshUserToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
      return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    const refreshToken = cookies.refreshToken;
    const user = await UserProfile.findOne({ refreshToken });

    // Detected refresh token reuse!
    if (!user) {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return; // Expired, just return 403 below
        // If someone used a valid refresh token but it's not in DB, someone stole it
        const hackedUser = await UserProfile.findById(decoded.id);
        if (hackedUser) {
          hackedUser.refreshToken = ''; // Clear all tokens for this user
          await hackedUser.save();
        }
      });
      return res.status(403).json({ message: 'Forbidden, token reuse detected' });
    }

    // Evaluate jwt
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        user.refreshToken = '';
        await user.save();
        return res.status(403).json({ message: 'Forbidden, invalid refresh token' });
      }

      // Token is valid, rotate it
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(res, user._id);
      
      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({ token: accessToken });
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await UserProfile.findById(req.user._id).select('-password -refreshToken');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

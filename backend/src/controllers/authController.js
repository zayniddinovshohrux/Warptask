const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/environment');
const logger = require('../utils/logger');

const generateTokens = async (userId) => {
  // Generate access token
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Save refresh token to database
  await RefreshToken.create({
    userId,
    token: refreshToken,
    expiresAt
  });

  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      throw new AppError('Email, password and full name are required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const saltRounds = config.bcrypt.saltRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      fullName
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Find token in database
    const storedToken = await RefreshToken.findByToken(refreshToken);
    if (!storedToken) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Revoke old token
    await RefreshToken.revoke(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.revoke(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.revokeAllByUser(req.userId);
    
    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
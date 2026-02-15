const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { query } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = require('../config/env');
const { sanitizeUser } = require('../utils/helpers');
const logger = require('../utils/logger');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Store refresh token
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

exports.register = async (req, res) => {
  const { name, email, password, height, weight, calorie_goal } = req.body;

  // Check if user exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
  }

  // Create user
  const user = await User.create({ name, email, password, height, weight, calorie_goal });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);
  await storeRefreshToken(user.id, refreshToken);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check if account is active
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated',
    });
  }

  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);
  await storeRefreshToken(user.id, refreshToken);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

  // Check if token exists in database
  const result = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
    [refreshToken, decoded.userId]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
  
  // Delete old refresh token and store new one
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  await storeRefreshToken(decoded.userId, newRefreshToken);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId);

  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
};

exports.updateProfile = async (req, res) => {
  const { name, height, weight, calorie_goal, avatar_url } = req.body;

  const user = await User.update(req.userId, {
    name,
    height,
    weight,
    calorie_goal,
    avatar_url,
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: sanitizeUser(user) },
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findByEmail(req.user.email);

  // Verify current password
  const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  await User.changePassword(req.userId, newPassword);

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
};
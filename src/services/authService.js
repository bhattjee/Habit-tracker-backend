const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

class AuthService {
  static generateAccessToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = AuthService;
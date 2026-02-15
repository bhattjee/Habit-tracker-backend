const crypto = require('crypto');

/**
 * Generate random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

/**
 * Calculate pagination
 */
const paginate = (page = 1, limit = 20) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;
  
  return {
    limit: limitNum,
    offset,
    page: pageNum,
  };
};

/**
 * Format pagination response
 */
const paginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Calculate date range
 */
const getDateRange = (period = 'week') => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
};

module.exports = {
  generateToken,
  sanitizeUser,
  paginate,
  paginationResponse,
  getDateRange,
};
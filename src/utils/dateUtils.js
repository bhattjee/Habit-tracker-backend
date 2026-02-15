/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Get today's date
 */
const getToday = () => {
  return formatDate(new Date());
};

/**
 * Get start of week
 */
const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
};

/**
 * Get end of week
 */
const getEndOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (7 - day);
  d.setDate(diff);
  return formatDate(d);
};

/**
 * Get start of month
 */
const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  return formatDate(d);
};

/**
 * Get end of month
 */
const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return formatDate(d);
};

/**
 * Calculate days between dates
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round(Math.abs((d1 - d2) / oneDay));
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

module.exports = {
  formatDate,
  getToday,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  daysBetween,
  addDays,
};
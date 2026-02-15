const JournalEntry = require('../models/JournalEntry');
const { query } = require('../config/database');
const { getToday, getStartOfMonth, getEndOfMonth } = require('../utils/dateUtils');

exports.getEntries = async (req, res) => {
  const { mood, start_date, end_date } = req.query;

  const entries = await JournalEntry.findByUserId(req.userId, {
    mood,
    start_date,
    end_date,
  });

  res.json({
    success: true,
    data: { entries },
  });
};

exports.getEntry = async (req, res) => {
  const entry = await JournalEntry.findById(req.params.id, req.userId);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found',
    });
  }

  res.json({
    success: true,
    data: { entry },
  });
};

exports.createEntry = async (req, res) => {
  const entry = await JournalEntry.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Journal entry created successfully',
    data: { entry },
  });
};

exports.updateEntry = async (req, res) => {
  const entry = await JournalEntry.update(req.params.id, req.userId, req.body);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found',
    });
  }

  res.json({
    success: true,
    message: 'Journal entry updated successfully',
    data: { entry },
  });
};

exports.deleteEntry = async (req, res) => {
  await JournalEntry.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Journal entry deleted successfully',
  });
};

exports.getMoodStats = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const stats = await JournalEntry.getMoodStats(req.userId, startDate, endDate);

  res.json({
    success: true,
    data: { stats },
  });
};

// Affirmations
exports.getAffirmations = async (req, res) => {
  const { category, is_favorite } = req.query;

  let queryText = 'SELECT * FROM affirmations WHERE user_id = $1 OR is_custom = false';
  const params = [req.userId];
  let paramCount = 2;

  if (category) {
    queryText += ` AND category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  if (is_favorite === 'true') {
    queryText += ` AND is_favorite = true`;
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: { affirmations: result.rows },
  });
};

exports.createAffirmation = async (req, res) => {
  const { text, category } = req.body;

  const result = await query(
    'INSERT INTO affirmations (user_id, text, category, is_custom) VALUES ($1, $2, $3, true) RETURNING *',
    [req.userId, text, category]
  );

  res.status(201).json({
    success: true,
    message: 'Affirmation created successfully',
    data: result.rows[0],
  });
};

exports.toggleFavoriteAffirmation = async (req, res) => {
  const result = await query(
    `UPDATE affirmations 
     SET is_favorite = NOT is_favorite 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [req.params.id, req.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found',
    });
  }

  res.json({
    success: true,
    message: 'Affirmation updated successfully',
    data: result.rows[0],
  });
};

exports.deleteAffirmation = async (req, res) => {
  await query(
    'DELETE FROM affirmations WHERE id = $1 AND user_id = $2 AND is_custom = true',
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Affirmation deleted successfully',
  });
};

exports.getRandomAffirmation = async (req, res) => {
  const { category } = req.query;

  let queryText = 'SELECT * FROM affirmations WHERE user_id = $1 OR is_custom = false';
  const params = [req.userId];

  if (category) {
    queryText += ' AND category = $2';
    params.push(category);
  }

  queryText += ' ORDER BY RANDOM() LIMIT 1';

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: result.rows[0] || null,
  });
};
const Workout = require('../models/Workout');
const Measurement = require('../models/Measurement');
const { query } = require('../config/database');
const { getToday, getStartOfMonth, getEndOfMonth } = require('../utils/dateUtils');

// Workout endpoints
exports.getWorkouts = async (req, res) => {
  const { type, start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const workouts = await Workout.findByUserId(req.userId, {
    type,
    start_date: startDate,
    end_date: endDate,
  });

  res.json({
    success: true,
    data: { workouts },
  });
};

exports.getWorkout = async (req, res) => {
  const workout = await Workout.findById(req.params.id, req.userId);

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found',
    });
  }

  res.json({
    success: true,
    data: { workout },
  });
};

exports.createWorkout = async (req, res) => {
  const workout = await Workout.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Workout logged successfully',
    data: { workout },
  });
};

exports.updateWorkout = async (req, res) => {
  const workout = await Workout.update(req.params.id, req.userId, req.body);

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found',
    });
  }

  res.json({
    success: true,
    message: 'Workout updated successfully',
    data: { workout },
  });
};

exports.deleteWorkout = async (req, res) => {
  await Workout.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Workout deleted successfully',
  });
};

exports.getWorkoutStats = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const stats = await Workout.getStats(req.userId, startDate, endDate);

  res.json({
    success: true,
    data: { stats },
  });
};

// Measurement endpoints
exports.getMeasurements = async (req, res) => {
  const { start_date, end_date } = req.query;

  const measurements = await Measurement.findByUserId(req.userId, start_date, end_date);

  res.json({
    success: true,
    data: { measurements },
  });
};

exports.getMeasurement = async (req, res) => {
  const measurement = await Measurement.findById(req.params.id, req.userId);

  if (!measurement) {
    return res.status(404).json({
      success: false,
      message: 'Measurement not found',
    });
  }

  res.json({
    success: true,
    data: { measurement },
  });
};

exports.createMeasurement = async (req, res) => {
  const measurement = await Measurement.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Measurement recorded successfully',
    data: { measurement },
  });
};

exports.deleteMeasurement = async (req, res) => {
  await Measurement.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Measurement deleted successfully',
  });
};

exports.getLatestMeasurement = async (req, res) => {
  const measurement = await Measurement.getLatest(req.userId);

  res.json({
    success: true,
    data: { measurement },
  });
};

exports.getProgress = async (req, res) => {
  const { metric, start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  if (!metric) {
    return res.status(400).json({
      success: false,
      message: 'Metric parameter is required',
    });
  }

  const progress = await Measurement.getProgress(req.userId, metric, startDate, endDate);

  res.json({
    success: true,
    data: {
      metric,
      progress,
    },
  });
};

// Progress Photos
exports.uploadProgressPhoto = async (req, res) => {
  const { photo_url, photo_type, date } = req.body;
  const targetDate = date || getToday();

  const result = await query(
    'INSERT INTO progress_photos (user_id, photo_url, photo_type, date) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.userId, photo_url, photo_type, targetDate]
  );

  res.status(201).json({
    success: true,
    message: 'Progress photo uploaded successfully',
    data: result.rows[0],
  });
};

exports.getProgressPhotos = async (req, res) => {
  const { start_date, end_date } = req.query;
  
  let queryText = 'SELECT * FROM progress_photos WHERE user_id = $1';
  const params = [req.userId];

  if (start_date && end_date) {
    queryText += ' AND date BETWEEN $2 AND $3';
    params.push(start_date, end_date);
  }

  queryText += ' ORDER BY date DESC';

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: { photos: result.rows },
  });
};

exports.deleteProgressPhoto = async (req, res) => {
  await query(
    'DELETE FROM progress_photos WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Progress photo deleted successfully',
  });
};
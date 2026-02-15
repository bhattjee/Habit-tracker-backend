const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  const { period, status, category } = req.query;

  const goals = await Goal.findByUserId(req.userId, {
    period,
    status,
    category,
  });

  res.json({
    success: true,
    data: { goals },
  });
};

exports.getGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id, req.userId);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found',
    });
  }

  res.json({
    success: true,
    data: { goal },
  });
};

exports.createGoal = async (req, res) => {
  const goal = await Goal.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: { goal },
  });
};

exports.updateGoal = async (req, res) => {
  const goal = await Goal.update(req.params.id, req.userId, req.body);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found',
    });
  }

  res.json({
    success: true,
    message: 'Goal updated successfully',
    data: { goal },
  });
};

exports.deleteGoal = async (req, res) => {
  await Goal.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Goal deleted successfully',
  });
};

exports.updateProgress = async (req, res) => {
  const { progress } = req.body;

  if (progress < 0 || progress > 100) {
    return res.status(400).json({
      success: false,
      message: 'Progress must be between 0 and 100',
    });
  }

  const goal = await Goal.update(req.params.id, req.userId, {
    progress,
    status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found',
    });
  }

  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: { goal },
  });
};

exports.getStats = async (req, res) => {
  const stats = await Goal.getStats(req.userId);

  res.json({
    success: true,
    data: { stats },
  });
};
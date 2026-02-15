const Task = require('../models/Task');
const { paginate, paginationResponse } = require('../utils/helpers');
const { getToday } = require('../utils/dateUtils');

exports.getTasks = async (req, res) => {
  const { page, limit, completed, category, priority, due_date, search } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit);

  const tasks = await Task.findByUserId(req.userId, {
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
    category,
    priority,
    due_date,
    search,
    limit: limitNum,
    offset,
  });

  const total = tasks.length; // In production, you'd do a separate count query

  res.json({
    success: true,
    data: paginationResponse(tasks, total, parseInt(page) || 1, limitNum),
  });
};

exports.getTask = async (req, res) => {
  const task = await Task.findById(req.params.id, req.userId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    data: { task },
  });
};

exports.createTask = async (req, res) => {
  const task = await Task.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
};

exports.updateTask = async (req, res) => {
  const task = await Task.update(req.params.id, req.userId, req.body);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  });
};

exports.toggleTask = async (req, res) => {
  const task = await Task.toggle(req.params.id, req.userId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    message: task.completed ? 'Task completed' : 'Task reopened',
    data: { task },
  });
};

exports.deleteTask = async (req, res) => {
  await Task.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
};

exports.getTaskStats = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getToday();
  const endDate = end_date || getToday();

  const stats = await Task.getStats(req.userId, startDate, endDate);

  res.json({
    success: true,
    data: { stats },
  });
};
const Expense = require('../models/Expense');
const { paginate, paginationResponse } = require('../utils/helpers');
const { getStartOfMonth, getEndOfMonth } = require('../utils/dateUtils');

exports.getExpenses = async (req, res) => {
  const { page, limit, type, category, account, start_date, end_date } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit);

  const expenses = await Expense.findByUserId(req.userId, {
    type,
    category,
    account,
    start_date: start_date || getStartOfMonth(),
    end_date: end_date || getEndOfMonth(),
    limit: limitNum,
    offset,
  });

  const total = expenses.length;

  res.json({
    success: true,
    data: paginationResponse(expenses, total, parseInt(page) || 1, limitNum),
  });
};

exports.getExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id, req.userId);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  res.json({
    success: true,
    data: { expense },
  });
};

exports.createExpense = async (req, res) => {
  const expense = await Expense.create(req.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense },
  });
};

exports.updateExpense = async (req, res) => {
  const expense = await Expense.update(req.params.id, req.userId, req.body);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense },
  });
};

exports.deleteExpense = async (req, res) => {
  await Expense.delete(req.params.id, req.userId);

  res.json({
    success: true,
    message: 'Expense deleted successfully',
  });
};

exports.getSummary = async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date || getStartOfMonth();
  const endDate = end_date || getEndOfMonth();

  const summary = await Expense.getSummary(req.userId, startDate, endDate);
  const categoryBreakdown = await Expense.getCategoryBreakdown(req.userId, startDate, endDate);

  res.json({
    success: true,
    data: {
      summary,
      categoryBreakdown,
    },
  });
};
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { computeGroupAnalytics, computeUserAnalytics } = require('../utils/analytics');

/**
 * Base summary endpoint.
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PaySplitApp Financial Summary & Analytics API',
    endpoints: {
      group: '/api/summary/group/:groupId',
      user: '/api/summary/user/:userId',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Group financial summary & category breakdown.
 */
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId });

    const analytics = computeGroupAnalytics(expenses);
    res.json({
      groupId,
      ...analytics,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * User personal financial dashboard across all expenses.
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = await Expense.find({
      $or: [{ payerId: userId }, { 'splits.userId': userId }],
    });

    const analytics = computeUserAnalytics(userId, expenses);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

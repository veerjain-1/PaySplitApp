const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

/**
 * GET /api/report/:groupId
 * Returns total amount spent in a group and count of expenses.
 */
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await Expense.aggregate([
      { $match: { groupId } },
      {
        $group: {
          _id: '$groupId',
          totalAmount: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
        },
      },
    ]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'No expenses found for this group' });
    }
    const { totalAmount, expenseCount } = result[0];
    res.json({ groupId, totalAmount, expenseCount });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error generating report' });
  }
});

module.exports = router;

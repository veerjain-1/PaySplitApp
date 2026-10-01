const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { computeNetBalances, computeSettlements } = require('../utils/balances');

// GET /api/groups/:groupId/balances
// Returns each member's net balance (positive = owed money, negative = owes
// money) for the group, plus a minimal list of suggested settlements.
router.get('/:groupId/balances', async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId });

    const netBalances = computeNetBalances(expenses);
    const settlements = computeSettlements(netBalances);

    const balances = Array.from(netBalances.entries()).map(([userId, balance]) => ({
      userId,
      balance,
    }));

    res.status(200).json({
      groupId,
      expenseCount: expenses.length,
      balances,
      settlements,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error computing group balances' });
  }
});

module.exports = router;

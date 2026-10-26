const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { computeNetBalances, computeSettlements, simplifyDebtGraph } = require('../utils/balances');

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
  } catch (_error) {
    res.status(500).json({ error: 'Server error computing group balances' });
  }
});

// POST /api/groups/simplify-debts
// Given arbitrary pairwise debts, simplifies the graph to minimal transactions
router.post('/simplify-debts', (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'transactions array is required' });
    }

    const result = simplifyDebtGraph(transactions);
    res.status(200).json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Error simplifying debt graph' });
  }
});

module.exports = router;

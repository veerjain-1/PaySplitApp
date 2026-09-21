const express = require('express');
const router = express.Router();
const RecurringExpense = require('../models/RecurringExpense');

// Create a new recurring expense
router.post('/', async (req, res) => {
  try {
    const recurringExpense = new RecurringExpense(req.body);
    await recurringExpense.save();
    res.status(201).json(recurringExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all recurring expenses for a specific group
router.get('/group/:groupId', async (req, res) => {
  try {
    const expenses = await RecurringExpense.find({ 
      groupId: req.params.groupId,
      isActive: true
    }).populate('paidBy splits.user', 'username email');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

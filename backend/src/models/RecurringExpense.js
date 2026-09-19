const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  // TODO: Add split logic (exact amounts, percentages, etc)
  // TODO: Add nextBillingDate calculation logic
  // TODO: Add active status toggle
}, { timestamps: true });

// TODO: Finish model and export
module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);

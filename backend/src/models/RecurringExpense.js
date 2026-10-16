const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Split amount must be positive'],
        },
      },
    ],
    nextBillingDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate next billing date if not set
recurringExpenseSchema.pre('save', function (next) {
  if (this.isModified('frequency') || !this.nextBillingDate) {
    this.nextBillingDate = this.calculateNextDate(new Date());
  }
  if (typeof next === 'function') {
    next();
  }
});

recurringExpenseSchema.methods.calculateNextDate = function (fromDate) {
  const nextDate = new Date(fromDate);
  switch (this.frequency) {
    case 'daily':
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      break;
    case 'weekly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      break;
    case 'monthly':
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      break;
    case 'yearly':
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
      break;
  }
  return nextDate;
};

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);

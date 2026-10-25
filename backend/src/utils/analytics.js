const { resolveSplitAmounts } = require('./balances');

/**
 * Financial analytics calculation engine for PaySplitApp.
 * Computes category breakdowns, monthly trends, spending distribution,
 * and individual user metrics across expense sets.
 */

/**
 * Compute high-level and detailed analytics for a group's expenses.
 * @param {Array<Object>} expenses - List of Expense documents or plain objects
 * @returns {Object} Comprehensive group analytics
 */
function computeGroupAnalytics(expenses = []) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return {
      totalSpending: 0,
      expenseCount: 0,
      averageExpense: 0,
      categoryBreakdown: {},
      memberSpending: {},
      topExpenses: [],
      monthlyTrends: {},
    };
  }

  let totalSpending = 0;
  const categoryMap = new Map();
  const memberMap = new Map();
  const monthlyMap = new Map();

  for (const exp of expenses) {
    const amount = Number(exp.amount) || 0;
    totalSpending += amount;

    // 1. Category aggregation
    const category = (exp.category && exp.category.trim()) || 'General';
    const currentCat = categoryMap.get(category) || { total: 0, count: 0 };
    currentCat.total += amount;
    currentCat.count += 1;
    categoryMap.set(category, currentCat);

    // 2. Member paid tracking
    const payer = String(exp.payerId);
    const payerStats = memberMap.get(payer) || { totalPaid: 0, totalShare: 0 };
    payerStats.totalPaid += amount;
    memberMap.set(payer, payerStats);

    // 3. Member share tracking from splits
    const splitMap = resolveSplitAmounts(exp);
    for (const [userId, share] of splitMap.entries()) {
      const uStats = memberMap.get(userId) || { totalPaid: 0, totalShare: 0 };
      uStats.totalShare += share;
      memberMap.set(userId, uStats);
    }

    // 4. Monthly trends
    const date = exp.createdAt ? new Date(exp.createdAt) : new Date();
    const yearMonth = isNaN(date.getTime())
      ? 'unknown'
      : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(yearMonth, (monthlyMap.get(yearMonth) || 0) + amount);
  }

  // Format category breakdown with percentages
  const categoryBreakdown = {};
  for (const [cat, data] of categoryMap.entries()) {
    categoryBreakdown[cat] = {
      total: Number(data.total.toFixed(2)),
      count: data.count,
      percentage: totalSpending > 0 ? Number(((data.total / totalSpending) * 100).toFixed(1)) : 0,
    };
  }

  // Format member metrics
  const memberSpending = {};
  for (const [userId, stats] of memberMap.entries()) {
    const paid = Number(stats.totalPaid.toFixed(2));
    const share = Number(stats.totalShare.toFixed(2));
    memberSpending[userId] = {
      totalPaid: paid,
      totalShare: share,
      netBalance: Number((paid - share).toFixed(2)),
    };
  }

  // Top 5 largest expenses
  const topExpenses = [...expenses]
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, 5)
    .map((e) => ({
      id: e._id || e.id,
      title: e.title,
      amount: Number(e.amount),
      payerId: e.payerId,
      category: e.category || 'General',
      createdAt: e.createdAt,
    }));

  // Format monthly trends
  const monthlyTrends = {};
  for (const [ym, total] of monthlyMap.entries()) {
    monthlyTrends[ym] = Number(total.toFixed(2));
  }

  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? Number((totalSpending / expenseCount).toFixed(2)) : 0;

  return {
    totalSpending: Number(totalSpending.toFixed(2)),
    expenseCount,
    averageExpense,
    categoryBreakdown,
    memberSpending,
    topExpenses,
    monthlyTrends,
  };
}

/**
 * Compute personal financial analytics for a specific user across expenses.
 * @param {string} userId - User identifier
 * @param {Array<Object>} expenses - List of expenses
 * @returns {Object} User financial summary
 */
function computeUserAnalytics(userId, expenses = []) {
  if (!userId || !Array.isArray(expenses) || expenses.length === 0) {
    return {
      userId: userId || null,
      totalPaidByMe: 0,
      myTotalShare: 0,
      netBalance: 0,
      involvedExpenseCount: 0,
      categoryBreakdown: {},
    };
  }

  const uId = String(userId);
  let totalPaidByMe = 0;
  let myTotalShare = 0;
  let involvedExpenseCount = 0;
  const categoryMap = new Map();

  for (const exp of expenses) {
    const isPayer = String(exp.payerId) === uId;
    const splitMap = resolveSplitAmounts(exp);
    const myShare = splitMap.get(uId) || 0;

    if (isPayer || myShare > 0) {
      involvedExpenseCount += 1;
    }

    if (isPayer) {
      totalPaidByMe += Number(exp.amount) || 0;
    }

    if (myShare > 0) {
      myTotalShare += myShare;

      const category = (exp.category && exp.category.trim()) || 'General';
      const cur = categoryMap.get(category) || 0;
      categoryMap.set(category, cur + myShare);
    }
  }

  const categoryBreakdown = {};
  for (const [cat, share] of categoryMap.entries()) {
    categoryBreakdown[cat] = {
      totalShare: Number(share.toFixed(2)),
      percentage: myTotalShare > 0 ? Number(((share / myTotalShare) * 100).toFixed(1)) : 0,
    };
  }

  return {
    userId: uId,
    totalPaidByMe: Number(totalPaidByMe.toFixed(2)),
    myTotalShare: Number(myTotalShare.toFixed(2)),
    netBalance: Number((totalPaidByMe - myTotalShare).toFixed(2)),
    involvedExpenseCount,
    categoryBreakdown,
  };
}

module.exports = {
  computeGroupAnalytics,
  computeUserAnalytics,
};

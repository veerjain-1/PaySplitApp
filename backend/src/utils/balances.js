/**
 * Balance calculation utilities for PaySplitApp.
 *
 * Given a list of expenses (each with a payer and a list of per-user splits),
 * computes each member's net balance and a minimal set of settlement
 * transactions (who should pay whom) to zero everyone out.
 */

/**
 * Resolve the amount each split participant owes for a single expense,
 * depending on the expense's splitType.
 *
 * - EQUAL: amount divided evenly across all split participants.
 * - EXACT: each split's explicit `amount` is used as-is.
 * - PERCENTAGE: each split's `percentage` (0-100) of the total amount.
 *
 * Returns a Map<userId, owedAmount>.
 */
function resolveSplitAmounts(expense) {
  const { amount, splitType, splits } = expense;
  const owed = new Map();

  if (!Array.isArray(splits) || splits.length === 0) {
    return owed;
  }

  if (splitType === 'EXACT') {
    for (const split of splits) {
      owed.set(split.userId, (owed.get(split.userId) || 0) + (split.amount || 0));
    }
  } else if (splitType === 'PERCENTAGE') {
    for (const split of splits) {
      const share = (amount * (split.percentage || 0)) / 100;
      owed.set(split.userId, (owed.get(split.userId) || 0) + share);
    }
  } else {
    // EQUAL (default)
    const share = amount / splits.length;
    for (const split of splits) {
      owed.set(split.userId, (owed.get(split.userId) || 0) + share);
    }
  }

  return owed;
}

/**
 * Compute net balances across a list of expenses.
 *
 * A positive balance means the user is owed money overall (they paid more
 * than their share). A negative balance means the user owes money overall.
 *
 * Returns a Map<userId, netBalance> rounded to 2 decimal places.
 */
function computeNetBalances(expenses) {
  const net = new Map();

  const credit = (userId, delta) => {
    net.set(userId, (net.get(userId) || 0) + delta);
  };

  for (const expense of expenses) {
    const owed = resolveSplitAmounts(expense);

    // Payer is credited the full amount they fronted.
    credit(expense.payerId, expense.amount);

    // Each participant is debited their resolved share.
    for (const [userId, share] of owed.entries()) {
      credit(userId, -share);
    }
  }

  // Round to avoid floating point drift (e.g. 19.999999999998).
  for (const [userId, balance] of net.entries()) {
    net.set(userId, Math.round(balance * 100) / 100);
  }

  return net;
}

/**
 * Given net balances, compute a minimal list of settlement transactions
 * so that every balance reaches (approximately) zero.
 *
 * Uses a greedy largest-debtor-pays-largest-creditor approach, which
 * minimizes the number of transactions for typical group-expense scenarios.
 *
 * Returns an array of { from, to, amount } where `from` owes `to` `amount`.
 */
function computeSettlements(netBalances, epsilon = 0.01) {
  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of netBalances.entries()) {
    if (balance > epsilon) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -epsilon) {
      debtors.push({ userId, amount: -balance });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settled = Math.min(debtor.amount, creditor.amount);

    if (settled > epsilon) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settled * 100) / 100,
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount <= epsilon) i += 1;
    if (creditor.amount <= epsilon) j += 1;
  }

  return settlements;
}

module.exports = { resolveSplitAmounts, computeNetBalances, computeSettlements };

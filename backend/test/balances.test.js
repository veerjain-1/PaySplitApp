const { resolveSplitAmounts, computeNetBalances, computeSettlements } = require('../src/utils/balances');

describe('balances utils', () => {
  describe('resolveSplitAmounts', () => {
    it('splits EQUAL amount evenly across participants', () => {
      const expense = {
        amount: 30,
        splitType: 'EQUAL',
        splits: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
      };
      const owed = resolveSplitAmounts(expense);
      expect(owed.get('a')).toBe(10);
      expect(owed.get('b')).toBe(10);
      expect(owed.get('c')).toBe(10);
    });

    it('uses explicit amounts for EXACT splits', () => {
      const expense = {
        amount: 50,
        splitType: 'EXACT',
        splits: [
          { userId: 'a', amount: 20 },
          { userId: 'b', amount: 30 },
        ],
      };
      const owed = resolveSplitAmounts(expense);
      expect(owed.get('a')).toBe(20);
      expect(owed.get('b')).toBe(30);
    });

    it('derives shares from percentages for PERCENTAGE splits', () => {
      const expense = {
        amount: 100,
        splitType: 'PERCENTAGE',
        splits: [
          { userId: 'a', percentage: 25 },
          { userId: 'b', percentage: 75 },
        ],
      };
      const owed = resolveSplitAmounts(expense);
      expect(owed.get('a')).toBe(25);
      expect(owed.get('b')).toBe(75);
    });

    it('returns an empty map when there are no splits', () => {
      const owed = resolveSplitAmounts({ amount: 10, splitType: 'EQUAL', splits: [] });
      expect(owed.size).toBe(0);
    });
  });

  describe('computeNetBalances', () => {
    it('credits the payer and debits each participant their share', () => {
      const expenses = [
        {
          amount: 30,
          payerId: 'a',
          splitType: 'EQUAL',
          splits: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
        },
      ];
      const net = computeNetBalances(expenses);
      expect(net.get('a')).toBe(20); // paid 30, owes 10
      expect(net.get('b')).toBe(-10);
      expect(net.get('c')).toBe(-10);
    });

    it('nets out balances across multiple expenses', () => {
      const expenses = [
        {
          amount: 30,
          payerId: 'a',
          splitType: 'EQUAL',
          splits: [{ userId: 'a' }, { userId: 'b' }],
        },
        {
          amount: 20,
          payerId: 'b',
          splitType: 'EQUAL',
          splits: [{ userId: 'a' }, { userId: 'b' }],
        },
      ];
      const net = computeNetBalances(expenses);
      // a: +15 -10 = +5 ; b: -15 +10 = -5
      expect(net.get('a')).toBe(5);
      expect(net.get('b')).toBe(-5);
    });

    it('returns an empty map for no expenses', () => {
      const net = computeNetBalances([]);
      expect(net.size).toBe(0);
    });
  });

  describe('computeSettlements', () => {
    it('produces a single transaction for a simple two-person debt', () => {
      const net = new Map([
        ['a', 10],
        ['b', -10],
      ]);
      const settlements = computeSettlements(net);
      expect(settlements).toEqual([{ from: 'b', to: 'a', amount: 10 }]);
    });

    it('minimizes transactions for a three-person group', () => {
      // a is owed 20, b owes 5, c owes 15
      const net = new Map([
        ['a', 20],
        ['b', -5],
        ['c', -15],
      ]);
      const settlements = computeSettlements(net);
      expect(settlements.length).toBe(2);
      const total = settlements.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBe(20);
    });

    it('ignores balances within the epsilon tolerance', () => {
      const net = new Map([
        ['a', 0.001],
        ['b', -0.001],
      ]);
      const settlements = computeSettlements(net);
      expect(settlements).toEqual([]);
    });

    it('returns no settlements when everyone is already even', () => {
      const net = new Map([
        ['a', 0],
        ['b', 0],
      ]);
      expect(computeSettlements(net)).toEqual([]);
    });
  });
});

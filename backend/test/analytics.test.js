const { computeGroupAnalytics, computeUserAnalytics } = require('../src/utils/analytics');

describe('Financial Analytics Utility', () => {
  describe('computeGroupAnalytics', () => {
    it('returns empty analytics for null or empty expenses', () => {
      const res = computeGroupAnalytics([]);
      expect(res.totalSpending).toBe(0);
      expect(res.expenseCount).toBe(0);
      expect(res.averageExpense).toBe(0);
      expect(res.categoryBreakdown).toEqual({});
      expect(res.memberSpending).toEqual({});
      expect(res.topExpenses).toEqual([]);
    });

    it('computes category breakdowns and member totals correctly', () => {
      const expenses = [
        {
          id: 'exp1',
          title: 'Grocery run',
          amount: 60,
          payerId: 'alice',
          category: 'Food',
          splitType: 'EQUAL',
          splits: [{ userId: 'alice' }, { userId: 'bob' }],
          createdAt: new Date('2026-10-01'),
        },
        {
          id: 'exp2',
          title: 'Train tickets',
          amount: 40,
          payerId: 'bob',
          category: 'Travel',
          splitType: 'EXACT',
          splits: [
            { userId: 'alice', amount: 15 },
            { userId: 'bob', amount: 25 },
          ],
          createdAt: new Date('2026-10-05'),
        },
      ];

      const res = computeGroupAnalytics(expenses);

      expect(res.totalSpending).toBe(100);
      expect(res.expenseCount).toBe(2);
      expect(res.averageExpense).toBe(50);

      // Category breakdown
      expect(res.categoryBreakdown.Food).toEqual({
        total: 60,
        count: 1,
        percentage: 60,
      });
      expect(res.categoryBreakdown.Travel).toEqual({
        total: 40,
        count: 1,
        percentage: 40,
      });

      // Member spending:
      // Alice: paid 60, share = 30 + 15 = 45 -> net = +15
      expect(res.memberSpending.alice).toEqual({
        totalPaid: 60,
        totalShare: 45,
        netBalance: 15,
      });
      // Bob: paid 40, share = 30 + 25 = 55 -> net = -15
      expect(res.memberSpending.bob).toEqual({
        totalPaid: 40,
        totalShare: 55,
        netBalance: -15,
      });

      // Top expenses
      expect(res.topExpenses).toHaveLength(2);
      expect(res.topExpenses[0].title).toBe('Grocery run');
      expect(res.topExpenses[0].amount).toBe(60);

      // Monthly trends
      expect(res.monthlyTrends['2026-10']).toBe(100);
    });
  });

  describe('computeUserAnalytics', () => {
    it('returns empty user analytics when given no expenses', () => {
      const res = computeUserAnalytics('alice', []);
      expect(res.userId).toBe('alice');
      expect(res.totalPaidByMe).toBe(0);
      expect(res.myTotalShare).toBe(0);
      expect(res.netBalance).toBe(0);
      expect(res.involvedExpenseCount).toBe(0);
    });

    it('computes personal spending and category share accurately', () => {
      const expenses = [
        {
          title: 'Groceries',
          amount: 100,
          payerId: 'alice',
          category: 'Groceries',
          splitType: 'EQUAL',
          splits: [{ userId: 'alice' }, { userId: 'bob' }],
        },
        {
          title: 'Utilities bill',
          amount: 80,
          payerId: 'bob',
          category: 'Utilities',
          splitType: 'EQUAL',
          splits: [{ userId: 'alice' }, { userId: 'bob' }],
        },
      ];

      const res = computeUserAnalytics('alice', expenses);
      expect(res.totalPaidByMe).toBe(100);
      expect(res.myTotalShare).toBe(90); // 50 + 40
      expect(res.netBalance).toBe(10); // 100 - 90
      expect(res.involvedExpenseCount).toBe(2);

      expect(res.categoryBreakdown.Groceries.totalShare).toBe(50);
      expect(res.categoryBreakdown.Utilities.totalShare).toBe(40);
    });
  });
});

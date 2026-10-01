const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

global.fetch = jest.fn();

jest.setTimeout(60000);

const app = require('../src/app');
const Expense = require('../src/models/Expense');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Group balances API', () => {
  it('returns net balances and settlements for a group', async () => {
    const groupId = new mongoose.Types.ObjectId();

    await Expense.create([
      {
        title: 'Dinner',
        amount: 30,
        payerId: 'alice',
        groupId,
        splitType: 'EQUAL',
        splits: [{ userId: 'alice' }, { userId: 'bob' }, { userId: 'carol' }],
      },
      {
        title: 'Cabs',
        amount: 20,
        payerId: 'bob',
        groupId,
        splitType: 'EQUAL',
        splits: [{ userId: 'alice' }, { userId: 'bob' }],
      },
    ]);

    const res = await request(app).get(`/api/groups/${groupId}/balances`).expect(200);

    expect(res.body.groupId).toBe(groupId.toString());
    expect(res.body.expenseCount).toBe(2);

    const balanceFor = (userId) => res.body.balances.find((b) => b.userId === userId).balance;
    expect(balanceFor('alice')).toBe(10); // paid 30, owes 10+10
    expect(balanceFor('bob')).toBe(0); // paid 20, owes 10+10
    expect(balanceFor('carol')).toBe(-10);

    expect(res.body.settlements.length).toBeGreaterThan(0);
    const total = res.body.settlements.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(10, 2);
  });

  it('returns empty balances for a group with no expenses', async () => {
    const groupId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/groups/${groupId}/balances`).expect(200);

    expect(res.body.expenseCount).toBe(0);
    expect(res.body.balances).toEqual([]);
    expect(res.body.settlements).toEqual([]);
  });
});

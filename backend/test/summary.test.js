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

describe('Summary & Analytics API', () => {
  it('GET /api/summary returns service status and endpoint links', async () => {
    const res = await request(app).get('/api/summary');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.endpoints).toHaveProperty('group');
    expect(res.body.endpoints).toHaveProperty('user');
  });

  it('GET /api/summary/group/:groupId returns full group analytics', async () => {
    const groupId = new mongoose.Types.ObjectId();

    await Expense.create([
      {
        title: 'Team Lunch',
        amount: 60,
        payerId: 'user_1',
        groupId,
        category: 'Dining',
        splitType: 'EQUAL',
        splits: [{ userId: 'user_1' }, { userId: 'user_2' }],
      },
      {
        title: 'Office Snacks',
        amount: 30,
        payerId: 'user_2',
        groupId,
        category: 'Snacks',
        splitType: 'EQUAL',
        splits: [{ userId: 'user_1' }, { userId: 'user_2' }],
      },
    ]);

    const res = await request(app).get(`/api/summary/group/${groupId}`);
    expect(res.status).toBe(200);
    expect(res.body.groupId).toBe(String(groupId));
    expect(res.body.totalSpending).toBe(90);
    expect(res.body.expenseCount).toBe(2);
    expect(res.body.averageExpense).toBe(45);
    expect(res.body.categoryBreakdown).toHaveProperty('Dining');
    expect(res.body.categoryBreakdown).toHaveProperty('Snacks');
    expect(res.body.topExpenses).toHaveLength(2);
  });

  it('GET /api/summary/user/:userId returns personal cross-group spending', async () => {
    const groupId = new mongoose.Types.ObjectId();

    await Expense.create([
      {
        title: 'Movie Tickets',
        amount: 50,
        payerId: 'user_david',
        groupId,
        category: 'Entertainment',
        splitType: 'EQUAL',
        splits: [{ userId: 'user_david' }, { userId: 'user_emma' }],
      },
    ]);

    const res = await request(app).get('/api/summary/user/user_david');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user_david');
    expect(res.body.totalPaidByMe).toBe(50);
    expect(res.body.myTotalShare).toBe(25);
    expect(res.body.netBalance).toBe(25);
    expect(res.body.involvedExpenseCount).toBe(1);
    expect(res.body.categoryBreakdown).toHaveProperty('Entertainment');
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const recurringExpensesRouter = require('../src/routes/recurringExpenses');
const RecurringExpense = require('../src/models/RecurringExpense');
require('../src/models/User');

const app = express();
app.use(express.json());
app.use('/api/recurring-expenses', recurringExpensesRouter);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await RecurringExpense.deleteMany({});
});

describe('RecurringExpense Model & API', () => {
  it('should calculate the next date correctly on save (monthly)', async () => {
    const groupId = new mongoose.Types.ObjectId();
    const paidBy = new mongoose.Types.ObjectId();
    const expense = new RecurringExpense({
      groupId,
      paidBy,
      amount: 15.99,
      frequency: 'monthly',
      nextBillingDate: new Date('2026-09-01T00:00:00.000Z'),
      splits: [{ user: paidBy, amount: 15.99 }],
    });

    const nextDate = expense.calculateNextDate(new Date('2026-09-01T00:00:00.000Z'));
    expect(nextDate).toBeDefined();
    // 1 month after Sept 1 is Oct 1
    expect(nextDate.toISOString()).toBe(new Date('2026-10-01T00:00:00.000Z').toISOString());
    await expense.save();
    expect(expense._id).toBeDefined();
  });

  it('should create a new recurring expense via POST /', async () => {
    const groupId = new mongoose.Types.ObjectId().toString();
    const paidBy = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/recurring-expenses')
      .send({
        groupId,
        paidBy,
        amount: 9.99,
        frequency: 'monthly',
        nextBillingDate: new Date('2026-09-15T00:00:00.000Z'),
        splits: [{ user: paidBy, amount: 9.99 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.amount).toBe(9.99);
    expect(res.body.frequency).toBe('monthly');
  });

  it('should fetch all recurring expenses for group via GET /group/:groupId', async () => {
    const groupId = new mongoose.Types.ObjectId();
    const paidBy = new mongoose.Types.ObjectId();
    await RecurringExpense.create({
      groupId,
      paidBy,
      amount: 50.0,
      frequency: 'monthly',
      nextBillingDate: new Date('2026-09-01T00:00:00.000Z'),
      splits: [{ user: paidBy, amount: 50.0 }],
    });

    const res = await request(app).get(`/api/recurring-expenses/group/${groupId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].amount).toBe(50.0);
  });
});

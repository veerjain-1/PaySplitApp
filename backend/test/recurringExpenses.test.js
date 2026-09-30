const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const recurringExpensesRouter = require('../src/routes/recurringExpenses');
const RecurringExpense = require('../src/models/RecurringExpense');

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
    const expense = new RecurringExpense({
      title: 'Netflix',
      amount: 15.99,
      interval: 'monthly',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      creatorId: new mongoose.Types.ObjectId(),
    });

    await expense.save();

    expect(expense.nextDate).toBeDefined();
    // 1 month after Sept 1 is Oct 1
    expect(expense.nextDate.toISOString()).toBe(new Date('2026-10-01T00:00:00.000Z').toISOString());
  });

  it('should create a new recurring expense via POST /', async () => {
    const creatorId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/recurring-expenses').send({
      title: 'Spotify',
      amount: 9.99,
      interval: 'monthly',
      startDate: '2026-09-15T00:00:00.000Z',
      creatorId,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Spotify');
    expect(res.body.nextDate).toBeDefined();
  });

  it('should fetch all recurring expenses via GET /', async () => {
    await RecurringExpense.create({
      title: 'Gym',
      amount: 50.0,
      interval: 'monthly',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      creatorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).get('/api/recurring-expenses');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Gym');
  });
});

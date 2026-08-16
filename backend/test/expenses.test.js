const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock fetch for the AI parsing endpoint since the Python server won't be running in the CI test env
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      items: [{ name: 'Test Dinner', cost: 25.00 }],
      total: 25.00,
      note: 'Mocked AI Response'
    })
  })
);

jest.setTimeout(60000);

const app = require('../src/app');
const Expense = require('../src/models/Expense');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Disconnect if already connected
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
    // Clear DB between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

describe('Expenses API', () => {
    it('should create a new expense successfully', async () => {
        const expenseData = {
            title: 'Uber Ride',
            amount: 15.50,
            payerId: 'user123',
            splitType: 'EQUAL',
            splits: [
                { userId: 'user123' },
                { userId: 'user456' },
                { userId: 'user789' }
            ]
        };

        const res = await request(app)
            .post('/api/expenses')
            .send(expenseData)
            .expect(201);
            
        expect(res.body.title).toBe(expenseData.title);
        expect(res.body.amount).toBe(expenseData.amount);
        expect(res.body.payerId).toBe(expenseData.payerId);
        
        // Verify it was saved in MongoDB
        const dbExpense = await Expense.findById(res.body._id);
        expect(dbExpense).toBeTruthy();
        expect(dbExpense.title).toBe('Uber Ride');
    });

    it('should fail to create an expense if title is missing', async () => {
        const res = await request(app)
            .post('/api/expenses')
            .send({
                amount: 15.50,
                payerId: 'user123'
            })
            .expect(400);
            
        expect(res.body.error).toMatch(/Title is required/i);
    });

    it('should fail to create an expense if amount is negative', async () => {
        const res = await request(app)
            .post('/api/expenses')
            .send({
                title: 'Lunch',
                amount: -10,
                payerId: 'user123'
            })
            .expect(400);
            
        expect(res.body.error).toMatch(/Amount must be positive/i);
    });

    it('should get all expenses', async () => {
        // Seed DB
        await Expense.create([
            { title: 'Dinner', amount: 40, payerId: 'user1', createdAt: new Date(Date.now() - 1000) },
            { title: 'Movies', amount: 20, payerId: 'user2', createdAt: new Date() }
        ]);

        const res = await request(app)
            .get('/api/expenses')
            .expect(200);
            
        expect(res.body.length).toBe(2);
        // Ensure sorted by createdAt DESC
        expect(res.body[0].title).toBe('Movies');
        expect(res.body[1].title).toBe('Dinner');
    });

    it('should successfully parse a receipt via the AI pipeline route', async () => {
        const res = await request(app)
            .post('/api/expenses/parse-receipt')
            .send({ receiptText: 'Dinner $25.00' })
            .expect(200);
            
        expect(res.body.total).toBe(25.00);
        expect(res.body.items[0].name).toBe('Test Dinner');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should fail to parse a receipt if no text is provided', async () => {
        const res = await request(app)
            .post('/api/expenses/parse-receipt')
            .send({})
            .expect(400);
            
        expect(res.body.error).toBe('No receipt text provided');
    });
});

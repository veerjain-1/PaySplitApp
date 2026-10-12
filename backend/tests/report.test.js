const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

// Use an in‑memory MongoDB server for tests (assumes setup in test env)

beforeAll(async () => {
  // connection handled by test environment setup
});

afterAll(async () => {
  await mongoose.disconnect();
});

test('GET /api/report/:groupId returns 404 when no data', async () => {
  const res = await request(app).get('/api/report/nonexistent');
  expect(res.status).toBe(404);
});

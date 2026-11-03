const request = require('supertest');
const express = require('express');
const errorHandler = require('../src/middleware/errorHandler');
const rateLimiter = require('../src/middleware/rateLimiter');

describe('Middleware Unit Tests', () => {
  describe('errorHandler', () => {
    it('catches synchronous and asynchronous route errors and returns formatted JSON', async () => {
      const app = express();
      app.get('/test-error', (req, res, next) => {
        const error = new Error('Custom validation failure');
        error.status = 400;
        next(error);
      });
      app.use(errorHandler);

      const res = await request(app).get('/test-error');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Custom validation failure' });
    });

    it('defaults to 500 when error does not have a status property', async () => {
      const app = express();
      app.get('/test-500', (req, res, next) => {
        next(new Error('Database exploded'));
      });
      app.use(errorHandler);

      const res = await request(app).get('/test-500');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Database exploded' });
    });
  });

  describe('rateLimiter', () => {
    it('sets X-RateLimit headers and allows requests within limit', async () => {
      const app = express();
      app.use(rateLimiter);
      app.get('/rate-test', (req, res) => res.json({ ok: true }));

      const res = await request(app).get('/rate-test');
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('x-ratelimit-limit');
      expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });
});

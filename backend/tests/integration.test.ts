import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

describe('Backend API Integration', () => {
  it('should return 200 OK from healthcheck', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

// NeuroLearn Production Express Backend Server Entrypoint
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { Queue } from 'bullmq';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { setupWorker } from './worker';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import client from 'prom-client';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Prometheus Default Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom Prometheus Metric
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'neurolearn-super-secret-key-gateways';

// Setup BullMQ Queue
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
const aiQueue = new Queue('ai-inference-queue', { connection: redisConnection });

// Initialize the worker if not in a separate process
setupWorker();

app.use(cors());
app.use(express.json());

// Sentry Request Handler
Sentry.setupExpressErrorHandler(app);

// Prometheus Middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Phase 9: Enterprise Security
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Multer for memory storage of audio files
const upload = multer({ storage: multer.memoryStorage() });

// Zod schemas for validation
const ScreeningSubmitSchema = z.object({
  studentId: z.string().uuid(),
  testId: z.string().uuid(),
  wpm: z.number(),
  accuracy: z.number(),
  hesitationMs: z.number(),
  distractionCount: z.number(),
  speechScore: z.number(),
  aiPayload: z.any().optional(), // Raw data to send to AI models
  aiType: z.enum(['DYSLEXIA', 'ADHD', 'SPEECH']).optional()
});

// 2. JWT verification middleware
const authenticateToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token authorization failed' });
    req.user = user;
    next();
  });
};

// 3. REST API Routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NeuroLearn core cluster is operational', date: new Date() });
});

// Student assessment submission endpoint
app.post('/api/screenings/submit', authenticateToken, async (req: any, res) => {
  try {
    const data = ScreeningSubmitSchema.parse(req.body);

    // Save initial basic result in DB
    const result = await prisma.testResult.create({
      data: {
        studentId: data.studentId,
        testId: data.testId,
        wpm: data.wpm,
        accuracy: data.accuracy,
        hesitationMs: data.hesitationMs,
        distractionCount: data.distractionCount,
        speechScore: data.speechScore,
      }
    });

    // If AI processing requested, push to queue
    if (data.aiPayload && data.aiType) {
      await aiQueue.add('generate-ai-report', {
        studentId: data.studentId,
        payload: data.aiPayload,
        type: data.aiType
      });
    }

    res.status(201).json({
      message: 'Screening parameters successfully stored and AI processing queued',
      data: result
    });

    // Push WebSocket notification telemetry to listening teachers in real-time!
    broadcastToTeachers({
      event: 'NEW_SCREENING_SUBMISSION',
      data: { studentId: data.studentId, wpm: data.wpm, focusScore: data.accuracy }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payload format', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Audio Upload Route for True Speech Inference
app.post('/api/screenings/submit-audio', authenticateToken, upload.single('audio'), async (req: any, res) => {
  try {
    const studentId = req.body.studentId;
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Pass the file buffer directly to the AI service
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname || 'audio.webm');
    
    // Create an AudioRecord in DB
    const audioRecord = await prisma.audioRecord.create({
      data: {
        studentId: studentId,
        durationMs: 0, // This will be updated later
        localFilePath: 'memory',
      }
    });

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/ai/predict/speech-whisper`, form, {
      headers: { ...form.getHeaders() }
    });

    res.status(200).json({
      message: 'Audio processed by Whisper AI successfully',
      aiResponse: aiResponse.data,
      recordId: audioRecord.id
    });
  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({ error: 'Failed to process audio via AI Service' });
  }
});

// Get AI Reports by student role
app.get('/api/reports/:studentId', authenticateToken, async (req, res) => {
  try {
    const reports = await prisma.aIReport.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { date: 'desc' },
      take: 5
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

// 4. WebSocket Server handling real-time cognitive stress tracking
const connectedClients = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, req) => {
  let userId = `user-${Math.random().toString(36).slice(2, 9)}`;
  connectedClients.set(userId, ws);

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.event === 'ACTIVE_TELEMETRY_STREAM') {
        ws.send(JSON.stringify({ event: 'TELEMETRY_ACKNOWLEDGED', status: 'STABLE' }));
      }
    } catch (e) {
      ws.send(JSON.stringify({ error: 'Invalid JSON payload format' }));
    }
  });

  ws.on('close', () => {
    connectedClients.delete(userId);
  });
});

const broadcastToTeachers = (payload: any) => {
  connectedClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  });
};

server.listen(PORT, () => {
  console.log(`[NeuroLearn Server] Core API up and running on port ${PORT}`);
});

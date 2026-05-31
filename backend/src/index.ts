import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import client from 'prom-client';
import helmet from 'helmet';
import multer from 'multer';

import { env } from './config/env';
import { setupWorker } from './worker';
import { authenticateToken } from './middleware/auth';
import { apiLimiter } from './middleware/security';
import { initWebSocketServer } from './websocket/wsServer';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { StudentController } from './controllers/student.controller';
import { ScreeningController } from './controllers/screening.controller';
import { AdminController } from './controllers/admin.controller';

// Initialize Sentry Tracking
Sentry.init({
  dsn: env.SENTRY_DSN || '',
  tracesSampleRate: 1.0,
});

// Setup Prometheus Instrumentation metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Boot BullMQ redis worker
setupWorker();

// Global Express Middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());

// Sentry Error Handlers
Sentry.setupExpressErrorHandler(app);

// Prometheus counter increment middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Set rate limiter on api routes
app.use('/api/', apiLimiter);

// Setup multer memory buffer storage for audio bytes
const upload = multer({ storage: multer.memoryStorage() });

// WebSocket Stream Channel
initWebSocketServer(wss);

// ----------------------------------------------------
// Core Routing Trees
// ----------------------------------------------------

// Server Health & Stats
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NeuroLearn core cluster is operational', date: new Date() });
});

app.get('/metrics', async (req, res) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  if (
    login &&
    password &&
    login === env.METRICS_USER &&
    password === env.METRICS_PASS
  ) {
    res.set('Content-Type', register.contentType);
    return res.end(await register.metrics());
  }
  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Authentication required.');
});

// Authentication Domain Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/refresh', AuthController.refresh);

// Student Profiles & Analytics Routes
app.get('/api/students', authenticateToken, StudentController.getStudents);
app.get('/api/students/:id', authenticateToken, StudentController.getStudentById);
app.put('/api/reports/:reportId/notes', authenticateToken, StudentController.updateReportNotes);
app.get('/api/reports/:studentId', authenticateToken, StudentController.getReports);
app.get('/api/reading-tests', authenticateToken, StudentController.getReadingTests);
app.post('/api/students/:id/assign-test', authenticateToken, StudentController.assignTest);
app.post('/api/parent/link-child', authenticateToken, StudentController.linkChild);

// Telemetry & Screening Routes
app.post('/api/telemetry', authenticateToken, ScreeningController.submitTelemetry);
app.post('/api/screenings/submit', authenticateToken, ScreeningController.submitScreening);
app.post(
  '/api/screenings/submit-audio',
  authenticateToken,
  upload.single('audio'),
  ScreeningController.submitAudio
);

// Admin Control Domain Routes
app.get('/api/admin/users', authenticateToken, AdminController.getUsers);
app.delete('/api/admin/users/:id', authenticateToken, AdminController.deleteUser);
app.get('/api/admin/audit-logs', authenticateToken, AdminController.getAuditLogs);

// Custom Interactive Chatbot Assistant Route
app.post('/api/chat', authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  let botResponse = 'I can assist you with your learning difficulty screening or custom study plans.';
  const query = message.toLowerCase();

  if (query.includes('dyslexia')) {
    botResponse =
      'Dyslexia is mapped through letter substitutions (like b/d swap) and physical keystroke rhythm inconsistencies. Our platform generates custom formatted OpenDyslexic spaced text guides as accommodations.';
  } else if (query.includes('adhd') || query.includes('focus')) {
    botResponse =
      'ADHD attention slip vectors are identified via webcam eye gaze tracking deviations. We recommend 2-minute visual calibration focus breaks.';
  } else if (query.includes('voice')) {
    botResponse =
      'The voice module analyzes speech hesitation patterns, reading speed, and phonological fluency using our PyTorch Whisper cluster.';
  }

  setTimeout(() => res.json({ reply: botResponse }), 600);
});

// Boot API server
server.listen(env.PORT, () => {
  console.log(`[NeuroLearn Server] Core API up and running on port ${env.PORT}`);
});

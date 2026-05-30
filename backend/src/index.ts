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
import bcrypt from 'bcryptjs';

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
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set.');
}
const JWT_SECRET = process.env.JWT_SECRET;

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
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  if (login && password && login === process.env.METRICS_USER && password === process.env.METRICS_PASS) {
    res.set('Content-Type', register.contentType);
    return res.end(await register.metrics());
  }
  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Authentication required.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NeuroLearn core cluster is operational', date: new Date() });
});

// AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, schoolName } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create School if provided, else use a default
    let schoolId = undefined;
    if (schoolName) {
      const school = await prisma.school.upsert({
        where: { name: schoolName },
        update: {},
        create: { name: schoolName }
      });
      schoolId = school.id;
    } else {
      const defaultSchool = await prisma.school.findFirst();
      if (defaultSchool) schoolId = defaultSchool.id;
      else {
        const newSchool = await prisma.school.create({ data: { name: 'Default Academy' } });
        schoolId = newSchool.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        ...(role === 'STUDENT' ? {
          studentProfile: {
            create: {
              grade: 'Ungraded',
              schoolId: schoolId!
            }
          }
        } : {})
      },
      include: { studentProfile: true }
    });

    const tokenPayload = { 
      userId: user.id, 
      role: user.role, 
      studentProfileId: user.studentProfile?.id 
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { studentProfile: true } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

    const tokenPayload = { 
      userId: user.id, 
      role: user.role, 
      studentProfileId: user.studentProfile?.id 
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// TEACHER & ADMIN Endpoints
app.get('/api/students', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const students = await prisma.studentProfile.findMany({ include: { user: true } });
  res.json(students);
});

app.get('/api/students/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const student = await prisma.studentProfile.findUnique({ 
    where: { id: req.params.id }, 
    include: { user: true, aiReports: { orderBy: { date: 'desc' }, take: 1 } } 
  });
  res.json(student);
});

app.put('/api/reports/:reportId/notes', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const { notes } = req.body;
  const report = await prisma.aIReport.update({
    where: { id: req.params.reportId },
    data: { teacherNotes: notes }
  });
  res.json(report);
});

app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

app.delete('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

app.post('/api/telemetry', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Forbidden' });
  const data = req.body;
  const session = await prisma.telemetrySession.create({
    data: {
      studentId: req.user.studentProfileId,
      gazeVectorsX: data.gazeVectorsX || [],
      gazeVectorsY: data.gazeVectorsY || [],
      blinkIntervals: data.blinkIntervals || [],
      keyDwellTimes: data.keyDwellTimes || [],
      keyFlightTimes: data.keyFlightTimes || []
    }
  });
  res.status(201).json(session);
});

app.get('/api/admin/audit-logs', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(logs);
});

app.post('/api/chat', authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  // Simulated LLM context to avoid external dependencies
  let botResponse = "I can assist you with your learning difficulty screening or custom study plans.";
  const query = message.toLowerCase();
  if (query.includes('dyslexia')) botResponse = "Dyslexia is mapped through letter substitutions (like b/d swap) and physical keystroke rhythm inconsistencies. Our platform generates custom formatted OpenDyslexic spaced text guides as accommodations.";
  else if (query.includes('adhd') || query.includes('focus')) botResponse = "ADHD attention slip vectors are identified via webcam eye gaze tracking deviations. We recommend 2-minute visual calibration focus breaks.";
  else if (query.includes('voice')) botResponse = "The voice module analyzes speech hesitation patterns, reading speed, and phonological fluency using our PyTorch Whisper cluster.";
  
  setTimeout(() => res.json({ reply: botResponse }), 600);
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

// Get AI Reports by student role with Ownership Authorization
app.get('/api/reports/:studentId', authenticateToken, async (req: any, res) => {
  try {
    const { studentId } = req.params;
    
    // RBAC Check
    if (req.user.role === 'STUDENT') {
      if (req.user.studentProfileId !== studentId) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role === 'PARENT') {
      const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
      if (!student || student.parentId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const reports = await prisma.aIReport.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 5
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

// 4. WebSocket Server handling real-time cognitive stress tracking
const connectedClients = new Map<string, { ws: WebSocket, role: string }>();

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const userId = `user-${Math.random().toString(36).slice(2, 9)}`;
    connectedClients.set(userId, { ws, role: user.role });

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
});

const broadcastToTeachers = (payload: any) => {
  connectedClients.forEach((client) => {
    if (client.role === 'TEACHER' && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(payload));
    }
  });
};

server.listen(PORT, () => {
  console.log(`[NeuroLearn Server] Core API up and running on port ${PORT}`);
});

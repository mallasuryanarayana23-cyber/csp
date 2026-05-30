import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch'; // if needed, but in Node 18+ fetch is global

const prisma = new PrismaClient();

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const setupWorker = () => {
  const worker = new Worker(
    'ai-inference-queue',
    async (job: Job) => {
      console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
      const { studentId, payload, type } = job.data;

      try {
        let endpoint = '';
        if (type === 'DYSLEXIA') endpoint = '/ai/predict/dyslexia';
        else if (type === 'ADHD') endpoint = '/ai/predict/adhd';
        else if (type === 'SPEECH') endpoint = '/ai/predict/speech-fluency';

        // Call the Python AI service
        const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`AI Service failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log(`[Worker] Job ${job.id} AI inference complete:`, result);

        // Store result in database via Prisma (we can store this in AIReport or TestResult)
        // For simplicity in this job, we log it and if it's an AIReport we could generate it.
        // Assuming we are generating a full report here:
        
        const report = await prisma.aIReport.create({
          data: {
            studentId,
            dyslexiaRisk: result.prediction === 'DYSLEXIA_SCREENING' ? result.risk_tier : 'LOW',
            dyslexiaProb: result.probability || 0,
            adhdRisk: result.prediction === 'ADHD_FOCUS_SCREENING' ? result.risk_tier : 'LOW',
            adhdProb: result.probability || 0,
            speechFluencyScore: result.fluency_score || 100,
            typingRhythmConsistency: 100, // Assuming static for now or derived from dyslex
            attentionSpanMin: 15.0,
            recommendations: [
              `Automated recommendation based on ${result.risk_tier || 'normal'} findings.`,
            ],
            cognitiveStress: 'LOW',
          }
        });
        
        console.log(`[Worker] Saved AI Report ${report.id} to database.`);
        return report;
      } catch (error) {
        console.error(`[Worker] Failed job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} has completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job?.id} has failed with ${err.message}`);
  });

  console.log('[Worker] BullMQ worker initialized and listening to ai-inference-queue');
};

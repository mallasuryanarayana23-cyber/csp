import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { redisConnection, isRedisAvailable } from './queue.config';
import { executeJob } from './worker-job';

export const setupWorker = () => {
  if (!isRedisAvailable()) {
    console.log('[Worker] Redis is unavailable. BullMQ worker boot skipped. In-memory queue listener active.');
    return;
  }

  try {
    const worker = new Worker(
      'ai-inference-queue',
      async (job: Job) => {
        console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
        return executeJob(job.data);
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
  } catch (err: any) {
    console.warn('[Worker] Failed to boot Redis BullMQ worker, falling back to local memory worker:', err.message);
  }
};

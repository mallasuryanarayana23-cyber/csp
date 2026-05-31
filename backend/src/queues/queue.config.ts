import { Queue } from 'bullmq';
import { env } from '../config/env';
import { EventEmitter } from 'events';

export const redisConnection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

let queueInstance: any = null;
let redisAvailable = true;

try {
  queueInstance = new Queue('ai-inference-queue', { 
    connection: redisConnection,
    defaultJobOptions: { removeOnComplete: true }
  });
  
  // Listen to connection errors to prevent node crashes
  queueInstance.on('error', (err: any) => {
    // We log it once but don't let it crash node
    if (redisAvailable) {
      console.warn('[Queue] Redis connection failed, falling back to In-Memory asynchronous execution:', err.message);
      redisAvailable = false;
    }
  });
} catch (e: any) {
  console.warn('[Queue] Could not initialize BullMQ. Falling back to In-Memory asynchronous execution.');
  redisAvailable = false;
}

// In-Memory fallback queue class
class InMemoryQueue extends EventEmitter {
  async add(name: string, data: any) {
    console.log(`[InMemoryQueue] Enqueued job: ${name} (Data: ${JSON.stringify(data)})`);
    // Run the job asynchronously in memory
    setImmediate(async () => {
      try {
        const { executeJob } = require('./worker-job');
        await executeJob(data);
      } catch (err: any) {
        console.error(`[InMemoryQueue] Failed executing job asynchronously:`, err.message);
      }
    });
    return { id: `mock-job-${Date.now()}` };
  }
  on(event: string, handler: any) {
    return this;
  }
}

export const isRedisAvailable = () => redisAvailable;
export const aiQueue = queueInstance && redisAvailable ? queueInstance : new InMemoryQueue();
export default aiQueue;

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000'),
  JWT_SECRET: z.string().default('local_development_secret'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
  AI_SERVICE_URL: z.string().default('http://127.0.0.1:8000'),
  SENTRY_DSN: z.string().optional(),
  METRICS_USER: z.string().optional(),
  METRICS_PASS: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

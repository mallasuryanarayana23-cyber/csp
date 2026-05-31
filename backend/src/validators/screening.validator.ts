import { z } from 'zod';

export const ScreeningSubmitSchema = z.object({
  studentId: z.string().uuid(),
  testId: z.string().uuid(),
  wpm: z.number(),
  accuracy: z.number(),
  hesitationMs: z.number(),
  distractionCount: z.number(),
  speechScore: z.number(),
  aiPayload: z.any().optional(), // Raw sensory signals
  aiType: z.enum(['DYSLEXIA', 'ADHD', 'SPEECH']).optional(),
});

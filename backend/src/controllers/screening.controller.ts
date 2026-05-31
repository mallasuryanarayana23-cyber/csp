import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ScreeningSubmitSchema } from '../validators/screening.validator';
import { AIService } from '../services/ai.service';
import { TelemetryService } from '../services/telemetry.service';
import { broadcastToTeachers } from '../websocket/wsServer';
import { z } from 'zod';

export class ScreeningController {
  static async submitScreening(req: AuthenticatedRequest, res: Response) {
    try {
      const data = ScreeningSubmitSchema.parse(req.body);

      const result = await AIService.submitScreening(data);

      res.status(201).json({
        message: 'Screening parameters successfully stored and AI processing queued',
        data: result,
      });

      // Stream alert events to active teacher views instantly!
      broadcastToTeachers({
        event: 'NEW_SCREENING_SUBMISSION',
        data: { studentId: data.studentId, wpm: data.wpm, focusScore: data.accuracy },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid payload format', details: (error as any).errors });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async submitAudio(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.body.studentId;
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      const result = await AIService.processAudio(studentId, req.file);

      return res.status(200).json({
        message: 'Audio processed by Whisper AI successfully',
        aiResponse: result.aiResponse,
        recordId: result.recordId,
      });
    } catch (error) {
      console.error('Audio processing error:', error);
      return res.status(500).json({ error: 'Failed to process audio via AI Service' });
    }
  }

  static async submitTelemetry(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user!.role !== 'STUDENT') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const session = await TelemetryService.saveTelemetry(req.user!.studentProfileId!, req.body);
      return res.status(201).json(session);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record telemetry session' });
    }
  }
}

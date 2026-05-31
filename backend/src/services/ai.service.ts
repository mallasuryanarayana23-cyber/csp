import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env';
import { aiQueue } from '../queues/queue.config';
import { ReportRepository } from '../repositories/report.repository';
import { StudentRepository } from '../repositories/student.repository';

export class AIService {
  static async submitScreening(data: {
    studentId: string;
    testId: string;
    wpm: number;
    accuracy: number;
    hesitationMs: number;
    distractionCount: number;
    speechScore: number;
    aiPayload?: any;
    aiType?: 'DYSLEXIA' | 'ADHD' | 'SPEECH';
  }) {
    // 1. Save screening test results in DB
    const result = await StudentRepository.createTestResult({
      studentId: data.studentId,
      testId: data.testId,
      wpm: data.wpm,
      accuracy: data.accuracy,
      hesitationMs: data.hesitationMs,
      distractionCount: data.distractionCount,
      speechScore: data.speechScore,
    });

    // 2. Queue AI generation report job if requested
    if (data.aiPayload && data.aiType) {
      await aiQueue.add('generate-ai-report', {
        studentId: data.studentId,
        payload: data.aiPayload,
        type: data.aiType,
      });
    }

    return result;
  }

  static async processAudio(studentId: string, audioFile: Express.Multer.File) {
    // Create an initial AudioRecord in the DB
    const audioRecord = await ReportRepository.createAudioRecord({
      studentId,
      durationMs: 0,
      localFilePath: 'memory',
    });

    // Forward raw buffer stream to FastAPI AI service
    const form = new FormData();
    form.append('file', audioFile.buffer, audioFile.originalname || 'audio.webm');

    const aiResponse = await axios.post(`${env.AI_SERVICE_URL}/ai/predict/speech-whisper`, form, {
      headers: { ...form.getHeaders() },
    });

    return {
      aiResponse: aiResponse.data,
      recordId: audioRecord.id,
    };
  }
}

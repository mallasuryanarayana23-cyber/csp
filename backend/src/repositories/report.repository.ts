import { prisma } from '../database/prisma';

export class ReportRepository {
  static async findByStudentId(studentId: string, limit = 5) {
    return prisma.aIReport.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  static async updateNotes(reportId: string, notes: string) {
    return prisma.aIReport.update({
      where: { id: reportId },
      data: { teacherNotes: notes },
    });
  }

  static async createAIReport(data: {
    studentId: string;
    dyslexiaRisk: string;
    dyslexiaProb: number;
    adhdRisk: string;
    adhdProb: number;
    speechFluencyScore: number;
    typingRhythmConsistency: number;
    attentionSpanMin: number;
    recommendations: string;
    cognitiveStress: string;
  }) {
    return prisma.aIReport.create({
      data,
    });
  }

  static async createExplainabilityLog(data: {
    aiModelVersion: string;
    predictionType: string;
    confidenceScore: number;
    explanationText: string;
    featureWeights: any;
    aiReportId: string;
  }) {
    return prisma.explainabilityLog.create({
      data: {
        aiModelVersion: data.aiModelVersion,
        predictionType: data.predictionType,
        confidenceScore: data.confidenceScore,
        explanationText: data.explanationText,
        featureWeights: data.featureWeights ? JSON.stringify(data.featureWeights) : null,
        aiReportId: data.aiReportId,
      },
    });
  }

  static async createAudioRecord(data: { studentId: string; durationMs: number; localFilePath: string }) {
    return prisma.audioRecord.create({
      data,
    });
  }

  static async findStudentById(studentId: string) {
    return prisma.studentProfile.findUnique({
      where: { id: studentId },
    });
  }
}

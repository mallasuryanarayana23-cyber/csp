import { prisma } from '../database/prisma';

export class StudentRepository {
  static async findAll() {
    return prisma.studentProfile.findMany({
      include: { user: true },
    });
  }

  static async findById(id: string) {
    return prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        aiReports: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
  }

  static async findSchoolByName(name: string) {
    return prisma.school.findUnique({
      where: { name },
    });
  }

  static async upsertSchool(name: string) {
    return prisma.school.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  static async findFirstSchool() {
    return prisma.school.findFirst();
  }

  static async createSchool(name: string) {
    return prisma.school.create({
      data: { name },
    });
  }

  static async createTelemetry(data: {
    studentId: string;
    gazeVectorsX: string;
    gazeVectorsY: string;
    blinkIntervals: string;
    keyDwellTimes: string;
    keyFlightTimes: string;
  }) {
    return prisma.telemetrySession.create({
      data,
    });
  }

  static async createTestResult(data: {
    studentId: string;
    testId: string;
    wpm: number;
    accuracy: number;
    hesitationMs: number;
    distractionCount: number;
    speechScore: number;
  }) {
    return prisma.testResult.create({
      data,
    });
  }
}

import { prisma } from '../database/prisma';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true },
    });
  }

  static async create(data: { email: string; name: string; passwordHash: string; role: string; schoolId?: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        ...(data.role === 'STUDENT' && data.schoolId
          ? {
              studentProfile: {
                create: {
                  grade: 'Ungraded',
                  schoolId: data.schoolId,
                },
              },
            }
          : {}),
      },
      include: { studentProfile: true },
    });
  }

  static async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

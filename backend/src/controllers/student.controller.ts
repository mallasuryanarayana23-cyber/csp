import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { StudentRepository } from '../repositories/student.repository';
import { ReportRepository } from '../repositories/report.repository';
import { prisma } from '../database/prisma';

export class StudentController {
  static async getStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const students = await StudentRepository.findAll();
      return res.json(students);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
  }

  static async getStudentById(req: AuthenticatedRequest, res: Response) {
    try {
      const student = await StudentRepository.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json(student);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch student' });
    }
  }

  static async updateReportNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { notes } = req.body;
      const report = await ReportRepository.updateNotes(req.params.reportId, notes);
      return res.json(report);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update notes' });
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const user = req.user!;

      // RBAC and Ownership Checks
      if (user.role === 'STUDENT') {
        if (user.studentProfileId !== studentId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      } else if (user.role === 'PARENT') {
        const student = await ReportRepository.findStudentById(studentId);
        if (!student || student.parentId !== user.userId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      } else if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const reports = await ReportRepository.findByStudentId(studentId);
      return res.json(reports);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not fetch reports' });
    }
  }

  // 1. GET /api/reading-tests
  static async getReadingTests(req: AuthenticatedRequest, res: Response) {
    try {
      const tests = await prisma.readingTest.findMany();
      return res.json(tests);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch reading tests' });
    }
  }

  // 2. POST /api/students/:id/assign-test
  static async assignTest(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.params.id;
      const { testId } = req.body;

      if (!testId) {
        return res.status(400).json({ error: 'testId is required' });
      }

      // Fetch student profile and associated user
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { user: true },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Fetch test
      const test = await prisma.readingTest.findUnique({
        where: { id: testId },
      });

      if (!test) {
        return res.status(404).json({ error: 'Reading test not found' });
      }

      // Assign the test by creating a notification for the student
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: 'New Test Assigned',
          message: `Your educator assigned the screening test: "${test.title}" (${test.difficulty} difficulty).`,
          type: 'warning',
        },
      });

      // Log the assignment event
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          event: `Assigned test "${test.title}" to student: ${student.user.name}`,
        },
      });

      return res.json({
        success: true,
        message: `Successfully assigned test "${test.title}" to ${student.user.name}`,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to assign test to student roster' });
    }
  }

  // 3. POST /api/parent/link-child
  static async linkChild(req: AuthenticatedRequest, res: Response) {
    try {
      const parentId = req.user!.userId;
      const { childEmail } = req.body;

      if (req.user!.role !== 'PARENT') {
        return res.status(403).json({ error: 'Only parents can link to student profiles' });
      }

      if (!childEmail) {
        return res.status(400).json({ error: 'childEmail is required' });
      }

      // Find student user
      const childUser = await prisma.user.findFirst({
        where: { email: childEmail, role: 'STUDENT' },
        include: { studentProfile: true },
      });

      if (!childUser || !childUser.studentProfile) {
        return res.status(404).json({ error: 'No student found with that email address' });
      }

      // Link child profile to parent
      const updatedProfile = await prisma.studentProfile.update({
        where: { id: childUser.studentProfile.id },
        data: { parentId },
      });

      // Find parent name
      const parentUser = await prisma.user.findUnique({
        where: { id: parentId },
      });
      const parentName = parentUser?.name || 'Helen Sterling';

      // Notify the child
      await prisma.notification.create({
        data: {
          userId: childUser.id,
          title: 'Parent Connected',
          message: `Your account has been successfully linked to parent: ${parentName}.`,
          type: 'success',
        },
      });

      return res.json({
        success: true,
        message: `Successfully linked child ${childUser.name} to parent account.`,
        studentProfile: updatedProfile,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to link child profile' });
    }
  }
}

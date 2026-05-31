import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../database/prisma';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UserRepository.findAll();
      return res.json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      await UserRepository.delete(req.params.id);
      return res.json({ message: 'User deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return res.json(logs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve audit trail' });
    }
  }
}

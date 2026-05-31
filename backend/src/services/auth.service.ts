import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { StudentRepository } from '../repositories/student.repository';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: any): string {
    const payload = {
      userId: user.id,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' }); // 1 day access token
  }

  static generateRefreshToken(user: any): string {
    const payload = {
      userId: user.id,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' }); // 30 day refresh token
  }

  static async register(data: { name: string; email: string; passwordHash: string; role: string; schoolName?: string }) {
    let schoolId: string | undefined;

    if (data.schoolName) {
      const school = await StudentRepository.upsertSchool(data.schoolName);
      schoolId = school.id;
    } else {
      const firstSchool = await StudentRepository.findFirstSchool();
      if (firstSchool) {
        schoolId = firstSchool.id;
      } else {
        const defaultSchool = await StudentRepository.createSchool('Default Academy');
        schoolId = defaultSchool.id;
      }
    }

    const user = await UserRepository.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
      schoolId,
    });

    const token = this.generateToken(user);
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }

  static async login(email: string, passwordHash: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await this.comparePassword(passwordHash, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.generateToken(user);
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
}

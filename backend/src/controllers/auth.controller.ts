import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const parseCookies = (cookieHeader: string | undefined) => {
  const list: { [key: string]: string } = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURI(parts.join('='));
  });
  return list;
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, schoolName } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one uppercase letter and one numeric digit' });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const result = await AuthService.register({
        name,
        email,
        passwordHash,
        role,
        schoolName,
      });

      // Generate refresh token and set as httpOnly cookie
      const userObj = await UserRepository.findByEmail(email);
      if (userObj) {
        const refreshToken = AuthService.generateRefreshToken(userObj);
        res.cookie('neurolearn_refresh', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }

      return res.status(201).json(result);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('already exists')) {
        return res.status(400).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
      }

      const result = await AuthService.login(email, password);

      // Generate refresh token and set as httpOnly cookie
      const userObj = await UserRepository.findByEmail(email);
      if (userObj) {
        const refreshToken = AuthService.generateRefreshToken(userObj);
        res.cookie('neurolearn_refresh', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }

      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Invalid credentials')) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies['neurolearn_refresh'];

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token missing' });
      }

      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as any;
      const user = await UserRepository.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const accessToken = AuthService.generateToken(user);
      return res.json({
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }
}

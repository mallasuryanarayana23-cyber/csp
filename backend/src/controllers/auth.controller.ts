import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, schoolName } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const result = await AuthService.register({
        name,
        email,
        passwordHash,
        role,
        schoolName,
      });

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
      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Invalid credentials')) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      return res.status(500).json({ error: 'Login failed' });
    }
  }
}

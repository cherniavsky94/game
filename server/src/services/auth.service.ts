import { verifyToken } from '../utils/supabase';
import { userRepo } from '../repositories/user.repo';
import { ValidationError } from '../types/errors';

class AuthService {
  async verifyAndGetUser(token: string) {
    if (!token) throw new ValidationError('No token provided');
    const user = await verifyToken(token);
    if (!user) throw new ValidationError('Invalid token');

    // ensure minimal user exists in DB
    await userRepo.upsertMinimal({ id: user.id, email: user.email, username: user.email?.split('@')[0] });

    return user;
  }
}

export const authService = new AuthService();

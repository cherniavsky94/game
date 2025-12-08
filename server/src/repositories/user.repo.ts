import prisma from '../utils/prisma';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async upsertMinimal(user: { id: string; email?: string; username?: string }) {
    return prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@local`,
        username: user.username ?? `user_${user.id.slice(0, 8)}`,
      },
    });
  }
}

export const userRepo = new UserRepository();

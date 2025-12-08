import prisma from '../utils/prisma';
import { CharacterClass } from 'shared';

export class CharacterRepository {
  async findByUserId(userId: string) {
    return prisma.character.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async countByUserId(userId: string) {
    return prisma.character.count({ where: { userId } });
  }

  async findById(id: string) {
    return prisma.character.findUnique({ where: { id } });
  }

  async findByNameForUser(userId: string, name: string) {
    return prisma.character.findFirst({ where: { userId, name } });
  }

  async create(data: {
    userId: string;
    name: string;
    class: CharacterClass;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
  }) {
    return prisma.character.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.character.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.character.delete({ where: { id } });
  }
}

export const characterRepo = new CharacterRepository();

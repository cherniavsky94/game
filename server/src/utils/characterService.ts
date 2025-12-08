import prisma from './prisma';
import { CharacterClass, CHARACTER_CLASSES, GAME_CONFIG } from 'shared';

export class CharacterService {
  async getCharactersByUserId(userId: string) {
    return await prisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCharacter(userId: string, name: string, characterClass: CharacterClass) {
    // Ensure user exists in DB to satisfy foreign key constraint.
    // If real user data (email/username) is available earlier in the request,
    // it's better to create/upsert the user there. This is a safe dev-friendly fallback.
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: `${userId}@local`,
          username: `user_${userId.slice(0, 8)}`,
        },
      });
    } catch (e) {
      // If upsert fails for some reason, log and continue — creation will fail with FK if user truly absent.
      console.warn('User upsert failed:', e);
    }
    // Check character limit
    const existingCount = await prisma.character.count({
      where: { userId },
    });

    if (existingCount >= GAME_CONFIG.MAX_CHARACTERS_PER_USER) {
      throw new Error(`Maximum ${GAME_CONFIG.MAX_CHARACTERS_PER_USER} characters allowed`);
    }

    // Check name uniqueness for this user
    const existingName = await prisma.character.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingName) {
      throw new Error('Character name already exists');
    }

    // Get class stats
    const classData = CHARACTER_CLASSES[characterClass];

    // Create character
    return await prisma.character.create({
      data: {
        userId,
        name,
        class: characterClass,
        health: classData.baseHealth,
        maxHealth: classData.baseHealth,
        mana: classData.baseMana,
        maxMana: classData.baseMana,
      },
    });
  }

  async getCharacterById(characterId: string) {
    return await prisma.character.findUnique({
      where: { id: characterId },
    });
  }

  async updateCharacter(characterId: string, data: any) {
    return await prisma.character.update({
      where: { id: characterId },
      data,
    });
  }

  async deleteCharacter(characterId: string) {
    return await prisma.character.delete({
      where: { id: characterId },
    });
  }
}

export const characterService = new CharacterService();

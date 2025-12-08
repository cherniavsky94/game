import { characterRepo } from '../repositories/character.repo';
import { userRepo } from '../repositories/user.repo';
import { CHARACTER_CLASSES, GAME_CONFIG } from 'shared';
import { ValidationError, ConflictError, TooManyError, NotFoundError } from '../types/errors';

class CharacterService {
  async listByUser(userId: string) {
    return characterRepo.findByUserId(userId);
  }

  async create(userId: string, name: string, characterClass: string) {
    // validation
    if (!name || typeof name !== 'string') throw new ValidationError('Name is required');
    if (name.length < 3 || name.length > 16) throw new ValidationError('Name must be 3-16 characters');
    if (!characterClass || !(characterClass in CHARACTER_CLASSES)) throw new ValidationError('Invalid class');

    // ensure user exists (dev-friendly upsert)
    await userRepo.upsertMinimal({ id: userId });

    // enforce limit
    const count = await characterRepo.countByUserId(userId);
    if (count >= GAME_CONFIG.MAX_CHARACTERS_PER_USER) {
      throw new TooManyError(`Maximum ${GAME_CONFIG.MAX_CHARACTERS_PER_USER} characters allowed`);
    }

    // uniqueness
    const existing = await characterRepo.findByNameForUser(userId, name);
    if (existing) throw new ConflictError('Character name already exists');

    const classData = CHARACTER_CLASSES[characterClass as any];

    return characterRepo.create({
      userId,
      name,
      class: characterClass as any,
      health: classData.baseHealth,
      maxHealth: classData.baseHealth,
      mana: classData.baseMana,
      maxMana: classData.baseMana,
    });
  }

  async getById(id: string) {
    const c = await characterRepo.findById(id);
    if (!c) throw new NotFoundError('Character not found');
    return c;
  }

  async remove(id: string) {
    return characterRepo.delete(id);
  }
}

export const characterServiceNew = new CharacterService();

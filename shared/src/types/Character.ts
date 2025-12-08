import { CharacterClass } from './enums';

export interface CharacterType {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  x: number;
  y: number;
  createdAt: string | Date;
}

export interface CreateCharacterRequest {
  name: string;
  class: CharacterClass;
}

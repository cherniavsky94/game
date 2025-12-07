export interface GameState {
  players: Map<string, PlayerState>;
  serverTime: number;
}

export interface PlayerState {
  id: string;
  username: string;
  x: number;
  y: number;
  health: number;
  level: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface IsometricPosition {
  row: number;
  col: number;
}

export interface PlayerInput {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  rarity: Rarity;
  value: number;
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  CONSUMABLE = 'CONSUMABLE',
  QUEST = 'QUEST',
  MATERIAL = 'MATERIAL',
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export enum CharacterClass {
  ASSASSIN = 'ASSASSIN',
  AMAZON = 'AMAZON',
  BARBARIAN = 'BARBARIAN',
  GUARDIAN = 'GUARDIAN',
  WITCH = 'WITCH',
  SORCERESS = 'SORCERESS',
  MAGE = 'MAGE',
  DRUID = 'DRUID',
}

export interface CharacterData {
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
  createdAt: Date;
}

export interface CreateCharacterRequest {
  name: string;
  class: CharacterClass;
}

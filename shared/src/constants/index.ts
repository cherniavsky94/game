export const GAME_CONFIG = {
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  WORLD_WIDTH: 1280,
  WORLD_HEIGHT: 720,
  MAX_PLAYERS: 50,
  TICK_RATE: 60,
  MAX_CHARACTERS_PER_USER: 10,
} as const;

export const PLAYER_CONFIG = {
  MOVE_SPEED: 5,
  STARTING_HEALTH: 100,
  STARTING_MANA: 50,
  STARTING_LEVEL: 1,
} as const;

export const NETWORK_CONFIG = {
  CLIENT_PORT: 3000,
  SERVER_PORT: 2567,
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 1000,
} as const;

export const COLORS = {
  RARITY: {
    COMMON: 0xffffff,
    UNCOMMON: 0x1eff00,
    RARE: 0x0070dd,
    EPIC: 0xa335ee,
    LEGENDARY: 0xff8000,
  },
} as const;

export const CHARACTER_CLASSES = {
  ASSASSIN: {
    name: 'Ассасин',
    description: 'Мастер скрытности и быстрых атак',
    baseHealth: 80,
    baseMana: 60,
    color: 0x8b0000,
  },
  AMAZON: {
    name: 'Амазонка',
    description: 'Искусная лучница с высокой ловкостью',
    baseHealth: 90,
    baseMana: 50,
    color: 0x228b22,
  },
  BARBARIAN: {
    name: 'Варвар',
    description: 'Могучий воин ближнего боя',
    baseHealth: 150,
    baseMana: 30,
    color: 0xb8860b,
  },
  GUARDIAN: {
    name: 'Страж',
    description: 'Защитник с высокой броней',
    baseHealth: 140,
    baseMana: 40,
    color: 0x4682b4,
  },
  WITCH: {
    name: 'Ведьма',
    description: 'Темная магия и проклятия',
    baseHealth: 70,
    baseMana: 120,
    color: 0x9370db,
  },
  SORCERESS: {
    name: 'Чародейка',
    description: 'Мастер стихийной магии',
    baseHealth: 60,
    baseMana: 140,
    color: 0xff69b4,
  },
  MAGE: {
    name: 'Маг',
    description: 'Владеет мощной боевой магией',
    baseHealth: 65,
    baseMana: 130,
    color: 0x4169e1,
  },
  DRUID: {
    name: 'Дриада',
    description: 'Повелитель природы и превращений',
    baseHealth: 100,
    baseMana: 100,
    color: 0x32cd32,
  },
} as const;

export * from './rooms';

export const MAP_WIDTH = 1280;
export const MAP_HEIGHT = 720;
export const TILE_SIZE = 64;

export const PLAYER_SPEED = 200;
export const PLAYER_DASH_SPEED = 500;
export const PLAYER_DASH_DURATION = 200;
export const PLAYER_DASH_COOLDOWN = 1000;
export const PLAYER_STUN_DURATION = 1000;
export const PLAYER_MAX_HEALTH = 3;

export const CHOP_TIME = 2;
export const COOK_TIME = 3;
export const SAUCE_TIME = 2;
export const BURN_TIME = 5;

export const COMBO_MULTIPLIER = 0.1;
export const MAX_COMBO_MULTIPLIER = 2.0;
export const WRONG_ORDER_PENALTY = 50;
export const BURN_PENALTY = 30;
export const TRAP_DAMAGE_PENALTY = 20;

export const MAX_ACTIVE_ORDERS = 3;
export const ORDER_SPAWN_INTERVAL = 10;
export const GAME_DURATION = 180;

export const INGREDIENT_TYPES = {
  RAW_MEAT: 'raw_meat',
  RAW_VEGGIE: 'raw_veggie',
  RAW_BREAD: 'raw_bread',
  RAW_TOMATO: 'raw_tomato',
  RAW_CHEESE: 'raw_cheese'
};

export const INGREDIENT_STATES = {
  RAW: 'raw',
  SLICED: 'sliced',
  COOKED: 'cooked',
  SAUCED: 'sauced',
  PLATED: 'plated',
  BURNT: 'burnt'
};

export const WORKSTATION_TYPES = {
  CHOP: 'chop',
  COOK: 'cook',
  SAUCE: 'sauce',
  PLATE: 'plate',
  SERVE: 'serve',
  STORAGE: 'storage'
};

export const INGREDIENT_DISPLAY = {
  raw_meat: { emoji: '🥩', name: '生肉' },
  raw_veggie: { emoji: '🥕', name: '蔬菜' },
  raw_bread: { emoji: '🍞', name: '面包' },
  raw_tomato: { emoji: '🍅', name: '番茄' },
  raw_cheese: { emoji: '🧀', name: '奶酪' },
  sliced_veggie: { emoji: '🥗', name: '切好的菜' },
  sliced_bread: { emoji: '🍞', name: '切片面包' },
  sliced_tomato: { emoji: '🍅', name: '切好的番茄' },
  sliced_cheese: { emoji: '🧀', name: '奶酪片' },
  cooked_meat: { emoji: '🍖', name: '烤肉' },
  sauced_tomato: { emoji: '🍅', name: '番茄酱' },
  burnt: { emoji: '💀', name: '烧焦' }
};

export const DISH_RECIPES = [
  {
    id: 'classic_meat',
    name: '经典烤肉',
    emoji: '🍽️',
    required: ['cooked_meat', 'sliced_veggie'],
    baseScore: 100,
    timeLimit: 45
  },
  {
    id: 'cheese_sandwich',
    name: '芝士三明治',
    emoji: '🥪',
    required: ['sliced_bread', 'sliced_cheese', 'sauced_tomato'],
    baseScore: 150,
    timeLimit: 60
  },
  {
    id: 'feast',
    name: '豪华盛宴',
    emoji: '🎂',
    required: ['cooked_meat', 'sliced_veggie', 'sliced_cheese'],
    baseScore: 200,
    timeLimit: 75
  },
  {
    id: 'simple_salad',
    name: '田园沙拉',
    emoji: '🥗',
    required: ['sliced_veggie', 'sauced_tomato'],
    baseScore: 80,
    timeLimit: 40
  },
  {
    id: 'meat_plate',
    name: '烤肉大拼盘',
    emoji: '🥩',
    required: ['cooked_meat', 'cooked_meat', 'sliced_bread'],
    baseScore: 180,
    timeLimit: 70
  }
];

export const TRAP_TYPES = {
  SPIKE: 'spike',
  MOVING_PLATFORM: 'platform',
  ROTATING: 'rotating',
  TELEPORT: 'teleport'
};

export const COLORS = {
  BROWN_DARK: 0x3d2817,
  BROWN: 0x5c3d2e,
  GOLD: 0xd4a843,
  GOLD_LIGHT: 0xf0c75e,
  RED_DARK: 0x8b2500,
  RED: 0xe63946,
  ORANGE: 0xff7b29,
  TEAL: 0x4ecdc4,
  BEIGE: 0xf5deb3,
  STONE: 0x6b5b4f,
  STONE_LIGHT: 0x8b7d6b,
  WOOD: 0x8b5a2b,
  WOOD_LIGHT: 0xa0522d
};

import { uid, randomChoice, randomInt } from '../utils/helpers.js';
import { DISH_RECIPES, INGREDIENT_DISPLAY, GUEST_TYPES, GUEST_CONFIG } from '../utils/constants.js';

export class Order {
  constructor(config = {}) {
    const recipe = config.recipe || randomChoice(DISH_RECIPES);
    this.id = uid('order');
    this.recipeId = recipe.id;
    this.name = recipe.name;
    this.emoji = recipe.emoji;
    this.required = [...recipe.required];
    this.baseScore = recipe.baseScore;
    this.targetTable = config.targetTable || randomInt(1, 4);
    this.completed = false;
    this.failed = false;
    this.delivered = [];

    this.guestType = config.guestType || randomChoice(Object.values(GUEST_TYPES));
    const guestConfig = GUEST_CONFIG[this.guestType];
    this.guestConfig = guestConfig;
    this.guestName = guestConfig.name;
    this.guestEmoji = guestConfig.emoji;

    this.timeLimit = config.timeLimit || Math.round(recipe.timeLimit * guestConfig.patienceMultiplier);
    this.timeLeft = this.timeLimit;

    this.scoreMultiplier = guestConfig.baseScoreMultiplier;
    this.tipMultiplier = guestConfig.tipMultiplier;
    this.comboBonus = guestConfig.comboBonus;
    this.chainEffect = guestConfig.chainEffect;
    this.priority = guestConfig.priority;
  }

  update(delta, speedModifier = 1) {
    if (this.completed || this.failed) return;
    this.timeLeft -= (delta / 1000) * speedModifier;
    if (this.timeLeft <= 0) {
      this.failed = true;
      this.timeLeft = 0;
    }
  }

  calculateScore(combo, globalMultiplier = 1) {
    const timeBonus = 1 + (this.timeLeft / this.timeLimit) * 0.5;
    const comboMultiplier = 1 + Math.min(1.0, combo * 0.1 + this.comboBonus);
    const baseWithGuest = this.baseScore * this.scoreMultiplier;
    const tip = Math.round(baseWithGuest * this.tipMultiplier * 0.3);
    const total = Math.round(baseWithGuest * timeBonus * comboMultiplier * globalMultiplier) + tip;
    return { total, tip, timeBonus, comboMultiplier };
  }

  getTimePercent() {
    return Math.max(0, this.timeLeft / this.timeLimit);
  }

  isUrgent() {
    return this.getTimePercent() < 0.25;
  }

  checkDish(ingredientTypes) {
    if (ingredientTypes.length !== this.required.length) return false;
    const sorted1 = [...ingredientTypes].sort();
    const sorted2 = [...this.required].sort();
    return sorted1.every((item, index) => item === sorted2[index]);
  }

  getRequiredDisplay() {
    return this.required.map(type => {
      const info = INGREDIENT_DISPLAY[type];
      return info ? info.emoji : '❓';
    });
  }
}

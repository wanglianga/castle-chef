import { uid, randomChoice, randomInt } from '../utils/helpers.js';
import { DISH_RECIPES, INGREDIENT_DISPLAY } from '../utils/constants.js';

export class Order {
  constructor(config = {}) {
    const recipe = config.recipe || randomChoice(DISH_RECIPES);
    this.id = uid('order');
    this.recipeId = recipe.id;
    this.name = recipe.name;
    this.emoji = recipe.emoji;
    this.required = [...recipe.required];
    this.baseScore = recipe.baseScore;
    this.timeLimit = config.timeLimit || recipe.timeLimit;
    this.timeLeft = this.timeLimit;
    this.targetTable = config.targetTable || randomInt(1, 4);
    this.completed = false;
    this.failed = false;
    this.delivered = [];
  }

  update(delta) {
    if (this.completed || this.failed) return;
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.failed = true;
      this.timeLeft = 0;
    }
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

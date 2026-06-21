import {
  WORKSTATION_TYPES,
  CHOP_TIME,
  COOK_TIME,
  SAUCE_TIME,
  COLORS,
  INGREDIENT_TYPES
} from '../utils/constants.js';

export class Workstation {
  constructor(scene, x, y, type, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = config.width || 80;
    this.height = config.height || 80;
    this.ingredients = [];
    this.maxIngredients = config.maxIngredients || (type === 'plate' ? 5 : 1);
    this.originalX = x;
    this.originalY = y;
    this.moveConfig = config.move || null;
    this.moveTimer = 0;

    const styleMap = {
      storage: { bg: COLORS.STONE, border: COLORS.GOLD, label: '📦', name: '食材箱' },
      chop: { bg: COLORS.WOOD, border: COLORS.WOOD_LIGHT, label: '🔪', name: '切菜台' },
      cook: { bg: COLORS.RED_DARK, border: COLORS.ORANGE, label: '🔥', name: '烤炉' },
      sauce: { bg: 0x2d5a27, border: COLORS.TEAL, label: '🥣', name: '酱料台' },
      plate: { bg: 0x1e3a5f, border: 0x4a7ab8, label: '🍽️', name: '装盘台' },
      serve: { bg: COLORS.GOLD, border: COLORS.GOLD_LIGHT, label: '🎩', name: '送餐窗' }
    };

    const style = styleMap[type] || styleMap.storage;
    this.label = style.label;
    this.workstationName = style.name;

    this.bg = scene.add.rectangle(x, y, this.width, this.height, style.bg)
      .setStrokeStyle(4, style.border)
      .setDepth(2);

    this.labelText = scene.add.text(x, y - 6, style.label, { fontSize: '32px' })
      .setOrigin(0.5)
      .setDepth(3);

    this.nameText = scene.add.text(x, y + this.height / 2 - 8, style.name, {
      fontSize: '12px',
      color: '#f5deb3',
      fontFamily: 'Cinzel, serif',
      fontWeight: '700'
    }).setOrigin(0.5).setDepth(3);

    this.storageType = config.storageType || null;
    this.tableNumber = config.tableNumber || null;
    if (this.tableNumber !== null) {
      this.tableText = scene.add.text(x, y - this.height / 2 + 12, `桌${this.tableNumber}`, {
        fontSize: '14px',
        color: '#3d2817',
        fontFamily: 'Cinzel, serif',
        fontWeight: '900'
      }).setOrigin(0.5).setDepth(4);
    }

    this.glow = scene.add.rectangle(x, y, this.width + 10, this.height + 10, COLORS.GOLD, 0)
      .setDepth(1);

    this.speedModifier = 1;
    this.fireIntensity = 1;
  }

  update(delta) {
    if (this.moveConfig) {
      this.moveTimer += delta / 1000;
      const { axis, range, speed } = this.moveConfig;
      const offset = Math.sin(this.moveTimer * speed) * range;
      if (axis === 'x') {
        this.x = this.originalX + offset;
      } else {
        this.y = this.originalY + offset;
      }
      this.bg.setPosition(this.x, this.y);
      this.labelText.setPosition(this.x, this.y - 6);
      this.nameText.setPosition(this.x, this.y + this.height / 2 - 8);
      this.glow.setPosition(this.x, this.y);
      if (this.tableText) this.tableText.setPosition(this.x, this.y - this.height / 2 + 12);
      this.updateIngredientPositions();
    }
  }

  updateIngredientPositions() {
    for (let i = 0; i < this.ingredients.length; i++) {
      const ing = this.ingredients[i];
      const offsetX = (i - (this.ingredients.length - 1) / 2) * 30;
      ing.setPosition(this.x + offsetX, this.y - 10);
    }
  }

  isPlayerNear(player, distance = 60) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }

  setHighlight(active) {
    this.glow.setAlpha(active ? 0.4 : 0);
  }

  canAccept(ingredient) {
    if (this.ingredients.length >= this.maxIngredients) return false;

    if (this.type === 'chop') {
      return ingredient.state === 'raw' && ingredient.type !== INGREDIENT_TYPES.RAW_MEAT;
    }
    if (this.type === 'cook') {
      return ingredient.type === INGREDIENT_TYPES.RAW_MEAT && ingredient.state === 'raw';
    }
    if (this.type === 'sauce') {
      return ingredient.type === INGREDIENT_TYPES.RAW_TOMATO && ingredient.state === 'sliced';
    }
    if (this.type === 'plate' || this.type === 'serve') {
      return ingredient.state !== 'raw' || ingredient.type === INGREDIENT_TYPES.RAW_BREAD;
    }
    return false;
  }

  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
    ingredient.onWorkstation = this;
    this.updateIngredientPositions();

    if (this.type === 'chop') {
      ingredient.startProcessing('chop');
    } else if (this.type === 'cook') {
      ingredient.startProcessing('cook');
    } else if (this.type === 'sauce') {
      ingredient.startProcessing('sauce');
    }
  }

  removeIngredient(ingredient) {
    const idx = this.ingredients.indexOf(ingredient);
    if (idx >= 0) {
      this.ingredients.splice(idx, 1);
      ingredient.onWorkstation = null;
      ingredient.cancelProcessing();
      this.updateIngredientPositions();
      return true;
    }
    return false;
  }

  processIngredients(delta) {
    for (const ing of this.ingredients) {
      if (ing.processingType) {
        let processTime;
        if (this.type === 'chop') processTime = CHOP_TIME;
        else if (this.type === 'cook') processTime = COOK_TIME;
        else if (this.type === 'sauce') processTime = SAUCE_TIME;

        let effectiveDelta = delta / 1000;
        effectiveDelta *= this.speedModifier;

        if (this.type === 'cook') {
          effectiveDelta *= this.fireIntensity;
        }

        const result = ing.updateProcessing(effectiveDelta, processTime);
        if (result.done) {
          if (result.burnt) {
            ing.finishProcessing();
          } else if (this.type !== 'cook') {
            ing.finishProcessing();
          }
        }
      }
    }
  }

  setSpeedModifier(modifier) {
    this.speedModifier = Math.max(0.5, Math.min(2.0, modifier));
  }

  setFireIntensity(intensity) {
    this.fireIntensity = Math.max(0.3, Math.min(1.8, intensity));
  }

  getProcessedTypes() {
    return this.ingredients
      .filter(i => !i.processingType)
      .map(i => i.getEffectiveType());
  }

  clearIngredients() {
    this.ingredients = [];
    this.updateIngredientPositions();
  }

  destroy() {
    this.bg.destroy();
    this.labelText.destroy();
    this.nameText.destroy();
    this.glow.destroy();
    if (this.tableText) this.tableText.destroy();
  }
}

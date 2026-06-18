import Phaser from 'phaser';
import { uid } from '../utils/helpers.js';
import { INGREDIENT_DISPLAY } from '../utils/constants.js';

export class Ingredient {
  constructor(scene, x, y, type, state = 'raw') {
    this.scene = scene;
    this.id = uid('ing');
    this.type = type;
    this.state = state;
    this.isHeld = false;
    this.isBurning = false;
    this.processProgress = 0;
    this.processingType = null;
    this.onWorkstation = null;
    this.x = x;
    this.y = y;

    const display = this.getDisplayInfo();
    this.sprite = scene.add.text(x, y, display.emoji, {
      fontSize: '32px'
    }).setOrigin(0.5).setDepth(5);

    this.progressBar = scene.add.rectangle(x, y - 28, 36, 5, 0x000000, 0.6).setDepth(6).setVisible(false);
    this.progressFill = scene.add.rectangle(x - 17, y - 28, 0, 5, 0xf0c75e).setOrigin(0, 0.5).setDepth(7).setVisible(false);
  }

  getDisplayInfo() {
    const key = this.state === 'raw' ? this.type : `${this.state}_${this.type.replace('raw_', '')}`;
    if (this.state === 'burnt') return INGREDIENT_DISPLAY.burnt;
    const info = INGREDIENT_DISPLAY[key];
    if (info) return info;
    return INGREDIENT_DISPLAY[this.type] || { emoji: '❓', name: '未知' };
  }

  updateDisplay() {
    const display = this.getDisplayInfo();
    this.sprite.setText(display.emoji);
  }

  getEffectiveType() {
    if (this.state === 'raw') return this.type;
    if (this.state === 'burnt') return 'burnt';
    return `${this.state}_${this.type.replace('raw_', '')}`;
  }

  startProcessing(type) {
    this.processingType = type;
    this.processProgress = 0;
    this.progressBar.setVisible(true);
    this.progressFill.setVisible(true);
  }

  updateProcessing(delta, totalTime) {
    if (!this.processingType) return false;
    this.processProgress += delta / totalTime;

    this.progressFill.width = Math.min(34, this.processProgress * 34);
    if (this.processingType === 'cook' && this.processProgress > 1) {
      const burnProgress = (this.processProgress - 1) * (totalTime / 5);
      this.progressFill.fillColor = burnProgress > 0.5 ? 0xe63946 : 0xff7b29;
    }

    if (this.processProgress >= 1) {
      return true;
    }
    return false;
  }

  finishProcessing() {
    if (this.processingType === 'chop') {
      this.state = 'sliced';
    } else if (this.processingType === 'cook') {
      if (this.processProgress >= 1 + (5 / 3)) {
        this.state = 'burnt';
      } else {
        this.state = 'cooked';
      }
    } else if (this.processingType === 'sauce') {
      this.state = 'sauced';
    }
    this.processingType = null;
    this.processProgress = 0;
    this.progressBar.setVisible(false);
    this.progressFill.setVisible(false);
    this.progressFill.width = 0;
    this.progressFill.fillColor = 0xf0c75e;
    this.updateDisplay();
  }

  cancelProcessing() {
    this.processingType = null;
    this.processProgress = 0;
    this.progressBar.setVisible(false);
    this.progressFill.setVisible(false);
    this.progressFill.width = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.setPosition(x, y);
    this.progressBar.setPosition(x, y - 28);
    this.progressFill.setPosition(x - 17, y - 28);
  }

  destroy() {
    this.sprite.destroy();
    this.progressBar.destroy();
    this.progressFill.destroy();
  }
}

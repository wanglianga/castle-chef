import { formatTime } from '../utils/helpers.js';

export class HUD {
  constructor(scene, container) {
    this.scene = scene;
    this.container = container;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud-top';
    this.hudEl.innerHTML = `
      <div class="hud-item">
        <span class="label">时间</span>
        <span class="value" id="hud-time">3:00</span>
      </div>
      <div class="hud-item combo" id="hud-combo-box">
        <span class="label">连击</span>
        <span class="value" id="hud-combo">0</span>
      </div>
      <div class="hud-item">
        <span class="label">分数</span>
        <span class="value gold" id="hud-score">0</span>
      </div>
      <div class="hud-item">
        <span class="label">生命</span>
        <span class="health-hearts" id="hud-health">❤️❤️❤️</span>
      </div>
    `;
    container.appendChild(this.hudEl);

    this.timeEl = this.hudEl.querySelector('#hud-time');
    this.scoreEl = this.hudEl.querySelector('#hud-score');
    this.comboEl = this.hudEl.querySelector('#hud-combo');
    this.comboBoxEl = this.hudEl.querySelector('#hud-combo-box');
    this.healthEl = this.hudEl.querySelector('#hud-health');

    this.inventoryEl = document.createElement('div');
    this.inventoryEl.className = 'inventory-bar';
    this.inventoryEl.innerHTML = `
      <span class="inventory-label">手持</span>
      <div class="inventory-slot" id="inv-slot-1"></div>
      <div class="inventory-slot" id="inv-slot-2"></div>
    `;
    container.appendChild(this.inventoryEl);

    this.invSlot1 = this.inventoryEl.querySelector('#inv-slot-1');
    this.invSlot2 = this.inventoryEl.querySelector('#inv-slot-2');

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'hint-text';
    this.hintEl.id = 'hint-text';
    container.appendChild(this.hintEl);
  }

  updateTime(timeLeft) {
    this.timeEl.textContent = formatTime(timeLeft);
    this.timeEl.classList.toggle('danger', timeLeft < 30);
  }

  updateScore(score) {
    this.scoreEl.textContent = score;
    this.scoreEl.style.transform = 'scale(1.3)';
    setTimeout(() => { this.scoreEl.style.transform = 'scale(1)'; }, 150);
  }

  updateCombo(combo) {
    this.comboEl.textContent = combo;
    this.comboBoxEl.classList.toggle('active', combo >= 3);
  }

  updateHealth(health, maxHealth) {
    let hearts = '';
    for (let i = 0; i < maxHealth; i++) {
      hearts += i < health ? '❤️' : '🖤';
    }
    this.healthEl.textContent = hearts;
  }

  updateInventory(inventory) {
    if (inventory[0]) {
      this.invSlot1.textContent = inventory[0].getDisplayInfo().emoji;
      this.invSlot1.classList.add('filled');
    } else {
      this.invSlot1.textContent = '';
      this.invSlot1.classList.remove('filled');
    }
    if (inventory[1]) {
      this.invSlot2.textContent = inventory[1].getDisplayInfo().emoji;
      this.invSlot2.classList.add('filled');
    } else {
      this.invSlot2.textContent = '';
      this.invSlot2.classList.remove('filled');
    }
  }

  showHint(text) {
    this.hintEl.textContent = text;
    this.hintEl.classList.add('visible');
  }

  hideHint() {
    this.hintEl.classList.remove('visible');
  }

  destroy() {
    this.hudEl.remove();
    this.inventoryEl.remove();
    this.hintEl.remove();
  }
}

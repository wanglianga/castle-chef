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
      <div class="inventory-slot" id="inv-slot-3"></div>
    `;
    container.appendChild(this.inventoryEl);

    this.invSlot1 = this.inventoryEl.querySelector('#inv-slot-1');
    this.invSlot2 = this.inventoryEl.querySelector('#inv-slot-2');
    this.invSlot3 = this.inventoryEl.querySelector('#inv-slot-3');

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'hint-text';
    this.hintEl.id = 'hint-text';
    container.appendChild(this.hintEl);

    this.chainEffectsEl = document.createElement('div');
    this.chainEffectsEl.className = 'chain-effects';
    this.chainEffectsEl.id = 'chain-effects';
    container.appendChild(this.chainEffectsEl);

    this.speedBoostEl = document.createElement('div');
    this.speedBoostEl.className = 'speed-boost-indicator';
    this.speedBoostEl.id = 'speed-boost';
    container.appendChild(this.speedBoostEl);
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
    const slots = [this.invSlot1, this.invSlot2, this.invSlot3];
    for (let i = 0; i < slots.length; i++) {
      if (inventory[i]) {
        slots[i].textContent = inventory[i].getDisplayInfo().emoji;
        slots[i].classList.add('filled');
      } else {
        slots[i].textContent = '';
        slots[i].classList.remove('filled');
      }
    }
  }

  showHint(text) {
    this.hintEl.textContent = text;
    this.hintEl.classList.add('visible');
  }

  hideHint() {
    this.hintEl.classList.remove('visible');
  }

  updateChainEffects(activeEffects) {
    if (!activeEffects || activeEffects.length === 0) {
      this.chainEffectsEl.innerHTML = '';
      this.chainEffectsEl.classList.remove('visible');
      return;
    }

    this.chainEffectsEl.classList.add('visible');
    this.chainEffectsEl.innerHTML = activeEffects.map(effect => `
      <div class="chain-effect" title="${effect.description}">
        <span class="chain-effect-name">${effect.name}</span>
        <span class="chain-effect-time">${Math.ceil(effect.timeLeft)}s</span>
      </div>
    `).join('');
  }

  updateSpeedBoost(stacks, percent) {
    if (stacks <= 0) {
      this.speedBoostEl.innerHTML = '';
      this.speedBoostEl.classList.remove('visible');
      return;
    }

    this.speedBoostEl.classList.add('visible');
    const stars = '⚡'.repeat(stacks);
    this.speedBoostEl.innerHTML = `
      <span class="speed-boost-icon">${stars}</span>
      <span class="speed-boost-text">加速 +${Math.round(percent)}%</span>
    `;
  }

  destroy() {
    this.hudEl.remove();
    this.inventoryEl.remove();
    this.hintEl.remove();
    this.chainEffectsEl.remove();
    this.speedBoostEl.remove();
  }
}

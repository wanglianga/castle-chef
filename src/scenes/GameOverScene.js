import Phaser from 'phaser';
import { getHighScore, setHighScore } from '../utils/helpers.js';
import { COLORS, MAP_WIDTH, MAP_HEIGHT } from '../utils/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.maxCombo = data.maxCombo || 0;
    this.ordersCompleted = data.ordersCompleted || 0;
    this.ordersFailed = data.ordersFailed || 0;
    this.trapDodgeCount = data.trapDodgeCount || 0;
  }

  create() {
    const isNewRecord = setHighScore(this.finalScore);
    const highScore = getHighScore();
    const totalOrders = this.ordersCompleted + this.ordersFailed;
    const completionRate = totalOrders > 0 ? Math.round((this.ordersCompleted / totalOrders) * 100) : 0;

    let stars = 1;
    if (this.finalScore >= 1500) stars = 2;
    if (this.finalScore >= 3000) stars = 3;

    this.cameras.main.fadeIn(800);

    const container = document.getElementById('game-container');

    this.screenEl = document.createElement('div');
    this.screenEl.className = 'gameover-screen visible';
    this.screenEl.innerHTML = `
      <div class="gameover-title">${this.finalScore >= 1500 ? '🏆 宴会成功!' : '⏰ 时间到!'}</div>
      <div class="gameover-score">${this.finalScore}</div>
      ${isNewRecord ? '<div class="gameover-new-record">✨ 新纪录! ✨</div>' : ''}
      <div class="gameover-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div class="gameover-stats">
        <div class="gameover-stat">
          <div class="gameover-stat-label">最高连击</div>
          <div class="gameover-stat-value">${this.maxCombo}</div>
        </div>
        <div class="gameover-stat">
          <div class="gameover-stat-label">完成订单</div>
          <div class="gameover-stat-value">${this.ordersCompleted}</div>
        </div>
        <div class="gameover-stat">
          <div class="gameover-stat-label">机关躲避</div>
          <div class="gameover-stat-value">${this.trapDodgeCount}</div>
        </div>
        <div class="gameover-stat">
          <div class="gameover-stat-label">成功率</div>
          <div class="gameover-stat-value">${completionRate}%</div>
        </div>
      </div>
      <div class="gameover-stat">
        <div class="gameover-stat-label">历史最高</div>
        <div class="gameover-stat-value" style="color: #f0c75e;">${highScore}</div>
      </div>
      <div style="margin-top: 24px; display: flex; gap: 16px;">
        <button class="menu-btn" id="retry-btn">再来一局</button>
        <button class="menu-btn" id="menu-btn">返回主菜单</button>
      </div>
    `;
    container.appendChild(this.screenEl);

    document.getElementById('retry-btn').addEventListener('click', () => {
      this.goToGame();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      this.goToMenu();
    });

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.goToGame();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.goToMenu();
    }
  }

  goToGame() {
    if (this.switching) return;
    this.switching = true;
    this.cameras.main.fadeOut(400, 0, 0, 0, (_, progress) => {
      if (progress >= 1) {
        this.screenEl.remove();
        this.scene.start('GameScene');
      }
    });
  }

  goToMenu() {
    if (this.switching) return;
    this.switching = true;
    this.cameras.main.fadeOut(400, 0, 0, 0, (_, progress) => {
      if (progress >= 1) {
        this.screenEl.remove();
        this.scene.start('MenuScene');
      }
    });
  }
}

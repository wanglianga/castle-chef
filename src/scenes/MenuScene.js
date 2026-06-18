import Phaser from 'phaser';
import { getHighScore } from '../utils/helpers.js';
import { COLORS, MAP_WIDTH, MAP_HEIGHT } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;

    this.createParticleBackground();

    this.cameras.main.fadeIn(800);

    const highScore = getHighScore();

    this.uiContainer = document.getElementById('game-container');

    this.menuScreen = document.createElement('div');
    this.menuScreen.className = 'menu-screen';
    this.menuScreen.innerHTML = `
      <div class="menu-title">🏰 古堡厨师</div>
      <div class="menu-subtitle">CASTLE CHEF</div>
      <button class="menu-btn" id="start-btn">开始游戏</button>
      <div class="menu-highscore">最高分：${highScore}</div>
      <div class="menu-controls">
        <strong>WASD / 方向键</strong> 移动<br/>
        <strong>空格</strong> 交互 / 拾取 / 放下<br/>
        <strong>Shift</strong> 冲刺
      </div>
    `;
    this.uiContainer.appendChild(this.menuScreen);

    document.getElementById('start-btn').addEventListener('click', () => {
      this.startGame();
    });

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  createParticleBackground() {
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, MAP_WIDTH);
      const y = Phaser.Math.Between(0, MAP_HEIGHT);
      const particle = this.add.circle(x, y, Phaser.Math.Between(2, 6), COLORS.ORANGE, 0.3);
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        hold: 0,
        onRepeat: () => {
          particle.setY(y);
          particle.setAlpha(0.3);
        }
      });
    }

    const torches = [
      { x: 100, y: 150 }, { x: MAP_WIDTH - 100, y: 150 },
      { x: 100, y: MAP_HEIGHT - 150 }, { x: MAP_WIDTH - 100, y: MAP_HEIGHT - 150 }
    ];
    for (const t of torches) {
      this.add.text(t.x, t.y, '🔥', { fontSize: '40px' }).setOrigin(0.5);
    }
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame();
    }
  }

  startGame() {
    if (this.started) return;
    this.started = true;
    this.cameras.main.fadeOut(400, 0, 0, 0, (_, progress) => {
      if (progress >= 1) {
        this.menuScreen.remove();
        this.scene.start('GameScene');
      }
    });
  }
}

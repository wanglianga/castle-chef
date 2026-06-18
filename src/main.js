import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

class Game extends Phaser.Game {
  constructor(config) {
    super(config);
    this.scene.add('BootScene', BootScene);
    this.scene.add('MenuScene', MenuScene);
    this.scene.add('GameScene', GameScene);
    this.scene.add('GameOverScene', GameOverScene);
    this.scene.start('BootScene');
  }
}

window.addEventListener('load', () => {
  new Game(gameConfig);
});

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a0f08);

    const title = this.add.text(width / 2, height / 2 - 60, '🏰 古堡厨师', {
      fontFamily: 'Cinzel, serif',
      fontSize: '48px',
      color: '#d4a843',
      fontStyle: '900'
    }).setOrigin(0.5);

    const progressBox = this.add.rectangle(width / 2, height / 2 + 40, 300, 30, 0x3d2817)
      .setStrokeStyle(2, 0xd4a843);
    const progressBar = this.add.rectangle(width / 2 - 147, height / 2 + 40, 0, 24, 0xf0c75e)
      .setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, height / 2 + 85, '载入中...', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#f5deb3'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.width = 294 * value;
    });

    this.load.on('complete', () => {
      loadingText.setText('准备就绪！');
    });
  }

  create() {
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}

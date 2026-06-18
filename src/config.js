import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from './utils/constants.js';

export const gameConfig = {
  type: Phaser.AUTO,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a0f08',
  pixelArt: false,
  physics: {
    default: 'none'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: false
  },
  render: {
    antialias: true,
    pixelArt: false
  }
};

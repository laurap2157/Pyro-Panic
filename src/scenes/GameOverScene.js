import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import tips from '../data/tips.js';
import * as Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.reason = data?.reason || 'default';
  }

  create() {
    const { width, height } = this.scale;
    const level = levels.find(l => l.id === gameState.currentLevelId);
    const tipData = tips[this.reason] || tips.default;

    this.cameras.main.setBackgroundColor('#3a0f0f');
    gameState.setLastResult('gameover');

    this.add.text(width / 2, 90, 'Game Over', {
      fontSize: '46px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 170, level ? level.name : 'Niveau en cours', {
      fontSize: '28px',
      color: '#ffb4a2'
    }).setOrigin(0.5);

    this.add.text(width / 2, 260, `Cause : ${tipData.title}`, {
      fontSize: '30px',
      color: '#ffd6a5',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 360, `Explication : ${tipData.explanation}`, {
      fontSize: '22px',
      color: '#ffffff',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 450, `Astuce : ${tipData.tip}`, {
      fontSize: '22px',
      color: '#caffbf',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 560, 'R / Entrée / Espace pour recommencer', {
      fontSize: '22px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-R', () => this.restartLevel());
    this.input.keyboard.on('keydown-ENTER', () => this.restartLevel());
    this.input.keyboard.on('keydown-SPACE', () => this.restartLevel());
  }

  restartLevel() {
    const level = levels.find(l => l.id === gameState.currentLevelId);

    if (!level) {
      this.scene.start('WorldMapScene');
      return;
    }

    this.scene.start(level.key);
  }
}
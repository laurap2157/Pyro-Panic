import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import Phaser from 'phaser';

export default class BriefingScene extends Phaser.Scene {
  constructor() {
    super('BriefingScene');
  }

  create() {
    const { width, height } = this.scale;
    const level = levels.find(l => l.id === gameState.currentLevelId);

    this.cameras.main.setBackgroundColor('#221b1b');

    if (!level) {
      this.add.text(width / 2, height / 2, 'Niveau introuvable', {
        fontSize: '32px',
        color: '#ff6666'
      }).setOrigin(0.5);

      return;
    }

    this.add.text(width / 2, 80, 'Briefing', {
      fontSize: '42px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 170, level.name, {
      fontSize: '34px',
      color: '#ffd166'
    }).setOrigin(0.5);

    this.add.text(width / 2, 280, `Objectif : ${level.briefing}`, {
      fontSize: '24px',
      color: '#ffffff',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 400, `Conseil : ${level.tip}`, {
      fontSize: '22px',
      color: '#b8f2e6',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 560, 'Entrée / Espace / E pour lancer le niveau', {
      fontSize: '22px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => this.launchLevel(level));
    this.input.keyboard.on('keydown-SPACE', () => this.launchLevel(level));
    this.input.keyboard.on('keydown-E', () => this.launchLevel(level));
  }

  launchLevel(level) {
    this.scene.start(level.key);
  }
}
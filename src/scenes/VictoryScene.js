import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import * as Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    const { width, height } = this.scale;
    const level = levels.find(l => l.id === gameState.currentLevelId);

    this.cameras.main.setBackgroundColor('#132a13');

    gameState.setLastResult('victory');
    gameState.unlockNextLevel();

    this.add.text(width / 2, 120, 'Niveau maîtrisé', {
      fontSize: '44px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 230, level ? level.name : 'Niveau inconnu', {
      fontSize: '32px',
      color: '#ffd166'
    }).setOrigin(0.5);

    this.add.text(width / 2, 340, 'Incendie contenu. Aucun foyer critique restant.', {
      fontSize: '24px',
      color: '#d8f3dc',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 520, 'Entrée / Espace / E pour retourner à la carte', {
      fontSize: '22px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('WorldMapScene'));
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('WorldMapScene'));
    this.input.keyboard.on('keydown-E', () => this.scene.start('WorldMapScene'));
  }
}
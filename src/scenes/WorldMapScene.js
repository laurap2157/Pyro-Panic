import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import Phaser from 'phaser';

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
    this.selectedLevel = 1;
    this.levelTexts = [];
  }

  create() {
    const { width } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1f2b');

    this.add.text(width / 2, 60, 'Carte générale', {
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 110, 'Flèches haut/bas pour choisir • Entrée/Espace/E pour valider', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.levelTexts = [];

    levels.forEach((level, index) => {
      const isUnlocked = level.id <= gameState.unlockedLevel;
      const text = this.add.text(width / 2, 200 + index * 70, '', {
        fontSize: '28px',
        color: isUnlocked ? '#ffffff' : '#666666'
      }).setOrigin(0.5);

      this.levelTexts.push(text);
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.moveSelection(-1);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.moveSelection(1);
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.confirmSelection();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.confirmSelection();
    });

    this.input.keyboard.on('keydown-E', () => {
      this.confirmSelection();
    });

    this.refreshMap();
  }

  moveSelection(direction) {
    const unlockedLevels = levels.filter(level => level.id <= gameState.unlockedLevel);
    const min = 1;
    const max = unlockedLevels.length;

    this.selectedLevel += direction;

    if (this.selectedLevel < min) {
      this.selectedLevel = min;
    }

    if (this.selectedLevel > max) {
      this.selectedLevel = max;
    }

    this.refreshMap();
  }

  confirmSelection() {
    const level = levels.find(level => level.id === this.selectedLevel);

    if (!level || level.id > gameState.unlockedLevel) {
      return;
    }

    gameState.setCurrentLevel(level.id);
    this.scene.start('BriefingScene');
  }

  refreshMap() {
    levels.forEach((level, index) => {
      const isUnlocked = level.id <= gameState.unlockedLevel;
      const isSelected = level.id === this.selectedLevel;

      let label = `${level.id}. ${level.name}`;

      if (!isUnlocked) {
        label += ' 🔒';
      }

      if (isSelected && isUnlocked) {
        label = `> ${label}`;
      }

      this.levelTexts[index].setText(label);
      this.levelTexts[index].setColor(isUnlocked ? (isSelected ? '#ffd166' : '#ffffff') : '#666666');
    });
  }
}
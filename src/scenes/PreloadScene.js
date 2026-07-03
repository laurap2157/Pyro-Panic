import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.scale;

    // =====================================================
    // 1. Affichage temporaire de chargement
    // =====================================================
    this.add.text(width / 2, height / 2, 'Chargement...', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // =====================================================
    // 2. Musiques de fond principales
    // =====================================================
    // Les fichiers doivent être placés dans :
    // public/assets/audio/
    this.load.audio('music-title', 'assets/audio/Pyro_Panic.mp3');
    this.load.audio('music-map', 'assets/audio/Map_Theme.mp3');
    this.load.audio('music-level-faubourg', 'assets/audio/Level_Faubourg.mp3');
    this.load.audio('music-gameover', 'assets/audio/Game_Over.mp3');
  }

  create() {
    // =====================================================
    // 1. Passage vers l’écran titre
    // =====================================================
    this.scene.start('TitleScene');
  }
}
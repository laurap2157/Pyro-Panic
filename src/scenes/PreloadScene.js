import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, 'Chargement...', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  create() {
    this.scene.start('TitleScene');
  }
}
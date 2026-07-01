import * as Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 40, "Pyro Panic", {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, "Entrée / Espace / E pour commencer", {
      fontSize: '24px',
      color: '#ffcc66'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('WorldMapScene'));
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('WorldMapScene'));
    this.input.keyboard.on('keydown-E', () => this.scene.start('WorldMapScene'));
  }
}
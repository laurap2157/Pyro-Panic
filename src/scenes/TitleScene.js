import * as Phaser from 'phaser';

import MenuInputGuard from '../systems/MenuInputGuard.js';
import MusicManager from '../systems/MusicManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    // =====================================================
    // 1. Background de l’écran titre
    // =====================================================
    // Le fichier contient déjà le titre "PYRO PANIC"
    // et le sous-titre "DEVIL'S SPARK".
    this.load.image('title-background', 'assets/backgrounds/EcranTitre.png');
  }

  create() {
    const { width, height } = this.scale;

    // =====================================================
    // 1. Musique de l’écran titre
    // =====================================================
    MusicManager.play(this, 'music-title', {
      volume: 0.65,
      fadeDuration: 900,
    });

    // =====================================================
    // 2. Background
    // =====================================================
    this.addCoverBackground('title-background');

    // Léger voile sombre pour intégrer l’instruction du bas
    // sans écraser le visuel du background.
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.08
    );

    // =====================================================
    // 3. Instruction de démarrage
    // =====================================================
    this.add.rectangle(
      width / 2,
      height - 72,
      560,
      54,
      0x090b10,
      0.72
    ).setStrokeStyle(2, 0xf7d28a, 0.65);

    this.add.text(width / 2, height - 72, 'A / START / ENTRÉE / ESPACE', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 32, 'F : plein écran', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);

    // =====================================================
    // 4. Inputs
    // =====================================================
    this.startKeys = this.input.keyboard.addKeys({
      space: 'SPACE',
      enter: 'ENTER',
    });

    this.fullscreenKey = this.input.keyboard.addKey('F');

    this.inputGuard = new MenuInputGuard(
      this,
      this.startKeys,
      [0, 9] // A, Start
    );
  }

  update() {
    // =====================================================
    // 1. Mise à jour du garde anti-maintien
    // =====================================================
    this.inputGuard.updateReleaseState();

    // =====================================================
    // 2. Plein écran
    // =====================================================
    if (Phaser.Input.Keyboard.JustDown(this.fullscreenKey)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    // =====================================================
    // 3. Passage vers la carte
    // =====================================================
    if (this.inputGuard.isPressed()) {
      this.scene.start('WorldMapScene');
    }

    // =====================================================
    // 4. Fin de frame du garde d’input
    // =====================================================
    this.inputGuard.endFrame();
  }

  addCoverBackground(textureKey) {
    const { width, height } = this.scale;

    const image = this.add.image(width / 2, height / 2, textureKey);
    image.setOrigin(0.5);

    const texture = this.textures.get(textureKey);
    const source = texture.getSourceImage();

    const scaleX = width / source.width;
    const scaleY = height / source.height;
    const scale = Math.max(scaleX, scaleY);

    image.setScale(scale);

    return image;
  }
}
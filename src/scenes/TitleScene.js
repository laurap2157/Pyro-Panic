import * as Phaser from 'phaser';

import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    // Background complet de l'écran titre.
    // Le fichier contient déjà le titre "PYRO PANIC"
    // et le sous-titre "DEVIL'S SPARK".
    this.load.image('title-background', 'assets/backgrounds/EcranTitre.png');
  }

  create() {
    const { width, height } = this.scale;

    // =====================================================
    // 1. Background
    // =====================================================
    // On affiche l'image en mode cover pour remplir l'écran
    // sans déformation.
    this.addCoverBackground('title-background');

    // Léger voile sombre.
    // On le garde très discret pour ne pas étouffer l'image,
    // mais il aide à intégrer proprement l'instruction du bas.
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.08
    );

    // =====================================================
    // 2. Instructions de démarrage
    // =====================================================
    // Le titre et le sous-titre ne sont plus affichés par Phaser :
    // ils sont déjà présents dans l'image.
    this.add.rectangle(
      width / 2,
      height - 72,
      620,
      64,
      0x090b10,
      0.72
    ).setStrokeStyle(2, 0xf7d28a, 0.65);

    this.add.text(width / 2, height - 82, 'A / START / ENTRÉE / ESPACE', {
      fontFamily: 'monospace',
      fontSize: '23px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 54, 'F : PLEIN ÉCRAN', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#f7d28a',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);

    // =====================================================
    // 3. Inputs
    // =====================================================
    this.startKeys = this.input.keyboard.addKeys({
      space: 'SPACE',
      enter: 'ENTER',
    });

    this.fullscreenKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.F
    );

    this.inputGuard = new MenuInputGuard(
      this,
      this.startKeys,
      [0, 9] // A, Start
    );
  }

  update() {
    this.inputGuard.updateReleaseState();

    if (Phaser.Input.Keyboard.JustDown(this.fullscreenKey)) {
      this.toggleFullscreen();
    }

    if (this.inputGuard.isPressed()) {
      this.scene.start('WorldMapScene');
    }

    this.inputGuard.endFrame();
  }

  toggleFullscreen() {
    // Les navigateurs exigent une action utilisateur pour lancer le plein écran.
    // Cette méthode est donc appelée depuis l'appui sur F.
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }

    this.scale.startFullscreen();
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

import * as Phaser from 'phaser';

import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class LevelPlaceholderScene extends Phaser.Scene {
  constructor(sceneKey, levelName) {
    super(sceneKey);

    this.levelName = levelName;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x101018
    );

    this.add.text(width / 2, height / 2 - 120, this.levelName, {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, 'Niveau en construction', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffcc66',
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2 + 30,
      'Cette mission sera implémentée dans une prochaine phase.',
      {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: 900 },
      }
    ).setOrigin(0.5);

    this.add.text(
      width / 2,
      height - 80,
      'A / Start / Entrée / Espace : retour carte',
      {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      }
    ).setOrigin(0.5);

    this.continueKeys = this.input.keyboard.addKeys({
      space: 'SPACE',
      enter: 'ENTER',
    });

    this.inputGuard = new MenuInputGuard(
      this,
      this.continueKeys,
      [0, 9] // A, Start
    );
  }

  update() {
    this.inputGuard.updateReleaseState();

    if (this.inputGuard.isPressed()) {
      this.scene.start('WorldMapScene');
    }

    this.inputGuard.endFrame();
  }
}
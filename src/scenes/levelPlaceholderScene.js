import * as Phaser from 'phaser';

import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';

export default class LevelPlaceholderScene extends Phaser.Scene {
  constructor(sceneKey, levelName) {
    super(sceneKey);

    this.levelName = levelName;
  }

  create() {
    this.ui = new ScreenView(this);

    this.ui.drawBackground({
      accentColor: 0xff8a2a,
      dangerColor: 0x3a1d1a,
    });

    this.ui.drawPanel(
      this.ui.centerX - 450,
      175,
      900,
      360,
      {
        fillColor: 0x151a24,
        strokeColor: 0xff8a2a,
      }
    );

    this.ui.addSubtitle('MISSION À VENIR', 230, {
      fontSize: '24px',
      color: '#ffb35c',
    });

    this.ui.addTitle(this.levelName, 305, {
      fontSize: '44px',
      color: '#ffffff',
    });

    this.ui.addBody(
      'Cette zone est déjà raccordée à la carte, mais son gameplay sera implémenté dans une prochaine phase.',
      this.ui.centerX,
      405,
      760,
      {
        fontSize: '22px',
        color: '#d7d7d7',
      }
    );

    this.ui.addBody(
      'Le niveau 1 reste la tranche jouable principale du prototype.',
      this.ui.centerX,
      480,
      760,
      {
        fontSize: '20px',
        color: '#ffcc66',
      }
    );

    this.ui.addHint('A / Start / Entrée / Espace : retour carte');

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
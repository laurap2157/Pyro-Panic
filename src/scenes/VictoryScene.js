import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  preload() {
    this.load.image('btn-a', 'assets/ui/xbox_360_A.png');
  }

  create() {
    gameState.setLastResult('victory');
    gameState.unlockNextLevel();

    this.ui = new ScreenView(this);

    this.ui.drawBackground({
      accentColor: 0xffcc66,
      dangerColor: 0x2d4a31,
    });

    this.ui.drawPanel(
      this.ui.centerX - 390,
      185,
      780,
      320,
      {
        fillColor: 0x13201a,
        strokeColor: 0xffcc66,
      }
    );

    this.ui.addSubtitle('INTERVENTION TERMINÉE', 235, {
      fontSize: '24px',
      color: '#ffcc66',
    });

    this.ui.addTitle('INCENDIE MAÎTRISÉ', 315, {
      fontSize: '52px',
      color: '#ffffff',
    });

    this.ui.addBody(
      'Le secteur est sécurisé. La progression de l’équipe est enregistrée.',
      this.ui.centerX,
      405,
      680,
      {
        fontSize: '22px',
        color: '#d8ffd8',
      }
    );

    this.createReturnHint();

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

  createReturnHint() {
    const y = 592;

    const textStyle = {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#d9d9d9',
    };

    const tempText = this.add.text(0, 0, 'Retour carte', textStyle).setVisible(false);
    const iconSize = 28;
    const gap = 12;
    const totalWidth = iconSize + gap + tempText.width;
    const startX = this.ui.centerX - totalWidth / 2;

    this.add.image(startX, y, 'btn-a')
      .setOrigin(0, 0.5)
      .setDisplaySize(iconSize, iconSize)
      .setDepth(100);

    this.add.text(startX + iconSize + gap, y - 14, 'Retour carte', textStyle)
      .setOrigin(0, 0)
      .setDepth(100);

    tempText.destroy();
  }
}
import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';

export default class BriefingScene extends Phaser.Scene {
  constructor() {
    super('BriefingScene');
  }

  preload() {
    this.load.image('btn-a', 'assets/ui/xbox_360_A.png');
  }

  create() {
    this.level = levels.find(level => level.id === gameState.currentLevelId);

    if (!this.level) {
      this.scene.start('WorldMapScene');
      return;
    }

    this.ui = new ScreenView(this);

    this.ui.drawBackground({
      accentColor: 0xffb35c,
      dangerColor: 0x5c1f16,
    });

    this.ui.addSubtitle('BRIEFING D’INTERVENTION', 58, {
      fontSize: '24px',
      color: '#ffb35c',
    });

    this.ui.drawPanel(
      this.ui.centerX - 470,
      135,
      940,
      430,
      {
        fillColor: 0x151a24,
        strokeColor: 0xffcc66,
      }
    );

    this.ui.addTitle(this.level.name, 195, {
      fontSize: '46px',
      color: '#ffffff',
    });

    this.ui.addBadge('OBJECTIF', this.ui.centerX, 285, {
      width: 170,
      fillColor: 0x263243,
      strokeColor: 0xffcc66,
    });

    this.ui.addBody(
      this.level.briefing,
      this.ui.centerX,
      345,
      760,
      {
        fontSize: '23px',
        color: '#dddddd',
      }
    );

    this.ui.addBadge('CONSEIL', this.ui.centerX, 445, {
      width: 150,
      fillColor: 0x3b2817,
      strokeColor: 0xff8a2a,
    });

    this.ui.addBody(
      this.level.tip,
      this.ui.centerX,
      505,
      780,
      {
        fontSize: '21px',
        color: '#ffcc8a',
      }
    );

    this.createMissionHint();

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
      this.scene.start(this.level.key);
    }

    this.inputGuard.endFrame();
  }

  createMissionHint() {
    const baseX = this.ui.centerX - 110;
    const y = 648;

    const icon = this.add.image(baseX, y, 'btn-a').setOrigin(0, 0.5);
    icon.setScale(1);
    icon.setDepth(100);

    const text = this.add.text(baseX + 42, y - 12, ' : Lancer la mission', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#d9d9d9',
    });
    text.setDepth(100);
  }
}
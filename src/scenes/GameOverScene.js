import * as Phaser from 'phaser';

import tips from '../data/tips.js';
import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  preload() {
    this.load.image('btn-y', 'assets/ui/xbox_360_Y.png');
  }

  create(data) {
    this.reason = data?.reason || 'default';

    const currentLevel = levels.find(level => level.id === gameState.currentLevelId);
    this.levelKey = data?.levelKey || currentLevel?.key || 'Level1Scene';

    const tipData = tips[this.reason] || tips.default;

    this.ui = new ScreenView(this);

    this.ui.drawBackground({
      accentColor: 0xff5555,
      dangerColor: 0x7a1f1f,
    });

    this.ui.drawPanel(
      this.ui.centerX - 470,
      135,
      940,
      470,
      {
        fillColor: 0x201316,
        strokeColor: 0xff5555,
      }
    );

    this.ui.addSubtitle('INTERVENTION ÉCHOUÉE', 190, {
      fontSize: '24px',
      color: '#ff7777',
    });

    this.ui.addTitle('GAME OVER', 265, {
      fontSize: '62px',
      color: '#ff5555',
    });

    this.ui.addBadge('CAUSE', this.ui.centerX, 350, {
      width: 140,
      fillColor: 0x431a1a,
      strokeColor: 0xff5555,
    });

    this.ui.addBody(
      tipData.cause,
      this.ui.centerX,
      395,
      760,
      {
        fontSize: '23px',
        color: '#ffffff',
      }
    );

    this.ui.addBody(
      tipData.explanation,
      this.ui.centerX,
      460,
      780,
      {
        fontSize: '20px',
        color: '#cccccc',
      }
    );

    this.ui.addBody(
      `Astuce : ${tipData.tip}`,
      this.ui.centerX,
      540,
      820,
      {
        fontSize: '20px',
        color: '#ffcc66',
      }
    );

    this.createRestartHint();

    this.restartKeys = this.input.keyboard.addKeys({
      r: 'R',
      space: 'SPACE',
      enter: 'ENTER',
    });

    this.inputGuard = new MenuInputGuard(
      this,
      this.restartKeys,
      [3, 8] // Y, View
    );
  }

  update() {
    this.inputGuard.updateReleaseState();

    if (this.inputGuard.isPressed()) {
      this.scene.start(this.levelKey);
    }

    this.inputGuard.endFrame();
  }

  createRestartHint() {
    const baseX = this.ui.centerX - 95;
    const y = 655;

    const icon = this.add.image(baseX, y, 'btn-y').setOrigin(0, 0.5);
    icon.setScale(1);
    icon.setDepth(100);

    const text = this.add.text(baseX + 42, y - 12, ' Recommencer', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#d9d9d9',
    });
    text.setDepth(100);
  }
}
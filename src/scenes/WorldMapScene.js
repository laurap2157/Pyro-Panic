import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  create() {
    this.ui = new ScreenView(this);

    this.selectedIndex = 0;

    this.ui.drawBackground({
      accentColor: 0xffcc66,
      dangerColor: 0x4d1515,
    });

    this.ui.addTitle('CARTE D’INTERVENTION', 64, {
      fontSize: '44px',
      color: '#ffe6a3',
    });

    this.ui.addSubtitle('Progression opérationnelle', 112, {
      fontSize: '20px',
      color: '#cccccc',
    });

    this.mapGraphics = this.add.graphics();

    this.levelPositions = [
      { x: 170, y: 430 },
      { x: 430, y: 315 },
      { x: 690, y: 450 },
      { x: 950, y: 315 },
      { x: 1205, y: 430 },
    ];

    this.levelLabels = levels.map((level, index) => {
      const position = this.levelPositions[index];

      return this.add.text(position.x, position.y + 72, '', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 210 },
      }).setOrigin(0.5);
    });

    this.statusText = this.add.text(this.ui.centerX, this.ui.height - 118, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffcc66',
      align: 'center',
    }).setOrigin(0.5);

    this.ui.addHint('Stick / Flèches : choisir | A / Start / Entrée / Espace : valider');

    this.keys = this.input.keyboard.addKeys({
      up: 'UP',
      down: 'DOWN',
      left: 'LEFT',
      right: 'RIGHT',
      z: 'Z',
      q: 'Q',
      s: 'S',
      d: 'D',
      enter: 'ENTER',
      space: 'SPACE',
    });

    this.inputGuard = new MenuInputGuard(
      this,
      {
        enter: this.keys.enter,
        space: this.keys.space,
      },
      [0, 9] // A, Start
    );

    this.navigationCooldown = 0;
    this.previousGamepadButtons = {};

    this.refreshDisplay();
  }

  update(time, delta) {
    this.inputGuard.updateReleaseState();

    if (!this.inputGuard.canValidate) {
      this.inputGuard.endFrame();
      this.saveCurrentGamepadButtons();
      return;
    }

    this.navigationCooldown -= delta;

    this.handleNavigation();
    this.handleValidation();

    this.inputGuard.endFrame();
    this.saveCurrentGamepadButtons();
  }

  handleNavigation() {
    if (this.navigationCooldown > 0) {
      return;
    }

    const direction = this.getNavigationDirection();

    if (direction === 0) {
      return;
    }

    this.selectedIndex += direction;

    if (this.selectedIndex < 0) {
      this.selectedIndex = levels.length - 1;
    }

    if (this.selectedIndex >= levels.length) {
      this.selectedIndex = 0;
    }

    this.navigationCooldown = 180;
    this.refreshDisplay();
  }

  handleValidation() {
    if (!this.isConfirmPressed()) {
      return;
    }

    const selectedLevel = levels[this.selectedIndex];

    if (!this.isLevelUnlocked(selectedLevel.id)) {
      this.statusText.setText('Secteur encore verrouillé.');
      return;
    }

    gameState.setCurrentLevel(selectedLevel.id);
    this.scene.start('BriefingScene');
  }

  refreshDisplay() {
    this.mapGraphics.clear();

    this.drawPaths();
    this.drawNodes();

    const selectedLevel = levels[this.selectedIndex];

    if (this.isLevelUnlocked(selectedLevel.id)) {
      this.statusText.setText(`Secteur sélectionné : ${selectedLevel.name}`);
    } else {
      this.statusText.setText(`Secteur verrouillé : ${selectedLevel.name}`);
    }
  }

  drawPaths() {
    for (let index = 0; index < this.levelPositions.length - 1; index++) {
      const start = this.levelPositions[index];
      const end = this.levelPositions[index + 1];

      const nextLevel = levels[index + 1];
      const isPathUnlocked = this.isLevelUnlocked(nextLevel.id);

      this.mapGraphics.lineStyle(
        10,
        isPathUnlocked ? 0xff8a2a : 0x3b3f4a,
        isPathUnlocked ? 0.75 : 0.55
      );

      this.mapGraphics.beginPath();
      this.mapGraphics.moveTo(start.x, start.y);
      this.mapGraphics.lineTo(end.x, end.y);
      this.mapGraphics.strokePath();

      this.mapGraphics.lineStyle(
        2,
        isPathUnlocked ? 0xffcc66 : 0x777777,
        isPathUnlocked ? 0.85 : 0.35
      );

      this.mapGraphics.beginPath();
      this.mapGraphics.moveTo(start.x, start.y);
      this.mapGraphics.lineTo(end.x, end.y);
      this.mapGraphics.strokePath();
    }
  }

  drawNodes() {
    levels.forEach((level, index) => {
      const position = this.levelPositions[index];

      const isSelected = index === this.selectedIndex;
      const isUnlocked = this.isLevelUnlocked(level.id);
      const isCompleted = this.isLevelCompleted(level.id);

      const outerColor = isSelected ? 0xffcc66 : 0xffffff;
      const fillColor = this.getNodeColor(isUnlocked, isCompleted);

      this.mapGraphics.fillStyle(fillColor, isUnlocked ? 1 : 0.55);
      this.mapGraphics.fillCircle(position.x, position.y, isSelected ? 34 : 28);

      this.mapGraphics.lineStyle(
        isSelected ? 5 : 3,
        outerColor,
        isSelected ? 1 : 0.55
      );

      this.mapGraphics.strokeCircle(position.x, position.y, isSelected ? 38 : 31);

      this.mapGraphics.fillStyle(0x101018, 0.75);
      this.mapGraphics.fillCircle(position.x, position.y, 15);

      this.mapGraphics.fillStyle(isUnlocked ? 0xffcc66 : 0x777777, 1);
      this.mapGraphics.fillCircle(position.x, position.y, 6);

      const status = this.getLevelStatusText(level.id);

      this.levelLabels[index].setText(`${level.name}\n${status}`);

      if (!isUnlocked) {
        this.levelLabels[index].setColor('#777777');
      } else if (isSelected) {
        this.levelLabels[index].setColor('#ffcc66');
      } else if (isCompleted) {
        this.levelLabels[index].setColor('#d8ffd8');
      } else {
        this.levelLabels[index].setColor('#ffffff');
      }
    });
  }

  getNodeColor(isUnlocked, isCompleted) {
    if (isCompleted) {
      return 0x2f6f3e;
    }

    if (isUnlocked) {
      return 0x8a4b1f;
    }

    return 0x2a2f3a;
  }

  getLevelStatusText(levelId) {
    if (this.isLevelCompleted(levelId)) {
      return 'terminé';
    }

    if (this.isLevelUnlocked(levelId)) {
      return 'accessible';
    }

    return 'verrouillé';
  }

  isLevelCompleted(levelId) {
    if (typeof gameState.unlockedLevel !== 'number') {
      return false;
    }

    return levelId < gameState.unlockedLevel;
  }

  isLevelUnlocked(levelId) {
    if (typeof gameState.isLevelUnlocked === 'function') {
      return gameState.isLevelUnlocked(levelId);
    }

    if (typeof gameState.unlockedLevel === 'number') {
      return levelId <= gameState.unlockedLevel;
    }

    return levelId === 1;
  }

  getNavigationDirection() {
    const keyboardPrevious =
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.left) ||
      Phaser.Input.Keyboard.JustDown(this.keys.z) ||
      Phaser.Input.Keyboard.JustDown(this.keys.q);

    const keyboardNext =
      Phaser.Input.Keyboard.JustDown(this.keys.down) ||
      Phaser.Input.Keyboard.JustDown(this.keys.right) ||
      Phaser.Input.Keyboard.JustDown(this.keys.s) ||
      Phaser.Input.Keyboard.JustDown(this.keys.d);

    if (keyboardPrevious) {
      return -1;
    }

    if (keyboardNext) {
      return 1;
    }

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }

      const leftX = gamepad.axes[0] || 0;
      const leftY = gamepad.axes[1] || 0;

      if (leftX < -0.5 || leftY < -0.5) {
        return -1;
      }

      if (leftX > 0.5 || leftY > 0.5) {
        return 1;
      }

      if (this.wasGamepadButtonPressed(12) || this.wasGamepadButtonPressed(14)) {
        return -1;
      }

      if (this.wasGamepadButtonPressed(13) || this.wasGamepadButtonPressed(15)) {
        return 1;
      }
    }

    return 0;
  }

  isConfirmPressed() {
    return this.inputGuard.isPressed();
  }

  isGamepadButtonDown(buttonIndex) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }

      const button = gamepad.buttons[buttonIndex];

      if (button && (button.pressed || button.value > 0.5)) {
        return true;
      }
    }

    return false;
  }

  wasGamepadButtonPressed(buttonIndex) {
    const isDownNow = this.isGamepadButtonDown(buttonIndex);
    const wasDownBefore = this.previousGamepadButtons[buttonIndex] || false;

    return isDownNow && !wasDownBefore;
  }

  saveCurrentGamepadButtons() {
    this.previousGamepadButtons = {
      12: this.isGamepadButtonDown(12),
      13: this.isGamepadButtonDown(13),
      14: this.isGamepadButtonDown(14),
      15: this.isGamepadButtonDown(15),
    };
  }
}
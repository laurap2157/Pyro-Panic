import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';
import MusicManager from '../systems/MusicManager.js';

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  preload() {
    this.load.image('btn-a', 'assets/ui/xbox_360_A.png');
    this.load.image('btn-stick', 'assets/ui/xbox_360_joystick.png');
  }

  create() {
    // =====================================================
    // 1. Musique de carte / navigation
    // =====================================================
    MusicManager.play(this, 'music-map', {
      volume: 0.48,
      fadeDuration: 900,
    });

    // =====================================================
    // 2. Initialisation UI
    // =====================================================
    this.ui = new ScreenView(this);
    this.selectedIndex = 0;

    // Affichage de l'illustration pixel art calée sur la résolution de référence 1280x720
    this.add
      .image(0, 0, 'map-background')
      .setOrigin(0, 0)
      .setDisplaySize(1280, 720);

    // =====================================================
    // 3. Données visuelles de la carte
    // =====================================================
    this.mapGraphics = this.add.graphics();

    // Coordonnées absolues basées sur l'illustration en 1280x720
    this.levelPositions = [
      { x: 430, y: 530 }, // 1. Faubourg des Étincelles
      { x: 430, y: 207 }, // 2. Le Manoir aux Portes Rouges
      { x: 647, y: 374 }, // 3. L’Aire du Dernier Plein
      { x: 888, y: 549 }, // 4. La Forêt de Brûlevent
      { x: 912, y: 196 }, // 5. Zone inconnue (Centre du cadenas)
    ];

    // Les labels textuels dynamiques sont masqués pour ne pas surcharger l'image d'origine
    this.levelLabels = levels.map(() => {
      return this.add.text(0, 0, '', { visible: false });
    });

    this.statusText = this.add
      .text(this.ui.centerX, this.ui.height - 118, '', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffcc66',
        align: 'center',
      })
      .setOrigin(0.5);

    this.ui.addHint(
      'Stick / Flèches : choisir | A / Start / Entrée / Espace : valider',
    );

    // =====================================================
    // 4. Inputs clavier / manette
    // =====================================================
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
      [0, 9], // A, Start
    );

    this.navigationCooldown = 0;
    this.previousGamepadButtons = {};

    // =====================================================
    // 5. Premier rendu de la carte
    // =====================================================
    this.refreshDisplay();
  }

  update(time, delta) {
    // =====================================================
    // 1. Garde anti-maintien
    // =====================================================
    this.inputGuard.updateReleaseState();

    if (!this.inputGuard.canValidate) {
      this.inputGuard.endFrame();
      this.saveCurrentGamepadButtons();
      return;
    }

    // =====================================================
    // 2. Navigation / validation
    // =====================================================
    this.navigationCooldown -= delta;

    this.handleNavigation();
    this.handleValidation();

    // =====================================================
    // 3. Fin de frame
    // =====================================================
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

    this.drawNodes();

    const selectedLevel = levels[this.selectedIndex];

    if (this.isLevelUnlocked(selectedLevel.id)) {
      this.statusText.setText(`Secteur sélectionné : ${selectedLevel.name}`);
    } else {
      this.statusText.setText(`Secteur verrouillé : ${selectedLevel.name}`);
    }
  }

  drawNodes() {
    const size = 24;
    const radius = 4;
    const half = size / 2;

    levels.forEach((level, index) => {
      const { x, y } = this.levelPositions[index];

      const isSelected = index === this.selectedIndex;
      const isUnlocked = this.isLevelUnlocked(level.id);

      const borderColor = isSelected
        ? 0xffd46b // jaune
        : 0xd7d7d7; // gris clair

      const fillColor = isUnlocked
        ? 0x3b7f4a // vert foncé
        : 0x7a2b2b; // rouge brique

      this.mapGraphics.fillStyle(fillColor, 1);
      this.mapGraphics.fillRoundedRect(x - half, y - half, size, size, radius);

      // Contour
      this.mapGraphics.lineStyle(3, borderColor, 1);
      this.mapGraphics.strokeRoundedRect(
        x - half,
        y - half,
        size,
        size,
        radius,
      );

      // Léger reflet intérieur (optionnel, donne un effet plus proche du mockup)
      this.mapGraphics.lineStyle(1, isSelected ? 0xffefb0 : 0xffffff, 0.18);
      this.mapGraphics.strokeRoundedRect(
        x - half + 1,
        y - half + 1,
        size - 2,
        size - 2,
        radius - 1,
      );
    });
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

      if (
        this.wasGamepadButtonPressed(12) ||
        this.wasGamepadButtonPressed(14)
      ) {
        return -1;
      }

      if (
        this.wasGamepadButtonPressed(13) ||
        this.wasGamepadButtonPressed(15)
      ) {
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

  createMapHint() {
    const y = this.ui.height - 58;
    const centerX = this.ui.centerX;

    const styleMain = {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffcc66',
    };

    const styleAccent = {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffcc66',
    };

    const textAfterStick = 'Joystick : choisir';
    const separator = '   |   ';
    const textAfterA = 'Valider';

    const temp1 = this.add
      .text(0, 0, textAfterStick, styleMain)
      .setVisible(false);
    const temp2 = this.add.text(0, 0, separator, styleMain).setVisible(false);
    const temp3 = this.add
      .text(0, 0, textAfterA, styleAccent)
      .setVisible(false);

    const iconSize = 24;
    const gap = 8;

    const totalWidth =
      iconSize + gap + temp1.width + temp2.width + iconSize + gap + temp3.width;

    let currentX = centerX - totalWidth / 2;

    this.add
      .image(currentX, y + 2, 'btn-stick')
      .setOrigin(0, 0.5)
      .setDisplaySize(iconSize, iconSize);
    currentX += iconSize + gap;

    this.add.text(currentX, y - 11, textAfterStick, styleMain).setOrigin(0, 0);
    currentX += temp1.width;

    this.add.text(currentX, y - 11, separator, styleMain).setOrigin(0, 0);
    currentX += temp2.width;

    this.add
      .image(currentX, y + 2, 'btn-a')
      .setOrigin(0, 0.5)
      .setDisplaySize(iconSize, iconSize);
    currentX += iconSize + gap;

    this.add.text(currentX, y - 11, textAfterA, styleAccent).setOrigin(0, 0);

    temp1.destroy();
    temp2.destroy();
    temp3.destroy();
  }
}

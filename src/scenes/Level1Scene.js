import * as Phaser from 'phaser';

import Player from '../objects/Player.js';
import Fire from '../objects/Fire.js';
import HudView from '../objects/HudView.js';
import SupplyPoint from '../objects/SupplyPoint.js';

import InputManager from '../systems/InputManager.js';
import ExtinguishSystem from '../systems/ExtinguishSystem.js';
import ResourceSystem from '../systems/ResourceSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';

import { level1Layout } from '../data/Level1Layout.js';

const SPRAY_RANGE = 220;
const SPRAY_WIDTH = 35;

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  preload() {
    this.load.image(
      'level1-bg',
      'assets/backgrounds/FaubourgDesEtincelles.png',
    );
    this.load.image('texture_water', 'assets/sprites/water.png');
    this.load.image('texture_foam', 'assets/sprites/foam.png');
    this.load.image('texture_oxygen', 'assets/sprites/oxygen.png');
  }

  create() {
    this.add.image(0, 0, 'level1-bg').setOrigin(0, 0);
    // =====================================================
    // 1. Initialisation des systèmes
    // =====================================================
    this.inputManager = new InputManager(this);
    this.resourceSystem = new ResourceSystem();
    this.extinguishSystem = new ExtinguishSystem();

    // =====================================================
    // 2. Initialisation du joueur
    // =====================================================
    this.player = new Player(this, 400, 300);

    // =====================================================
    // 3. Initialisation des feux du niveau 1
    // =====================================================
    this.fires = [
      new Fire({ x: 620, y: 280, size: 'small', type: 'normal' }),
      new Fire({ x: 860, y: 420, size: 'large', type: 'normal' }),
    ];

    // =====================================================
    // 4. Préparation du rendu
    // =====================================================
    this.graphics = this.add.graphics();

    // Instanciation du HUD partagé
    this.hud = new HudView(this);

    // Texte d’aide temporaire pour les tests
    this.helpText = this.add.text(
      24,
      728,
      'RT / Espace / Clic : jet faible | RB + RT / Shift : jet puissant',
      { fontFamily: 'monospace', fontSize: '18px', color: '#cccccc' },
    );
  }

  update(time, delta) {
    const input = this.inputManager.getState(this.player.getPosition());

    this.resourceSystem.update(delta);
    this.player.update(input, delta, this.collisionSystem);
    this.handleInteractions(input);

    this.graphics.clear();

    // =====================================================
    // 4. Gameplay de tir
    // =====================================================
    this.handleShooting(input, delta);
    this.drawFires();
    this.hud.update();

    // =====================================================
    // 6. Conditions de fin de niveau
    // =====================================================
    this.checkEndConditions();
  }

  handleShooting(input, delta) {
    if (!input.isShooting) return;

    const power = input.isPowerJet ? 'strong' : 'weak';
    const activeAgent = this.resourceSystem.activeAgent;

    if (!this.hasResource(activeAgent)) {
      return;
    }

    const sprayOrigin = this.player.getSprayOrigin();
    const aimDirection = this.player.getAimDirection();

    this.drawSpray(sprayOrigin, aimDirection, power);

    const hasConsumedResource = this.resourceSystem.consumeAgent(power, delta);

    if (!hasConsumedResource) {
      return;
    }

    const touchedFires = this.getTouchedFires(sprayOrigin, aimDirection);

    if (touchedFires.length === 0) {
      return;
    }

    this.resourceSystem.consumeAgent(power, delta);

    touchedFires.forEach((fire) => {
      this.extinguishSystem.applyJet({
        fire: fire,
        agent: activeAgent,
        power: power,
        delta: delta,
      });
    });
  }

  hasResource(activeAgent) {
    if (activeAgent === 'water') {
      return this.resourceSystem.waterReserve > 0;
    }

    if (activeAgent === 'foam') {
      return this.resourceSystem.foamReserve > 0;
    }

    return false;
  }

  getTouchedFires(sprayOrigin, aimDirection) {
    return this.fires.filter((fire) => {
      if (fire.isExtinguished) return false;

      const fireVectorX = fire.x - sprayOrigin.x;
      const fireVectorY = fire.y - sprayOrigin.y;
      const projection =
        fireVectorX * aimDirection.x + fireVectorY * aimDirection.y;

      if (projection < 0 || projection > SPRAY_RANGE) return false;

      const closestPointX = sprayOrigin.x + aimDirection.x * projection;
      const closestPointY = sprayOrigin.y + aimDirection.y * projection;

      return (
        Phaser.Math.Distance.Between(
          fire.x,
          fire.y,
          closestPointX,
          closestPointY,
        ) <= SPRAY_WIDTH
      );
    });
  }

  drawSpray(sprayOrigin, aimDirection, power) {
    const sprayLength = power === 'strong' ? SPRAY_RANGE : SPRAY_RANGE * 0.75;
    const sprayColor = power === 'strong' ? 0x66ccff : 0x99ddff;
    const sprayThickness = power === 'strong' ? 8 : 4;

    this.graphics.lineStyle(sprayThickness, sprayColor, 0.85);
    this.graphics.beginPath();
    this.graphics.moveTo(sprayOrigin.x, sprayOrigin.y);
    this.graphics.lineTo(
      sprayOrigin.x + aimDirection.x * sprayLength,
      sprayOrigin.y + aimDirection.y * sprayLength,
    );
    this.graphics.strokePath();
  }

  drawFires() {
    this.fires.forEach((fire) => {
      if (fire.isExtinguished) {
        return;
      }

      const radius = this.getFireRadius(fire);
      const hpRatio = fire.hp / fire.maxHp;

      this.graphics.fillStyle(0xff5a1f, 1);
      this.graphics.fillCircle(fire.x, fire.y, radius);

      this.graphics.fillStyle(0xffcc33, 0.8);
      this.graphics.fillCircle(fire.x, fire.y, radius * 0.55);

      this.graphics.lineStyle(2, 0x000000, 0.8);
      this.graphics.strokeCircle(fire.x, fire.y, radius);

      this.graphics.fillStyle(0x222222, 1);
      this.graphics.fillRect(fire.x - 24, fire.y - radius - 18, 48, 6);
      this.graphics.fillStyle(0xff3333, 1);
      this.graphics.fillRect(
        fire.x - 24,
        fire.y - radius - 18,
        48 * hpRatio,
        6,
      );
    });
  }

  getFireRadius(fire) {
    if (fire.size === 'small') return 18;
    if (fire.size === 'medium') return 28;
    if (fire.size === 'large') return 40;

    return 24;
  }

  createPlayerAnimations() {
    const frameCount = 6;
    const directions = [
      { key: 'face', row: 0 },
      { key: 'dos', row: 1 },
      { key: 'gauche', row: 2 },
      { key: 'droite', row: 3 },
      { key: 'diag-haut-gauche', row: 4 },
      { key: 'diag-haut-droite', row: 5 },
      { key: 'diag-bas-gauche', row: 6 },
      { key: 'diag-bas-droite', row: 7 },
    ];

    directions.forEach((direction) => {
      const animationKey = `pompier-${direction.key}`;
      const start = direction.row * frameCount;

      if (this.anims.exists(animationKey)) {
        this.anims.remove(animationKey);
      }

      this.anims.create({
        key: animationKey,
        frames: this.anims.generateFrameNumbers('pompier', {
          start,
          end: start + frameCount - 1,
        }),
        frameRate: 12,
        repeat: -1,
      });
    });
  }

  createFireAnimations() {
    if (!this.anims.exists('fire-small-burn')) {
      this.anims.create({
        key: 'fire-small-burn',
        frames: this.anims.generateFrameNumbers('fire-small', {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists('fire-large-burn')) {
      this.anims.create({
        key: 'fire-large-burn',
        frames: this.anims.generateFrameNumbers('fire-large', {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  handleInteractions(input) {
    if (!input.interactPressed) {
      return;
    }

    const playerPosition = this.player.getPosition();

    const supplyPoint = this.supplyPoints.find((point) => {
      return point.isPlayerInRange(playerPosition);
    });

    if (!supplyPoint) {
      return;
    }

    const result = supplyPoint.interact(this.resourceSystem);

    this.showInteractionFeedback(result.message);
  }

  showInteractionFeedback(message) {
    this.interactionFeedbackText.setText(message);

    this.time.delayedCall(1200, () => {
      this.interactionFeedbackText.setText('');
    });
  }

  checkEndConditions() {
    if (this.fires.every((fire) => fire.isExtinguished)) {
      this.scene.start('VictoryScene');
      return;
    }

    if (this.resourceSystem.oxygen <= 0) {
      this.scene.start('GameOverScene', {
        reason: 'oxygen',
        levelKey: 'Level1Scene',
      });
    }
  }
}

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
const SPRAY_WIDTH = 18;

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  preload() {
    this.load.image('level1-bg', 'assets/backgrounds/FaubourgDesEtincelles.png');

    this.load.image('texture_water', 'assets/sprites/water.png');
    this.load.image('texture_foam', 'assets/sprites/foam.png');
    this.load.image('texture_oxygen', 'assets/sprites/oxygen.png');

    this.load.spritesheet('fire-small', 'assets/sprites/fire_small.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet('fire-large', 'assets/sprites/fire_large.png', {
      frameWidth: 32,
      frameHeight: 45,
    });

    this.load.spritesheet('pompier', 'assets/sprites/Firefighter_v10_64.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.add.image(0, 0, 'level1-bg').setOrigin(0, 0);

    this.inputManager = new InputManager(this);
    this.resourceSystem = new ResourceSystem();
    this.extinguishSystem = new ExtinguishSystem();

    this.obstacles = level1Layout.obstacles || [];
    this.collisionSystem = new CollisionSystem(this.obstacles);

    this.createPlayerAnimations();
    this.createFireAnimations();

    this.player = new Player(
      this,
      level1Layout.playerSpawn.x,
      level1Layout.playerSpawn.y
    );

    this.fires = level1Layout.fires.map((fireData) => {
      const fire = new Fire({
        x: fireData.x,
        y: fireData.y,
        size: fireData.size,
        type: fireData.type,
      });

      const textureKey = fire.size === 'large' ? 'fire-large' : 'fire-small';
      const animKey = fire.size === 'large' ? 'fire-large-burn' : 'fire-small-burn';

      fire.sprite = this.add.sprite(fire.x, fire.y, textureKey, 0);
      fire.sprite.setDepth(2);
      fire.sprite.play(animKey);

      if (fire.size === 'small') {
        fire.sprite.setScale(1.2);
      } else if (fire.size === 'medium') {
        fire.sprite.setScale(1.35);
      } else if (fire.size === 'large') {
        fire.sprite.setScale(1.5);
      } else {
        fire.sprite.setScale(1.2);
      }

      return fire;
    });

    this.supplyPoints = (level1Layout.interactives || [])
      .filter((interactive) => interactive.type === 'water_refill')
      .map((interactive) => {
        return new SupplyPoint(this, {
          ...interactive,
          agent: 'water',
          amount: interactive.amount ?? 100,
          label: interactive.label || interactive.prompt || 'Recharger en eau',
        });
      });

    this.graphics = this.add.graphics();

    this.hud = new HudView(this);

    this.interactionFeedbackText = this.add.text(24, 704, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
    });
    this.interactionFeedbackText.setDepth(100);
    this.interactionFeedbackText.setVisible(false);

    this.helpText = this.add.text(
      24,
      728,
      'RT / Espace / Clic : jet faible | RB + RT / Shift : jet puissant',
      {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cccccc',
      },
    );
  }

  update(time, delta) {
    const input = this.inputManager.getState(this.player.getPosition());

    this.resourceSystem.update(delta);
    this.player.update(input, delta, this.collisionSystem);
    this.handleInteractions(input);

    this.graphics.clear();

    this.handleShooting(input, delta);
    this.drawFires();
    this.hud.update();

    this.checkEndConditions();
  }

  handleShooting(input, delta) {
    if (!input.isShooting) {
      return;
    }

    const power = input.isPowerJet ? 'strong' : 'weak';
    const activeAgent = this.resourceSystem.activeAgent;

    if (!this.resourceSystem.hasActiveResource()) {
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

    touchedFires.forEach((fire) => {
      this.extinguishSystem.applyJet({
        fire: fire,
        agent: activeAgent,
        power: power,
        delta: delta,
      });
    });
  }

getTouchedFires(sprayOrigin, aimDirection) {
  return this.fires.filter((fire) => {
    if (fire.isExtinguished) {
      return false;
    }

    const fireVectorX = fire.x - sprayOrigin.x;
    const fireVectorY = fire.y - sprayOrigin.y;

    const projection =
      fireVectorX * aimDirection.x +
      fireVectorY * aimDirection.y;

    if (projection < 0 || projection > SPRAY_RANGE) {
      return false;
    }

    const closestPointX = sprayOrigin.x + aimDirection.x * projection;
    const closestPointY = sprayOrigin.y + aimDirection.y * projection;

    const distanceToSpray = Phaser.Math.Distance.Between(
      fire.x,
      fire.y,
      closestPointX,
      closestPointY,
    );

    const fireHitRadius = fire.size === 'large' ? 16 : 12;

    return distanceToSpray <= SPRAY_WIDTH + fireHitRadius;
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
        if (fire.sprite) {
          fire.sprite.setVisible(false);
        }
        return;
      }

      if (fire.sprite) {
        fire.sprite.setVisible(true);
        fire.sprite.setPosition(fire.x, fire.y);
      }

      const radius = this.getFireRadius(fire);
      const hpRatio = fire.hp / fire.maxHp;

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
        frames: this.anims.generateFrameNumbers('fire-small', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists('fire-large-burn')) {
      this.anims.create({
        key: 'fire-large-burn',
        frames: this.anims.generateFrameNumbers('fire-large', { start: 0, end: 7 }),
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

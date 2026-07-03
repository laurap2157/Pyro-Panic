import * as Phaser from 'phaser';

import Player from '../objects/Player.js';
import Fire from '../objects/Fire.js';
import HudView from '../objects/HudView.js';
import SupplyPoint from '../objects/SupplyPoint.js';

import InputManager from '../systems/InputManager.js';
import ExtinguishSystem from '../systems/ExtinguishSystem.js';
import ResourceSystem from '../systems/ResourceSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import MusicManager from '../systems/MusicManager.js';

import { level1Layout } from '../data/Level1Layout.js';

const SPRAY_RANGE = 220;
const SPRAY_WIDTH = 18;

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  preload() {
    // =====================================================
    // 1. Background du niveau 1
    // =====================================================
    this.load.image('level1-bg', 'assets/backgrounds/FaubourgDesEtincelles.png');

    // =====================================================
    // 2. Textures du HUD
    // =====================================================
    this.load.image('texture_water', 'assets/sprites/water.png');
    this.load.image('texture_foam', 'assets/sprites/foam.png');
    this.load.image('texture_oxygen', 'assets/sprites/oxygen.png');

    // =====================================================
    // 3. Icônes d’aide aux contrôles
    // =====================================================
    this.load.image('btn-rt', 'assets/ui/xbox_360_RT.png');
    this.load.image('btn-rb', 'assets/ui/xbox_360_RB.png');
    this.load.image('btn-stick', 'assets/ui/xbox_360_joystick.png');
    this.load.image('btn-a', 'assets/ui/xbox_360_A.png');
    this.load.image('btn-y', 'assets/ui/xbox_360_Y.png');

    // =====================================================
    // 4. Spritesheets des feux
    // =====================================================
    this.load.spritesheet('fire-small', 'assets/sprites/fire_small.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet('fire-large', 'assets/sprites/fire_large.png', {
      frameWidth: 32,
      frameHeight: 45,
    });

    // =====================================================
    // 5. Spritesheet du pompier
    // =====================================================
    this.load.spritesheet('pompier', 'assets/sprites/Firefighter_v10_64.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    // =====================================================
    // 1. Musique du niveau 1
    // =====================================================
    MusicManager.play(this, 'music-level-faubourg', {
      volume: 0.52,
      fadeDuration: 1000,
    });

    // =====================================================
    // 2. Background
    // =====================================================
    this.add.image(0, 0, 'level1-bg').setOrigin(0, 0);

    // =====================================================
    // 3. Initialisation des systèmes de gameplay
    // =====================================================
    this.inputManager = new InputManager(this);
    this.resourceSystem = new ResourceSystem();
    this.extinguishSystem = new ExtinguishSystem();

    this.obstacles = level1Layout.obstacles || [];
    this.collisionSystem = new CollisionSystem(this.obstacles);

    // =====================================================
    // 4. Création des animations
    // =====================================================
    this.createPlayerAnimations();
    this.createFireAnimations();

    // =====================================================
    // 5. Création du joueur depuis le layout
    // =====================================================
    this.player = new Player(
      this,
      level1Layout.playerSpawn.x,
      level1Layout.playerSpawn.y
    );

    // =====================================================
    // 6. Création des feux depuis le layout
    // =====================================================
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

    // =====================================================
    // 7. Création des points d’approvisionnement
    // =====================================================
    // Le niveau 1 ne transforme que les interactifs water_refill
    // en points de recharge d’eau.
    // Il ne propose pas la mousse.
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

    // =====================================================
    // 8. Rendu dynamique principal
    // =====================================================
    this.graphics = this.add.graphics();

    // =====================================================
    // 9. HUD
    // =====================================================
    this.hud = new HudView(this);

    // =====================================================
    // 10. Feedback d’interaction
    // =====================================================
    this.interactionFeedbackText = this.add.text(24, 704, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    });

    this.interactionFeedbackText.setDepth(100);
    this.interactionFeedbackText.setVisible(false);

    // =====================================================
    // 11. Aide visuelle aux contrôles
    // =====================================================
    this.createControlHints();

    // =====================================================
    // 12. Bulle d’alerte eau faible
    // =====================================================
    this.lowWaterWarningVisible = false;
    this.createLowWaterBubble();
  }

  update(time, delta) {
    // =====================================================
    // 1. Lecture des inputs
    // =====================================================
    const input = this.inputManager.getState(this.player.getPosition());

    // =====================================================
    // 2. Mise à jour des systèmes principaux
    // =====================================================
    this.resourceSystem.update(delta);

    // =====================================================
    // 3. Mise à jour du joueur et des interactions
    // =====================================================
    this.player.update(input, delta, this.collisionSystem);
    this.handleInteractions(input);

    // =====================================================
    // 4. Nettoyage du rendu dynamique
    // =====================================================
    this.graphics.clear();

    // =====================================================
    // 5. Gameplay de tir
    // =====================================================
    this.handleShooting(input, delta);

    // =====================================================
    // 6. Affichage des feux et du HUD
    // =====================================================
    this.drawFires();
    this.hud.update();

    // =====================================================
    // 7. Alerte eau faible
    // =====================================================
    this.updateLowWaterBubble();

    // =====================================================
    // 8. Conditions de fin
    // =====================================================
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

    // La ressource est consommée dès que le joueur projette l’agent actif,
    // même si aucun feu n’est touché.
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
    this.interactionFeedbackText.setVisible(true);

    this.time.delayedCall(1200, () => {
      this.interactionFeedbackText.setText('');
      this.interactionFeedbackText.setVisible(false);
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

  createControlHints() {
    const y = 728;

    const textStyle = {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#cccccc',
    };

    const createBuilder = (startX) => {
      let currentX = startX;

      const addIcon = (key, width = 32, scale = 0.85, offsetY = 9) => {
        const icon = this.add.image(currentX, y + offsetY, key).setOrigin(0, 0.5);
        icon.setScale(scale);
        icon.setDepth(100);
        currentX += width;
      };

      const addText = (content, gap = 0) => {
        const text = this.add.text(currentX, y, content, textStyle);
        text.setDepth(100);
        currentX += text.width + gap;
      };

      return { addIcon, addText };
    };

    const left = createBuilder(24);
    left.addIcon('btn-stick', 32, 0.9);
    left.addText(' : se déplacer   ', 8);

    left.addIcon('btn-a', 32, 0.85);
    left.addText(' : recharger en eau', 8);

    const right = createBuilder(860);
    right.addIcon('btn-rt', 32, 0.85);
    right.addText(' : jet faible   ', 8);

    right.addIcon('btn-rb', 36, 1.1);
    right.addText(' + ', 3);
    right.addIcon('btn-rt', 32, 0.85);
    right.addText(' : jet puissant');
  }

  createLowWaterBubble() {
    this.lowWaterBubble = this.add.graphics();
    this.lowWaterBubble.setDepth(120);
    this.lowWaterBubble.setVisible(false);

    this.lowWaterText = this.add.text(0, 0, 'Eau faible !\nRetour au camion !', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#1a1a1a',
      align: 'center',
      lineSpacing: 2,
    });

    this.lowWaterText.setOrigin(0.5);
    this.lowWaterText.setDepth(121);
    this.lowWaterText.setVisible(false);
  }

  shouldShowLowWaterBubble() {
    if (this.resourceSystem.activeAgent !== 'water') {
      return false;
    }

    if (this.lowWaterWarningVisible) {
      return this.resourceSystem.waterReserve <= 35;
    }

    return this.resourceSystem.waterReserve <= 25;
  }

  updateLowWaterBubble() {
    this.lowWaterWarningVisible = this.shouldShowLowWaterBubble();

    if (!this.lowWaterWarningVisible) {
      this.lowWaterBubble.clear();
      this.lowWaterBubble.setVisible(false);
      this.lowWaterText.setVisible(false);
      return;
    }

    const playerPosition = this.player.getPosition();
    const bubbleCenterX = playerPosition.x;
    const bubbleCenterY = playerPosition.y - 78;

    this.lowWaterText.setText('Eau faible !\nRetour au camion !');
    this.lowWaterText.setPosition(bubbleCenterX, bubbleCenterY);
    this.lowWaterText.setVisible(true);

    const bounds = this.lowWaterText.getBounds();
    const paddingX = 10;
    const paddingY = 8;
    const tailHeight = 10;
    const tailHalfWidth = 8;

    const rectX = bounds.x - paddingX;
    const rectY = bounds.y - paddingY;
    const rectWidth = bounds.width + paddingX * 2;
    const rectHeight = bounds.height + paddingY * 2;
    const tailBaseY = rectY + rectHeight;

    this.lowWaterBubble.clear();
    this.lowWaterBubble.setVisible(true);

    this.lowWaterBubble.fillStyle(0xf8f1cf, 0.96);
    this.lowWaterBubble.lineStyle(2, 0x3a2f1f, 1);

    this.lowWaterBubble.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, 8);
    this.lowWaterBubble.strokeRoundedRect(rectX, rectY, rectWidth, rectHeight, 8);

    this.lowWaterBubble.fillTriangle(
      bubbleCenterX - tailHalfWidth, tailBaseY,
      bubbleCenterX + tailHalfWidth, tailBaseY,
      bubbleCenterX, tailBaseY + tailHeight
    );

    this.lowWaterBubble.lineBetween(
      bubbleCenterX - tailHalfWidth, tailBaseY,
      bubbleCenterX, tailBaseY + tailHeight
    );

    this.lowWaterBubble.lineBetween(
      bubbleCenterX + tailHalfWidth, tailBaseY,
      bubbleCenterX, tailBaseY + tailHeight
    );
  }
}
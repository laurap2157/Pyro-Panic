import * as Phaser from 'phaser';

import Player from '../objects/Player.js';
import Fire from '../objects/Fire.js';
import Door from '../objects/Door.js';
import HudView from '../objects/HudView.js';
import SupplyPoint from '../objects/SupplyPoint.js';

import InputManager from '../systems/InputManager.js';
import ExtinguishSystem from '../systems/ExtinguishSystem.js';
import ResourceSystem from '../systems/ResourceSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';

import { level2Layout } from '../data/Level2Layout.js';

const SPRAY_RANGE = 220;
const SPRAY_WIDTH = 18;

export default class Level2Scene extends Phaser.Scene {
  constructor() {
    super('Level2Scene');
  }

  preload() {
    // =====================================================
    // 1. Background du niveau 2
    // =====================================================
    this.load.image('level2-bg', 'assets/backgrounds/LeManoirAuxPortesRouges.png');

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
    // 4. Sprite de porte ouverte
    // =====================================================
    // Les portes fermées sont déjà dessinées dans le background.
    // On ne charge donc que le sprite de porte ouverte à afficher
    // après inspection puis arrosage de la bonne porte.
    this.load.image('open_door', 'assets/sprites/open_red_door.png');

    // =====================================================
    // 5. Spritesheets des feux
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
    // 6. Spritesheet du pompier
    // =====================================================
    this.load.spritesheet('pompier', 'assets/sprites/Firefighter_v10_64.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    // =====================================================
    // 1. Background
    // =====================================================
    this.add.image(0, 0, 'level2-bg').setOrigin(0, 0);

    // =====================================================
    // 2. Initialisation des systèmes de gameplay
    // =====================================================
    this.inputManager = new InputManager(this);
    this.resourceSystem = new ResourceSystem();
    this.extinguishSystem = new ExtinguishSystem();

    this.obstacles = level2Layout.obstacles || [];
    this.collisionSystem = new CollisionSystem(this.obstacles);

    // =====================================================
    // 3. Création des animations
    // =====================================================
    this.createPlayerAnimations();
    this.createFireAnimations();

    // =====================================================
    // 4. Création du joueur depuis le layout
    // =====================================================
    this.player = new Player(
      this,
      level2Layout.playerSpawn.x,
      level2Layout.playerSpawn.y
    );

    // =====================================================
    // 5. Création des feux visibles dès le départ
    // =====================================================
    this.visibleFires = (level2Layout.fires || []).map((fireData) => {
      return this.createFireFromData(fireData, {
        isHidden: false,
        isRevealed: true,
      });
    });

    // =====================================================
    // 6. Création des feux cachés
    // =====================================================
    // Ces feux existent en mémoire, mais ne sont pas visibles
    // et ne peuvent pas prendre de dégâts tant qu’ils ne sont pas révélés.
    this.hiddenFires = (level2Layout.hiddenFires || []).map((fireData) => {
      return this.createFireFromData(fireData, {
        isHidden: true,
        isRevealed: false,
      });
    });

    // =====================================================
    // 7. Liste globale des feux
    // =====================================================
    this.fires = [
      ...this.visibleFires,
      ...this.hiddenFires,
    ];

    // =====================================================
    // 8. Création des portes logiques
    // =====================================================
    // Les portes fermées sont celles du background.
    // Door.js ne dessine donc aucune porte fermée.
    // Une seule porte possède un sprite open_door caché,
    // aligné sur la porte fermée du décor.
    this.doors = (level2Layout.doors || []).map((doorData) => {
      return new Door(this, doorData);
    });

    // =====================================================
    // 9. Création des points d’approvisionnement
    // =====================================================
    // Niveau 2 : recharge en eau autour du bassin.
    // Pas de mousse pour le moment.
    this.supplyPoints = (level2Layout.interactives || [])
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
    // 10. Rendu dynamique principal
    // =====================================================
    // Deux calques séparés évitent les chevauchements gênants :
    // - les barres de vie restent au-dessus des sprites ;
    // - le jet reste au-dessus des portes, des feux et des barres.
    this.fireGraphics = this.add.graphics();
    this.fireGraphics.setDepth(85);

    this.sprayGraphics = this.add.graphics();
    this.sprayGraphics.setDepth(95);

    // Alias conservé par sécurité si du code temporaire l’utilise encore.
    this.graphics = this.fireGraphics;

    // =====================================================
    // 11. HUD
    // =====================================================
    this.hud = new HudView(this);

    // =====================================================
    // 12. Feedback d’interaction
    // =====================================================
    this.interactionFeedbackText = this.add.text(24, 704, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    });

    this.interactionFeedbackText.setDepth(100);
    this.interactionFeedbackText.setVisible(false);

    this.feedbackTimer = null;

    // =====================================================
    // 13. Aide visuelle aux contrôles
    // =====================================================
    this.createControlHints();
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
    this.fireGraphics.clear();
    this.sprayGraphics.clear();

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
    // 7. Conditions de fin
    // =====================================================
    this.checkEndConditions();
  }

  createFireFromData(fireData, options = {}) {
    const fire = new Fire({
      x: fireData.x,
      y: fireData.y,
      size: fireData.size,
      type: fireData.type,
    });

    fire.id = fireData.id || null;
    fire.doorId = fireData.doorId || null;
    fire.isHidden = options.isHidden || false;
    fire.isRevealed = options.isRevealed ?? !fire.isHidden;

    const textureKey = fire.size === 'large' ? 'fire-large' : 'fire-small';
    const animKey = fire.size === 'large' ? 'fire-large-burn' : 'fire-small-burn';

    fire.sprite = this.add.sprite(fire.x, fire.y, textureKey, 0);

    // Les feux cachés doivent apparaître devant la porte ouverte
    // une fois révélés. Les feux visibles gardent leur profondeur
    // habituelle pour limiter les effets de bord sur le décor.
    fire.sprite.setDepth(fire.isHidden ? 12 : 3);
    fire.sprite.play(animKey);
    fire.sprite.setVisible(fire.isRevealed);

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

    // Une porte ne peut réagir au jet que si elle a été inspectée avant.
    this.handleDoorSpray(sprayOrigin, aimDirection);

    const touchedFires = this.getTouchedFires(sprayOrigin, aimDirection);

    if (touchedFires.length === 0) {
      return;
    }

    touchedFires.forEach((fire) => {
      this.extinguishSystem.applyJet({
        fire,
        agent: activeAgent,
        power,
        delta,
      });
    });
  }

  handleDoorSpray(sprayOrigin, aimDirection) {
    const touchedDoor = this.doors.find((door) => {
      return (
        door.isInspected &&
        door.canReactToSpray(sprayOrigin, aimDirection, SPRAY_RANGE, SPRAY_WIDTH)
      );
    });

    if (!touchedDoor) {
      return;
    }

    const result = touchedDoor.openAfterSpray();

    if (!result.success) {
      return;
    }

    if (result.revealedHiddenFire && result.hiddenFireId) {
      this.revealHiddenFire(result.hiddenFireId);
    }

    this.showInteractionFeedback(result.message);
  }

  revealHiddenFire(hiddenFireId) {
    const hiddenFire = this.hiddenFires.find((fire) => {
      return fire.id === hiddenFireId;
    });

    if (!hiddenFire) {
      return;
    }

    hiddenFire.isRevealed = true;

    if (hiddenFire.sprite) {
      hiddenFire.sprite.setDepth(12);
      hiddenFire.sprite.setVisible(true);
      hiddenFire.sprite.setAlpha(1);
    }
  }

  getTouchedFires(sprayOrigin, aimDirection) {
    return this.getActiveFires().filter((fire) => {
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

  getActiveFires() {
    return this.fires.filter((fire) => {
      return !fire.isHidden || fire.isRevealed;
    });
  }

  drawSpray(sprayOrigin, aimDirection, power) {
    const sprayLength = power === 'strong' ? SPRAY_RANGE : SPRAY_RANGE * 0.75;
    const sprayColor = power === 'strong' ? 0x66ccff : 0x99ddff;
    const sprayThickness = power === 'strong' ? 8 : 4;

    this.sprayGraphics.lineStyle(sprayThickness, sprayColor, 0.85);
    this.sprayGraphics.beginPath();
    this.sprayGraphics.moveTo(sprayOrigin.x, sprayOrigin.y);
    this.sprayGraphics.lineTo(
      sprayOrigin.x + aimDirection.x * sprayLength,
      sprayOrigin.y + aimDirection.y * sprayLength,
    );
    this.sprayGraphics.strokePath();
  }

  drawFires() {
    this.fires.forEach((fire) => {
      if (fire.isHidden && !fire.isRevealed) {
        if (fire.sprite) {
          fire.sprite.setVisible(false);
        }

        return;
      }

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

      this.fireGraphics.fillStyle(0x222222, 1);
      this.fireGraphics.fillRect(fire.x - 24, fire.y - radius - 18, 48, 6);

      this.fireGraphics.fillStyle(0xff3333, 1);
      this.fireGraphics.fillRect(
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
    // =====================================================
    // 1. Inspection des portes
    // =====================================================
    // Clavier : F.
    // Manette : X.
    if (input.inspectPressed) {
      this.inspectNearestDoor();
    }

    // =====================================================
    // 2. Recharge en eau
    // =====================================================
    // Clavier : E.
    // Manette : A.
    if (input.interactPressed) {
      this.useNearestSupplyPoint();
    }
  }

  inspectNearestDoor() {
    const playerPosition = this.player.getPosition();
    const nearestDoor = this.findNearestDoorInRange(playerPosition);

    if (!nearestDoor) {
      return;
    }

    const result = nearestDoor.inspect();

    this.showInteractionFeedback(result.message);
  }

  findNearestDoorInRange(playerPosition) {
    const doorsInRange = this.doors.filter((door) => {
      return door.isPlayerInRange(playerPosition);
    });

    if (doorsInRange.length === 0) {
      return null;
    }

    doorsInRange.sort((doorA, doorB) => {
      const distanceA = Phaser.Math.Distance.Between(
        playerPosition.x,
        playerPosition.y,
        doorA.x,
        doorA.y
      );

      const distanceB = Phaser.Math.Distance.Between(
        playerPosition.x,
        playerPosition.y,
        doorB.x,
        doorB.y
      );

      return distanceA - distanceB;
    });

    return doorsInRange[0];
  }

  useNearestSupplyPoint() {
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

    if (this.feedbackTimer) {
      this.feedbackTimer.remove(false);
    }

    this.feedbackTimer = this.time.delayedCall(1400, () => {
      this.interactionFeedbackText.setText('');
      this.interactionFeedbackText.setVisible(false);
      this.feedbackTimer = null;
    });
  }

  checkEndConditions() {
    const visibleFiresExtinguished = this.visibleFires.every((fire) => {
      return fire.isExtinguished;
    });

    const allDoorsInspected = this.doors.every((door) => {
      return door.isInspected;
    });

    const hiddenDoor = this.doors.find((door) => {
      return door.hasHiddenFire;
    });

    const hiddenFire = this.hiddenFires.find((fire) => {
      return fire.doorId === hiddenDoor?.id;
    });

    const hiddenDoorIdentifiedAndOpened =
      hiddenDoor &&
      hiddenDoor.isInspected &&
      hiddenDoor.hasRevealedFire;

    const hiddenFireExtinguished =
      hiddenFire &&
      hiddenFire.isRevealed &&
      hiddenFire.isExtinguished;

    if (
      visibleFiresExtinguished &&
      allDoorsInspected &&
      hiddenDoorIdentifiedAndOpened &&
      hiddenFireExtinguished
    ) {
      this.scene.start('VictoryScene');
      return;
    }

    if (this.resourceSystem.oxygen <= 0) {
      this.scene.start('GameOverScene', {
        reason: 'oxygen',
        levelKey: 'Level2Scene',
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
    left.addText(' : recharger   ', 8);

    left.addText('F / X : inspecter', 8);

    const right = createBuilder(890);
    right.addIcon('btn-rt', 32, 0.85);
    right.addText(' : jet faible   ', 8);

    right.addIcon('btn-rb', 36, 1.1);
    right.addText(' + ', 3);
    right.addIcon('btn-rt', 32, 0.85);
    right.addText(' : jet puissant');
  }
}

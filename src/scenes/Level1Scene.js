import * as Phaser from 'phaser';

import Player from '../objects/Player.js';
import Fire from '../objects/Fire.js';
import HudView from '../objects/HudView.js';

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
    this.load.image('level1-bg', 'assets/backgrounds/FaubourgDesEtincelles.png');

    // Textures utilisées par le HUD actuel.
    // On garde ce preload local pour l’instant, tant que la liste d’assets n’est pas figée.
    this.load.image('texture_water', 'assets/sprites/water.png');
    this.load.image('texture_foam', 'assets/sprites/foam.png');
    this.load.image('texture_oxygen', 'assets/sprites/oxygen.png');
  }

  create() {
    // =====================================================
    // 1. Background du niveau 1
    // =====================================================
    // Le projet est désormais calé sur les assets en 1376 × 768.
    // On affiche donc l’image à sa taille native, sans conversion de coordonnées.
    this.add.image(0, 0, 'level1-bg').setOrigin(0, 0);

    // =====================================================
    // 2. Initialisation des systèmes
    // =====================================================
    this.inputManager = new InputManager(this);
    this.resourceSystem = new ResourceSystem();
    this.extinguishSystem = new ExtinguishSystem();

    // Les obstacles viennent du fichier fourni par le dev décor/layout.
    // Convention : x/y = coin haut-gauche, width/height = dimensions du rectangle bloquant.
    this.obstacles = level1Layout.obstacles || [];
    this.collisionSystem = new CollisionSystem(this.obstacles);

    // =====================================================
    // 3. Initialisation du joueur depuis le layout
    // =====================================================
    this.player = new Player(
      this,
      level1Layout.playerSpawn.x,
      level1Layout.playerSpawn.y
    );

    // =====================================================
    // 4. Initialisation des feux depuis le layout
    // =====================================================
    this.fires = level1Layout.fires.map((fireData) => {
      return new Fire({
        x: fireData.x,
        y: fireData.y,
        size: fireData.size,
        type: fireData.type,
      });
    });

    // =====================================================
    // 5. Rendu temporaire et HUD
    // =====================================================
    this.graphics = this.add.graphics();

    this.hud = new HudView(this);

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
    // =====================================================
    // 1. Lecture des inputs
    // =====================================================
    const input = this.inputManager.getState(this.player.getPosition());

    // =====================================================
    // 2. Mise à jour des systèmes principaux
    // =====================================================
    this.resourceSystem.update(delta);

    // Le joueur reçoit maintenant le CollisionSystem.
    // Il ne peut donc plus traverser les obstacles fournis par Level1Layout.
    this.player.update(input, delta, this.collisionSystem);

    // =====================================================
    // 3. Nettoyage du rendu temporaire
    // =====================================================
    this.graphics.clear();

    // =====================================================
    // 4. Gameplay de tir
    // =====================================================
    this.handleShooting(input, delta);

    // =====================================================
    // 5. Affichage monde / HUD
    // =====================================================
    this.drawFires();
    this.hud.update();

    // =====================================================
    // 6. Conditions de fin
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

      return distanceToSpray <= SPRAY_WIDTH;
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
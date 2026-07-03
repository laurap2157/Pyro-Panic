import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';
import MusicManager from '../systems/MusicManager.js';

export default class BriefingScene extends Phaser.Scene {
  constructor() {
    super('BriefingScene');
  }

  create() {
    // =====================================================
    // 1. Récupération du niveau courant
    // =====================================================
    this.level = levels.find(level => level.id === gameState.currentLevelId);

    if (!this.level) {
      this.scene.start('WorldMapScene');
      return;
    }

    // =====================================================
    // 2. Musique de navigation / briefing
    // =====================================================
    MusicManager.play(this, 'music-map', {
      volume: 0.48,
      fadeDuration: 900,
    });

    // =====================================================
    // 3. Interface de briefing
    // =====================================================
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

    this.ui.addHint('A / Start / Entrée / Espace : lancer la mission');

    // =====================================================
    // 4. Inputs
    // =====================================================
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
    // =====================================================
    // 1. Garde anti-maintien
    // =====================================================
    this.inputGuard.updateReleaseState();

    // =====================================================
    // 2. Lancement de la mission
    // =====================================================
    if (this.inputGuard.isPressed()) {
      this.scene.start(this.level.key);
    }

    // =====================================================
    // 3. Fin de frame
    // =====================================================
    this.inputGuard.endFrame();
  }
}
import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';
import ScreenView from '../objects/ScreenView.js';
import MusicManager from '../systems/MusicManager.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    // =====================================================
    // 1. Mise à jour de la progression
    // =====================================================
    gameState.setLastResult('victory');
    gameState.unlockNextLevel();

    // =====================================================
    // 2. Musique de navigation / résultat
    // =====================================================
    MusicManager.play(this, 'music-map', {
      volume: 0.48,
      fadeDuration: 900,
    });

    // =====================================================
    // 3. Interface de victoire
    // =====================================================
    this.ui = new ScreenView(this);

    this.ui.drawBackground({
      accentColor: 0xffcc66,
      dangerColor: 0x2d4a31,
    });

    this.ui.drawPanel(
      this.ui.centerX - 390,
      185,
      780,
      320,
      {
        fillColor: 0x13201a,
        strokeColor: 0xffcc66,
      }
    );

    this.ui.addSubtitle('INTERVENTION TERMINÉE', 235, {
      fontSize: '24px',
      color: '#ffcc66',
    });

    this.ui.addTitle('INCENDIE MAÎTRISÉ', 315, {
      fontSize: '52px',
      color: '#ffffff',
    });

    this.ui.addBody(
      'Le secteur est sécurisé. La progression de l’équipe est enregistrée.',
      this.ui.centerX,
      405,
      680,
      {
        fontSize: '22px',
        color: '#d8ffd8',
      }
    );

    this.ui.addHint('A / Start / Entrée / Espace : retour carte');

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
    // 2. Retour carte
    // =====================================================
    if (this.inputGuard.isPressed()) {
      this.scene.start('WorldMapScene');
    }

    // =====================================================
    // 3. Fin de frame
    // =====================================================
    this.inputGuard.endFrame();
  }
}
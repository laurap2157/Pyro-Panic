import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    create() {
        // On enregistre la victoire dans l’état global.
        gameState.setLastResult('victory');

        // On débloque le niveau suivant.
        // Exemple : après le niveau 1, le niveau 2 devient disponible sur la carte.
        gameState.unlockNextLevel();

        this.add.text(640, 260, 'Incendie maîtrisé', {
            fontFamily: 'monospace',
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 340, 'Relâchez les touches, puis appuyez sur A / Entrée pour continuer', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Important :
        // On ne met pas SPACE ici.
        // Espace sert déjà au tir dans Level1Scene.
        // L’utiliser aussi comme validation d’écran peut provoquer un skip automatique.
        this.continueKeys = this.input.keyboard.addKeys({
            enter: 'ENTER'
        });

        // MenuInputGuard bloque la validation tant que les touches/boutons
        // ne sont pas relâchés, puis accepte seulement un nouvel appui.
        this.inputGuard = new MenuInputGuard(
            this,
            this.continueKeys,
            [0, 9] // A, Start
        );
    }

    update() {
        this.inputGuard.updateReleaseState();

        if (this.inputGuard.isPressed()) {
            this.scene.start('WorldMapScene');
        }

        this.inputGuard.endFrame();
    }
}
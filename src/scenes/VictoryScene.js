import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    create() {
        // =====================================================
        // 1. Mise à jour de l'état global après victoire
        // =====================================================
        // On enregistre que le dernier niveau joué a été réussi.
        gameState.setLastResult('victory');

        // On débloque le niveau suivant à partir du niveau courant.
        // Exemple : si currentLevelId vaut 1, le niveau 2 devient accessible.
        gameState.unlockNextLevel();

        // =====================================================
        // 2. Affichage de l'écran de victoire
        // =====================================================
        this.add.text(640, 260, 'Incendie maîtrisé', {
            fontFamily: 'monospace',
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 340, 'Relâchez les touches, puis appuyez sur A / Start / Entrée / Espace pour continuer', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#cccccc'
        }).setOrigin(0.5);

        // =====================================================
        // 3. Inputs de validation
        // =====================================================
        // On rétablit SPACE comme touche de validation pour garder la cohérence
        // avec les autres écrans de menu.
        //
        // La sécurité anti-skip est désormais assurée par MenuInputGuard :
        // - délai court au démarrage ;
        // - attente du relâchement complet ;
        // - validation uniquement sur nouvel appui.
        this.continueKeys = this.input.keyboard.addKeys({
            space: 'SPACE',
            enter: 'ENTER'
        });

        this.inputGuard = new MenuInputGuard(
            this,
            this.continueKeys,
            [0, 9] // A, Start
        );
    }

    update() {
        // On met à jour l'état du garde d'input.
        // Tant que les touches/boutons surveillés ne sont pas relâchés,
        // isPressed() restera bloqué.
        this.inputGuard.updateReleaseState();

        // Une fois les inputs relâchés, un nouvel appui permet de revenir à la carte.
        if (this.inputGuard.isPressed()) {
            this.scene.start('WorldMapScene');
        }

        // On mémorise l'état courant des touches/boutons pour détecter
        // correctement les nouveaux appuis à la frame suivante.
        this.inputGuard.endFrame();
    }
}
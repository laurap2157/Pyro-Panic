import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';

// Petit délai de sécurité au démarrage de l'écran.
// Il évite qu'une touche maintenue dans Level1Scene,
// notamment Espace utilisé pour tirer, valide immédiatement VictoryScene.
const INPUT_LOCK_DELAY = 250;

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

        this.continueKeys = this.input.keyboard.addKeys({
            enter: 'ENTER'
        });

        // Au démarrage de VictoryScene, on interdit la validation.
        // La scène devra d'abord attendre :
        // 1. la fin du petit délai de sécurité ;
        // 2. le relâchement des touches / boutons ;
        // 3. un nouvel appui volontaire.
        this.canContinue = false;

        // Moment à partir duquel la scène a le droit de commencer
        // à regarder si les inputs sont relâchés.
        this.inputUnlockTime = this.time.now + INPUT_LOCK_DELAY;

        // Sert à détecter un nouvel appui manette.
        this.previousGamepadButtons = {};
    }

    update() {
        // Étape 0 : on ignore totalement les validations pendant un court délai.
        // C'est ce qui corrige le cas où Espace est encore maintenu au moment
        // du passage de Level1Scene vers VictoryScene.
        if (this.time.now < this.inputUnlockTime) {
            this.saveCurrentGamepadButtons();
            return;
        }

        // Étape 1 : attendre que toutes les touches / boutons soient relâchés.
        if (!this.canContinue) {
            if (this.areContinueInputsReleased()) {
                this.canContinue = true;
                this.saveCurrentGamepadButtons();
            }

            return;
        }

        // Étape 2 : accepter uniquement un nouvel appui volontaire.
        if (this.isContinuePressed()) {
            this.scene.start('WorldMapScene');
        }

        this.saveCurrentGamepadButtons();
    }

    areContinueInputsReleased() {
      const keyboardReleased =
          !this.continueKeys.enter.isDown;

        const gamepadReleased =
            !this.isGamepadButtonDown(0) && // A
            !this.isGamepadButtonDown(9);  // Start

        return keyboardReleased && gamepadReleased;
    }

    isContinuePressed() {
        const keyboardPressed =
            Phaser.Input.Keyboard.JustDown(this.continueKeys.enter);

        const gamepadPressed =
            this.wasGamepadButtonPressed(0) || // A
            this.wasGamepadButtonPressed(9);   // Start

        return keyboardPressed || gamepadPressed;
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
            0: this.isGamepadButtonDown(0), // A
            9: this.isGamepadButtonDown(9)  // Start
        };
    }
}
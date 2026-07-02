import * as Phaser from 'phaser';

import gameState from '../systems/GameState.js';

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
            space: 'SPACE',
            enter: 'ENTER'
        });

        // On bloque d'abord la validation.
        // Cela évite que le tir maintenu dans le niveau précédent
        // valide automatiquement l’écran de victoire.
        this.canContinue = false;

        // Sert à détecter un nouvel appui manette.
        this.previousGamepadButtons = {};
    }

    update() {
        // Étape 1 : attendre que toutes les touches/boutons soient relâchés.
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
            !this.continueKeys.space.isDown &&
            !this.continueKeys.enter.isDown;

        const gamepadReleased =
            !this.isGamepadButtonDown(0) && // A
            !this.isGamepadButtonDown(9);  // Start

        return keyboardReleased && gamepadReleased;
    }

    isContinuePressed() {
        const keyboardPressed =
            Phaser.Input.Keyboard.JustDown(this.continueKeys.space) ||
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
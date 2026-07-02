import * as Phaser from 'phaser';

import tips from '../data/tips.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        // Raison du game over.
        // Exemple : oxygen, weak_on_large, fuel_fire, etc.
        this.reason = data?.reason || 'default';

        // Niveau à relancer.
        // Level1Scene transmet déjà levelKey.
        // Si rien n'est transmis, on retombe sur Level1Scene pour l'étape 1.
        this.levelKey = data?.levelKey || 'Level1Scene';

        const tipData = tips[this.reason] || tips.default;

        this.add.text(640, 180, 'GAME OVER', {
            fontFamily: 'monospace',
            fontSize: '56px',
            color: '#ff5555'
        }).setOrigin(0.5);

        this.add.text(640, 270, `Cause : ${tipData.cause}`, {
            fontFamily: 'monospace',
            fontSize: '26px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 330, tipData.explanation, {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 410, `Astuce : ${tipData.tip}`, {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#ffcc66',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 560, 'Relâchez les touches, puis appuyez sur R / Y pour recommencer', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Touches de recommencement.
        this.restartKeys = this.input.keyboard.addKeys({
            r: 'R',
            space: 'SPACE',
            enter: 'ENTER'
        });

        // On bloque d'abord la validation.
        // Cela évite que l'écran soit skippé par une touche encore maintenue.
        this.canRestart = false;

        // Sert à détecter un nouvel appui manette.
        this.previousGamepadButtons = {};
    }

    update() {
        // Étape 1 : attendre que les touches/boutons soient relâchés.
        if (!this.canRestart) {
            if (this.areRestartInputsReleased()) {
                this.canRestart = true;
                this.saveCurrentGamepadButtons();
            }

            return;
        }

        // Étape 2 : accepter seulement un nouvel appui.
        if (this.isRestartPressed()) {
            this.scene.start(this.levelKey);
        }

        this.saveCurrentGamepadButtons();
    }

    areRestartInputsReleased() {
        const keyboardReleased =
            !this.restartKeys.r.isDown &&
            !this.restartKeys.space.isDown &&
            !this.restartKeys.enter.isDown;

        const gamepadReleased =
            !this.isGamepadButtonDown(3) && // Y
            !this.isGamepadButtonDown(8);  // View

        return keyboardReleased && gamepadReleased;
    }

    isRestartPressed() {
        const keyboardPressed =
            Phaser.Input.Keyboard.JustDown(this.restartKeys.r) ||
            Phaser.Input.Keyboard.JustDown(this.restartKeys.space) ||
            Phaser.Input.Keyboard.JustDown(this.restartKeys.enter);

        const gamepadPressed =
            this.wasGamepadButtonPressed(3) || // Y
            this.wasGamepadButtonPressed(8);   // View

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
            3: this.isGamepadButtonDown(3), // Y
            8: this.isGamepadButtonDown(8)  // View
        };
    }
}
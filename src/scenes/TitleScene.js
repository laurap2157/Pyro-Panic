import * as Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        this.add.text(640, 250, 'PYRO PANIC', {
            fontFamily: 'monospace',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 320, "Devil's Spark", {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ffcc66'
        }).setOrigin(0.5);

        this.add.text(640, 470, 'Appuyez sur A / Start / Entrée / Espace', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Touches clavier acceptées sur l'écran titre.
        this.startKeys = this.input.keyboard.addKeys({
            space: 'SPACE',
            enter: 'ENTER'
        });

        // Sert à détecter un nouvel appui manette.
        // On évite ainsi les validations parasites.
        this.previousGamepadButtons = {};
    }

    update() {
        if (this.isStartPressed()) {
            this.scene.start('WorldMapScene');
        }

        this.saveCurrentGamepadButtons();
    }

    isStartPressed() {
        const keyboardPressed =
            Phaser.Input.Keyboard.JustDown(this.startKeys.space) ||
            Phaser.Input.Keyboard.JustDown(this.startKeys.enter);

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
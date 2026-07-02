import * as Phaser from 'phaser';

export default class MenuInputGuard {
    constructor(scene, keyboardKeys = {}, gamepadButtons = []) {
        this.scene = scene;

        this.keyboardKeys = keyboardKeys;
        this.gamepadButtons = gamepadButtons;

        this.canValidate = false;
        this.previousGamepadButtons = {};

        this.saveCurrentGamepadButtons();
    }

    updateReleaseState() {
        if (this.canValidate) {
            return;
        }

        if (this.areInputsReleased()) {
            this.canValidate = true;
            this.saveCurrentGamepadButtons();
        }
    }

    canUseValidation() {
        return this.canValidate;
    }

    isPressed() {
        if (!this.canValidate) {
            return false;
        }

        const keyboardPressed = Object.values(this.keyboardKeys).some(key => {
            return Phaser.Input.Keyboard.JustDown(key);
        });

        const gamepadPressed = this.gamepadButtons.some(buttonIndex => {
            return this.wasGamepadButtonPressed(buttonIndex);
        });

        return keyboardPressed || gamepadPressed;
    }

    areInputsReleased() {
        const keyboardReleased = Object.values(this.keyboardKeys).every(key => {
            return !key.isDown;
        });

        const gamepadReleased = this.gamepadButtons.every(buttonIndex => {
            return !this.isGamepadButtonDown(buttonIndex);
        });

        return keyboardReleased && gamepadReleased;
    }

    endFrame() {
        this.saveCurrentGamepadButtons();
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
        this.previousGamepadButtons = {};

        this.gamepadButtons.forEach(buttonIndex => {
            this.previousGamepadButtons[buttonIndex] = this.isGamepadButtonDown(buttonIndex);
        });
    }
}
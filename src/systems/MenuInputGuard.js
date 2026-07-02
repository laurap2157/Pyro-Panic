import * as Phaser from 'phaser';

const INPUT_LOCK_DELAY = 150;

const KEY_CODE_BY_NAME = {
    space: 'Space',
    enter: 'Enter',
    r: 'KeyR',
    up: 'ArrowUp',
    down: 'ArrowDown',
    z: 'KeyZ',
    s: 'KeyS'
};

if (!window.__PYRO_KEYBOARD_STATE__) {
    window.__PYRO_KEYBOARD_STATE__ = {
        pressedKeys: new Set()
    };

    window.addEventListener('keydown', (event) => {
        window.__PYRO_KEYBOARD_STATE__.pressedKeys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
        window.__PYRO_KEYBOARD_STATE__.pressedKeys.delete(event.code);
    });
}

const physicalKeysDown = window.__PYRO_KEYBOARD_STATE__.pressedKeys;

export default class MenuInputGuard {
    constructor(scene, keyboardKeys = {}, gamepadButtons = []) {
        this.scene = scene;
        this.keyboardKeys = keyboardKeys;
        this.gamepadButtons = gamepadButtons;

        this.canValidate = false;
        this.inputUnlockTime = this.scene.time.now + INPUT_LOCK_DELAY;

        this.previousKeyboardKeys = {};
        this.previousGamepadButtons = {};

        this.saveCurrentInputs();
    }

    updateReleaseState() {
        if (this.canValidate) {
            return;
        }

        if (this.scene.time.now < this.inputUnlockTime) {
            this.saveCurrentInputs();
            return;
        }

        if (this.areInputsReleased()) {
            this.canValidate = true;
            this.saveCurrentInputs();
        }
    }

    isPressed() {
        if (!this.canValidate) {
            return false;
        }

        const keyboardPressed = Object.entries(this.keyboardKeys).some(([keyName, key]) => {
            return this.wasKeyboardKeyPressed(keyName, key);
        });

        const gamepadPressed = this.gamepadButtons.some(buttonIndex => {
            return this.wasGamepadButtonPressed(buttonIndex);
        });

        return keyboardPressed || gamepadPressed;
    }

    areInputsReleased() {
        const keyboardReleased = Object.entries(this.keyboardKeys).every(([keyName, key]) => {
            return !this.isKeyboardKeyDown(keyName, key);
        });

        const gamepadReleased = this.gamepadButtons.every(buttonIndex => {
            return !this.isGamepadButtonDown(buttonIndex);
        });

        return keyboardReleased && gamepadReleased;
    }

    endFrame() {
        this.saveCurrentInputs();
    }

    isKeyboardKeyDown(keyName, key) {
        const physicalCode = KEY_CODE_BY_NAME[keyName];

        const phaserDown = key?.isDown || false;
        const physicalDown = physicalCode ? physicalKeysDown.has(physicalCode) : false;

        return phaserDown || physicalDown;
    }

    wasKeyboardKeyPressed(keyName, key) {
        const physicalCode = KEY_CODE_BY_NAME[keyName];
        const previousKey = physicalCode || keyName;

        const isDownNow = this.isKeyboardKeyDown(keyName, key);
        const wasDownBefore = this.previousKeyboardKeys[previousKey] || false;

        return isDownNow && !wasDownBefore;
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

    saveCurrentInputs() {
        this.saveCurrentKeyboardKeys();
        this.saveCurrentGamepadButtons();
    }

    saveCurrentKeyboardKeys() {
        this.previousKeyboardKeys = {};

        Object.entries(this.keyboardKeys).forEach(([keyName, key]) => {
            const physicalCode = KEY_CODE_BY_NAME[keyName];
            const previousKey = physicalCode || keyName;

            this.previousKeyboardKeys[previousKey] = this.isKeyboardKeyDown(keyName, key);
        });
    }

    saveCurrentGamepadButtons() {
        this.previousGamepadButtons = {};

        this.gamepadButtons.forEach(buttonIndex => {
            this.previousGamepadButtons[buttonIndex] = this.isGamepadButtonDown(buttonIndex);
        });
    }
}
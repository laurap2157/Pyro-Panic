import * as Phaser from 'phaser';

const GAMEPAD_DEADZONE = 0.2;
const GAMEPAD_TRIGGER_THRESHOLD = 0.2;
const MOUSE_AIM_DEADZONE = 4;

const GAMEPAD_BUTTONS = {
    A: 0,
    X: 2,
    RB: 5,
    RT: 7,
    VIEW: 8,
    START: 9
};

export default class InputManager {
    constructor(scene) {
        this.scene = scene;

        this.keys = scene.input.keyboard.addKeys({
            up: 'Z',
            down: 'S',
            left: 'Q',
            right: 'D',

            arrowUp: 'UP',
            arrowDown: 'DOWN',
            arrowLeft: 'LEFT',
            arrowRight: 'RIGHT',

            shoot: 'SPACE',
            powerJet: 'SHIFT',
            interact: 'E',
            inspect: 'F',
            pause: 'ESC'
        });

        this.previousGamepadButtons = {};

        this.state = {
            moveX: 0,
            moveY: 0,
            aimX: 1,
            aimY: 0,
            isShooting: false,
            isPowerJet: false,
            interactPressed: false,
            inspectPressed: false,
            pausePressed: false
        };
    }

    getState(aimOrigin = null) {
        this.updateKeyboardState();
        this.updateMouseState(aimOrigin);
        this.updateGamepadState();

        return this.state;
    }

    updateKeyboardState() {
        this.state.moveX = 0;
        this.state.moveY = 0;

        if (this.keys.left.isDown || this.keys.arrowLeft.isDown) {
            this.state.moveX -= 1;
        }

        if (this.keys.right.isDown || this.keys.arrowRight.isDown) {
            this.state.moveX += 1;
        }

        if (this.keys.up.isDown || this.keys.arrowUp.isDown) {
            this.state.moveY -= 1;
        }

        if (this.keys.down.isDown || this.keys.arrowDown.isDown) {
            this.state.moveY += 1;
        }

        this.normalizeMovement();

        const keyboardShooting = this.keys.shoot.isDown;

        this.state.isShooting = keyboardShooting;
        this.state.isPowerJet = this.keys.powerJet.isDown && this.state.isShooting;

        this.state.interactPressed = Phaser.Input.Keyboard.JustDown(this.keys.interact);
        this.state.inspectPressed = Phaser.Input.Keyboard.JustDown(this.keys.inspect);
        this.state.pausePressed = Phaser.Input.Keyboard.JustDown(this.keys.pause);
    }

    updateMouseState(aimOrigin) {
        if (!aimOrigin) {
            return;
        }

        const pointer = this.scene.input.activePointer;

        if (!pointer) {
            return;
        }

        const aimX = pointer.worldX - aimOrigin.x;
        const aimY = pointer.worldY - aimOrigin.y;

        const aimLength = Math.hypot(aimX, aimY);

        if (aimLength > MOUSE_AIM_DEADZONE) {
            this.state.aimX = aimX / aimLength;
            this.state.aimY = aimY / aimLength;
        }

        if (pointer.isDown) {
            this.state.isShooting = true;
            this.state.isPowerJet = this.keys.powerJet.isDown;
        }
    }

    updateGamepadState() {
        const gamepad = this.getFirstConnectedGamepad();

        if (!gamepad) {
            return;
        }

        this.updateGamepadMovement(gamepad);
        this.updateGamepadAim(gamepad);
        this.updateGamepadActions(gamepad);
        this.saveCurrentGamepadButtons(gamepad);
    }

    getFirstConnectedGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        for (const gamepad of gamepads) {
            if (gamepad) {
                return gamepad;
            }
        }

        return null;
    }

    updateGamepadMovement(gamepad) {
        const leftX = this.applyDeadzone(gamepad.axes[0] || 0);
        const leftY = this.applyDeadzone(gamepad.axes[1] || 0);

        if (leftX !== 0 || leftY !== 0) {
            const normalized = this.getNormalizedVector(leftX, leftY);

            this.state.moveX = normalized.x;
            this.state.moveY = normalized.y;
        }
    }

    updateGamepadAim(gamepad) {
        const rightX = this.applyDeadzone(gamepad.axes[2] || 0);
        const rightY = this.applyDeadzone(gamepad.axes[3] || 0);

        if (rightX !== 0 || rightY !== 0) {
            const normalized = this.getNormalizedVector(rightX, rightY);

            this.state.aimX = normalized.x;
            this.state.aimY = normalized.y;
        }
    }

    updateGamepadActions(gamepad) {
        const rtPressed = this.isButtonDown(gamepad, GAMEPAD_BUTTONS.RT, GAMEPAD_TRIGGER_THRESHOLD);
        const rbPressed = this.isButtonDown(gamepad, GAMEPAD_BUTTONS.RB);

        if (rtPressed) {
            this.state.isShooting = true;
            this.state.isPowerJet = rbPressed;
        }

        this.state.interactPressed =
            this.state.interactPressed ||
            this.wasGamepadButtonPressed(gamepad, GAMEPAD_BUTTONS.A);

        this.state.inspectPressed =
            this.state.inspectPressed ||
            this.wasGamepadButtonPressed(gamepad, GAMEPAD_BUTTONS.X);

        this.state.pausePressed =
            this.state.pausePressed ||
            this.wasGamepadButtonPressed(gamepad, GAMEPAD_BUTTONS.START);
    }

    isButtonDown(gamepad, buttonIndex, threshold = 0.5) {
        const button = gamepad.buttons[buttonIndex];

        if (!button) {
            return false;
        }

        return button.pressed || button.value > threshold;
    }

    wasGamepadButtonPressed(gamepad, buttonIndex) {
        const isDownNow = this.isButtonDown(gamepad, buttonIndex);
        const wasDownBefore = this.previousGamepadButtons[buttonIndex] || false;

        return isDownNow && !wasDownBefore;
    }

    saveCurrentGamepadButtons(gamepad) {
        this.previousGamepadButtons = {};

        gamepad.buttons.forEach((button, index) => {
            this.previousGamepadButtons[index] = button.pressed || button.value > 0.5;
        });
    }

    applyDeadzone(value) {
        if (Math.abs(value) < GAMEPAD_DEADZONE) {
            return 0;
        }

        return value;
    }

    normalizeMovement() {
        const normalized = this.getNormalizedVector(this.state.moveX, this.state.moveY);

        this.state.moveX = normalized.x;
        this.state.moveY = normalized.y;
    }

    getNormalizedVector(x, y) {
        const length = Math.hypot(x, y);

        if (length > 1) {
            return {
                x: x / length,
                y: y / length
            };
        }

        return { x, y };
    }
}
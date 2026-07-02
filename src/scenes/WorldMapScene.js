import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';

export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMapScene');
    }

    create() {
        this.selectedIndex = 0;

        this.add.text(640, 80, 'CARTE D’INTERVENTION', {
            fontFamily: 'monospace',
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 640, 'Stick / Flèches : choisir | A / Start / Entrée / Espace : valider', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#cccccc'
        }).setOrigin(0.5);

        this.levelTexts = [];

        levels.forEach((level, index) => {
            const isUnlocked = this.isLevelUnlocked(level.id);

            const text = this.add.text(640, 180 + index * 70, '', {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: isUnlocked ? '#ffffff' : '#777777'
            }).setOrigin(0.5);

            this.levelTexts.push(text);
        });

        this.keys = this.input.keyboard.addKeys({
            up: 'UP',
            down: 'DOWN',
            z: 'Z',
            s: 'S',
            enter: 'ENTER',
            space: 'SPACE'
        });

        // Empêche la carte de valider immédiatement si A / Entrée / Espace
        // est encore maintenu depuis l’écran précédent.
        this.canUseInputs = false;

        // Permet d’éviter que le stick ou le D-Pad fasse défiler trop vite.
        this.navigationCooldown = 0;

        // Sert à détecter un nouvel appui manette.
        this.previousGamepadButtons = {};

        this.refreshDisplay();
    }

    update(time, delta) {
        if (!this.canUseInputs) {
            if (this.areMenuInputsReleased()) {
                this.canUseInputs = true;
                this.saveCurrentGamepadButtons();
            }

            return;
        }

        this.navigationCooldown -= delta;

        this.handleNavigation();
        this.handleValidation();

        this.saveCurrentGamepadButtons();
    }

    handleNavigation() {
        if (this.navigationCooldown > 0) {
            return;
        }

        const direction = this.getNavigationDirection();

        if (direction === 0) {
            return;
        }

        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex = levels.length - 1;
        }

        if (this.selectedIndex >= levels.length) {
            this.selectedIndex = 0;
        }

        this.navigationCooldown = 180;

        this.refreshDisplay();
    }

    handleValidation() {
        if (!this.isConfirmPressed()) {
            return;
        }

        const selectedLevel = levels[this.selectedIndex];

        if (!this.isLevelUnlocked(selectedLevel.id)) {
            return;
        }

        gameState.setCurrentLevel(selectedLevel.id);
        this.scene.start('BriefingScene');
    }

    refreshDisplay() {
        levels.forEach((level, index) => {
            const isSelected = index === this.selectedIndex;
            const isUnlocked = this.isLevelUnlocked(level.id);

            const prefix = isSelected ? '> ' : '  ';
            const lockText = isUnlocked ? '' : ' [verrouillé]';

            this.levelTexts[index].setText(`${prefix}${level.name}${lockText}`);

            if (!isUnlocked) {
                this.levelTexts[index].setColor('#777777');
            } else if (isSelected) {
                this.levelTexts[index].setColor('#ffcc66');
            } else {
                this.levelTexts[index].setColor('#ffffff');
            }
        });
    }

    isLevelUnlocked(levelId) {
        // On essaie d’abord d’utiliser une méthode propre si elle existe.
        if (typeof gameState.isLevelUnlocked === 'function') {
            return gameState.isLevelUnlocked(levelId);
        }

        // Sinon, fallback selon la structure probable de GameState.
        if (Array.isArray(gameState.unlockedLevels)) {
            return gameState.unlockedLevels.includes(levelId);
        }

        if (typeof gameState.highestUnlockedLevel === 'number') {
            return levelId <= gameState.highestUnlockedLevel;
        }

        // Sécurité pour l’étape 1 : au minimum, le niveau 1 est jouable.
        return levelId === 1;
    }

    getNavigationDirection() {
        const keyboardUp =
            Phaser.Input.Keyboard.JustDown(this.keys.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.z);

        const keyboardDown =
            Phaser.Input.Keyboard.JustDown(this.keys.down) ||
            Phaser.Input.Keyboard.JustDown(this.keys.s);

        if (keyboardUp) {
            return -1;
        }

        if (keyboardDown) {
            return 1;
        }

        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        for (const gamepad of gamepads) {
            if (!gamepad) {
                continue;
            }

            const leftY = gamepad.axes[1] || 0;

            // Stick gauche vertical.
            if (leftY < -0.5) {
                return -1;
            }

            if (leftY > 0.5) {
                return 1;
            }

            // D-Pad Xbox standard :
            // 12 = haut
            // 13 = bas
            if (this.wasGamepadButtonPressed(12)) {
                return -1;
            }

            if (this.wasGamepadButtonPressed(13)) {
                return 1;
            }
        }

        return 0;
    }

    isConfirmPressed() {
        const keyboardPressed =
            Phaser.Input.Keyboard.JustDown(this.keys.enter) ||
            Phaser.Input.Keyboard.JustDown(this.keys.space);

        const gamepadPressed =
            this.wasGamepadButtonPressed(0) || // A
            this.wasGamepadButtonPressed(9);   // Start

        return keyboardPressed || gamepadPressed;
    }

    areMenuInputsReleased() {
        const keyboardReleased =
            !this.keys.enter.isDown &&
            !this.keys.space.isDown;

        const gamepadReleased =
            !this.isGamepadButtonDown(0) &&  // A
            !this.isGamepadButtonDown(9) &&  // Start
            !this.isGamepadButtonDown(12) && // D-Pad haut
            !this.isGamepadButtonDown(13);   // D-Pad bas

        return keyboardReleased && gamepadReleased;
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
            0: this.isGamepadButtonDown(0),   // A
            9: this.isGamepadButtonDown(9),   // Start
            12: this.isGamepadButtonDown(12), // D-Pad haut
            13: this.isGamepadButtonDown(13)  // D-Pad bas
        };
    }
}
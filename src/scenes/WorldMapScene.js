import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMapScene');
    }

    create() {
        // Index du niveau actuellement sélectionné dans la liste.
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

        // Textes affichés pour chaque niveau.
        // Ils seront mis à jour dans refreshDisplay().
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

        // Touches clavier utilisées sur la carte.
        this.keys = this.input.keyboard.addKeys({
            up: 'UP',
            down: 'DOWN',
            z: 'Z',
            s: 'S',
            enter: 'ENTER',
            space: 'SPACE'
        });

        // MenuInputGuard gère uniquement la validation.
        // Il empêche notamment qu’un Espace ou un A maintenu depuis l’écran titre
        // valide immédiatement le niveau sélectionné sur la carte.
        this.inputGuard = new MenuInputGuard(
            this,
            {
                enter: this.keys.enter,
                space: this.keys.space
            },
            [0, 9] // A, Start
        );

        // Permet d’éviter que le stick fasse défiler trop vite.
        this.navigationCooldown = 0;

        // État précédent des boutons D-Pad.
        // On garde cette logique séparée du MenuInputGuard, car le D-Pad sert à naviguer,
        // pas à valider.
        this.previousGamepadButtons = {};

        this.refreshDisplay();
    }

    update(time, delta) {
        // Mise à jour du garde de validation.
        // Tant que les inputs de validation n’ont pas été relâchés,
        // la carte ne peut pas lancer de niveau.
        this.inputGuard.updateReleaseState();

        // Si la validation n’est pas encore autorisée, on bloque uniquement la validation.
        // On met quand même à jour les états internes en fin de frame.
        if (!this.inputGuard.canValidate) {
            this.inputGuard.endFrame();
            this.saveCurrentGamepadButtons();
            return;
        }

        this.navigationCooldown -= delta;

        this.handleNavigation();
        this.handleValidation();

        this.inputGuard.endFrame();
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

        // Si le niveau est verrouillé, on ignore la validation.
        if (!this.isLevelUnlocked(selectedLevel.id)) {
            return;
        }

        // On mémorise le niveau choisi, puis BriefingScene ira le lire dans GameState.
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
        // Méthode normale depuis GameState.
        if (typeof gameState.isLevelUnlocked === 'function') {
            return gameState.isLevelUnlocked(levelId);
        }

        // Fallbacks de sécurité, au cas où GameState évoluerait.
        if (Array.isArray(gameState.unlockedLevels)) {
            return gameState.unlockedLevels.includes(levelId);
        }

        if (typeof gameState.highestUnlockedLevel === 'number') {
            return levelId <= gameState.highestUnlockedLevel;
        }

        if (typeof gameState.unlockedLevel === 'number') {
            return levelId <= gameState.unlockedLevel;
        }

        // Sécurité minimale : le niveau 1 doit toujours rester jouable.
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
        // La validation passe maintenant uniquement par MenuInputGuard.
        // Cela harmonise Espace / Entrée avec A / Start et évite les validations en cascade.
        return this.inputGuard.isPressed();
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
            12: this.isGamepadButtonDown(12), // D-Pad haut
            13: this.isGamepadButtonDown(13)  // D-Pad bas
        };
    }
}
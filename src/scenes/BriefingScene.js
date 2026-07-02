import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';

export default class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    create() {
        // On récupère le niveau courant depuis GameState.
        // WorldMapScene définit ce niveau juste avant de lancer BriefingScene.
        this.level = levels.find(level => level.id === gameState.currentLevelId);

        // Sécurité : si aucun niveau n'est trouvé, on retourne à la carte.
        // Cela évite un écran cassé si currentLevelId contient une valeur invalide.
        if (!this.level) {
            this.scene.start('WorldMapScene');
            return;
        }

        this.add.text(640, 130, this.level.name, {
            fontFamily: 'monospace',
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 260, `Objectif : ${this.level.briefing}`, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 390, `Conseil : ${this.level.tip}`, {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#ffcc66',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 600, 'Relâchez les touches, puis appuyez sur A / Entrée / Espace pour commencer', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Touches clavier permettant de lancer le niveau.
        this.continueKeys = this.input.keyboard.addKeys({
            space: 'SPACE',
            enter: 'ENTER'
        });

        // On bloque d'abord la validation.
        // Cela évite que l'appui qui a servi à sélectionner un niveau
        // sur la carte lance immédiatement le niveau sans laisser lire le briefing.
        this.canStartLevel = false;

        // Sert à détecter un nouvel appui manette, et pas un bouton déjà maintenu.
        this.previousGamepadButtons = {};
    }

    update() {
        // Étape 1 : attendre que les touches/boutons soient relâchés.
        if (!this.canStartLevel) {
            if (this.areContinueInputsReleased()) {
                this.canStartLevel = true;
                this.saveCurrentGamepadButtons();
            }

            return;
        }

        // Étape 2 : accepter uniquement un nouvel appui volontaire.
        if (this.isContinuePressed()) {
            this.scene.start(this.level.key);
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
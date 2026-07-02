import * as Phaser from 'phaser';

import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';

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
        // Ici, on conserve Espace parce qu'on est encore dans un écran de menu,
        // pas dans l'écran de victoire qui suit un tir maintenu.
        this.continueKeys = this.input.keyboard.addKeys({
            space: 'SPACE',
            enter: 'ENTER'
        });

        // MenuInputGuard empêche le briefing d'être validé automatiquement
        // par la touche ou le bouton qui a servi à sélectionner le niveau sur la carte.
        this.inputGuard = new MenuInputGuard(
            this,
            this.continueKeys,
            [0, 9] // A, Start
        );
    }

    update() {
        this.inputGuard.updateReleaseState();

        if (this.inputGuard.isPressed()) {
            this.scene.start(this.level.key);
        }

        this.inputGuard.endFrame();
    }
}
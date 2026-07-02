import * as Phaser from 'phaser';

import MenuInputGuard from '../systems/MenuInputGuard.js';

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

        this.startKeys = this.input.keyboard.addKeys({
            space: 'SPACE',
            enter: 'ENTER'
        });

        this.inputGuard = new MenuInputGuard(
            this,
            this.startKeys,
            [0, 9] // A, Start
        );
    }

    update() {
        this.inputGuard.updateReleaseState();

        if (this.inputGuard.isPressed()) {
            this.scene.start('WorldMapScene');
        }

        this.inputGuard.endFrame();
    }
}
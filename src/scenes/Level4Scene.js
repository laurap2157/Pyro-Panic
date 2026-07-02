import * as Phaser from 'phaser';
import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

export default class Level4Scene extends Phaser.Scene {
    constructor() {
        super('Level4Scene');
    }

    create() {
        // 1. Initialisation des systèmes
        this.inputManager = new InputManager(this);
        this.resourceSystem = new ResourceSystem();
        this.extinguishSystem = new ExtinguishSystem();
        
        // 2. Initialisation joueur
        this.player = new Player(this, 640, 360);
        
        // 3. Configuration des feux (Niveau 4 : Très difficile)
        this.fires = [
            new Fire({ x: 200, y: 150, size: 'large', type: 'fuel' }),
            new Fire({ x: 1000, y: 150, size: 'large', type: 'fuel' }),
            new Fire({ x: 640, y: 550, size: 'medium', type: 'normal' }),
            new Fire({ x: 300, y: 400, size: 'small', type: 'normal' }),
            new Fire({ x: 900, y: 400, size: 'small', type: 'normal' })
        ];

        this.graphics = this.add.graphics();
    }

    update(time, delta) {
        const input = this.inputManager.getState();
        this.resourceSystem.update(delta);
        this.player.update(input, delta);

        // Logique de tir
        if (input.isShooting) {
            const power = input.isPowerJet ? 'strong' : 'weak';
            if (this.resourceSystem.consumeAgent(power, delta)) {
                this.fires.forEach(fire => {
                    this.extinguishSystem.applyJet({
                        fire: fire,
                        agent: this.resourceSystem.activeAgent,
                        power: power,
                        delta: delta
                    });
                });
            }
        }

        // Rendu
        this.graphics.clear();
        this.player.draw(this.graphics);
        this.fires.forEach(fire => {
            if (!fire.isExtinguished) {
                const color = fire.type === 'fuel' ? 0xff0000 : 0xff9900;
                this.graphics.fillStyle(color, 1);
                this.graphics.fillRect(fire.x, fire.y, 32, 32);
            }
        });

        // Condition de victoire / défaite
        if (this.fires.every(f => f.isExtinguished)) {
            this.scene.start('FinalLevelScene'); // Passage au niveau final
        }
        
        if (this.resourceSystem.isAsphyxiated()) {
            this.scene.start('GameOverScene');
        }
    }
}
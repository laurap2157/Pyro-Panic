import * as Phaser from 'phaser';
import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene');
    }

    create() {
        // 1. Initialisation des systèmes
        this.inputManager = new InputManager(this);
        this.resourceSystem = new ResourceSystem();
        this.extinguishSystem = new ExtinguishSystem();
        
        // 2. Initialisation joueur
        this.player = new Player(this, 100, 100);
        
        // 3. Initialisation des feux pour le niveau 2 (plus nombreux/difficiles)
        this.fires = [
            new Fire({ x: 300, y: 200, size: 'medium', type: 'normal' }),
            new Fire({ x: 800, y: 400, size: 'large', type: 'fuel' }),
            new Fire({ x: 500, y: 600, size: 'small', type: 'normal' })
        ];

        this.graphics = this.add.graphics();
    }

    update(time, delta) {
        const input = this.inputManager.getState();
        this.resourceSystem.update(delta);
        this.player.update(input, delta);

        // Gestion du tir
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
                // Le rendu visuel aide à voir les différents types de feux
                const color = fire.type === 'fuel' ? 0xff0000 : 0xff9900;
                this.graphics.fillStyle(color, 1);
                this.graphics.fillRect(fire.x, fire.y, 32, 32);
            }
        });

        // Condition de fin
        if (this.fires.every(f => f.isExtinguished)) {
            this.scene.start('Level3Scene'); // Passage au niveau 3
        }
        
        if (this.resourceSystem.isAsphyxiated()) {
            this.scene.start('GameOverScene');
        }
    }
}
import * as Phaser from 'phaser';
import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super('Level3Scene');
    }

    create() {
        // 1. Initialisation des systèmes
        this.inputManager = new InputManager(this);
        this.resourceSystem = new ResourceSystem();
        this.extinguishSystem = new ExtinguishSystem();
        
        // 2. Initialisation joueur
        this.player = new Player(this, 100, 100);
        
        // 3. Configuration des feux (Niveau 3 : plus de gros feux)
        this.fires = [
            new Fire({ x: 200, y: 200, size: 'large', type: 'fuel' }),
            new Fire({ x: 1000, y: 500, size: 'medium', type: 'normal' }),
            new Fire({ x: 600, y: 300, size: 'large', type: 'normal' })
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
            this.scene.start('Level4Scene'); // Passage au niveau 4
        }
        
        if (this.resourceSystem.isAsphyxiated()) {
            this.scene.start('GameOverScene');
        }
    }
}
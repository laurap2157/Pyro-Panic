import * as Phaser from 'phaser';
import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

export default class FinalLevelScene extends Phaser.Scene {
    constructor() {
        super('FinalLevelScene');
    }

    create() {
        // 1. Initialisation
        this.inputManager = new InputManager(this);
        this.resourceSystem = new ResourceSystem();
        this.extinguishSystem = new ExtinguishSystem();
        
        this.player = new Player(this, 640, 360);
        
        // 3. Configuration finale (Le "Boss" des feux)
        this.fires = [
            new Fire({ x: 200, y: 150, size: 'large', type: 'fuel' }),
            new Fire({ x: 1080, y: 150, size: 'large', type: 'fuel' }),
            new Fire({ x: 640, y: 100, size: 'large', type: 'normal' }),
            new Fire({ x: 640, y: 600, size: 'large', type: 'normal' })
        ];

        this.graphics = this.add.graphics();
        
        // Petit message pour le joueur
        this.add.text(450, 20, 'NIVEAU FINAL - ETEIGNEZ TOUT !', { fontSize: '24px', fill: '#ffffff' });
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
                this.graphics.fillRect(fire.x, fire.y, 40, 40); // Feux plus gros
            }
        });

        // Condition de Victoire Finale
        if (this.fires.every(f => f.isExtinguished)) {
            this.scene.start('VictoryScene'); 
        }
        
        // Défaite
        if (this.resourceSystem.isAsphyxiated()) {
            this.scene.start('GameOverScene');
        }
    }
}
import * as Phaser from 'phaser';
import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

    create() {
        // 1. Initialisation des systèmes
        this.inputManager = new InputManager(this);
        this.resourceSystem = new ResourceSystem();
        this.extinguishSystem = new ExtinguishSystem();
        
        // 2. Initialisation des objets
        this.player = new Player(this, 400, 300);
        
        // Exemple de feux (ajoutez-en autant que nécessaire)
        this.fires = [
            new Fire({ x: 600, y: 200, size: 'small', type: 'normal' }),
            new Fire({ x: 200, y: 500, size: 'medium', type: 'fuel' })
        ];

        // 3. Préparation du rendu
        this.graphics = this.add.graphics();
    }

    update(time, delta) {
        // 1. Mise à jour de l'état
        const input = this.inputManager.getState();
        this.resourceSystem.update(delta);
        this.player.update(input, delta);

        // 2. Logique de tir
        if (input.isShooting) {
            const power = input.isPowerJet ? 'strong' : 'weak';
            
            // On vérifie si on a assez de ressource (Eau ou Mousse)
            // Note : le ResourceSystem gère l'agent actif via this.resourceSystem.activeAgent
            if (this.resourceSystem.waterReserve > 0 || this.resourceSystem.foamReserve > 0) {
                
                this.resourceSystem.consumeAgent(power, delta);

                // Application des dégâts sur chaque feu
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

        // 4. Conditions de fin
        if (this.fires.every(f => f.isExtinguished)) {
            this.scene.start('VictoryScene');
        }
        
        if (this.resourceSystem.oxygen <= 0) {
            this.scene.start('GameOverScene');
        }
    }
}
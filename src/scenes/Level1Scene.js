import FireTruck from "../objects/FireTruck";
import Player from "../objects/Player";
import Fire from "../objects/Fire";
import FireSystem from "../systems/FireSystem";
import ExtinguishSystem from "../systems/ExtinguishSystem";
import ResourceSystem from "../systems/ResourceSystem";
import SupplyPoint from "../objects/SupplyPoint";
import Door from "../objects/Door";
export default class Level1Scene {
    create() {
        // 1. Initialiser le joueur
        this.player = new Player();
        
        // 2. Créer les placeholders (rectangles)
        this.fires = [/* liste de vos rectangles orange */];

        // 3. Initialiser les points interactifs
        this.supplyPoint = new SupplyPoint();

        this.truck = new FireTruck(200, 300);

        this.waterPoint = new SupplyPoint(100, 100, 'water');
        
        this.foamPoint = new SupplyPoint(500, 100, 'foam');

        this.door = new Door(300, 200, true);
    }

    update() {
        // 4. Récupérer les inputs (via InputManager)
        const input = InputManager.getState();
        
        // 5. Appliquer les mouvements
        this.player.move(input.moveX, input.moveY);
        this.player.aim(input.aimX, input.aimY);
        
        if (input.isShooting) {
            this.player.shoot(input.isPowerJet);
        } 

     input = InputManager.getState();

// Vérifier la distance entre le joueur et le camion
        if (input.interactPressed && this.isPlayerNear(this.truck)) {
            this.truck.interact();
        }

     input = InputManager.getState();

        if (input.interactPressed) {
            if (this.waterPoint.isPlayerInRange(this.player)) {
                this.waterPoint.interact(this.player);
            }
            if (this.foamPoint.isPlayerInRange(this.player)) {
                this.foamPoint.interact(this.player);
            }
        }

     input = InputManager.getState();

        // Interaction A : Ouvrir
        if (input.interactPressed && this.door.isPlayerInRange(this.player)) {
            this.door.open();
        }

        // Interaction X : Inspecter
        if (input.inspectPressed && this.door.isPlayerInRange(this.player)) {
            const status = this.door.inspect();
            // Vous pourriez afficher le résultat (status) dans une zone de texte UI ici
        }
    }
}
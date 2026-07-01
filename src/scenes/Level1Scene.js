
export default class Level1Scene {
    create() {
        // 1. Initialiser le joueur
        this.player = new Player();
        
        // 2. Créer les placeholders (rectangles)
        this.fires = [/* liste de vos rectangles orange */];
        
        // 3. Initialiser les points interactifs
        this.supplyPoint = new SupplyPoint();

        this.truck = new FireTruck(200, 300);
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
    }
}
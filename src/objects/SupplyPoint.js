export default class SupplyPoint {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 50;  // Taille du placeholder
        this.height = 50;
        this.type = type; // 'water' ou 'foam' (selon la DEV_BIBLE )
        
        // Couleur selon le type (bleu pour eau, blanc/gris pour mousse)
        this.color = (type === 'water') ? 0x0000FF : 0xCCCCCC; 
    }

    // Méthode appelée lorsque le joueur appuie sur A [cite: 83, 76]
    interact(player) {
        console.log(`DEBUG: Interaction avec le point de ravitaillement : ${this.type}`);
        
        // Logique pour dire au système de ressource de recharger le joueur
        // Vous devrez appeler votre ResourceSystem ici plus tard
        // ResourceSystem.refill(player, this.type);
    }

    // Rendu du placeholder
    draw(graphics) {
        graphics.fillStyle(this.color, 1);
        graphics.fillRect(this.x, this.y, this.width, this.height);
    }

    // Vérifie si le joueur est proche pour afficher l'aide à l'écran
    isPlayerInRange(player) {
        const distance = Math.sqrt(
            Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2)
        );
        return distance < 100; // Rayon de 100 pixels pour l'interaction
    }
}
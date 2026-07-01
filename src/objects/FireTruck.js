// src/objects/FireTruck.js

export default class FireTruck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;  // Taille du rectangle placeholder
        this.height = 60;
        this.color = 0x8B0000; // Rouge sombre (tel que demandé dans la consigne)
    }

    // Méthode appelée quand le joueur appuie sur A à proximité
    interact() {
        console.log("Interaction avec le camion : Changement d'équipement en cours...");
        // Ici, vous appellerez plus tard le ResourceSystem pour changer d'agent (eau/mousse)
    }

    // Méthode pour le rendu (à adapter selon votre moteur de jeu)
    draw(graphics) {
        graphics.fillStyle(this.color, 1);
        graphics.fillRect(this.x, this.y, this.width, this.height);
    }
}
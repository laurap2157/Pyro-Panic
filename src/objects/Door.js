// src/objects/Door.js

export default class Door {
    constructor(x, y, isDangerous = false) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.isDangerous = isDangerous; // Indique si la porte cache un danger (backdraft)
        this.isOpen = false;
    }

    // Méthode pour inspecter la porte (touche X)
    inspect() {
        if (this.isDangerous) {
            console.log("DEBUG: Attention, fumée dense derrière la porte ! Danger.");
            return "DANGER";
        } else {
            console.log("DEBUG: Porte sûre.");
            return "SAFE";
        }
    }

    // Méthode pour ouvrir la porte (touche A)
    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            console.log("DEBUG: Porte ouverte.");
            
            if (this.isDangerous) {
                console.log("DEBUG: BACKDRAFT !");
                // Ici, déclencher l'événement feu/explosion via FireSystem plus tard
            }
        }
    }

    draw(graphics) {
        // Couleur marron pour la porte
        graphics.fillStyle(this.isOpen ? 0x553311 : 0x8B4513, 1);
        graphics.fillRect(this.x, this.y, this.width, this.height);
    }
}
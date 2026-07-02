import * as Phaser from 'phaser';

import Player from "../objects/Player.js";
import Fire from "../objects/Fire.js";
import InputManager from "../systems/InputManager.js";
import ExtinguishSystem from "../systems/ExtinguishSystem.js";
import ResourceSystem from "../systems/ResourceSystem.js";

// Distance maximale à laquelle le jet peut toucher un feu.
// Cette valeur sert pour la détection logique, pas seulement pour le dessin.
const SPRAY_RANGE = 220;

// Largeur de tolérance du jet.
// Plus cette valeur est grande, plus le jet touche facilement les feux proches de son axe.
const SPRAY_WIDTH = 35;

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        // Identifiant technique de la scène.
        // Il doit correspondre au nom déclaré dans gameConfig.js.
        super('Level1Scene');
    }

    create() {
        // =====================================================
        // 1. Initialisation des systèmes
        // =====================================================
        // InputManager lit les contrôles clavier, souris et manette.
        // Il ne déplace pas le joueur lui-même : il renvoie seulement un état d'input.
        this.inputManager = new InputManager(this);

        // ResourceSystem gère les ressources du joueur :
        // eau, mousse, oxygène et agent actuellement équipé.
        this.resourceSystem = new ResourceSystem();

        // ExtinguishSystem contient les règles d'efficacité :
        // jet faible / fort, petit feu / gros feu, eau / mousse, etc.
        this.extinguishSystem = new ExtinguishSystem();

        // =====================================================
        // 2. Initialisation du joueur
        // =====================================================
        // Le joueur reçoit la scène et une position de départ.
        // Il crée lui-même son placeholder visuel pour l’instant.
        this.player = new Player(this, 400, 300);

        // =====================================================
        // 3. Initialisation des feux du niveau 1
        // =====================================================
        // Le niveau 1 sert de tutoriel aux bases :
        // - déplacement,
        // - visée,
        // - jet faible,
        // - jet puissant,
        // - gestion de l’eau,
        // - extinction de feux normaux.
        //
        // On évite volontairement les feux de carburant ici.
        // Les feux de carburant doivent arriver plus tard, dans le niveau 3,
        // quand la mousse et le changement d’agent seront réellement intégrés.
        this.fires = [
            new Fire({ x: 620, y: 280, size: 'small', type: 'normal' }),
            new Fire({ x: 860, y: 420, size: 'large', type: 'normal' })
        ];

        // =====================================================
        // 4. Préparation du rendu
        // =====================================================
        // graphics sert à dessiner des éléments temporaires :
        // feux, barres de vie, jet d’eau.
        //
        // Ce n’est pas encore du vrai pixel art intégré,
        // mais c’est suffisant pour valider la boucle de gameplay.
        this.graphics = this.add.graphics();

        // HUD temporaire affichant les ressources et l’état du joueur.
        this.hudText = this.add.text(24, 24, '', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff'
        });

        // Texte d’aide temporaire pour les tests.
        // Plus tard, ces informations pourront être remplacées par un vrai HUD pixel art.
        this.helpText = this.add.text(
            24,
            680,
            'RT / Espace / Clic : jet faible | RB + RT / Shift : jet puissant',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#cccccc'
            }
        );
    }

    update(time, delta) {
        // =====================================================
        // 1. Lecture des inputs
        // =====================================================
        // On passe la position du joueur à InputManager.
        // C’est indispensable pour calculer correctement la visée souris :
        // direction = position souris - position joueur.
        const input = this.inputManager.getState(this.player.getPosition());

        // =====================================================
        // 2. Mise à jour des systèmes principaux
        // =====================================================
        // L’oxygène diminue avec le temps dans ResourceSystem.
        this.resourceSystem.update(delta);

        // Le joueur se déplace et met à jour sa direction de visée.
        this.player.update(input, delta);

        // =====================================================
        // 3. Nettoyage du rendu temporaire
        // =====================================================
        // Comme graphics redessine des formes à chaque frame,
        // il faut effacer l’ancien rendu avant de redessiner.
        this.graphics.clear();

        // =====================================================
        // 4. Gameplay de tir
        // =====================================================
        this.handleShooting(input, delta);

        // =====================================================
        // 5. Affichage
        // =====================================================
        this.drawFires();
        this.drawHud(input);

        // =====================================================
        // 6. Conditions de fin de niveau
        // =====================================================
        this.checkEndConditions();
    }

    handleShooting(input, delta) {
        // Si le joueur ne tire pas, il n’y a rien à calculer.
        if (!input.isShooting) {
            return;
        }

        // Le débit dépend de l’état d’input.
        // RT seul / clic / espace = weak.
        // RB + RT / Shift = strong.
        const power = input.isPowerJet ? 'strong' : 'weak';

        // L’agent actif vient du ResourceSystem.
        // Pour le niveau 1, ce sera normalement toujours "water".
        const activeAgent = this.resourceSystem.activeAgent;

        // On vérifie que le joueur possède encore la ressource nécessaire.
        // Exemple : s’il tire à l’eau, il doit avoir de l’eau.
        if (!this.hasResource(activeAgent)) {
            return;
        }

        // Le jet ne part pas exactement du centre du joueur.
        // getSprayOrigin() donne un point légèrement avancé dans la direction de visée.
        const sprayOrigin = this.player.getSprayOrigin();

        // Direction normalisée du jet.
        // Exemple : { x: 1, y: 0 } signifie viser à droite.
        const aimDirection = this.player.getAimDirection();

        // Affichage visuel temporaire du jet.
        this.drawSpray(sprayOrigin, aimDirection, power);

        // On récupère uniquement les feux réellement touchés par le jet.
        // C’est ce qui empêche le joueur d’éteindre tous les feux en tirant n’importe où.
        const touchedFires = this.getTouchedFires(sprayOrigin, aimDirection);

        // Si aucun feu n’est touché, on ne consomme pas encore de ressource.
        // Ce choix est volontaire pour le prototype :
        // il évite de punir trop fortement les tests de visée.
        //
        // Plus tard, on pourra décider de consommer même si le joueur rate.
        if (touchedFires.length === 0) {
            return;
        }

        // La ressource est consommée uniquement si le jet touche au moins un feu.
        this.resourceSystem.consumeAgent(power, delta);

        // On applique les règles d’extinction sur chaque feu touché.
        touchedFires.forEach(fire => {
            this.extinguishSystem.applyJet({
                fire: fire,
                agent: activeAgent,
                power: power,
                delta: delta
            });
        });
    }

    hasResource(activeAgent) {
        // Cette méthode isole la vérification de ressource.
        // Cela évite d’avoir une condition longue dans handleShooting().
        if (activeAgent === 'water') {
            return this.resourceSystem.waterReserve > 0;
        }

        if (activeAgent === 'foam') {
            return this.resourceSystem.foamReserve > 0;
        }

        // Si l’agent actif est inconnu, on bloque le tir par sécurité.
        return false;
    }

    getTouchedFires(sprayOrigin, aimDirection) {
        // Cette méthode détermine quels feux sont touchés par le jet.
        //
        // Principe :
        // 1. On prend le vecteur entre l’origine du jet et le feu.
        // 2. On projette ce vecteur sur la direction du jet.
        // 3. Si la projection est négative, le feu est derrière le joueur.
        // 4. Si la projection dépasse la portée, le feu est trop loin.
        // 5. Sinon, on mesure la distance entre le feu et l’axe du jet.
        // 6. Si cette distance est assez faible, le feu est considéré comme touché.
        return this.fires.filter(fire => {
            // Un feu déjà éteint ne peut plus être touché.
            if (fire.isExtinguished) {
                return false;
            }

            // Vecteur entre l’origine du jet et le feu.
            const fireVectorX = fire.x - sprayOrigin.x;
            const fireVectorY = fire.y - sprayOrigin.y;

            // Projection du feu sur l’axe du jet.
            // C’est une forme de produit scalaire.
            const projection =
                fireVectorX * aimDirection.x +
                fireVectorY * aimDirection.y;

            // Si projection < 0 : le feu est derrière le joueur.
            // Si projection > SPRAY_RANGE : le feu est trop loin.
            if (projection < 0 || projection > SPRAY_RANGE) {
                return false;
            }

            // Point le plus proche du feu sur la ligne du jet.
            const closestPointX = sprayOrigin.x + aimDirection.x * projection;
            const closestPointY = sprayOrigin.y + aimDirection.y * projection;

            // Distance entre le feu et l’axe du jet.
            const distanceToSpray = Phaser.Math.Distance.Between(
                fire.x,
                fire.y,
                closestPointX,
                closestPointY
            );

            // Le feu est touché s’il est assez proche de l’axe du jet.
            return distanceToSpray <= SPRAY_WIDTH;
        });
    }

    drawSpray(sprayOrigin, aimDirection, power) {
        // Le jet puissant est plus long et plus épais.
        // Cela donne un feedback visuel immédiat au joueur.
        const sprayLength = power === 'strong' ? SPRAY_RANGE : SPRAY_RANGE * 0.75;
        const sprayColor = power === 'strong' ? 0x66ccff : 0x99ddff;
        const sprayThickness = power === 'strong' ? 8 : 4;

        this.graphics.lineStyle(
            sprayThickness,
            sprayColor,
            0.85
        );

        this.graphics.beginPath();

        this.graphics.moveTo(
            sprayOrigin.x,
            sprayOrigin.y
        );

        this.graphics.lineTo(
            sprayOrigin.x + aimDirection.x * sprayLength,
            sprayOrigin.y + aimDirection.y * sprayLength
        );

        this.graphics.strokePath();
    }

    drawFires() {
        // Dessin temporaire des feux.
        //
        // Plus tard, cette méthode pourra être remplacée par des sprites animés :
        // petite flamme, brasier moyen, gros brasier, etc.
        this.fires.forEach(fire => {
            if (fire.isExtinguished) {
                return;
            }

            const radius = this.getFireRadius(fire);

            // Ratio de vie du feu, utilisé pour dessiner la barre de vie.
            const hpRatio = fire.hp / fire.maxHp;

            // Cercle extérieur orange.
            this.graphics.fillStyle(0xff5a1f, 1);
            this.graphics.fillCircle(fire.x, fire.y, radius);

            // Cœur jaune de la flamme.
            this.graphics.fillStyle(0xffcc33, 0.8);
            this.graphics.fillCircle(fire.x, fire.y, radius * 0.55);

            // Contour noir pour améliorer la lisibilité.
            this.graphics.lineStyle(2, 0x000000, 0.8);
            this.graphics.strokeCircle(fire.x, fire.y, radius);

            // Fond de la barre de vie du feu.
            this.graphics.fillStyle(0x222222, 1);
            this.graphics.fillRect(
                fire.x - 24,
                fire.y - radius - 18,
                48,
                6
            );

            // Remplissage de la barre de vie.
            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillRect(
                fire.x - 24,
                fire.y - radius - 18,
                48 * hpRatio,
                6
            );
        });
    }

    getFireRadius(fire) {
        // Taille visuelle des feux selon leur catégorie.
        // Cela aide le joueur à comprendre quel débit utiliser.
        if (fire.size === 'small') {
            return 18;
        }

        if (fire.size === 'medium') {
            return 28;
        }

        if (fire.size === 'large') {
            return 40;
        }

        // Valeur de secours si une taille inconnue est passée.
        return 24;
    }

    drawHud(input) {
        // HUD temporaire.
        //
        // On garde volontairement un affichage simple pour l’étape 1.
        // L’objectif est de valider les données avant de faire une interface pixel art propre.
        this.hudText.setText(
            `Oxygène : ${Math.ceil(this.resourceSystem.oxygen)}\n` +
            `Eau : ${Math.ceil(this.resourceSystem.waterReserve)}\n` +
            `Mousse : ${Math.ceil(this.resourceSystem.foamReserve)}\n` +
            `Agent : ${this.resourceSystem.activeAgent}\n` +
            `Jet : ${input.isPowerJet ? 'puissant' : 'faible'}`
        );
    }

    checkEndConditions() {
        // Victoire : tous les feux du niveau sont éteints.
        if (this.fires.every(fire => fire.isExtinguished)) {
            this.scene.start('VictoryScene');
            return;
        }

        // Défaite : le joueur n’a plus d’oxygène.
        if (this.resourceSystem.oxygen <= 0) {
            this.scene.start('GameOverScene', {
                reason: 'oxygen',
                levelKey: 'Level1Scene'
            });
        }
    }
}
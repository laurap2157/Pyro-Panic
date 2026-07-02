import * as Phaser from 'phaser';

import tips from '../data/tips.js';
import { levels } from '../data/levels.js';
import gameState from '../systems/GameState.js';
import MenuInputGuard from '../systems/MenuInputGuard.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        // =====================================================
        // 1. Récupération de la raison du game over
        // =====================================================
        // Exemple : oxygen, weak_on_large, fuel_fire, etc.
        // Si aucune raison n'est transmise, on affiche un message générique.
        this.reason = data?.reason || 'default';

        // =====================================================
        // 2. Détermination du niveau à relancer
        // =====================================================
        // Priorité :
        // 1. levelKey transmis directement par la scène de niveau ;
        // 2. niveau courant stocké dans GameState ;
        // 3. fallback sur Level1Scene.
        const currentLevel = levels.find(level => level.id === gameState.currentLevelId);

        this.levelKey = data?.levelKey || currentLevel?.key || 'Level1Scene';

        const tipData = tips[this.reason] || tips.default;

        // =====================================================
        // 3. Affichage de l'écran de game over
        // =====================================================
        this.add.text(640, 180, 'GAME OVER', {
            fontFamily: 'monospace',
            fontSize: '56px',
            color: '#ff5555'
        }).setOrigin(0.5);

        this.add.text(640, 270, `Cause : ${tipData.cause}`, {
            fontFamily: 'monospace',
            fontSize: '26px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 330, tipData.explanation, {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 410, `Astuce : ${tipData.tip}`, {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#ffcc66',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.add.text(640, 560, 'Relâchez les touches, puis appuyez sur R / Espace / Entrée / Y pour recommencer', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // =====================================================
        // 4. Inputs de recommencement
        // =====================================================
        // On garde Espace comme touche de validation/restart,
        // mais il passe maintenant par MenuInputGuard.
        //
        // Cela évite qu'un Espace maintenu pendant le gameplay
        // relance automatiquement le niveau après un game over.
        this.restartKeys = this.input.keyboard.addKeys({
            r: 'R',
            space: 'SPACE',
            enter: 'ENTER'
        });

        this.inputGuard = new MenuInputGuard(
            this,
            this.restartKeys,
            [3, 8] // Y, View
        );
    }

    update() {
        // Mise à jour du garde d'input.
        // Tant que les touches/boutons surveillés ne sont pas relâchés,
        // isPressed() reste bloqué.
        this.inputGuard.updateReleaseState();

        // Une fois les inputs relâchés, un nouvel appui relance le niveau.
        if (this.inputGuard.isPressed()) {
            this.scene.start(this.levelKey);
        }

        // Mémorisation des états courants pour détecter les nouveaux appuis.
        this.inputGuard.endFrame();
    }
}
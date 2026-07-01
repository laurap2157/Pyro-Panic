# DEV BIBLE — Pyro Panic: Devil’s Spark

## 1. Rôle du document

Ce document sert de référence commune pour le développement de **Pyro Panic: Devil’s Spark**.

Il fixe les conventions techniques, les noms à utiliser, les contrôles, les contrats entre fichiers, les responsabilités des développeurs et les règles de gameplay validées.

L’objectif est d’éviter les incohérences, les conflits Git et les variations de nommage entre les différentes parties du projet.

Toute modification importante de ce document doit être annoncée à l’équipe.

---

## 2. Socle technique validé

### Moteur

Le projet utilise :

```text
Phaser 4
JavaScript vanilla
Vite
Node.js
VS Code
Git / GitHub
```

### Résolution

La résolution de référence du jeu est :

```text
1280 × 720
```

Format :

```text
16:9
```

Tous les écrans, interfaces et prototypes visuels doivent être pensés pour cette résolution.

### Import Phaser

Avec Phaser 4, l’import recommandé dans les modules JavaScript est :

```js
import * as Phaser from 'phaser';
```

À éviter :

```js
import Phaser from 'phaser';
```

---

## 3. Noms définitifs des niveaux

Les titres officiels des niveaux sont :

```text
1. Faubourg des Étincelles
2. Le Manoir aux Portes Rouges
3. L’Aire du Dernier Plein
4. La Forêt de Brûlevent
5. Le Cœur de Braise
```

Ces noms doivent être utilisés dans :

```text
src/data/levels.js
les écrans de briefing
la carte du monde
les écrans de victoire
les écrans de game over
les documents de pitch
les prompts d’assets
```

Ne plus utiliser les anciens noms de travail.

---

## 4. Identifiants techniques des scènes

Les scènes officielles du jeu doivent utiliser les identifiants suivants :

```text
BootScene
PreloadScene
TitleScene
WorldMapScene
BriefingScene
Level1Scene
Level2Scene
Level3Scene
Level4Scene
FinalLevelScene
VictoryScene
GameOverScene
```

Ces noms doivent rester stables, car ils sont utilisés pour les transitions entre scènes.

---

## 5. Progression globale du jeu

La progression générale est linéaire :

```text
TitleScene
→ WorldMapScene
→ BriefingScene
→ Level1Scene
→ VictoryScene ou GameOverScene
→ retour WorldMapScene
→ niveau suivant
```

Ordre des niveaux :

```text
1. Faubourg des Étincelles
2. Le Manoir aux Portes Rouges
3. L’Aire du Dernier Plein
4. La Forêt de Brûlevent
5. Le Cœur de Braise
```

Chaque niveau introduit ou renforce une mécanique principale :

```text
Niveau 1 : tutoriel, eau, oxygène, débits faible/fort
Niveau 2 : portes, inspection, danger de backdraft
Niveau 3 : carburant, mousse, mauvais agent d’extinction
Niveau 4 : propagation, vent, containment
Niveau 5 : synthèse des mécaniques, révélation finale
```

---

## 6. Piliers de gameplay

Le projet repose sur quatre piliers.

### 6.1 Lisibilité

Le joueur doit comprendre rapidement :

```text
ce qu’il contrôle
où il peut se déplacer
ce qui est dangereux
quel type de feu il affronte
quel objet est interactif
quel outil utiliser
```

Les éléments importants doivent donc être visuellement lisibles :

```text
joueur
flammes
fumée
portes
bouches d’incendie
camion
réserves de mousse
flaques de carburant
véhicules dangereux
objets interactifs
HUD
```

### 6.2 Gestion des ressources

Le joueur dispose notamment de :

```text
une jauge d’oxygène
une réserve d’eau
une réserve de mousse si le niveau le permet
```

Arroser sans réfléchir peut vider les ressources trop vite. Vouloir économiser à tout prix peut faire perdre du temps et laisser l’incendie progresser.

### 6.3 Choix du bon débit

Le joueur dispose de deux débits :

```text
weak = jet faible
strong = jet puissant
```

Le jet faible est précis, économique et efficace sur les petits foyers. Le jet puissant est coûteux, mais nécessaire contre les gros brasiers.

### 6.4 Apprentissage par l’échec

Certains game over doivent expliquer l’erreur du joueur :

```text
porte ouverte sans inspection
eau utilisée sur un feu de carburant
mauvais débit utilisé
proximité avec un véhicule en feu
oxygène épuisé
feu non contenu
```

Le game over doit aider le joueur à réussir la tentative suivante.

---

## 7. Agents d’extinction

Les agents d’extinction officiels sont :

```text
water = eau
foam = mousse
```

### Règle importante

Le joueur ne change pas d’agent avec une touche dédiée.

Le changement d’agent se fait uniquement via interaction avec un objet du décor :

```text
camion de pompier
réserve de mousse
casier d’équipement
borne d’approvisionnement
point de ravitaillement
```

Exemple manette :

```text
A — Changer d’équipement
```

Exemple clavier :

```text
E — Changer d’équipement
```

---

## 8. Débits de jet

Les débits officiels sont :

```text
weak = jet faible
strong = jet puissant
```

### Contrôle manette

```text
RT seul = weak
RT + RB = strong
```

### Fallback clavier / souris

```text
clic gauche ou espace = weak
Shift + clic gauche ou Shift + espace = strong
```

---

## 9. Tailles de feu

Les tailles de feu officielles sont :

```text
small = petit foyer
medium = foyer moyen
large = gros brasier
```

---

## 10. Types de feu

Les types de feu officiels sont :

```text
normal = feu classique
fuel = feu de carburant
infernal = feu spécial final, si implémenté
```

---

## 11. Règles d’efficacité feu / agent / débit

Règles générales :

```text
small + weak = très efficace
small + strong = fonctionne mais gaspille de la ressource

medium + weak = fonctionne, mais lentement
medium + strong = efficace, mais plus coûteux

large + weak = résiste ou ralentit seulement
large + strong = nécessaire pour éteindre

fuel + water = erreur / propagation / danger
fuel + foam = efficace

infernal = réservé au niveau final si implémenté
```

Ces règles doivent guider le système d’extinction, les feedbacks visuels et les conseils affichés en game over.

---

## 12. Contrôles officiels

### 12.1 Manette Xbox compatible PC

```text
Stick gauche = déplacement
Stick droit = visée
RT = projeter l’agent équipé
RB + RT = jet puissant
A = interaction principale
X = inspection
Start = pause
Y ou View = recommencer sur écran de mort
```

### Actions interdites

```text
Pas de bouton d’esquive.
Pas de bouton de recul rapide.
Pas de bouton de changement d’agent.
```

Le changement d’agent passe par les objets du décor.

### 12.2 Fallback clavier / souris

```text
ZQSD ou flèches = déplacement
Souris = visée
Clic gauche ou espace = projeter
Shift = jet puissant
E = interaction principale
F = inspection
Échap = pause
R = recommencer
```

---

## 13. Structure commune de l’input

`InputManager` doit retourner un objet d’état unique :

```js
{
    moveX: number,
    moveY: number,
    aimX: number,
    aimY: number,
    isShooting: boolean,
    isPowerJet: boolean,
    interactPressed: boolean,
    inspectPressed: boolean,
    pausePressed: boolean
}
```

### Signification

```text
moveX
Direction horizontale du déplacement. Valeur comprise entre -1 et 1.

moveY
Direction verticale du déplacement. Valeur comprise entre -1 et 1.

aimX
Direction horizontale de la visée.

aimY
Direction verticale de la visée.

isShooting
Vaut true tant que le joueur projette l’agent d’extinction.

isPowerJet
Vaut true lorsque le joueur utilise le jet puissant.

interactPressed
Vaut true uniquement au moment exact où le joueur déclenche l’interaction principale.

inspectPressed
Vaut true uniquement au moment exact où le joueur déclenche l’inspection.

pausePressed
Vaut true uniquement au moment exact où le joueur déclenche la pause.
```

### Règle importante

```text
isShooting et isPowerJet sont des états continus.
interactPressed, inspectPressed et pausePressed sont des appuis ponctuels.
```

---

## 14. Contrat technique — Dev 2 : Player + InputManager

Le Dev 2 fournit deux classes principales :

```text
InputManager
Player
```

Ces classes sont utilisées par les scènes de niveau, notamment `Level1Scene`.

### 14.1 InputManager

Fichier :

```text
src/systems/InputManager.js
```

Rôle :

```text
InputManager centralise les contrôles clavier, souris et manette.
Il ne déplace pas le joueur lui-même.
Il retourne uniquement un objet d’état décrivant les intentions du joueur.
```

Utilisation attendue dans une scène :

```js
this.inputManager = new InputManager(this);
```

Puis dans `update` :

```js
const inputState = this.inputManager.getState(this.player.getPosition());
```

Méthode publique obligatoire :

```js
getState(aimOrigin)
```

Paramètre :

```js
aimOrigin
```

Format attendu :

```js
{
    x: number,
    y: number
}
```

Retour attendu :

```js
{
    moveX: number,
    moveY: number,
    aimX: number,
    aimY: number,
    isShooting: boolean,
    isPowerJet: boolean,
    interactPressed: boolean,
    inspectPressed: boolean,
    pausePressed: boolean
}
```

Méthodes internes recommandées :

```text
getState()
updateKeyboardState()
updateMouseState()
updateGamepadState()
getFirstConnectedGamepad()
updateGamepadMovement()
updateGamepadAim()
updateGamepadActions()
isButtonDown()
wasGamepadButtonPressed()
saveCurrentGamepadButtons()
applyDeadzone()
normalizeMovement()
getNormalizedVector()
```

Propriétés internes recommandées :

```text
scene
keys
state
previousGamepadButtons
```

Constantes recommandées :

```text
GAMEPAD_DEADZONE
GAMEPAD_TRIGGER_THRESHOLD
MOUSE_AIM_DEADZONE
GAMEPAD_BUTTONS
```

### 14.2 Player

Fichier :

```text
src/objects/Player.js
```

Rôle :

```text
Player représente le pompier contrôlé par le joueur.
Il gère sa position, son déplacement, sa direction de visée et fournit les informations nécessaires aux autres systèmes.
```

Utilisation attendue dans une scène :

```js
this.player = new Player(this, 640, 360);
```

Puis dans `update` :

```js
this.player.update(inputState, delta);
```

Méthodes publiques obligatoires :

```js
update(inputState, delta)
```

Met à jour le joueur à partir de l’état d’input et du delta temps.

```js
getPosition()
```

Retourne la position actuelle du joueur.

Format attendu :

```js
{
    x: number,
    y: number
}
```

```js
getAimDirection()
```

Retourne la direction actuelle de visée.

Format attendu :

```js
{
    x: number,
    y: number
}
```

```js
getSprayOrigin()
```

Retourne le point de départ du jet d’eau ou de mousse.

Format attendu :

```js
{
    x: number,
    y: number
}
```

Cette méthode sera utilisée par les systèmes de jet, de feu et d’extinction.

Méthodes internes recommandées :

```text
update()
move()
updateAim()
updateAimLine()
keepInsideScreen()
getPosition()
getAimDirection()
getSprayOrigin()
```

Propriétés internes recommandées :

```text
scene
sprite
speed
lastAimX
lastAimY
aimLine
```

Constantes recommandées :

```text
PLAYER_SPEED
DEFAULT_AIM_X
DEFAULT_AIM_Y
```

### 14.3 Exemple d’intégration Player + InputManager

```js
import Player from '../objects/Player.js';
import InputManager from '../systems/InputManager.js';

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

    create() {
        this.inputManager = new InputManager(this);
        this.player = new Player(this, 640, 360);
    }

    update(time, delta) {
        const inputState = this.inputManager.getState(this.player.getPosition());

        this.player.update(inputState, delta);

        const sprayOrigin = this.player.getSprayOrigin();
        const aimDirection = this.player.getAimDirection();

        // Ces données peuvent être utilisées par le système d’extinction.
    }
}
```

### 14.4 Règle d’encapsulation

Les scènes officielles ne doivent pas accéder directement aux propriétés internes du joueur.

À éviter :

```js
this.player.sprite.x
this.player.lastAimX
this.player.lastAimY
```

À utiliser :

```js
this.player.getPosition()
this.player.getAimDirection()
this.player.getSprayOrigin()
```

Cela permet de modifier l’intérieur de `Player.js` sans casser le code des autres développeurs.

---

## 15. Contrat technique — Feux et extinction

Cette partie concerne principalement le système de feu.

### Classes prévues

```text
Fire
FireSystem
ExtinguishSystem
ResourceSystem
```

### Fire

Fichier :

```text
src/objects/Fire.js
```

Propriétés attendues :

```js
{
    size: 'small' | 'medium' | 'large',
    type: 'normal' | 'fuel' | 'infernal',
    hp: number,
    maxHp: number,
    isExtinguished: boolean
}
```

### FireSystem

Fichier :

```text
src/systems/FireSystem.js
```

Rôle :

```text
Gérer la liste des feux présents dans une scène.
Mettre à jour les feux.
Savoir si tous les feux critiques sont éteints.
```

Méthodes recommandées :

```text
addFire()
update()
allFiresExtinguished()
```

### ExtinguishSystem

Fichier :

```text
src/systems/ExtinguishSystem.js
```

Rôle :

```text
Appliquer les règles d’efficacité entre feu, agent et débit.
```

Méthode recommandée :

```js
applyJet({
    fire,
    agent,
    power,
    delta
})
```

Valeurs attendues :

```text
agent = 'water' | 'foam'
power = 'weak' | 'strong'
```

### ResourceSystem

Fichier :

```text
src/systems/ResourceSystem.js
```

Rôle :

```text
Gérer l’eau, la mousse et l’oxygène.
```

Propriétés attendues :

```text
water
foam
oxygen
```

Règles :

```text
Le jet faible consomme peu.
Le jet puissant consomme davantage.
L’oxygène diminue avec le temps.
L’oxygène peut diminuer plus vite dans la fumée ou près d’un gros brasier.
```

---

## 16. Objets interactifs

Objets prévus :

```text
FireTruck
SupplyPoint
Door
```

### FireTruck

Fichier :

```text
src/objects/FireTruck.js
```

Rôle :

```text
Point principal d’équipement.
Peut permettre de changer d’agent d’extinction.
Peut éventuellement servir de point de recharge selon le niveau.
```

### SupplyPoint

Fichier :

```text
src/objects/SupplyPoint.js
```

Rôle :

```text
Point de recharge ou d’approvisionnement.
Peut fournir de l’eau ou de la mousse.
```

Types possibles :

```text
water
foam
both
```

### Door

Fichier :

```text
src/objects/Door.js
```

Rôle :

```text
Objet interactif du niveau 2.
Peut être ouvert avec l’interaction principale.
Peut être inspecté avec l’action d’inspection.
Certaines portes peuvent être dangereuses.
```

États possibles :

```text
safe
dangerous
locked
opened
```

---

## 17. HUD et interface

L’interface doit rester lisible et minimale.

Éléments principaux :

```text
Jauge d’oxygène : haut gauche
Jauge de ressource équipée : bas gauche
Agent actuellement équipé : bas droite
Indication contextuelle : près de l’objet interactif ou bas centre
```

Exemples d’indications contextuelles :

```text
A — Recharger
A — Ouvrir
X — Inspecter
A — Changer d’équipement
```

Fallback clavier :

```text
E — Recharger
E — Ouvrir
F — Inspecter
E — Changer d’équipement
```

L’interface ne doit pas masquer les dangers ou les objets importants.

---

## 18. Écrans de briefing

Chaque briefing contient :

```text
nom du niveau
objectif
conseil de départ
```

Exemples :

```text
Faubourg des Étincelles
Objectif : Éteindre les foyers avant que le feu ne gagne la façade principale.
Conseil : Les petits foyers se traitent efficacement avec un jet faible. Les gros brasiers demandent plus de puissance.

Le Manoir aux Portes Rouges
Objectif : Atteindre la pièce principale et éteindre le foyer central.
Conseil : Certaines portes peuvent être dangereuses. Inspectez avant d’ouvrir.

L’Aire du Dernier Plein
Objectif : Neutraliser les feux autour de l’aire de station-service.
Conseil : Tous les feux ne se combattent pas avec de l’eau. Cherchez le bon équipement.

La Forêt de Brûlevent
Objectif : Contenir la propagation de l’incendie.
Conseil : Couper la route du feu peut être plus important que l’attaquer de face.

Le Cœur de Braise
Objectif : Éteindre les brasiers avant que la menace ne s’échappe.
Conseil : Utilisez tout ce que vous avez appris.
```

---

## 19. Game over pédagogique

Un écran de game over doit afficher :

```text
cause
explication
astuce
action pour recommencer
```

Exemples :

### Mauvais débit

```text
Cause : Le brasier a résisté.
Explication : Le jet faible ne suffit pas contre les gros foyers.
Astuce : Utilisez le jet puissant pour attaquer les brasiers importants.
Action : Appuyez sur Y pour recommencer.
```

### Ressource épuisée

```text
Cause : Réserve épuisée.
Explication : Le jet puissant consomme rapidement l’agent d’extinction.
Astuce : Utilisez le jet faible sur les petits foyers pour économiser votre réserve.
Action : Appuyez sur Y pour recommencer.
```

### Porte dangereuse

```text
Cause : Ouverture dangereuse.
Explication : Une porte suspecte peut cacher une montée brutale de flammes.
Astuce : Inspectez les portes avec X avant de les ouvrir.
Action : Appuyez sur Y pour recommencer.
```

### Feu de carburant

```text
Cause : Propagation du carburant.
Explication : L’eau peut aggraver certains feux de carburant.
Astuce : Rejoignez le camion ou une réserve adaptée pour utiliser la mousse.
Action : Appuyez sur Y pour recommencer.
```

### Véhicule en feu

```text
Cause : Explosion du véhicule.
Explication : Un véhicule en feu représente un danger immédiat.
Astuce : Gardez vos distances et traitez le foyer sans rester collé à la voiture.
Action : Appuyez sur Y pour recommencer.
```

---

## 20. Direction artistique commune

Tous les assets doivent respecter une direction artistique commune.

### Style général

```text
Strict 2D pixel art
Écran ou asset réellement exploitable en jeu
Grille pixel lisible
Formes propres de sprites
Esthétique rétro console cohérente
Vue top-down ou légèrement inclinée
Lisibilité arcade
```

### Palette de départ

```text
bleus de début de soirée
gris de crépuscule
bruns d’asphalte
rouges brique atténués
verts sombres
ambres de lampadaires
rouges d’urgence contrôlés
petits accents orange feu
```

### Progression visuelle

```text
Début : monde urbain crédible, malaise discret
Milieu : fumée plus dense, ombres plus longues, palette plus chaude
Fin : corruption plus visible, fissures, teintes orangées, ambiance infernale contrôlée
```

### Antagoniste

Au début :

```text
pyromane humain plausible
capuche
tenue sombre
visage partiellement couvert
sabotage discret
pas de traits démoniaques évidents
```

À éviter en début de jeu :

```text
cornes
yeux rouges
yeux en croix
pentagrammes
démon explicite
silhouette monstrueuse
symboles infernaux trop visibles
```

---

## 21. Prompt général de direction artistique

Prompt socle à utiliser pour les générations d’images :

```text
Strict 2D pixel art video game mockup, designed as an actual in-game screen or game asset prototype. The image must have a clearly readable pixel-art style, with visible pixel structure, clean sprite-like shapes, and a coherent retro console aesthetic.

The visual direction should feel like a polished indie pixel art game inspired by classic top-down adventure and arcade games. Prioritize readability, strong silhouettes, functional composition, and clear separation between characters, scenery, interactive objects, hazards, and UI elements.

The world should start grounded and believable. The atmosphere must not be fully horror or infernal at the beginning. The sense of unease should appear gradually through subtle visual details, not through obvious demon imagery.

Use a restrained color palette:
early evening blues,
soft dusk grays,
asphalt browns,
muted brick reds,
dark greens,
warm streetlight ambers,
controlled emergency red accents,
small warm orange fire accents.

Lighting should remain limited and grounded. Avoid exaggerated bloom, excessive glow, glossy reflections, neon-heavy lighting, magical effects, or cinematic over-lighting. Reflections, if present, must be modest and physically believable.

The art must remain strict pixel art. Do not make it look painterly, realistic, 3D, glossy, vector-like, anime-like, or like a cinematic concept art illustration.

The interface, when present, must look like a real game UI: readable, minimal, useful, and not overloaded. Avoid decorative HUD elements that do not serve gameplay. Avoid XP panels, rank systems, compasses, large side menus, or unnecessary UI clutter unless explicitly requested.

For the antagonist, keep the pyromaniac subtle at the beginning of the game. He should look like a believable human saboteur or concealed troublemaker before the supernatural reveal. Do not show obvious horns, demon symbols, glowing red eyes, pentagrams, monster features, or overt infernal motifs in early screens.

The visual progression of the game should move slowly from grounded urban tension toward increasing discomfort, then toward supernatural corruption only in later screens.
```

Bloc de restrictions à ajouter si nécessaire :

```text
Important restrictions:
Strict pixel art only.
Must look like a real in-game screen, not a poster.
Do not make it painterly.
Do not make it realistic.
Do not make it 3D.
Do not use excessive glow.
Do not use neon-heavy lighting.
Do not overuse reflections.
Do not make the image too dark.
Do not add obvious demon imagery in early-game screens.
Do not add pentagrams, horns, demon logos, monster silhouettes, or infernal symbols unless explicitly requested for late-game content.
Keep the composition readable, restrained, and coherent with a small indie pixel art game.
```

---

## 22. Conventions de nommage

### Classes

```text
PascalCase
```

Exemples :

```text
Player
InputManager
FireSystem
ResourceSystem
```

### Fichiers de classes

```text
PascalCase.js
```

Exemples :

```text
Player.js
InputManager.js
FireSystem.js
```

### Variables et méthodes

```text
camelCase
```

Exemples :

```text
getState()
lastAimX
isShooting
updateGamepadState()
```

### Constantes

```text
UPPER_SNAKE_CASE
```

Exemples :

```text
PLAYER_SPEED
GAMEPAD_DEADZONE
MOUSE_AIM_DEADZONE
```

---

## 23. Règles Git

### Branches

Personne ne travaille directement sur `main`.

Chaque développeur travaille sur sa branche :

```text
dev/prenom
```

Exemple :

```bash
git switch main
git pull
git switch -c dev/jordan
```

### Avant commit

Toujours vérifier :

```bash
git status
```

N’ajouter que les fichiers dont on est responsable.

Éviter :

```bash
git add *
git add .
```

Préférer :

```bash
git add src/objects/Player.js src/systems/InputManager.js
```

### À ne jamais commit

```text
node_modules/
```

### Fichiers de test locaux

Les fichiers de test locaux ne doivent pas être pushés.

Ils doivent être ignorés par `.gitignore`, par exemple :

```gitignore
local/
src/local/
```

---

## 24. Répartition des responsabilités

### Dev 1 — Scènes et navigation

Zone principale :

```text
src/main.js
src/config/gameConfig.js
src/scenes/BootScene.js
src/scenes/PreloadScene.js
src/scenes/TitleScene.js
src/scenes/WorldMapScene.js
src/scenes/BriefingScene.js
src/scenes/VictoryScene.js
src/scenes/GameOverScene.js
src/systems/GameState.js
src/data/levels.js
src/data/tips.js
```

Rôle :

```text
Flux des scènes
Carte du monde
Briefings
Transitions
Victoire
Game over
Données globales
```

### Dev 2 — Joueur et contrôles

Zone principale :

```text
src/objects/Player.js
src/systems/InputManager.js
```

Rôle :

```text
Déplacement
Visée
Input clavier
Input souris
Input manette
Contrat Player / InputManager
```

### Dev 3 — Feux et ressources

Zone principale :

```text
src/objects/Fire.js
src/systems/FireSystem.js
src/systems/ExtinguishSystem.js
src/systems/ResourceSystem.js
```

Rôle :

```text
Types de feux
Tailles de feux
Extinction
Règles eau / mousse
Règles weak / strong
Jauges eau / mousse / oxygène
```

### Dev 4 — Niveaux, objets interactifs et assets

Zone principale :

```text
src/scenes/Level1Scene.js
src/scenes/Level2Scene.js
src/scenes/Level3Scene.js
src/scenes/Level4Scene.js
src/scenes/FinalLevelScene.js
src/objects/Door.js
src/objects/FireTruck.js
src/objects/SupplyPoint.js
public/assets/
```

Rôle :

```text
Level design
Décors
Objets interactifs
Intégration des assets
Placement des feux
Placement des points d’approvisionnement
```

---

## 25. Règle d’or d’intégration

Chaque développeur peut utiliser les classes des autres, mais ne doit pas modifier leurs fichiers sans accord.

Exemple :

```text
Dev 4 peut utiliser Player.js.
Dev 4 ne modifie pas Player.js.

Dev 4 peut utiliser FireSystem.js.
Dev 4 ne modifie pas FireSystem.js.

Dev 2 peut tester InputManager localement.
Dev 2 ne modifie pas Level1Scene.js sans accord.
```

---

## 26. Objectif prioritaire du prototype

Le premier objectif commun est d’obtenir une boucle jouable minimale :

```text
écran titre
carte ou lancement simple du niveau 1
joueur contrôlable
visée
projection
feu qui perd des PV
jauge de ressource
jauge d’oxygène
victoire si tous les feux sont éteints
game over si oxygène atteint zéro
```

Tant que cette boucle n’est pas fonctionnelle, les cinématiques, effets avancés, assets définitifs et polish passent après.

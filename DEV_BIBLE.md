# DEV BIBLE — Pyro Panic: Devil’s Spark

## 1. Rôle du document

Ce document est la référence commune du projet **Pyro Panic: Devil’s Spark**.

Il fixe les conventions, les noms officiels, les contrats techniques entre fichiers, les contrôles, les règles de gameplay, l’état actuel de l’étape 1 et les décisions d’harmonisation prises pendant le développement.

L’objectif est simple : éviter les incohérences entre développeurs, limiter les conflits Git, garder une base lisible, et permettre à chacun d’intégrer son travail sans casser les modules des autres.

Toute modification importante de cette bible doit être annoncée à l’équipe.

---

## 2. Socle technique

Le projet utilise :

```text
Phaser 4
JavaScript vanilla
Vite
Node.js / npm
Git / GitHub
VS Code
```

Résolution de référence :

```text
1280 × 720
16:9
```

Tous les écrans, assets, placements temporaires et futures interfaces doivent être pensés pour cette résolution.

Import Phaser recommandé dans les fichiers JavaScript :

```js
import * as Phaser from 'phaser';
```

À éviter :

```js
import Phaser from 'phaser';
```

---

## 3. Concept du jeu

**Pyro Panic: Devil’s Spark** est un jeu d’action / puzzle en pixel art dans lequel un pompier intervient sur différents lieux incendiés par un pyromane.

Le gameplay repose sur :

```text
déplacement du pompier
visée indépendante
gestion d’oxygène
gestion de ressource d’extinction
choix du débit de jet
choix du bon agent d’extinction
apprentissage par l’échec
progression de niveau en niveau
```

Le ton visuel démarre de manière relativement crédible, puis glisse progressivement vers une ambiance plus inquiétante, surnaturelle et infernale.

---

## 4. Noms définitifs des niveaux

Les noms officiels des niveaux sont :

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
WorldMapScene
BriefingScene
VictoryScene
GameOverScene si nécessaire
documents de pitch
prompts d’assets
future interface graphique
```

Les anciens noms de travail ne doivent plus être utilisés.

---

## 5. Identifiants techniques des scènes

Les identifiants techniques validés sont :

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

Ces noms doivent rester stables, car ils servent aux transitions Phaser.

---

## 6. Flux global validé

Le flux global actuel est :

```text
BootScene
→ PreloadScene
→ TitleScene
→ WorldMapScene
→ BriefingScene
→ LevelScene
→ VictoryScene ou GameOverScene
→ retour WorldMapScene ou restart du niveau
```

Le niveau sélectionné est stocké dans `GameState` :

```js
gameState.currentLevelId;
```

La carte définit le niveau courant avant de lancer le briefing :

```js
gameState.setCurrentLevel(level.id);
this.scene.start('BriefingScene');
```

Le briefing retrouve ensuite le niveau courant via :

```js
levels.find((level) => level.id === gameState.currentLevelId);
```

---

## 7. État validé de l’étape 1

L’étape 1 vise une boucle jouable minimale.

État actuel validé :

```text
écran titre fonctionnel
carte fonctionnelle
briefing fonctionnel
niveau 1 jouable
joueur contrôlable au clavier / souris / manette
visée indépendante
jet visible
feux visibles
extinction localisée par portée et direction
consommation de ressource
oxygène qui baisse
victoire si tous les feux sont éteints
game over si oxygène à zéro
retour carte après victoire
déverrouillage du niveau 2 après victoire
persistance du déverrouillage via localStorage
MenuInputGuard utilisé sur les scènes de transition principales
build Vite fonctionnel
```

L’étape 1 ne cherche pas encore à finaliser les niveaux 2 à 5. Ils peuvent rester en placeholders ou en versions partielles tant que le niveau 1 démontre correctement la boucle de jeu.

---

## 8. Niveau 1 — Faubourg des Étincelles

Le niveau 1 sert de tutoriel gameplay.

Il doit enseigner :

```text
déplacement
visée
tir faible
tir puissant
gestion d’eau
gestion d’oxygène
différence petit foyer / gros brasier
victoire / défaite
```

Pour l’étape 1, le niveau 1 utilise uniquement :

```text
feux normaux
tailles small et large
agent water
pas de feu fuel
pas de changement d’agent
pas de recharge d’eau obligatoire
```

Le feu de carburant appartient plutôt au niveau 3.

La recharge d’eau existe comme possibilité future via `ResourceSystem.refillResources()`, mais elle n’est pas encore une mécanique validée du niveau 1.

---

## 9. Progression et sauvegarde

La progression est gérée par :

```text
src/systems/GameState.js
```

Propriétés principales :

```js
unlockedLevel;
currentLevelId;
lastResult;
```

Méthodes principales :

```js
setCurrentLevel(levelId);
isLevelUnlocked(levelId);
unlockNextLevel();
setLastResult(result);
resetRun();
save();
load();
```

Le déverrouillage est persistant via `localStorage`.

Clé utilisée :

```js
pyro - panic - game - state;
```

Pour réinitialiser la progression pendant les tests, utiliser dans la console navigateur :

```js
localStorage.removeItem('pyro-panic-game-state');
```

Ou, de manière plus large :

```js
localStorage.clear();
```

Règle importante : `VictoryScene` est responsable du déverrouillage du niveau suivant, pas `Level1Scene`.

Flux de victoire attendu :

```text
Level1Scene détecte que tous les feux sont éteints
→ lance VictoryScene
→ VictoryScene appelle gameState.unlockNextLevel()
→ retour carte
→ WorldMapScene lit gameState.isLevelUnlocked(levelId)
```

---

## 10. Contrôles gameplay

### Manette Xbox compatible PC

```text
Stick gauche = déplacement
Stick droit = visée
RT = projeter l’agent actif
RB + RT = jet puissant
A = interaction principale
X = inspection
Start = pause
Y ou View = recommencer sur écran de game over
```

### Clavier / souris

```text
ZQSD ou flèches = déplacement
Souris = visée
Clic gauche ou Espace = projeter
Shift + tir = jet puissant
E = interaction principale
F = inspection
Échap = pause
R = recommencer sur game over
```

Il n’y a pas de bouton d’esquive.

Il n’y a pas de bouton direct de changement d’agent. Le changement d’agent doit venir d’une interaction avec un objet du décor.

---

## 11. Contrôles menus et transitions

Les scènes de menu et transition utilisent `MenuInputGuard` pour éviter les validations en cascade lorsqu’une touche ou un bouton reste maintenu entre deux scènes.

Scènes concernées :

```text
TitleScene
WorldMapScene
BriefingScene
VictoryScene
GameOverScene
```

Règle générale :

```text
une scène de menu doit attendre :
1. un court délai de sécurité ;
2. le relâchement complet des inputs surveillés ;
3. un nouvel appui volontaire.
```

Cela évite par exemple :

```text
Espace maintenu dans Level1Scene
→ VictoryScene
→ skip automatique de VictoryScene
```

ou :

```text
A maintenu sur TitleScene
→ WorldMapScene
→ lancement automatique du briefing
```

### MenuInputGuard

Fichier :

```text
src/systems/MenuInputGuard.js
```

Rôle :

```text
centraliser la validation clavier / manette des menus
empêcher les skips d’écran
détecter les nouveaux appuis
gérer les touches maintenues entre scènes
```

Méthodes principales :

```js
updateReleaseState();
isPressed();
areInputsReleased();
endFrame();
isKeyboardKeyDown();
wasKeyboardKeyPressed();
isGamepadButtonDown();
wasGamepadButtonPressed();
saveCurrentInputs();
```

Le helper surveille à la fois :

```text
les touches Phaser
l’état physique réel du clavier via window.__PYRO_KEYBOARD_STATE__
les boutons manette via navigator.getGamepads()
```

Boutons manette menu courants :

```text
A = 0
Y = 3
View = 8
Start = 9
D-Pad haut = 12
D-Pad bas = 13
```

---

## 12. InputManager — contrat gameplay

Fichier :

```text
src/systems/InputManager.js
```

`InputManager` est réservé au gameplay. Il ne doit pas être utilisé pour les menus.

Il centralise les inputs :

```text
clavier
souris
manette
```

Il retourne un objet d’état unique :

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

Règles :

```text
moveX / moveY sont compris entre -1 et 1
aimX / aimY représentent une direction de visée
isShooting et isPowerJet sont des états continus
interactPressed, inspectPressed et pausePressed sont des appuis ponctuels
```

Utilisation attendue dans une scène de niveau :

```js
this.inputManager = new InputManager(this);
const input = this.inputManager.getState(this.player.getPosition());
```

La position du joueur est nécessaire pour calculer la visée souris.

Ne pas utiliser :

```js
InputManager.getState();
```

car `getState()` n’est pas une méthode statique.

---

## 13. Player — contrat technique

Fichier :

```text
src/objects/Player.js
```

Le joueur est actuellement un placeholder graphique Phaser, mais son contrat est stable.

Création :

```js
this.player = new Player(this, 400, 300);
```

Mise à jour :

```js
this.player.update(inputState, delta);
```

Méthodes publiques à utiliser par les scènes :

```js
getPosition();
getAimDirection();
getSprayOrigin();
```

Les scènes ne doivent pas appeler directement :

```js
player.move();
player.updateAim();
player.updateAimLine();
player.sprite.x;
player.sprite.y;
```

Règle d’intégration :

```text
Les scènes donnent un inputState au joueur.
Le joueur gère son déplacement et sa visée.
Les systèmes de tir utilisent getSprayOrigin() et getAimDirection().
```

---

## 14. Feux — Fire

Fichier :

```text
src/objects/Fire.js
```

Un feu possède :

```js
x;
y;
size;
type;
maxHp;
hp;
isExtinguished;
```

Tailles supportées :

```text
small
medium
large
```

Types supportés :

```text
normal
fuel
infernal plus tard si nécessaire
```

HP actuels :

```text
small = 40
medium = 100
large = 250
```

`medium` est supporté techniquement, mais n’est pas central pour l’étape 1. Il peut être utilisé plus tard pour l’équilibrage.

Méthode principale :

```js
takeDamage(amount);
```

---

## 15. ExtinguishSystem — règles d’extinction

Fichier :

```text
src/systems/ExtinguishSystem.js
```

Dégât de base actuel :

```js
baseDamage = 30;
```

Méthode principale :

```js
applyJet({ fire, agent, power, delta });
```

Agents :

```text
water
foam
```

Puissances :

```text
weak
strong
```

Règles actuelles :

```text
small + weak = efficace
small + strong = fonctionne mais gaspille
medium + weak = fonctionne lentement
medium + strong = efficace
large + weak = quasi inutile
large + strong = nécessaire et efficace
fuel + water = aggrave le feu
fuel + foam = efficace avec bonus
```

Valeurs actuelles d’efficacité :

```text
small + weak = 1.5
small + strong = 0.7
medium + weak = 0.6
medium + strong = 1.3
large + weak = 0.08
large + strong = 2.0
fuel + foam = coefficient final × 1.5
fuel + water = soin / aggravation du feu
```

---

## 16. ResourceSystem — ressources et oxygène

Fichier :

```text
src/systems/ResourceSystem.js
```

Ressources actuelles :

```js
activeAgent = 'water';
waterReserve = 100;
foamReserve = 100;
oxygen = 100;
```

Taux actuels :

```js
weak = 6;
strong = 15;
oxygenDepletion = 1;
```

Méthodes actuelles :

```js
update(delta);
changeAgent(newAgent);
refillResources(delta);
consumeAgent(power, delta);
isAsphyxiated();
```

Règles :

```text
l’oxygène diminue avec le temps
le jet faible consomme moins
le jet fort consomme plus
l’agent actif détermine quelle réserve est consommée
le changement d’agent doit venir d’un objet du décor
la recharge n’est pas encore exploitée dans le niveau 1
```

### Décision HUD — contrat technique HudView

La jauge unique de liquide actif (bleue pour l'eau, blanche/gris clair pour la mousse) et la jauge d'oxygène sont gérées de manière centralisée et modulaire via un composant dédié afin d'éviter la duplication de code entre les scènes de niveau.

Fichier :
src/objects/HudView.js

Contrat technique et initialisation :
Le HUD s'instancie dans la méthode create() de chaque scène de niveau en lui passant l'instance de la scène en paramètre :
this.hud = new HudView(this);

Mise à jour :
Pour actualiser l'état visuel et appliquer les animations, la scène doit appeler la méthode de mise à jour dans sa boucle update() principale :
this.hud.update();

Structure interne (Phaser 4) :
Pour des raisons de performance et de compatibilité avec l'API graphique de Phaser 4, le HUD manipule des objets natifs :

- Phaser.GameObjects.Rectangle pour les arrière-plans et les zones de crise (flash rouge).
- Phaser.GameObjects.TileSprite pour le remplissage texturé dynamique ('texture_water', 'texture_foam', 'texture_oxygen').
- Phaser.GameObjects.Graphics uniquement pour le tracé statique des bordures.

L'effet de secousse (shakeOffsetX/Y) lié à la consommation active de fluide est directement encapsulé dans la méthode update() de HudView, soulageant ainsi le code de la scène.

````

Les réserves restent séparées dans `ResourceSystem` :

```js
waterReserve;
foamReserve;
activeAgent;
````

Mais le HUD graphique futur devra afficher la réserve correspondant à `activeAgent`.

Afin de respecter l'encapsulation et d'éviter que les scènes ou la vue du HUD ne lisent directement les variables internes (`waterReserve`, `foamReserve`), la classe ResourceSystem expose les méthodes d'abstraction suivantes qui doivent être obligatoirement utilisées :

- getActiveReserve() : Retourne la valeur brute (0 à 100) de la réserve de l'agent actuellement équipé.
- getActiveReserveRatio() : Retourne un ratio de type float (0.0 à 1.0) basé sur l'agent actif, prêt pour le calcul de largeur (.width) des composants visuels.
- getOxygenRatio() : Retourne le ratio de type float (0.0 à 1.0) pour la jauge d'oxygène.
- getActiveAgentLabel() : Retourne une chaîne de caractères lisible ('Eau' ou 'Mousse').
- hasActiveResource() : Retourne un booléen indiquant si la réserve de l'agent équipé est strictement supérieure à 0.
- isAsphyxiated() : Retourne un booléen validant si le niveau d'oxygène a atteint 0.

````

Ces méthodes ne remplacent pas `waterReserve` et `foamReserve`, mais évitent que les scènes lisent directement les deux réserves pour construire le HUD.

---

## 17. Level1Scene — boucle jouable actuelle

Fichier :

```text
src/scenes/Level1Scene.js
````

Systèmes utilisés :

```js
InputManager;
Player;
ResourceSystem;
ExtinguishSystem;
Fire;
```

Constantes de jet :

```js
SPRAY_RANGE = 220;
SPRAY_WIDTH = 35;
```

Le jet ne touche pas tous les feux automatiquement. La scène calcule les feux touchés avec :

```text
origine du jet
direction de visée
projection du feu sur l’axe du jet
distance du feu à l’axe du jet
portée maximale
largeur de tolérance
```

Conditions de fin :

```text
tous les feux éteints → VictoryScene
oxygen <= 0 → GameOverScene avec reason: oxygen
```

Le niveau 1 est actuellement calibré avec deux feux :

```text
un feu small normal
un feu large normal
```

Le niveau doit rester terminable sans recharge si le joueur utilise correctement les débits.

---

## 18. Scènes de transition

### TitleScene

Rôle :

```text
écran d’accueil
validation vers WorldMapScene
```

Validation via `MenuInputGuard`.

Inputs :

```text
Espace
Entrée
A
Start
```

### WorldMapScene

Rôle :

```text
afficher les niveaux
indiquer les niveaux verrouillés
sélectionner un niveau
définir gameState.currentLevelId
lancer BriefingScene
```

Navigation :

```text
flèches haut / bas
Z / S
stick gauche vertical
D-Pad haut / bas
```

Validation :

```text
Espace
Entrée
A
Start
```

La validation passe par `MenuInputGuard`.

La navigation D-Pad reste gérée séparément car elle ne sert pas à valider.

### BriefingScene

Rôle :

```text
afficher le nom du niveau
afficher l’objectif
afficher le conseil
lancer la scène du niveau courant
```

Le niveau est récupéré depuis :

```js
gameState.currentLevelId;
```

Validation via `MenuInputGuard`.

### VictoryScene

Rôle :

```text
enregistrer la victoire
débloquer le niveau suivant
retourner à la carte
```

Appels importants :

```js
gameState.setLastResult('victory');
gameState.unlockNextLevel();
```

Validation via `MenuInputGuard`.

### GameOverScene

Rôle :

```text
afficher la cause d’échec
afficher l’explication
afficher une astuce pédagogique
relancer le niveau courant
```

Raison transmise :

```js
reason;
```

Niveau relancé :

```js
levelKey transmis ou retrouvé via GameState
```

Validation via `MenuInputGuard`.

Inputs :

```text
R
Espace
Entrée
Y
View
```

---

## 19. Tips de game over

Fichier :

```text
src/data/tips.js
```

Export :

```js
export default tips;
```

Clés actuelles :

```text
oxygen
weak_on_large
no_resource
door_danger
fuel_fire
vehicle_explosion
default
```

Chaque tip doit contenir :

```js
cause;
explanation;
tip;
```

Exemple d’utilisation :

```js
const tipData = tips[this.reason] || tips.default;
```

Ne pas utiliser `title` : la propriété correcte est `cause`.

---

## 20. Objets interactifs

Objets prévus / partiels :

```text
Door
FireTruck
SupplyPoint
```

Règle importante :

```text
Le changement d’agent ne doit pas être déclenché par un bouton direct.
Il doit venir d’une interaction avec un objet du décor.
```

Exemples futurs :

```text
camion de pompier
casier d’équipement
réserve de mousse
point d’approvisionnement
```

`SupplyPoint` et `FireTruck` peuvent servir plus tard à la recharge ou au changement d’agent.

Attention : certains objets utilisent encore des méthodes placeholder comme `draw(graphics)`. Cela reste acceptable pour prototype, mais ne doit pas être confondu avec le contrat du `Player`, qui n’a pas de méthode `draw()`.

---

## 21. Direction artistique

Style général :

```text
strict 2D pixel art
écran de jeu réel ou prototype d’asset
lisibilité prioritaire
formes sprite-like
palette restreinte
pas de rendu 3D
pas de rendu glossy
pas de concept art trop peint
```

Palette de départ :

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

Progression visuelle :

```text
début crédible et urbain
malaise léger
palette plus chaude après progression
fumée plus dense
fissures orangées plus tard
corruption infernale seulement en fin de jeu
```

Antagoniste au début :

```text
pyromane humain plausible
capuche
tenue sombre
visage partiellement couvert
pas de cornes visibles
pas d’yeux rouges évidents
pas de symbole démoniaque frontal
```

Révélation démoniaque seulement en fin de jeu.

---

## 22. Prompt général de DA

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

Restrictions à ajouter aux prompts :

```text
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

## 23. Conventions de nommage

Classes :

```text
PascalCase
```

Exemples :

```text
Player
InputManager
MenuInputGuard
FireSystem
ResourceSystem
```

Fichiers de classes :

```text
PascalCase.js
```

Variables et méthodes :

```text
camelCase
```

Exemples :

```text
getState()
lastAimX
isShooting
updateReleaseState()
```

Constantes :

```text
UPPER_SNAKE_CASE
```

Exemples :

```text
PLAYER_SPEED
GAMEPAD_DEADZONE
SPRAY_RANGE
INPUT_LOCK_DELAY
```

---

## 24. Git et workflow

Règles :

```text
ne pas travailler directement sur main
créer une branche dédiée par tâche
faire un git status avant chaque add / commit
éviter git add .
committer par petite unité logique
tester npm run dev
tester npm run build avant merge
ne jamais committer node_modules
ne pas committer dist sauf décision explicite de livraison
```

Exemple :

```bash
git switch main
git pull origin main
git switch -c harmonize/active-liquid-hud
```

Commit ciblé :

```bash
git add src/scenes/Level1Scene.js src/systems/ResourceSystem.js DEV_BIBLE.md
git commit -m "Harmonise affichage de la reserve active"
```

Merge propre :

```bash
git switch main
git pull origin main
git merge nom-de-branche
npm run build
git push origin main
```

---

## 25. Tests minimaux avant merge

Avant merge dans `main`, vérifier :

```text
npm run dev fonctionne
npm run build fonctionne
écran titre accessible clavier et manette
carte accessible clavier et manette
briefing non skippé par touche maintenue
niveau 1 jouable
victoire fonctionnelle
niveau 2 débloqué après victoire
déverrouillage persistant après refresh
game over fonctionnel
restart game over fonctionnel
pas de validation en cascade avec Espace ou A maintenus
```

Le warning Vite sur la taille du bundle n’est pas bloquant pour la gamejam.

---

## 26. Décisions à ne pas oublier

Décisions validées :

```text
Phaser 4
résolution 1280 × 720
manette prioritaire mais fallback clavier / souris
pas d’esquive
pas de changement d’agent par bouton direct
MenuInputGuard pour les menus
GameState persistant via localStorage
niveau 1 sans feu fuel
niveau 1 terminable sans recharge obligatoire
medium supporté mais non central
future jauge unique de liquide actif
```

Décisions futures à traiter plus tard :

```text
vrai HUD graphique pixel art
jauge liquide actif colorée bleu / blanc
intégration sprite pompier
intégration assets feu
changement d’agent via objet décor
mousse réellement utile au niveau 3
mécanique portes / inspection au niveau 2
mécanique carburant au niveau 3
mécanique propagation / vent au niveau 4
révélation finale au niveau 5
```

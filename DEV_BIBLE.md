# DEV BIBLE — Pyro Panic: Devil’s Spark

## 1. Noms définitifs des niveaux

1. Faubourg des Étincelles
2. Le Manoir aux Portes Rouges
3. L'Aire du Dernier Plein
4. La Forêt de Brûlevent
5. Le Coeur de Braise

Les anciens noms présents dans certains documents ou brouillons ne doivent plus être utilisés dans le code.

## 2. Identifiants techniques des scènes

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

## 3. Agents d’extinction

water = eau
foam = mousse

Important : le joueur ne change pas d’agent avec un simple bouton.
Le changement d’agent se fait uniquement via interaction avec un objet du décor :
camion, réserve de mousse, casier d’équipement ou point d’approvisionnement.

## 4. Débits de jet

weak = jet faible
strong = jet puissant

RT seul = weak
RT + RB = strong

Fallback clavier :
clic gauche ou espace = weak
Shift + clic gauche ou Shift + espace = strong

## 5. Tailles de feu

small = petit foyer
medium = foyer moyen
large = gros brasier

## 6. Types de feu

normal = feu classique
fuel = feu de carburant
infernal = feu spécial final, si implémenté

## 7. Règles de gameplay

small + weak = très efficace
small + strong = fonctionne mais gaspille
medium + weak = fonctionne lentement
medium + strong = efficace
large + weak = résiste ou ralentit seulement
large + strong = nécessaire pour éteindre
fuel + water = erreur / propagation
fuel + foam = efficace

## 8. Contrôles manette

Stick gauche = déplacement
Stick droit = visée
RT = projeter
RB + RT = jet puissant
A = interaction principale
X = inspection
Start = pause
Y ou View = recommencer sur écran de mort

Pas de bouton d’esquive.
Pas de bouton de changement d’agent.

## 9. Contrôles clavier / souris

ZQSD ou flèches = déplacement
Souris = visée
Clic gauche ou espace = projeter
Shift = jet puissant
E = interaction principale
F = inspection
Échap = pause
R = recommencer

## 10. Structure de l’input partagé

InputManager doit retourner un objet unique :

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

moveX / moveY sont compris entre -1 et 1.
aimX / aimY indiquent la direction de visée.
isShooting et isPowerJet sont continus.
interactPressed, inspectPressed et pausePressed doivent être vrais uniquement au moment de l’appui.

## 11. Spécifications fonctionnelles et Signatures (Zone Exclusive Dev 3)

Pour assurer une communication fluide entre la logique de simulation (Dev 3), les mouvements du personnage (Dev 2) et l'intégration des niveaux (Dev 4), les structures et comportements suivants sont définis textuellement :

### Fiche d'identité d'un incendie (Fire)

Chaque foyer de feu généré dans le jeu possède des caractéristiques précises à la naissance et durant sa vie :

- **positionX** : Sa position horizontale exacte sur la carte.
- **positionY** : Sa position verticale exacte sur la carte.
- **size** : Sa classification de taille obligatoire parmi trois choix exclusifs : small, medium ou large.
- **type** : Sa typologie dictant son comportement face aux agents : normal, fuel ou infernal.
- **hp** : Sa réserve actuelle de points de vie, mise à jour de façon dynamique.
- **maxHp** : Son seuil maximal initial de points de vie.
- **isExtinguished** : Son état de viabilité actuel, confirmant par un oui ou un non si le feu est éteint.
- **takeDamage** : Son mécanisme interne capable d'encaisser et de soustraire un montant de dégâts reçus pour réduire la santé du foyer jusqu'à sa disparition.

### Rôle du gestionnaire de simulation (FireSystem)

Ce module central supervise l'ensemble des incendies d'une même carte :

- **addFire** : La méthode permettant au Dev 4 d'ajouter instantanément un feu n'importe où en spécifiant ses paramètres de base (positionX, positionY, size, type).
- **update** : La boucle d'actualisation qui écoute en continu le temps qui passe pour synchroniser l'évolution ou la propagation des flammes de manière fluide.
- **allFiresExtinguished** : Le processus de vérification qui analyse en permanence tous les foyers répertoriés. Si et seulement si chaque élément est éteint, il confirme au système du Dev 4 que la zone est sécurisée pour déclencher la victoire.

### Fonctionnement du système d'extinction (ExtinguishSystem)

Ce composant traite l'impact physique de la lance sur les brasiers :

- **applyJet** : La fonction qui prend pour cible un incendie précis et analyse l'attaque du joueur en fonction de l'agent chimique utilisé (water ou foam), de la puissance du débit choisi (weak ou strong) et du temps de contact. Elle applique ensuite la matrice de dégâts ou de propagation conformément aux règles de gameplay établies.

### Gestionnaire des réserves et de la survie (ResourceSystem)

Ce système surveille l'état critique du pompier et la viabilité de son équipement :

- **update** : La boucle de contrôle qui réduit de manière constante le taux d'oxygène disponible pour simuler l'asphyxie et créer le chronomètre du niveau.
- **changeAgent** : La commande qui modifie instantanément le produit projeté par la lance (water ou foam). Cette action n'est pas déclenchée par un bouton du joueur, mais par un ordre externe reçu lors d'une interaction physique avec le décor.
- **refillResources** : Le processus qui permet de remonter progressivement les niveaux des réservoirs d'eau et de mousse lorsque le personnage stationne près d'une borne active.
- **consumeAgent** : Le mécanisme qui, à chaque tentative de tir, vérifie si la réserve du produit sélectionné contient assez de matière selon le débit (weak ou strong) et déduit la consommation si le tir est possible.
- **isAsphyxiated** : Le signal d'alarme qui prévient immédiatement le moteur du niveau si la jauge d'oxygène tombe à zéro pour déclencher la fin de partie.

## 12. Conventions de nommage

Classes : PascalCase
Exemples : Player, InputManager, FireSystem

Méthodes et variables : camelCase
Exemples : getState(), lastAimX, isShooting

Fichiers de classes : PascalCase
Exemples : Player.js, InputManager.js, FireSystem.js

Constantes éventuelles : UPPER_SNAKE_CASE
Exemples : PLAYER_SPEED, GAMEPAD_DEADZONE

## 13. Règle Git

Personne ne travaille sur main directement.
Chaque dev travaille sur sa branche.
Avant commit, chaque dev vérifie git status.
Personne ne modifie les fichiers attribués à un autre dev sans accord.
node_modules ne doit jamais être commit.

```

```

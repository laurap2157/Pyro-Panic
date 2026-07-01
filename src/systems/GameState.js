class GameState {
  constructor() { // initialise les valeurs de départ
    this.unlockedLevel = 1;
    this.currentLevelId = 1;
    this.lastResult = null;
  }

  setCurrentLevel(levelId) { // Le niveau actuel est mis à jour en fonction de l'identifiant du niveau passé en paramètre
    this.currentLevelId = levelId;
  }

  unlockNextLevel() { // Débloque le niveau suivant après une victoire
    if (this.unlockedLevel < 5) {
      this.unlockedLevel += 1;
    }
  }

  setLastResult(result) { // Met à jour le dernier résultat du joueur (victoire ou défaite)
    this.lastResult = result;
  }

  resetRun() { // Réinitialise la partie
    this.currentLevelId = 1;
    this.lastResult = null;
  }
}

const gameState = new GameState();
export default gameState;
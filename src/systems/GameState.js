class GameState {
  constructor() {
    // Niveau le plus avancé actuellement débloqué.
    // Au lancement, seul le niveau 1 est disponible.
    this.unlockedLevel = 1;

    // Niveau actuellement sélectionné / joué.
    this.currentLevelId = 1;

    // Dernier résultat connu : victory, defeat, ou null.
    this.lastResult = null;
  }

  setCurrentLevel(levelId) {
    this.currentLevelId = levelId;
  }

  isLevelUnlocked(levelId) {
    // Un niveau est accessible si son id est inférieur ou égal
    // au niveau maximum débloqué.
    return levelId <= this.unlockedLevel;
  }

  unlockNextLevel() {
    // On débloque le niveau suivant en fonction du niveau réellement terminé.
    // Cela évite qu’un replay du niveau 1 débloque accidentellement le niveau 3.
    const nextLevel = this.currentLevelId + 1;

    if (nextLevel <= 5 && nextLevel > this.unlockedLevel) {
      this.unlockedLevel = nextLevel;
    }
  }

  setLastResult(result) {
    this.lastResult = result;
  }

  resetRun() {
    this.currentLevelId = 1;
    this.lastResult = null;
    this.unlockedLevel = 1;
  }
}

const gameState = new GameState();

export default gameState;
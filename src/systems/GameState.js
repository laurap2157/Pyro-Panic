const STORAGE_KEY = 'pyro-panic-game-state';

class GameState {
  constructor() {
    // =====================================================
    // 1. Valeurs par défaut
    // =====================================================
    // Niveau le plus avancé actuellement débloqué.
    // Au lancement d'une nouvelle partie, seul le niveau 1 est disponible.
    this.unlockedLevel = 1;

    // Niveau actuellement sélectionné / joué.
    // Cette valeur sert surtout pendant une session active.
    this.currentLevelId = 1;

    // Dernier résultat connu : 'victory', 'defeat', ou null.
    this.lastResult = null;

    // =====================================================
    // 2. Chargement de la sauvegarde locale
    // =====================================================
    // Si une progression existe dans localStorage,
    // on restaure le niveau maximum débloqué.
    this.load();
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
    // Exemple : si currentLevelId vaut 1, on tente de débloquer le niveau 2.
    const nextLevel = this.currentLevelId + 1;

    // On empêche de dépasser le dernier niveau actuellement prévu.
    // On évite aussi de "reverrouiller" ou de régresser.
    if (nextLevel <= 5 && nextLevel > this.unlockedLevel) {
      this.unlockedLevel = nextLevel;
      this.save();
    }
  }

  setLastResult(result) {
    this.lastResult = result;
  }

  resetRun() {
    // Réinitialise l'état de session.
    // Ici, on réinitialise aussi la progression sauvegardée,
    // ce qui est pratique pour tester le jeu depuis le début.
    this.currentLevelId = 1;
    this.lastResult = null;
    this.unlockedLevel = 1;

    this.save();
  }

  save() {
    // Sécurité : localStorage n'existe que dans le navigateur.
    // Cette condition évite une erreur si le code est analysé ailleurs.
    if (typeof localStorage === 'undefined') {
      return;
    }

    const data = {
      unlockedLevel: this.unlockedLevel
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  load() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
      return;
    }

    try {
      const data = JSON.parse(rawData);

      if (typeof data.unlockedLevel === 'number') {
        // On borne la valeur pour éviter une sauvegarde corrompue.
        this.unlockedLevel = Math.max(1, Math.min(5, data.unlockedLevel));
      }
    } catch (error) {
      // Si la sauvegarde est illisible, on repart proprement du niveau 1.
      this.unlockedLevel = 1;
      this.save();
    }
  }
}

const gameState = new GameState();

export default gameState;
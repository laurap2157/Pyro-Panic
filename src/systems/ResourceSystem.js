export default class ResourceSystem {
  constructor() {
    this.activeAgent = 'water'; // 'water' ou 'foam', modifié via interaction avec un objet du décor.[cite: 3]

    this.waterReserve = 100; // Réserve d'eau en pourcentage.
    this.foamReserve = 100; // Réserve de mousse en pourcentage.

    this.oxygen = 100; // Oxygène en pourcentage.

    this.rates = {
      weak: 6, // Consommation lente.
      strong: 15, // Consommation rapide.
      oxygenDepletion: 1, // Perte d'oxygène par seconde.
    };

    // États requis pour le HUD (couleurs, textures et animations de secousse/pulsation)
    this.isConsuming = false;
    this.isRefilling = false;
  }

  update(delta) {
    const dt = delta / 1000;

    // Diminution constante de l'oxygène.
    this.oxygen = Math.max(0, this.oxygen - this.rates.oxygenDepletion * dt);

    // Réinitialisation des états visuels à chaque tick
    this.isConsuming = false;
    this.isRefilling = false;
  }

  // Appelé lorsqu’un objet interactif change l’agent équipé.
  // Important : le changement d'agent ne doit pas venir d'une touche directe.
  // Il doit venir d'une interaction avec un objet du décor.[cite: 3]
  changeAgent(newAgent) {
    if (newAgent === 'water' || newAgent === 'foam') {
      this.activeAgent = newAgent;
    }
  }

  // Retourne la réserve correspondant à l'agent actif.
  // Exemple :
  // - si activeAgent = "water", retourne waterReserve ;
  // - si activeAgent = "foam", retourne foamReserve.
  //
  // Cette méthode prépare le futur HUD graphique :
  // une seule jauge sera affichée, mais son contenu dépendra de l'agent actif.
  getActiveReserve() {
    if (this.activeAgent === 'water') {
      return this.waterReserve;
    }

    if (this.activeAgent === 'foam') {
      return this.foamReserve;
    }

    return 0;
  }

  // Retourne un ratio entre 0 et 1 pour dessiner facilement une jauge.
  // Exemple : 75% devient 0.75.
  getActiveReserveRatio() {
    return this.getActiveReserve() / 100;
  }

  // Retourne un ratio entre 0 et 1 pour dessiner la jauge d'oxygène.
  getOxygenRatio() {
    return this.oxygen / 100;
  }

  // Retourne un libellé lisible pour l'interface.
  getActiveAgentLabel() {
    if (this.activeAgent === 'water') {
      return 'Eau';
    }

    if (this.activeAgent === 'foam') {
      return 'Mousse';
    }

    return 'Inconnu';
  }

  // Indique si l'agent actif possède encore de la ressource.
  // Cela évite aux scènes de connaître directement waterReserve / foamReserve.
  hasActiveResource() {
    return this.getActiveReserve() > 0;
  }

  // Appelé lorsque le joueur utilise un point de recharge.
  refillResources(delta) {
    const dt = delta / 1000;
    this.isRefilling = true;

    this.waterReserve = Math.min(100, this.waterReserve + 25 * dt);
    this.foamReserve = Math.min(100, this.foamReserve + 25 * dt);
  }

  refillAgent(agent, amount = 100) {
    if (agent === 'water') {
      this.waterReserve = Math.min(100, this.waterReserve + amount);
      this.isRefilling = true;
      return true;
    }

    if (agent === 'foam') {
      this.foamReserve = Math.min(100, this.foamReserve + amount);
      this.isRefilling = true;
      return true;
    }

    if (agent === 'both') {
      this.waterReserve = Math.min(100, this.waterReserve + amount);
      this.foamReserve = Math.min(100, this.foamReserve + amount);
      this.isRefilling = true;
      return true;
    }

    return false;
  }

  consumeAgent(power, delta) {
    const dt = delta / 1000;
    const cost = power === 'strong' ? this.rates.strong : this.rates.weak;

    if (this.activeAgent === 'water') {
      if (this.waterReserve <= 0) {
        return false;
      }

      this.isConsuming = true;
      this.waterReserve = Math.max(0, this.waterReserve - cost * dt);
      return true;
    }

    if (this.activeAgent === 'foam') {
      if (this.foamReserve <= 0) {
        return false;
      }

      this.isConsuming = true;
      this.foamReserve = Math.max(0, this.foamReserve - cost * dt);
      return true;
    }

    return false;
  }

  isAsphyxiated() {
    return this.oxygen <= 0;
  }
}

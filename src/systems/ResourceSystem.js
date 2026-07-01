export default class ResourceSystem {
  constructor() {
    this.activeAgent = "water"; // 'water' ou 'foam' (modifié par Emilien via interaction)
    this.waterReserve = 100; // %
    this.foamReserve = 100; // %
    this.oxygen = 100; // % (Survie + Pression temporelle)

    this.rates = {
      weak: 6, // Consommation lente
      strong: 15, // Consommation rapide (gaspillage si mal utilisé)
      oxygenDepletion: 0.8, // Perte par seconde
    };
  }

  update(delta) {
    const dt = delta / 1000;
    // Diminution constante de l'oxygène
    this.oxygen = Math.max(0, this.oxygen - this.rates.oxygenDepletion * dt);
  }

  // Appelé lorsqu’un objet interactif change l’agent équipé.
  changeAgent(newAgent) {
    if (newAgent === "water" || newAgent === "foam") {
      this.activeAgent = newAgent;
    }
  }

  // Appelé lorsque le joueur utilise un point de recharge.
  refillResources(delta) {
    const dt = delta / 1000;
    this.waterReserve = Math.min(100, this.waterReserve + 25 * dt);
    this.foamReserve = Math.min(100, this.foamReserve + 25 * dt);
  }

  consumeAgent(power, delta) {
    const dt = delta / 1000;
    const cost = power === "strong" ? this.rates.strong : this.rates.weak;

    if (this.activeAgent === "water") {
      if (this.waterReserve <= 0) return false;
      this.waterReserve = Math.max(0, this.waterReserve - cost * dt);
      return true;
    } else {
      if (this.foamReserve <= 0) return false;
      this.foamReserve = Math.max(0, this.foamReserve - cost * dt);
      return true;
    }
  }

  isAsphyxiated() {
    return this.oxygen <= 0;
  }
}

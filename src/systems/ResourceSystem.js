export default class ResourceSystem {
  constructor() {
    this.activeAgent = 'water';

    this.waterReserve = 100;
    this.foamReserve = 100;

    this.oxygen = 100;

    this.rates = {
      weak: 6,
      strong: 15,
      oxygenDepletion: 1,
    };

    this.isConsuming = false;
    this.isRefilling = false;
  }

  update(delta) {
    const dt = delta / 1000;

    this.oxygen = Math.max(0, this.oxygen - this.rates.oxygenDepletion * dt);

    this.isConsuming = false;
    this.isRefilling = false;
  }

  changeAgent(newAgent) {
    if (newAgent === 'water' || newAgent === 'foam') {
      this.activeAgent = newAgent;
    }
  }

  getActiveReserve() {
    if (this.activeAgent === 'water') {
      return this.waterReserve;
    }

    if (this.activeAgent === 'foam') {
      return this.foamReserve;
    }

    return 0;
  }

  getActiveReserveRatio() {
    return this.getActiveReserve() / 100;
  }

  getOxygenRatio() {
    return this.oxygen / 100;
  }

  getActiveAgentLabel() {
    if (this.activeAgent === 'water') {
      return 'Eau';
    }

    if (this.activeAgent === 'foam') {
      return 'Mousse';
    }

    return 'Inconnu';
  }

  hasActiveResource() {
    return this.getActiveReserve() > 0;
  }

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

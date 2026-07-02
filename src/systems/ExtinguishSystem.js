export default class ExtinguishSystem {
  constructor() {
    this.baseDamage = 30;
  }

  applyJet({ fire, agent, power, delta }) {
    if (!fire || fire.isExtinguished) {
      return;
    }

    const dt = delta / 1000;
    let efficiency = 1.0;

    if (fire.type === "fuel" && agent === "water") {
      fire.hp = Math.min(fire.maxHp, fire.hp + this.baseDamage * 0.8 * dt);
      return;
    }

    if (fire.size === "small") {
      efficiency = power === "weak" ? 1.5 : 0.7;
    } else if (fire.size === "medium") {
      efficiency = power === "strong" ? 1.3 : 0.6;
    } else if (fire.size === "large") {
      efficiency = power === "strong" ? 2.0 : 0.08;
    }

    if (fire.type === "fuel" && agent === "foam") {
      efficiency *= 1.5;
    }

    const finalDamage = this.baseDamage * efficiency * dt;
    fire.takeDamage(finalDamage);
  }
}

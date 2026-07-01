export default class ExtinguishSystem {
  constructor() {
    this.baseDamage = 30;
  }

  applyJet({ fire, agent, power, delta }) {
    if (!fire || fire.isExtinguished) return;

    const dt = delta / 1000;
    let efficiency = 1.0;

    // RÈGLE : Feu de Carburant (Niveau 3) -> Eau interdite !
    if (fire.type === "fuel") {
      if (agent === "water") {
        // L'eau aggrave le feu (on redonne des HP au lieu d'en enlever)
        fire.hp = Math.min(fire.maxHp, fire.hp + this.baseDamage * 0.8 * dt);
        return;
      } else if (agent === "foam") {
        efficiency = 1.5; // La mousse étouffe le carburant
      }
    }

    // RÈGLE : Gestion des débits (Piliers 3)
    if (fire.size === "small") {
      efficiency = power === "weak" ? 1.5 : 0.7; // Jet fort = gaspillage sur petit feu
    } else if (fire.size === "medium") {
      efficiency = power === "strong" ? 1.3 : 0.6;
    } else if (fire.size === "large") {
      efficiency = power === "strong" ? 1.0 : 0.1; // Jet faible presque inutile sur gros brasier
    }

    const finalDamage = this.baseDamage * efficiency * dt;
    fire.takeDamage(finalDamage);
  }
}

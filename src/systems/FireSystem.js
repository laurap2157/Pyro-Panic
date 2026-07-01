import Fire from "../objects/Fire.js";

export default class FireSystem {
  constructor(scene) {
    this.scene = scene;
    this.fires = [];
  }

  addFire(config) {
    const fire = new Fire(config);
    this.fires.push(fire);
    return fire;
  }

  update(delta) {
    // Prêt pour une future logique de propagation (Niveau 4)
  }

  allFiresExtinguished() {
    if (this.fires.length === 0) return false;
    return this.fires.every((fire) => fire.isExtinguished);
  }
}

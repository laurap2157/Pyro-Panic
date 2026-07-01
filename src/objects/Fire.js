export default class Fire {
  constructor({ x, y, size = "small", type = "normal" }) {
    this.x = x;
    this.y = y;
    this.size = size; // 'small', 'medium', 'large'
    this.type = type; // 'normal', 'fuel' (Station Carburant)

    this.maxHp = this.determineMaxHp(size);
    this.hp = this.maxHp;
    this.isExtinguished = false;
  }

  determineMaxHp(size) {
    const hpMap = {
      small: 40,
      medium: 100,
      large: 250,
    };
    return hpMap[size] || 40;
  }

  takeDamage(amount) {
    if (this.isExtinguished) return;

    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isExtinguished = true;
    }
  }
}

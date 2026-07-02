export default class SupplyPoint {
  constructor(scene, config) {
    this.scene = scene;

    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 64;
    this.height = config.height || 64;

    // Agent rechargé par ce point.
    // Niveau 1 : uniquement 'water'.
    // Niveaux futurs : 'foam' ou 'both' si nécessaire.
    this.agent = config.agent || 'water';

    // Quantité ajoutée lors de l’interaction.
    this.amount = config.amount ?? 100;

    this.label = config.label || config.prompt || 'Approvisionnement';

    // Placeholder visuel.
    // Plus tard, ce rectangle pourra être remplacé par un sprite ou un élément de décor.
    this.sprite = scene.add.rectangle(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      this.height,
      0x2f8fff,
      0.45
    );

    this.sprite.setStrokeStyle(2, 0xffffff, 0.8);

    this.text = scene.add.text(
      this.x + this.width / 2,
      this.y - 18,
      this.label,
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      }
    ).setOrigin(0.5);
  }

  isPlayerInRange(playerPosition) {
    const margin = 28;

    return (
      playerPosition.x >= this.x - margin &&
      playerPosition.x <= this.x + this.width + margin &&
      playerPosition.y >= this.y - margin &&
      playerPosition.y <= this.y + this.height + margin
    );
  }

  interact(resourceSystem) {
    const hasRefilled = resourceSystem.refillAgent(this.agent, this.amount);

    return {
      success: hasRefilled,
      agent: this.agent,
      message: hasRefilled
        ? `Réapprovisionnement : ${this.getAgentLabel()}`
        : 'Réapprovisionnement impossible',
    };
  }

  getAgentLabel() {
    if (this.agent === 'water') {
      return 'eau';
    }

    if (this.agent === 'foam') {
      return 'mousse';
    }

    if (this.agent === 'both') {
      return 'eau + mousse';
    }

    return 'inconnu';
  }
}
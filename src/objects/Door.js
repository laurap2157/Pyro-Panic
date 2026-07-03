import * as Phaser from 'phaser';

export default class Door {
  constructor(scene, config) {
    this.scene = scene;

    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 80;
    this.height = config.height || 120;

    this.hasHiddenFire = config.hasHiddenFire || false;
    this.hiddenFireId = config.hiddenFireId || null;
    this.label = config.label || 'Porte';

    this.isInspected = false;
    this.isOpen = false;
    this.hasRevealedFire = false;
    this.hasBeenSprayedAfterInspection = false;

    this.interactionRange = config.interactionRange || 92;

    // Le décor contient déjà les portes fermées.
    // On ne crée donc aucun sprite de porte fermée côté code.
    // Seule la porte ouverte de la bonne porte est ajoutée,
    // masquée au départ, puis révélée après inspection + arrosage.
    this.openSprite = null;

    if (this.hasHiddenFire) {
      this.openSprite = scene.add.image(
        config.openSpriteX ?? this.x,
        config.openSpriteY ?? this.y,
        'open_door'
      );

      this.openSprite.setOrigin(
        config.openSpriteOriginX ?? 0.5,
        config.openSpriteOriginY ?? 1
      );

      this.openSprite.setScale(config.openSpriteScale ?? 0.18);

      // La porte ouverte doit rester devant le décor,
      // mais derrière le feu caché révélé et derrière le jet.
      this.openSprite.setDepth(config.openSpriteDepth ?? 6);
      this.openSprite.setVisible(false);
    }

    this.markerText = scene.add.text(this.x, this.y + 34, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffcc66',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.markerText.setDepth(50);
    this.markerText.setVisible(false);
  }

  isPlayerInRange(playerPosition) {
    return (
      Phaser.Math.Distance.Between(
        playerPosition.x,
        playerPosition.y,
        this.x,
        this.y
      ) <= this.interactionRange
    );
  }

  inspect() {
    this.isInspected = true;
    this.markerText.setVisible(true);

    if (this.hasHiddenFire) {
      this.markerText.setText('Chaleur !');

      return {
        success: true,
        danger: true,
        message: `${this.label} : chaleur anormale détectée. Arrosez la porte !`,
      };
    }

    this.markerText.setText('OK');

    return {
      success: true,
      danger: false,
      message: `${this.label} : rien d’inquiétant derrière.`,
    };
  }

  canReactToSpray(sprayOrigin, aimDirection, sprayRange, sprayWidth) {
    if (this.isOpen || this.hasBeenSprayedAfterInspection) {
      return false;
    }

    const doorVectorX = this.x - sprayOrigin.x;
    const doorVectorY = this.y - sprayOrigin.y;

    const projection =
      doorVectorX * aimDirection.x +
      doorVectorY * aimDirection.y;

    if (projection < 0 || projection > sprayRange) {
      return false;
    }

    const closestPointX = sprayOrigin.x + aimDirection.x * projection;
    const closestPointY = sprayOrigin.y + aimDirection.y * projection;

    const distanceToSpray = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      closestPointX,
      closestPointY
    );

    const doorHitRadius = Math.max(this.width, this.height) / 2;

    return distanceToSpray <= sprayWidth + doorHitRadius;
  }

  openAfterSpray() {
    if (!this.isInspected) {
      return {
        success: false,
        opened: false,
        revealedHiddenFire: false,
        hiddenFireId: null,
        message: `${this.label} : inspectez la porte avant de l’arroser.`,
      };
    }

    if (this.isOpen) {
      return {
        success: false,
        opened: false,
        revealedHiddenFire: false,
        hiddenFireId: null,
        message: `${this.label} est déjà ouverte.`,
      };
    }

    this.hasBeenSprayedAfterInspection = true;

    // Les portes sans feu restent de simples portes du décor.
    // Elles ne reçoivent pas de sprite ouvert.
    if (!this.hasHiddenFire) {
      return {
        success: true,
        opened: false,
        revealedHiddenFire: false,
        hiddenFireId: null,
        message: `${this.label} : aucun foyer derrière.`,
      };
    }

    this.isOpen = true;
    this.hasRevealedFire = true;
    this.markerText.setVisible(false);

    if (this.openSprite) {
      this.openSprite.setVisible(true);
    }

    return {
      success: true,
      opened: true,
      revealedHiddenFire: true,
      hiddenFireId: this.hiddenFireId,
      message: `${this.label} ouverte : feu découvert !`,
    };
  }
}

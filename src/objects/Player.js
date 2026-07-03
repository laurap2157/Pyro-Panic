const PLAYER_SPEED = 200;
const DEFAULT_AIM_X = 1;
const DEFAULT_AIM_Y = 0;

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = PLAYER_SPEED;
    this.lastAimX = DEFAULT_AIM_X;
    this.lastAimY = DEFAULT_AIM_Y;

    // Placeholder visuel actuel.
    // Plus tard, ce rectangle pourra être remplacé par un sprite animé,
    // mais le contrat public de Player devra rester le même.
    this.sprite = scene.add.rectangle(
      x,
      y,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      0x2f6fdd,
    );
    this.sprite.setStrokeStyle(2, 0xffffff);

    // Ligne de visée temporaire.
    this.aimLine = scene.add.line(0, 0, 0, 0, 48, 0, 0xffcc66);

    this.aimLine.setOrigin(0, 0);
    this.updateAimLine();
  }

  update(inputState, delta, collisionSystem = null) {
    const deltaInSeconds = delta / 1000;

    this.move(inputState, deltaInSeconds, collisionSystem);
    this.updateAim(inputState);
    this.updateAimLine();
  }

  move(inputState, deltaInSeconds, collisionSystem = null) {
    const deltaX = inputState.moveX * this.speed * deltaInSeconds;
    const deltaY = inputState.moveY * this.speed * deltaInSeconds;

    // Si aucun système de collision n'est fourni,
    // on garde le comportement précédent.
    if (!collisionSystem) {
      this.sprite.x += deltaX;
      this.sprite.y += deltaY;

      this.keepInsideScreen();
      return;
    }

    // Si un système de collision est fourni,
    // on convertit la position du joueur en hitbox rectangulaire.
    const currentHitbox = this.getHitbox();

    // Le CollisionSystem retourne une hitbox corrigée.
    // Il gère notamment le déplacement axe X puis axe Y
    // pour permettre au joueur de glisser le long des murs.
    const resolvedHitbox = collisionSystem.resolveMovement(
      currentHitbox,
      deltaX,
      deltaY,
    );

    // La hitbox utilise x/y en coin haut-gauche.
    // Le sprite Phaser utilise x/y au centre.
    this.sprite.x = resolvedHitbox.x + resolvedHitbox.width / 2;
    this.sprite.y = resolvedHitbox.y + resolvedHitbox.height / 2;

    this.keepInsideScreen();
  }

  updateAim(inputState) {
    const aimLength = Math.hypot(inputState.aimX, inputState.aimY);

    if (aimLength > 0) {
      this.lastAimX = inputState.aimX / aimLength;
      this.lastAimY = inputState.aimY / aimLength;
    }
  }

  updateAimLine() {
    this.aimLine.x = this.sprite.x;
    this.aimLine.y = this.sprite.y;
    this.aimLine.setTo(0, 0, this.lastAimX * 48, this.lastAimY * 48);
  }

  keepInsideScreen() {
    const halfWidth = PLAYER_WIDTH / 2;
    const halfHeight = PLAYER_HEIGHT / 2;

    this.sprite.x = Math.max(
      halfWidth,
      Math.min(1280 - halfWidth, this.sprite.x),
    );
    this.sprite.y = Math.max(
      halfHeight,
      Math.min(720 - halfHeight, this.sprite.y),
    );
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getHitbox() {
    // Hitbox ajustée pour du 32x32
    return {
      x: this.sprite.x - 8,
      y: this.sprite.y - 8,
      width: 16,
      height: 16,
    };
  }

  getAimDirection() {
    return { x: this.lastAimX, y: this.lastAimY };
  }

  getSprayOrigin() {
    return {
      x: this.sprite.x + this.lastAimX * 24,
      y: this.sprite.y + this.lastAimY * 24,
    };
  }
}

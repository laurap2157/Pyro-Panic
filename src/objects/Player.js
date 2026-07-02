const PLAYER_SPEED = 200;
const DEFAULT_AIM_X = 1;
const DEFAULT_AIM_Y = 0;

const PLAYER_WIDTH = 32; // Modifié
const PLAYER_HEIGHT = 32; // Modifié

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = PLAYER_SPEED;
    this.lastAimX = DEFAULT_AIM_X;
    this.lastAimY = DEFAULT_AIM_Y;

    this.sprite = scene.add.sprite(x, y, 'pompier');

    // Optionnel : agrandir le sprite si 32x32 paraît trop petit
    this.sprite.setScale(2);

    this.aimLine = scene.add.line(0, 0, 0, 0, 48, 0, 0xffcc66);
    this.aimLine.setOrigin(0, 0);
    this.updateAimLine();
  }

  update(inputState, delta, collisionSystem = null) {
    const deltaInSeconds = delta / 1000;
    this.move(inputState, deltaInSeconds, collisionSystem);
    this.updateAim(inputState);
    this.updateAimLine();
    this.updateAnimation(inputState);
  }

  updateAnimation(input) {
    if (input.moveX === 0 && input.moveY === 0) {
      this.sprite.anims.stop();
      return;
    }

    let anim = 'pompier-face';
    if (input.moveY > 0) anim = 'pompier-face';
    else if (input.moveY < 0) anim = 'pompier-dos';
    else if (input.moveX < 0) anim = 'pompier-gauche';
    else if (input.moveX > 0) anim = 'pompier-droite';

    this.sprite.play(anim, true);
  }

  move(inputState, deltaInSeconds, collisionSystem = null) {
    const deltaX = inputState.moveX * this.speed * deltaInSeconds;
    const deltaY = inputState.moveY * this.speed * deltaInSeconds;

    if (!collisionSystem) {
      this.sprite.x += deltaX;
      this.sprite.y += deltaY;
      this.keepInsideScreen();
      return;
    }

    const currentHitbox = this.getHitbox();
    const resolvedHitbox = collisionSystem.resolveMovement(
      currentHitbox,
      deltaX,
      deltaY,
    );

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

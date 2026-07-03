const PLAYER_SPEED = 220;
const DEFAULT_AIM_X = 1;
const DEFAULT_AIM_Y = 0;

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const PLAYER_SPRITE_SCALE = 2;

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.speed = PLAYER_SPEED;

        this.lastAimX = DEFAULT_AIM_X;
        this.lastAimY = DEFAULT_AIM_Y;

        this.hasAnimatedSprite = scene.textures.exists('pompier');

        if (this.hasAnimatedSprite) {
            this.sprite = scene.add.sprite(x, y, 'pompier', 0);
            this.sprite.setScale(PLAYER_SPRITE_SCALE);
            this.sprite.setDepth(3);
            this.screenHalfWidth = (PLAYER_WIDTH * PLAYER_SPRITE_SCALE) / 2;
            this.screenHalfHeight = (PLAYER_HEIGHT * PLAYER_SPRITE_SCALE) / 2;
        } else {
            this.sprite = scene.add.rectangle(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, 0x2f6fdd);
            this.sprite.setStrokeStyle(2, 0xffffff);
            this.screenHalfWidth = PLAYER_WIDTH / 2;
            this.screenHalfHeight = PLAYER_HEIGHT / 2;
        }

        this.aimLine = scene.add.line(
            0,
            0,
            0,
            0,
            48,
            0,
            0xffcc66
        );

        this.aimLine.setOrigin(0, 0);
        this.aimLine.setDepth(4);
        this.updateAimLine();
    }

    update(inputState, delta, collisionSystem = null) {
        const deltaInSeconds = delta / 1000;

        this.move(inputState, deltaInSeconds, collisionSystem);
        this.updateAim(inputState);
        this.updateAimLine();
        this.updateAnimation(inputState);
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
            deltaY
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

    updateAnimation(inputState) {
        if (!this.hasAnimatedSprite) {
            return;
        }

        if (inputState.moveX === 0 && inputState.moveY === 0) {
            this.sprite.anims.stop();
            return;
        }

        const animationKey = this.getAnimationKey(inputState);

        if (this.scene.anims.exists(animationKey)) {
            this.sprite.play(animationKey, true);
        }
    }

    getAnimationKey(inputState) {
        if (inputState.moveX < 0 && inputState.moveY < 0) {
            return 'pompier-diag-haut-gauche';
        }

        if (inputState.moveX > 0 && inputState.moveY < 0) {
            return 'pompier-diag-haut-droite';
        }

        if (inputState.moveX < 0 && inputState.moveY > 0) {
            return 'pompier-diag-bas-gauche';
        }

        if (inputState.moveX > 0 && inputState.moveY > 0) {
            return 'pompier-diag-bas-droite';
        }

        if (inputState.moveY < 0) {
            return 'pompier-dos';
        }

        if (inputState.moveY > 0) {
            return 'pompier-face';
        }

        if (inputState.moveX < 0) {
            return 'pompier-gauche';
        }

        return 'pompier-droite';
    }

    updateAimLine() {
        this.aimLine.x = this.sprite.x;
        this.aimLine.y = this.sprite.y;

        this.aimLine.setTo(
            0,
            0,
            this.lastAimX * 48,
            this.lastAimY * 48
        );
    }

    keepInsideScreen() {
        const halfWidth = this.screenHalfWidth;
        const halfHeight = this.screenHalfHeight;

        const sceneWidth = this.scene.scale.width;
        const sceneHeight = this.scene.scale.height;

        this.sprite.x = Math.max(
            halfWidth,
            Math.min(sceneWidth - halfWidth, this.sprite.x)
        );

        this.sprite.y = Math.max(
            halfHeight,
            Math.min(sceneHeight - halfHeight, this.sprite.y)
        );
    }

    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    getHitbox() {
        return {
            x: this.sprite.x - PLAYER_WIDTH / 2,
            y: this.sprite.y - PLAYER_HEIGHT / 2,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT
        };
    }

    getAimDirection() {
        return {
            x: this.lastAimX,
            y: this.lastAimY
        };
    }

    getSprayOrigin() {
        return {
            x: this.sprite.x + this.lastAimX * 24,
            y: this.sprite.y + this.lastAimY * 24
        };
    }
}

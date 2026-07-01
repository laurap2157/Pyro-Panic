const PLAYER_SPEED = 220;
const DEFAULT_AIM_X = 1;
const DEFAULT_AIM_Y = 0;

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.speed = PLAYER_SPEED;

        this.lastAimX = DEFAULT_AIM_X;
        this.lastAimY = DEFAULT_AIM_Y;

        this.sprite = scene.add.rectangle(x, y, 32, 32, 0x2f6fdd);
        this.sprite.setStrokeStyle(2, 0xffffff);

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
        this.updateAimLine();
    }

    update(inputState, delta) {
        const deltaInSeconds = delta / 1000;

        this.move(inputState, deltaInSeconds);
        this.updateAim(inputState);
        this.updateAimLine();
    }

    move(inputState, deltaInSeconds) {
        this.sprite.x += inputState.moveX * this.speed * deltaInSeconds;
        this.sprite.y += inputState.moveY * this.speed * deltaInSeconds;

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

        this.aimLine.setTo(
            0,
            0,
            this.lastAimX * 48,
            this.lastAimY * 48
        );
    }

    keepInsideScreen() {
        const halfSize = 16;

        this.sprite.x = Math.max(halfSize, Math.min(1280 - halfSize, this.sprite.x));
        this.sprite.y = Math.max(halfSize, Math.min(720 - halfSize, this.sprite.y));
    }

    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
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
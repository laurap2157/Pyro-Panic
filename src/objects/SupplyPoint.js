export default class SupplyPoint {
    constructor(scene, config) {
        this.scene = scene;

        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 64;
        this.height = config.height || 64;
        this.agent = config.agent || 'water';
        this.amount = config.amount ?? 100;
        this.label = config.label ?? config.prompt ?? '';

        this.sprite = scene.add.rectangle(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width,
            this.height,
            this.getColor(),
            0
        );
        this.sprite.setStrokeStyle(0, 0xffffff, 0);
        this.sprite.setDepth(1);
        this.sprite.setVisible(false);

        this.text = scene.add.text(
            this.x + this.width / 2,
            this.y - 18,
            '',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
            }
        );
        this.text.setOrigin(0.5);
        this.text.setDepth(5);
        this.text.setVisible(false);
    }

    getColor() {
        if (this.agent === 'foam') {
            return 0xcccccc;
        }

        if (this.agent === 'both') {
            return 0x90d8ff;
        }

        return 0x2f8fff;
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
                ? `Reapprovisionnement : ${this.getAgentLabel()}`
                : 'Reapprovisionnement impossible',
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

    draw(graphics) {
        graphics.fillStyle(this.getColor(), 0.45);
        graphics.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default class ScreenView {
  constructor(scene) {
    this.scene = scene;
    this.width = scene.scale.width;
    this.height = scene.scale.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  drawBackground(options = {}) {
    const accentColor = options.accentColor ?? 0xff8a2a;
    const dangerColor = options.dangerColor ?? 0x6f1d1b;

    this.scene.add.rectangle(
      this.centerX,
      this.centerY,
      this.width,
      this.height,
      0x101018
    );

    const graphics = this.scene.add.graphics();

    // Bande supérieure sombre.
    graphics.fillStyle(0x171b25, 1);
    graphics.fillRect(0, 0, this.width, 96);

    // Bande inférieure sombre.
    graphics.fillStyle(0x0c0f15, 1);
    graphics.fillRect(0, this.height - 92, this.width, 92);

    // Ligne d’accent, style signalisation / urgence.
    graphics.fillStyle(accentColor, 0.85);
    graphics.fillRect(0, 94, this.width, 3);

    graphics.fillStyle(dangerColor, 0.55);
    graphics.fillRect(0, this.height - 94, this.width, 2);

    // Quelques traits discrets pour casser le fond plat.
    graphics.lineStyle(1, 0xffffff, 0.05);

    for (let x = 0; x < this.width; x += 64) {
      graphics.lineBetween(x, 0, x - 160, this.height);
    }

    return graphics;
  }

  drawPanel(x, y, width, height, options = {}) {
    const fillColor = options.fillColor ?? 0x151a24;
    const strokeColor = options.strokeColor ?? 0xffcc66;
    const alpha = options.alpha ?? 0.92;

    const panel = this.scene.add.rectangle(
      x,
      y,
      width,
      height,
      fillColor,
      alpha
    );

    panel.setOrigin(0, 0);
    panel.setStrokeStyle(3, strokeColor, 0.9);

    const inner = this.scene.add.rectangle(
      x + 8,
      y + 8,
      width - 16,
      height - 16,
      fillColor,
      0
    );

    inner.setOrigin(0, 0);
    inner.setStrokeStyle(1, 0xffffff, 0.18);

    return panel;
  }

  addTitle(text, y, options = {}) {
    return this.scene.add.text(this.centerX, y, text, {
      fontFamily: 'monospace',
      fontSize: options.fontSize ?? '58px',
      color: options.color ?? '#ffe6a3',
      align: 'center',
    }).setOrigin(0.5);
  }

  addSubtitle(text, y, options = {}) {
    return this.scene.add.text(this.centerX, y, text, {
      fontFamily: 'monospace',
      fontSize: options.fontSize ?? '26px',
      color: options.color ?? '#ffb35c',
      align: 'center',
    }).setOrigin(0.5);
  }

  addBody(text, x, y, width, options = {}) {
    return this.scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: options.fontSize ?? '22px',
      color: options.color ?? '#d7d7d7',
      align: options.align ?? 'center',
      wordWrap: { width },
      lineSpacing: options.lineSpacing ?? 8,
    }).setOrigin(options.originX ?? 0.5, options.originY ?? 0.5);
  }

  addHint(text) {
    return this.scene.add.text(this.centerX, this.height - 48, text, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
  }

  addSmallLabel(text, x, y, options = {}) {
    return this.scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: options.fontSize ?? '18px',
      color: options.color ?? '#cccccc',
      align: options.align ?? 'center',
      wordWrap: { width: options.width ?? 320 },
    }).setOrigin(0.5);
  }

  addBadge(text, x, y, options = {}) {
    const width = options.width ?? 180;
    const height = options.height ?? 34;
    const fillColor = options.fillColor ?? 0x263243;
    const strokeColor = options.strokeColor ?? 0xffcc66;

    const rect = this.scene.add.rectangle(x, y, width, height, fillColor, 0.9);
    rect.setStrokeStyle(2, strokeColor, 0.85);

    const label = this.scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: options.fontSize ?? '16px',
      color: options.color ?? '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    return { rect, label };
  }
}
import * as Phaser from 'phaser';

export default class HudView {
  /**
   * @param {Phaser.Scene} scene - La scène Phaser parente
   */
  constructor(scene) {
    this.scene = scene;

    const startX = 24;
    const startY = 24;
    const barWidth = 200;
    const barHeight = 16;
    const spacing = 26;

    // --- INITIALISATION VISUELLE DE LA JAUGE D'AGENT ---
    this.agentBg = this.scene.add
      .rectangle(startX, startY, barWidth, barHeight, 0x2c3e50, 0.8)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);
    this.agentBar = this.scene.add
      .tileSprite(startX, startY, barWidth, barHeight, 'texture_water')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(101);
    this.agentFlash = this.scene.add
      .rectangle(startX, startY, barWidth, barHeight, 0xe74c3c, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);
    this.agentBorder = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(103);
    this.agentBorder.lineStyle(2, 0xffffff, 0.5);
    this.agentBorder.strokeRect(startX, startY, barWidth, barHeight);

    // --- INITIALISATION VISUELLE DE LA JAUGE D'OXYGÈNE ---
    const oxyY = startY + spacing;
    this.oxyBg = this.scene.add
      .rectangle(startX, oxyY, barWidth, barHeight, 0x2c3e50, 0.8)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);
    this.oxyBar = this.scene.add
      .tileSprite(startX, oxyY, barWidth, barHeight, 'texture_oxygen')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(101);
    this.oxyFlash = this.scene.add
      .rectangle(startX, oxyY, barWidth, barHeight, 0xe74c3c, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);
    this.oxyBorder = this.scene.add.graphics().setScrollFactor(0).setDepth(103);
    this.oxyBorder.lineStyle(2, 0xffffff, 0.5);
    this.oxyBorder.strokeRect(startX, oxyY, barWidth, barHeight);

    // Variables pour l'effet de secousse
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  update() {
    const resourceSystem = this.scene.resourceSystem;
    if (!resourceSystem) return;

    // 1. Gestion de la secousse de l'agent actif
    if (resourceSystem.isConsuming) {
      this.shakeOffsetX = (Math.random() - 0.5) * 4;
      this.shakeOffsetY = (Math.random() - 0.5) * 4;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    const startX = 24;
    const startY = 24;
    const barWidth = 200;

    // =====================================================
    // MISE À JOUR DE LA JAUGE D'AGENT ACTIF
    // =====================================================
    const agentRatio = resourceSystem.getActiveReserveRatio();
    const agentTexture =
      resourceSystem.activeAgent === 'water' ? 'texture_water' : 'texture_foam';

    const isAgentLow = resourceSystem.getActiveReserve() < 25;
    const isAgentFlashActive = Math.floor(this.scene.time.now / 200) % 2 === 0;

    if (this.agentBar.texture.key !== agentTexture) {
      this.agentBar.setTexture(agentTexture);
    }

    const currentAgentX = startX + this.shakeOffsetX;
    const currentAgentY = startY + this.shakeOffsetY;

    this.agentBg.setPosition(currentAgentX, currentAgentY);
    this.agentBar.setPosition(currentAgentX, currentAgentY);
    this.agentFlash.setPosition(currentAgentX, currentAgentY);

    this.agentBorder.clear();
    this.agentBorder.lineStyle(2, 0xffffff, 0.5);
    this.agentBorder.strokeRect(currentAgentX, currentAgentY, barWidth, 16);

    const currentAgentWidth = Math.max(0, barWidth * agentRatio);
    this.agentBar.width = currentAgentWidth;
    this.agentFlash.width = currentAgentWidth;

    if (agentRatio > 0 && isAgentLow && isAgentFlashActive) {
      this.agentFlash.setVisible(true);
      this.agentBar.setVisible(false);
    } else {
      this.agentFlash.setVisible(false);
      this.agentBar.setVisible(agentRatio > 0);
    }

    // =====================================================
    // MISE À JOUR DE LA JAUGE D'OXYGÈNE
    // =====================================================
    const oxyRatio = resourceSystem.getOxygenRatio();
    const isOxyLow = oxyRatio < 0.15;
    const isOxyFlashActive = Math.floor(this.scene.time.now / 150) % 2 === 0;

    const currentOxyWidth = Math.max(0, barWidth * oxyRatio);
    this.oxyBar.width = currentOxyWidth;
    this.oxyFlash.width = currentOxyWidth;

    if (oxyRatio > 0 && isOxyLow && isOxyFlashActive) {
      this.oxyFlash.setVisible(true);
      this.oxyBar.setVisible(false);
    } else {
      this.oxyFlash.setVisible(false);
      this.oxyBar.setVisible(oxyRatio > 0);
    }
  }
}

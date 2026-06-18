import { COLORS, TRAP_TYPES } from '../utils/constants.js';

export class Trap {
  constructor(scene, x, y, type, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = config;
    this.active = true;
    this.timer = 0;
    this.triggered = false;

    if (type === TRAP_TYPES.SPIKE) {
      this.createSpikeTrap();
    } else if (type === TRAP_TYPES.MOVING_PLATFORM) {
      this.createMovingPlatform();
    } else if (type === TRAP_TYPES.ROTATING) {
      this.createRotatingTrap();
    } else if (type === TRAP_TYPES.TELEPORT) {
      this.createTeleport();
    }
  }

  createSpikeTrap() {
    this.period = this.config.period || 3;
    this.duty = this.config.duty || 0.4;
    this.damage = this.config.damage || 1;

    this.base = this.scene.add.rectangle(this.x, this.y, 60, 60, COLORS.STONE, 0.6)
      .setStrokeStyle(2, COLORS.STONE_LIGHT)
      .setDepth(1);

    this.warningGlow = this.scene.add.rectangle(this.x, this.y, 56, 56, COLORS.RED, 0)
      .setDepth(1);

    this.spikeText = this.scene.add.text(this.x, this.y, '', { fontSize: '40px' })
      .setOrigin(0.5)
      .setDepth(4);
  }

  createMovingPlatform() {
    this.originalX = this.x;
    this.originalY = this.y;
    this.axis = this.config.axis || 'x';
    this.range = this.config.range || 150;
    this.speed = this.config.speed || 1.5;
    this.width = this.config.width || 100;
    this.height = this.config.height || 40;

    this.platform = this.scene.add.rectangle(this.x, this.y, this.width, this.height, COLORS.WOOD)
      .setStrokeStyle(3, COLORS.GOLD)
      .setDepth(2);

    this.arrowText = this.scene.add.text(this.x, this.y, this.axis === 'x' ? '⇆' : '⇅', {
      fontSize: '20px',
      color: '#d4a843',
      fontWeight: '900'
    }).setOrigin(0.5).setDepth(3);
  }

  createRotatingTrap() {
    this.radius = this.config.radius || 60;
    this.rotationSpeed = this.config.rotationSpeed || 2;
    this.currentAngle = 0;

    this.center = this.scene.add.circle(this.x, this.y, 8, COLORS.STONE)
      .setStrokeStyle(2, COLORS.GOLD)
      .setDepth(3);

    this.arm = this.scene.add.rectangle(this.x + this.radius, this.y, 80, 16, COLORS.RED_DARK)
      .setStrokeStyle(2, COLORS.RED)
      .setDepth(4);

    this.armTip = this.scene.add.text(this.x + this.radius + 30, this.y, '⚔️', {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(5);
  }

  createTeleport() {
    this.targetX = this.config.targetX || this.x;
    this.targetY = this.config.targetY || this.y;
    this.cooldown = this.config.cooldown || 5;
    this.lastUsed = -999;

    this.portalA = this.scene.add.circle(this.x, this.y, 28, COLORS.TEAL, 0.5)
      .setStrokeStyle(3, COLORS.TEAL)
      .setDepth(2);
    this.portalAText = this.scene.add.text(this.x, this.y, '🌀', {
      fontSize: '32px'
    }).setOrigin(0.5).setDepth(3);

    this.portalB = this.scene.add.circle(this.targetX, this.targetY, 28, COLORS.TEAL, 0.5)
      .setStrokeStyle(3, COLORS.TEAL)
      .setDepth(2);
    this.portalBText = this.scene.add.text(this.targetX, this.targetY, '🌀', {
      fontSize: '32px'
    }).setOrigin(0.5).setDepth(3);
  }

  update(delta, player, onPlayerHit, onTeleport) {
    this.timer += delta / 1000;

    if (this.type === TRAP_TYPES.SPIKE) {
      const phase = (this.timer % this.period) / this.period;
      const isActive = phase < this.duty;
      const isWarning = phase > this.duty - 0.3 && phase < this.duty;

      this.warningGlow.setAlpha(isWarning ? 0.3 + Math.sin(this.timer * 20) * 0.2 : 0);

      if (isActive) {
        this.spikeText.setText('🔺');
        if (!this.triggered && this.checkSpikeCollision(player)) {
          this.triggered = true;
          if (onPlayerHit) onPlayerHit();
        }
      } else {
        this.spikeText.setText('');
        this.triggered = false;
      }
    } else if (this.type === TRAP_TYPES.MOVING_PLATFORM) {
      const offset = Math.sin(this.timer * this.speed) * this.range;
      if (this.axis === 'x') {
        this.x = this.originalX + offset;
      } else {
        this.y = this.originalY + offset;
      }
      this.platform.setPosition(this.x, this.y);
      this.arrowText.setPosition(this.x, this.y);
    } else if (this.type === TRAP_TYPES.ROTATING) {
      this.currentAngle += this.rotationSpeed * (delta / 1000);
      const armX = this.x + Math.cos(this.currentAngle) * this.radius;
      const armY = this.y + Math.sin(this.currentAngle) * this.radius;
      this.arm.setPosition(armX, armY);
      this.arm.setRotation(this.currentAngle);
      this.armTip.setPosition(armX + Math.cos(this.currentAngle) * 30, armY + Math.sin(this.currentAngle) * 30);

      const dx = player.x - armX;
      const dy = player.y - armY;
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
        if (!this.triggered) {
          this.triggered = true;
          if (onPlayerHit) onPlayerHit();
          const pushAngle = Math.atan2(dy, dx);
          player.x += Math.cos(pushAngle) * 50;
          player.y += Math.sin(pushAngle) * 50;
        }
      } else {
        this.triggered = false;
      }
    } else if (this.type === TRAP_TYPES.TELEPORT) {
      this.portalA.setRotation(this.timer * 2);
      this.portalB.setRotation(-this.timer * 2);

      const canUse = this.timer - this.lastUsed > this.cooldown;
      const alpha = canUse ? 0.8 : 0.2;
      this.portalA.setAlpha(alpha);
      this.portalB.setAlpha(alpha);
      this.portalAText.setAlpha(canUse ? 1 : 0.4);
      this.portalBText.setAlpha(canUse ? 1 : 0.4);

      if (canUse) {
        let teleported = false;
        const dxA = player.x - this.x;
        const dyA = player.y - this.y;
        if (Math.sqrt(dxA * dxA + dyA * dyA) < 30) {
          player.x = this.targetX;
          player.y = this.targetY;
          teleported = true;
        } else {
          const dxB = player.x - this.targetX;
          const dyB = player.y - this.targetY;
          if (Math.sqrt(dxB * dxB + dyB * dyB) < 30) {
            player.x = this.x;
            player.y = this.y;
            teleported = true;
          }
        }
        if (teleported) {
          this.lastUsed = this.timer;
          if (onTeleport) onTeleport();
        }
      }
    }
  }

  checkSpikeCollision(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 35;
  }

  destroy() {
    if (this.base) this.base.destroy();
    if (this.warningGlow) this.warningGlow.destroy();
    if (this.spikeText) this.spikeText.destroy();
    if (this.platform) this.platform.destroy();
    if (this.arrowText) this.arrowText.destroy();
    if (this.center) this.center.destroy();
    if (this.arm) this.arm.destroy();
    if (this.armTip) this.armTip.destroy();
    if (this.portalA) this.portalA.destroy();
    if (this.portalAText) this.portalAText.destroy();
    if (this.portalB) this.portalB.destroy();
    if (this.portalBText) this.portalBText.destroy();
  }
}

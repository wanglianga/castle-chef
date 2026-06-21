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
    this.wasActivePhase = false;
    this.dodgeCounted = false;

    if (type === TRAP_TYPES.SPIKE) {
      this.createSpikeTrap();
    } else if (type === TRAP_TYPES.MOVING_PLATFORM) {
      this.createMovingPlatform();
    } else if (type === TRAP_TYPES.ROTATING) {
      this.createRotatingTrap();
    } else if (type === TRAP_TYPES.TELEPORT) {
      this.createTeleport();
    } else if (type === TRAP_TYPES.FLOOR_ROTATION) {
      this.createFloorRotation();
    } else if (type === TRAP_TYPES.FIRE_FLUCTUATION) {
      this.createFireFluctuation();
    } else if (type === TRAP_TYPES.WINDOW_SWAP) {
      this.createWindowSwap();
    } else if (type === TRAP_TYPES.KNIFE_SLIDE) {
      this.createKnifeSlide();
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

  createFloorRotation() {
    this.period = this.config.period || 4;
    this.radius = this.config.radius || 80;
    this.rotationSpeed = this.config.rotationSpeed || 1.5;
    this.damage = this.config.damage || 1;

    this.floorBase = this.scene.add.circle(this.x, this.y, this.radius, COLORS.STONE, 0.4)
      .setStrokeStyle(3, COLORS.GOLD)
      .setDepth(1);

    this.floorArrows = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2);
      const arrow = this.scene.add.text(
        this.x + Math.cos(angle) * (this.radius - 20),
        this.y + Math.sin(angle) * (this.radius - 20),
        '↻', { fontSize: '20px', color: '#d4a843', fontWeight: '900' }
      ).setOrigin(0.5).setDepth(2);
      this.floorArrows.push({ arrow, angle });
    }

    this.warningRing = this.scene.add.circle(this.x, this.y, this.radius + 5, COLORS.RED, 0)
      .setStrokeStyle(2, COLORS.RED)
      .setDepth(1);
  }

  createFireFluctuation() {
    this.period = this.config.period || 5;
    this.baseIntensity = this.config.baseIntensity || 1;
    this.damage = this.config.damage || 1;
    this.affectedRadius = this.config.affectedRadius || 100;

    this.fireBase = this.scene.add.circle(this.x, this.y, 40, COLORS.RED_DARK, 0.3)
      .setStrokeStyle(3, COLORS.ORANGE)
      .setDepth(1);

    this.fireEmoji = this.scene.add.text(this.x, this.y, '🔥', { fontSize: '36px' })
      .setOrigin(0.5).setDepth(3);

    this.heatWave = this.scene.add.circle(this.x, this.y, this.affectedRadius, COLORS.ORANGE, 0)
      .setDepth(0);
  }

  createWindowSwap() {
    this.table1 = this.config.table1 || 1;
    this.table2 = this.config.table2 || 2;
    this.cooldown = this.config.cooldown || 8;
    this.lastSwap = -999;

    this.swapIndicator1 = this.scene.add.text(this.x - 30, this.y, '🔄', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(3);

    this.swapIndicator2 = this.scene.add.text(this.x + 30, this.y, '🔄', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(3);

    this.label = this.scene.add.text(this.x, this.y, `桌${this.table1}⇄桌${this.table2}`, {
      fontSize: '14px', color: '#f5deb3', fontFamily: 'Cinzel, serif', fontWeight: '700'
    }).setOrigin(0.5).setDepth(4);

    this.glow = this.scene.add.rectangle(this.x, this.y, 80, 40, COLORS.TEAL, 0)
      .setDepth(2);
  }

  createKnifeSlide() {
    this.axis = this.config.axis || 'x';
    this.range = this.config.range || 120;
    this.speed = this.config.speed || 2;
    this.damage = this.config.damage || 1;
    this.originalX = this.x;
    this.originalY = this.y;

    this.track = this.scene.add.rectangle(
      this.x, this.y,
      this.axis === 'x' ? this.range * 2 + 20 : 20,
      this.axis === 'x' ? 20 : this.range * 2 + 20,
      COLORS.STONE, 0.3
    ).setStrokeStyle(2, COLORS.STONE_LIGHT)
     .setDepth(1);

    this.knife = this.scene.add.text(this.x, this.y, '🔪', { fontSize: '32px' })
      .setOrigin(0.5).setDepth(3);

    this.trail = this.scene.add.rectangle(this.x, this.y, 30, 10, COLORS.RED, 0.3)
      .setDepth(2);
  }

  update(delta, player, onPlayerHit, onTeleport, onDodge) {
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
    } else if (this.type === TRAP_TYPES.FLOOR_ROTATION) {
      const phase = (this.timer % this.period) / this.period;
      const isActive = phase < 0.5;
      const isWarning = phase > 0.35 && phase < 0.5;

      this.warningRing.setAlpha(isWarning ? 0.3 + Math.sin(this.timer * 15) * 0.2 : 0);

      for (const { arrow, angle } of this.floorArrows) {
        const rotatedAngle = angle + this.timer * this.rotationSpeed;
        arrow.setPosition(
          this.x + Math.cos(rotatedAngle) * (this.radius - 20),
          this.y + Math.sin(rotatedAngle) * (this.radius - 20)
        );
        arrow.setRotation(rotatedAngle);
      }

      if (isActive) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius) {
          const pushAngle = Math.atan2(dy, dx) + (this.rotationSpeed * 0.5);
          player.x += Math.cos(pushAngle) * 2;
          player.y += Math.sin(pushAngle) * 2;
          if (dist < 30 && !this.triggered) {
            this.triggered = true;
            if (onPlayerHit) onPlayerHit();
          }
        }
        if (this.wasActivePhase && !this.dodgeCounted) {
          const dx2 = player.x - this.x;
          const dy2 = player.y - this.y;
          if (Math.sqrt(dx2 * dx2 + dy2 * dy2) >= this.radius) {
            this.dodgeCounted = true;
            if (onDodge) onDodge('floor_rotation');
          }
        }
      } else {
        this.triggered = false;
        if (this.wasActivePhase) {
          this.dodgeCounted = false;
        }
      }
      this.wasActivePhase = isActive;

    } else if (this.type === TRAP_TYPES.FIRE_FLUCTUATION) {
      const phase = (this.timer % this.period) / this.period;
      const intensity = (Math.sin(phase * Math.PI * 2) + 1) / 2;
      const currentRadius = 40 + intensity * 60;

      this.fireEmoji.setFontSize(32 + intensity * 20);
      this.fireEmoji.setAlpha(0.7 + intensity * 0.3);
      this.heatWave.setRadius(this.affectedRadius * intensity);
      this.heatWave.setAlpha(intensity * 0.2);
      this.fireBase.setRadius(currentRadius);

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (intensity > 0.7 && dist < currentRadius) {
        if (!this.triggered) {
          this.triggered = true;
          if (onPlayerHit) onPlayerHit();
        }
      } else if (intensity < 0.3) {
        this.triggered = false;
        if (this.wasActivePhase && !this.dodgeCounted) {
          this.dodgeCounted = true;
          if (onDodge) onDodge('fire_fluctuation');
        }
      }
      this.wasActivePhase = intensity > 0.7;

    } else if (this.type === TRAP_TYPES.WINDOW_SWAP) {
      const canSwap = this.timer - this.lastSwap > this.cooldown;
      const swapSoon = this.timer - this.lastSwap > this.cooldown - 2;

      const pulseAlpha = swapSoon ? 0.3 + Math.sin(this.timer * 10) * 0.2 : 0;
      this.glow.setAlpha(pulseAlpha);
      this.swapIndicator1.setAlpha(canSwap ? 1 : 0.4);
      this.swapIndicator2.setAlpha(canSwap ? 1 : 0.4);

      if (canSwap && swapSoon) {
        const angle = this.timer * 3;
        this.swapIndicator1.setPosition(this.x - 30 + Math.sin(angle) * 5, this.y);
        this.swapIndicator2.setPosition(this.x + 30 + Math.sin(angle + Math.PI) * 5, this.y);
      }
    } else if (this.type === TRAP_TYPES.KNIFE_SLIDE) {
      const offset = Math.sin(this.timer * this.speed) * this.range;
      let newX = this.x;
      let newY = this.y;
      if (this.axis === 'x') {
        newX = this.originalX + offset;
      } else {
        newY = this.originalY + offset;
      }

      const prevX = this.knife.x;
      const prevY = this.knife.y;
      this.knife.setPosition(newX, newY);
      this.trail.setPosition((newX + prevX) / 2, (newY + prevY) / 2);
      this.trail.setRotation(Math.atan2(newY - prevY, newX - prevX));

      const dx = player.x - newX;
      const dy = player.y - newY;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        if (!this.triggered) {
          this.triggered = true;
          if (onPlayerHit) onPlayerHit();
        }
      } else {
        if (this.triggered && !this.dodgeCounted) {
          this.dodgeCounted = true;
          if (onDodge) onDodge('knife_slide');
        }
        this.triggered = false;
      }
    }
  }

  checkSpikeCollision(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 35;
  }

  swapTables(orders) {
    if (this.timer - this.lastSwap < this.cooldown) return false;
    this.lastSwap = this.timer;

    for (const order of orders) {
      if (order.completed || order.failed) continue;
      if (order.targetTable === this.table1) {
        order.targetTable = this.table2;
      } else if (order.targetTable === this.table2) {
        order.targetTable = this.table1;
      }
    }
    return true;
  }

  getFireIntensity() {
    if (this.type !== TRAP_TYPES.FIRE_FLUCTUATION) return 1;
    const phase = (this.timer % this.period) / this.period;
    return (Math.sin(phase * Math.PI * 2) + 1) / 2;
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

    if (this.floorBase) this.floorBase.destroy();
    if (this.warningRing) this.warningRing.destroy();
    if (this.floorArrows) {
      for (const { arrow } of this.floorArrows) arrow.destroy();
    }

    if (this.fireBase) this.fireBase.destroy();
    if (this.fireEmoji) this.fireEmoji.destroy();
    if (this.heatWave) this.heatWave.destroy();

    if (this.swapIndicator1) this.swapIndicator1.destroy();
    if (this.swapIndicator2) this.swapIndicator2.destroy();
    if (this.label) this.label.destroy();
    if (this.glow) this.glow.destroy();

    if (this.track) this.track.destroy();
    if (this.knife) this.knife.destroy();
    if (this.trail) this.trail.destroy();
  }
}

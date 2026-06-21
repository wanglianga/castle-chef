import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_DASH_SPEED,
  PLAYER_DASH_DURATION,
  PLAYER_DASH_COOLDOWN,
  PLAYER_STUN_DURATION,
  PLAYER_MAX_HEALTH,
  COLORS
} from '../utils/constants.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.health = PLAYER_MAX_HEALTH;
    this.isStunned = false;
    this.stunTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dashDirection = { x: 0, y: 0 };
    this.facing = 'down';
    this.inventory = [];
    this.maxInventory = 3;
    this.hurtFlashTimer = 0;
    this.speedBoost = 0;
    this.speedBoostTimer = 0;
    this.speedBoostStacks = 0;

    this.body = scene.add.container(x, y);

    const bodyCircle = scene.add.circle(0, 0, 20, COLORS.GOLD_LIGHT).setStrokeStyle(3, COLORS.BROWN_DARK);
    const hat = scene.add.text(0, -18, '👨‍🍳', { fontSize: '28px' }).setOrigin(0.5);

    this.heldItem1 = scene.add.text(-22, 22, '', { fontSize: '18px' }).setOrigin(0.5);
    this.heldItem2 = scene.add.text(0, 24, '', { fontSize: '18px' }).setOrigin(0.5);
    this.heldItem3 = scene.add.text(22, 22, '', { fontSize: '18px' }).setOrigin(0.5);

    this.body.add([bodyCircle, hat, this.heldItem1, this.heldItem2, this.heldItem3]);
    this.body.setDepth(10);

    this.cursors = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      interact: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    this.dashKeyJustDown = false;
    this.interactKeyJustDown = false;
  }

  update(delta) {
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    this.hurtFlashTimer = Math.max(0, this.hurtFlashTimer - delta);
    this.speedBoostTimer = Math.max(0, this.speedBoostTimer - delta);

    if (this.speedBoostTimer <= 0) {
      this.speedBoost = 0;
      this.speedBoostStacks = 0;
    }

    if (this.hurtFlashTimer > 0) {
      this.body.alpha = Math.sin(this.hurtFlashTimer * 0.03) > 0 ? 1 : 0.3;
    } else {
      this.body.alpha = 1;
    }

    if (this.isStunned) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
      this.updateInventoryDisplay();
      return;
    }

    const speedMultiplier = 1 + this.speedBoost;

    if (this.isDashing) {
      this.dashTimer -= delta;
      const speed = PLAYER_DASH_SPEED * speedMultiplier * (delta / 1000);
      this.x += this.dashDirection.x * speed;
      this.y += this.dashDirection.y * speed;

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      let dx = 0, dy = 0;
      if (this.cursors.up.isDown || this.cursors.upArrow.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.cursors.downArrow.isDown) dy += 1;
      if (this.cursors.left.isDown || this.cursors.leftArrow.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.cursors.rightArrow.isDown) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }

        const speed = PLAYER_SPEED * speedMultiplier * (delta / 1000);
        this.x += dx * speed;
        this.y += dy * speed;
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.dash) && this.dashCooldown <= 0 && (dx !== 0 || dy !== 0)) {
        this.isDashing = true;
        this.dashTimer = PLAYER_DASH_DURATION;
        this.dashCooldown = PLAYER_DASH_COOLDOWN;
        this.dashDirection = { x: dx, y: dy };
      }
    }

    this.x = Math.max(30, Math.min(1250, this.x));
    this.y = Math.max(90, Math.min(690, this.y));

    this.body.setPosition(this.x, this.y);
    this.updateInventoryDisplay();
  }

  isInteractJustDown() {
    return Phaser.Input.Keyboard.JustDown(this.cursors.interact);
  }

  pickup(ingredient) {
    if (this.inventory.length >= this.maxInventory) return false;
    this.inventory.push(ingredient);
    ingredient.isHeld = true;
    ingredient.setPosition(this.x, this.y);
    this.updateInventoryDisplay();
    return true;
  }

  drop() {
    if (this.inventory.length === 0) return null;
    const ingredient = this.inventory.pop();
    ingredient.isHeld = false;
    this.updateInventoryDisplay();
    return ingredient;
  }

  getInventoryTypes() {
    return this.inventory.map(ing => ing.getEffectiveType());
  }

  clearInventory() {
    this.inventory = [];
    this.updateInventoryDisplay();
  }

  updateInventoryDisplay() {
    this.heldItem1.setText(this.inventory[0] ? this.inventory[0].getDisplayInfo().emoji : '');
    this.heldItem2.setText(this.inventory[1] ? this.inventory[1].getDisplayInfo().emoji : '');
    this.heldItem3.setText(this.inventory[2] ? this.inventory[2].getDisplayInfo().emoji : '');
  }

  takeDamage(dropDishes = false) {
    if (this.isStunned || this.hurtFlashTimer > 0) return false;
    this.health = Math.max(0, this.health - 1);
    this.isStunned = true;
    this.stunTimer = PLAYER_STUN_DURATION;
    this.hurtFlashTimer = 1500;
    this.clearSpeedBoost();

    let droppedIngredients = [];
    if (dropDishes && this.inventory.length > 0) {
      droppedIngredients = [...this.inventory];
      for (const ing of this.inventory) {
        ing.isHeld = false;
        ing.setPosition(
          this.x + (Math.random() - 0.5) * 60,
          this.y + (Math.random() - 0.5) * 60
        );
      }
      this.inventory = [];
      this.updateInventoryDisplay();
    }
    return { damaged: true, dropped: droppedIngredients };
  }

  addSpeedBoost(amount, duration, maxStacks = 3) {
    this.speedBoostStacks = Math.min(maxStacks, this.speedBoostStacks + 1);
    this.speedBoost = amount * this.speedBoostStacks;
    this.speedBoostTimer = duration;
    return this.speedBoostStacks;
  }

  clearSpeedBoost() {
    this.speedBoost = 0;
    this.speedBoostStacks = 0;
    this.speedBoostTimer = 0;
  }

  getSpeedBoostPercent() {
    return this.speedBoost * 100;
  }

  isDead() {
    return this.health <= 0;
  }

  getDashCooldownPercent() {
    return 1 - (this.dashCooldown / PLAYER_DASH_COOLDOWN);
  }

  destroy() {
    this.body.destroy();
  }
}

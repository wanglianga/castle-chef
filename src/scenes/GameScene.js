import Phaser from 'phaser';
import { Player } from '../game/Player.js';
import { Workstation } from '../game/Workstation.js';
import { Ingredient } from '../game/Ingredient.js';
import { Trap } from '../game/Trap.js';
import { Order } from '../game/Order.js';
import { HUD } from '../ui/HUD.js';
import { OrderPanel } from '../ui/OrderPanel.js';
import { Feedback } from '../ui/Feedback.js';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  COLORS,
  GAME_DURATION,
  MAX_ACTIVE_ORDERS,
  ORDER_SPAWN_INTERVAL,
  COMBO_MULTIPLIER,
  MAX_COMBO_MULTIPLIER,
  WRONG_ORDER_PENALTY,
  BURN_PENALTY,
  TRAP_DAMAGE_PENALTY,
  INGREDIENT_TYPES,
  WORKSTATION_TYPES,
  TRAP_TYPES,
  PLAYER_MAX_HEALTH,
  GUEST_TYPES,
  GUEST_CONFIG,
  CHAIN_EFFECTS,
  TRAP_DODGE_SPEED_BOOST,
  TRAP_DODGE_BOOST_DURATION,
  MAX_TRAP_DODGE_STACK
} from '../utils/constants.js';
import { randomChoice, clamp } from '../utils/helpers.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = GAME_DURATION;
    this.ordersCompleted = 0;
    this.ordersFailed = 0;
    this.orderSpawnTimer = ORDER_SPAWN_INTERVAL;
    this.isGameOver = false;

    this.orders = [];
    this.ingredients = [];
    this.workstations = [];
    this.traps = [];

    this.activeChainEffects = [];
    this.globalScoreMultiplier = 1;
    this.globalKitchenSpeedModifier = 1;
    this.globalOrderSpawnModifier = 1;
    this.globalComboBonus = 0;

    this.trapDodgeCount = 0;
    this.consecutiveDodges = 0;

    this.createMap();
    this.createWorkstations();
    this.createTraps();
    this.createPlayer();
    this.createUI();

    this.spawnInitialIngredients();
    this.orders.push(new Order({
      recipe: { id: 'classic_meat', name: '经典烤肉', emoji: '🍽️', required: ['cooked_meat', 'sliced_veggie'], baseScore: 100, timeLimit: 60 },
      targetTable: 1,
      guestType: GUEST_TYPES.KING
    }));
    this.orders.push(new Order({
      recipe: { id: 'cheese_sandwich', name: '芝士三明治', emoji: '🥪', required: ['sliced_bread', 'sliced_cheese', 'sauced_tomato'], baseScore: 150, timeLimit: 90 },
      targetTable: 2,
      guestType: GUEST_TYPES.KNIGHT
    }));

    this.cameras.main.fadeIn(500);
  }

  createMap() {
    const floor = this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, COLORS.BROWN_DARK);

    for (let x = 0; x < MAP_WIDTH; x += 64) {
      for (let y = 0; y < MAP_HEIGHT; y += 64) {
        const shade = ((x + y) / 64) % 2 === 0 ? 0.04 : 0;
        this.add.rectangle(x + 32, y + 32, 62, 62, COLORS.BROWN, 0.08 + shade);
      }
    }

    const border = this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH - 10, MAP_HEIGHT - 10)
      .setStrokeStyle(8, COLORS.STONE);

    for (let x = 40; x < MAP_WIDTH - 40; x += 200) {
      this.add.text(x, 75, '🔥', { fontSize: '28px' }).setOrigin(0.5).setDepth(0);
    }
  }

  createWorkstations() {
    const ws = this.workstations;

    ws.push(new Workstation(this, 180, 200, WORKSTATION_TYPES.STORAGE, { storageType: INGREDIENT_TYPES.RAW_MEAT }));
    ws.push(new Workstation(this, 280, 200, WORKSTATION_TYPES.STORAGE, { storageType: INGREDIENT_TYPES.RAW_VEGGIE }));
    ws.push(new Workstation(this, 380, 200, WORKSTATION_TYPES.STORAGE, { storageType: INGREDIENT_TYPES.RAW_BREAD }));
    ws.push(new Workstation(this, 480, 200, WORKSTATION_TYPES.STORAGE, { storageType: INGREDIENT_TYPES.RAW_TOMATO }));
    ws.push(new Workstation(this, 580, 200, WORKSTATION_TYPES.STORAGE, { storageType: INGREDIENT_TYPES.RAW_CHEESE }));

    ws.push(new Workstation(this, 220, 400, WORKSTATION_TYPES.CHOP, {
      move: { axis: 'x', range: 80, speed: 1.2 }
    }));
    ws.push(new Workstation(this, 450, 400, WORKSTATION_TYPES.COOK, {
      move: { axis: 'y', range: 60, speed: 1.0 }
    }));
    ws.push(new Workstation(this, 680, 400, WORKSTATION_TYPES.SAUCE, {
      move: { axis: 'x', range: 70, speed: 1.5 }
    }));
    ws.push(new Workstation(this, 900, 400, WORKSTATION_TYPES.PLATE));

    ws.push(new Workstation(this, 1080, 200, WORKSTATION_TYPES.SERVE, { tableNumber: 1 }));
    ws.push(new Workstation(this, 1180, 350, WORKSTATION_TYPES.SERVE, { tableNumber: 2 }));
    ws.push(new Workstation(this, 1080, 500, WORKSTATION_TYPES.SERVE, { tableNumber: 3 }));
    ws.push(new Workstation(this, 1180, 620, WORKSTATION_TYPES.SERVE, { tableNumber: 4 }));
  }

  createTraps() {
    this.traps.push(new Trap(this, 640, 150, TRAP_TYPES.SPIKE, { period: 3, duty: 0.35 }));
    this.traps.push(new Trap(this, 100, 550, TRAP_TYPES.SPIKE, { period: 2.5, duty: 0.4 }));
    this.traps.push(new Trap(this, 780, 580, TRAP_TYPES.ROTATING, { radius: 70, rotationSpeed: 2.5 }));
    this.traps.push(new Trap(this, 400, 550, TRAP_TYPES.MOVING_PLATFORM, {
      axis: 'x', range: 100, speed: 1.8, width: 90, height: 30
    }));
    this.traps.push(new Trap(this, 150, 620, TRAP_TYPES.TELEPORT, {
      targetX: 1100, targetY: 150, cooldown: 6
    }));

    this.traps.push(new Trap(this, 640, 450, TRAP_TYPES.FLOOR_ROTATION, {
      period: 4, radius: 75, rotationSpeed: 2.0
    }));

    this.traps.push(new Trap(this, 450, 280, TRAP_TYPES.FIRE_FLUCTUATION, {
      period: 5, affectedRadius: 90
    }));

    this.traps.push(new Trap(this, 1130, 425, TRAP_TYPES.WINDOW_SWAP, {
      table1: 1, table2: 2, cooldown: 10
    }));

    this.traps.push(new Trap(this, 820, 180, TRAP_TYPES.KNIFE_SLIDE, {
      axis: 'x', range: 100, speed: 2.5
    }));
  }

  createPlayer() {
    this.player = new Player(this, 640, 550);
  }

  createUI() {
    const container = document.getElementById('game-container');

    this.overlay = document.createElement('div');
    this.overlay.className = 'ui-overlay';
    container.appendChild(this.overlay);

    this.hud = new HUD(this, this.overlay);
    this.orderPanel = new OrderPanel(this.overlay);
    this.feedback = new Feedback(this.overlay);

    this.hud.updateTime(this.timeLeft);
    this.hud.updateScore(this.score);
    this.hud.updateCombo(this.combo);
    this.hud.updateHealth(this.player.health, PLAYER_MAX_HEALTH);
  }

  spawnInitialIngredients() {
    const positions = [
      { x: 180, y: 300 }, { x: 380, y: 300 }, { x: 580, y: 300 },
      { x: 280, y: 300 }, { x: 480, y: 300 }
    ];
    const types = Object.values(INGREDIENT_TYPES);
    for (let i = 0; i < positions.length; i++) {
      const ing = new Ingredient(this, positions[i].x, positions[i].y, types[i]);
      this.ingredients.push(ing);
    }
  }

  spawnIngredientFromStorage(storageType, x, y) {
    const ing = new Ingredient(this, x, y, storageType);
    this.ingredients.push(ing);
    return ing;
  }

  spawnOrder() {
    const activeCount = this.orders.filter(o => !o.completed && !o.failed).length;
    if (activeCount >= MAX_ACTIVE_ORDERS) return;
    this.orders.push(new Order());
  }

  update(time, delta) {
    if (this.isGameOver) return;

    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endGame();
      return;
    }

    this.updateChainEffects(delta);
    this.updateWorkstationSpeeds();
    this.updateFireIntensity();
    this.checkWindowSwaps();

    const orderTimeModifier = this.globalOrderSpawnModifier;
    this.orderSpawnTimer -= (delta / 1000) * orderTimeModifier;
    if (this.orderSpawnTimer <= 0) {
      this.spawnOrder();
      this.orderSpawnTimer = ORDER_SPAWN_INTERVAL;
    }

    this.player.update(delta);
    for (const ws of this.workstations) {
      ws.update(delta);
      ws.processIngredients(delta);
    }

    for (const trap of this.traps) {
      trap.update(delta, this.player,
        () => this.onPlayerHitByTrap(),
        () => this.onPlayerTeleport(),
        (trapType) => this.onTrapDodge(trapType)
      );
    }

    for (const order of this.orders) {
      const wasFailed = order.failed;
      order.update(delta, 1);
      if (order.failed && !wasFailed) {
        this.onOrderFailed(order);
      }
    }

    for (let i = this.ingredients.length - 1; i >= 0; i--) {
      const ing = this.ingredients[i];
      if (ing.state === 'burnt' && !ing.isHeld && !ing.onWorkstation) {
        this.addScore(-BURN_PENALTY, ing.x, ing.y, '烧焦!');
        ing.destroy();
        this.ingredients.splice(i, 1);
        this.combo = 0;
      }
    }

    this.handleInput();
    this.updateUI();
  }

  updateChainEffects(delta) {
    for (let i = this.activeChainEffects.length - 1; i >= 0; i--) {
      const effect = this.activeChainEffects[i];
      effect.timeLeft -= delta / 1000;
      if (effect.timeLeft <= 0) {
        this.activeChainEffects.splice(i, 1);
        this.recalculateGlobalModifiers();
      }
    }
  }

  updateWorkstationSpeeds() {
    const baseSpeed = this.globalKitchenSpeedModifier;
    for (const ws of this.workstations) {
      if (ws.type !== WORKSTATION_TYPES.STORAGE && ws.type !== WORKSTATION_TYPES.SERVE) {
        ws.setSpeedModifier(baseSpeed);
      }
    }
  }

  updateFireIntensity() {
    const fireTrap = this.traps.find(t => t.type === TRAP_TYPES.FIRE_FLUCTUATION);
    if (!fireTrap) return;

    const intensity = fireTrap.getFireIntensity();
    const cookIntensity = 0.6 + intensity * 1.2;

    for (const ws of this.workstations) {
      if (ws.type === WORKSTATION_TYPES.COOK) {
        ws.setFireIntensity(cookIntensity);
      }
    }
  }

  checkWindowSwaps() {
    const swapTraps = this.traps.filter(t => t.type === TRAP_TYPES.WINDOW_SWAP);
    for (const trap of swapTraps) {
      const dist = Math.hypot(trap.x - this.player.x, trap.y - this.player.y);
      if (dist < 50 && this.player.isInteractJustDown()) {
        if (trap.swapTables(this.orders)) {
          this.showFloatFeedback(trap.x, trap.y - 40, '传送窗换位!', 'positive');
          this.consecutiveDodges = 0;
        }
      }
    }
  }

  recalculateGlobalModifiers() {
    this.globalScoreMultiplier = 1;
    this.globalKitchenSpeedModifier = 1;
    this.globalOrderSpawnModifier = 1;
    this.globalComboBonus = 0;

    for (const effect of this.activeChainEffects) {
      if (effect.tipBoost) this.globalScoreMultiplier += effect.tipBoost;
      if (effect.kitchenSpeed) this.globalKitchenSpeedModifier += effect.kitchenSpeed;
      if (effect.orderRefresh) this.globalOrderSpawnModifier += effect.orderRefresh;
      if (effect.comboBoost) this.globalComboBonus += effect.comboBoost;
      if (effect.speedPenalty) this.globalKitchenSpeedModifier -= effect.speedPenalty;
      if (effect.randomBoost) {
        const boost = 0.2 + Math.random() * 0.4;
        this.globalScoreMultiplier += boost;
        this.globalKitchenSpeedModifier += boost;
        this.globalOrderSpawnModifier += boost;
      }
      if (effect.orderShuffle) {
        this.orders = this.orders.sort(() => Math.random() - 0.5);
      }
    }
  }

  activateChainEffect(effectType) {
    const effectConfig = CHAIN_EFFECTS[effectType];
    if (!effectConfig) return;

    const existing = this.activeChainEffects.find(e => e.type === effectType);
    if (existing) {
      existing.timeLeft = effectConfig.duration;
    } else {
      this.activeChainEffects.push({
        type: effectType,
        name: effectConfig.name,
        description: effectConfig.description,
        timeLeft: effectConfig.duration,
        ...effectConfig
      });
    }

    this.recalculateGlobalModifiers();
    this.showFloatFeedback(640, 360, `${effectConfig.name}!`, 'combo');
  }

  onTrapDodge(trapType) {
    this.trapDodgeCount++;
    this.consecutiveDodges++;

    const stacks = this.player.addSpeedBoost(
      TRAP_DODGE_SPEED_BOOST,
      TRAP_DODGE_BOOST_DURATION,
      MAX_TRAP_DODGE_STACK
    );

    const trapNames = {
      spike: '尖刺',
      rotating: '旋转障碍',
      floor_rotation: '旋转地板',
      fire_fluctuation: '火焰',
      knife_slide: '飞刀'
    };

    const name = trapNames[trapType] || '机关';
    this.showFloatFeedback(
      this.player.x,
      this.player.y - 50,
      `躲过${name}! +${Math.round(TRAP_DODGE_SPEED_BOOST * 100 * stacks)}%`,
      'positive'
    );
  }

  handleInput() {
    let nearestWs = null;
    let nearestDist = Infinity;
    for (const ws of this.workstations) {
      const d = Math.hypot(ws.x - this.player.x, ws.y - this.player.y);
      if (d < 70 && d < nearestDist) {
        nearestDist = d;
        nearestWs = ws;
      }
    }

    for (const ws of this.workstations) {
      ws.setHighlight(ws === nearestWs);
    }

    if (nearestWs) {
      this.showWorkstationHint(nearestWs);
    } else {
      this.hud.hideHint();
    }

    if (this.player.isInteractJustDown()) {
      if (nearestWs) {
        this.interactWithWorkstation(nearestWs);
      } else {
        this.tryPickupNearby();
      }
    }
  }

  showWorkstationHint(ws) {
    const invCount = this.player.inventory.length;
    let hint = '';

    const hasReadyIngredient = ws.ingredients.some(i => {
      if (ws.type === WORKSTATION_TYPES.COOK) {
        return i.cookPhase === 'cooked' || i.cookPhase === 'burnt' || !i.processingType;
      }
      return !i.processingType;
    });

    if (ws.type === WORKSTATION_TYPES.STORAGE) {
      hint = invCount < this.player.maxInventory ? `[空格] 从${ws.workstationName}取食材` : '背包已满！';
    } else if (ws.type === WORKSTATION_TYPES.SERVE) {
      const plateWs = this.workstations.find(w => w.type === WORKSTATION_TYPES.PLATE);
      const hasTrayDish = plateWs && plateWs.ingredients.length > 0;
      hint = invCount > 0 || hasTrayDish ? `[空格] 送餐到桌${ws.tableNumber}` : '请先装盘！';
    } else if (ws.type === WORKSTATION_TYPES.PLATE) {
      hint = invCount > 0 ? '[空格] 放下食材装盘' : (ws.ingredients.length > 0 ? '[空格] 取走装盘' : '请携带食材');
    } else if (ws.type === WORKSTATION_TYPES.COOK) {
      const cookingMeat = ws.ingredients.find(i => i.processingType);
      if (cookingMeat && cookingMeat.cookPhase === 'cooked') {
        hint = invCount < this.player.maxInventory ? `[空格] 取出烤肉(快！别烧焦了)` : '背包已满！';
      } else if (cookingMeat && cookingMeat.cookPhase === 'processing') {
        hint = '🔥 正在烤制中...';
      } else if (hasReadyIngredient) {
        hint = invCount < this.player.maxInventory ? `[空格] 从${ws.workstationName}取走` : '背包已满！';
      } else if (invCount > 0) {
        const canAccept = this.player.inventory.some(ing => ws.canAccept(ing));
        hint = canAccept ? `[空格] 放入${ws.workstationName}` : `该食材不能在此加工`;
      } else {
        hint = ws.workstationName;
      }
    } else {
      if (invCount > 0) {
        const canAccept = this.player.inventory.some(ing => ws.canAccept(ing));
        hint = canAccept ? `[空格] 放入${ws.workstationName}` : `该食材不能在此加工`;
      } else if (hasReadyIngredient) {
        hint = `[空格] 从${ws.workstationName}取走`;
      } else {
        hint = ws.workstationName;
      }
    }
    this.hud.showHint(hint);
  }

  interactWithWorkstation(ws) {
    if (ws.type === WORKSTATION_TYPES.STORAGE) {
      if (this.player.inventory.length < this.player.maxInventory) {
        const ing = this.spawnIngredientFromStorage(ws.storageType, ws.x, ws.y + 50);
        this.player.pickup(ing);
      }
      return;
    }

    if (ws.type === WORKSTATION_TYPES.SERVE) {
      this.tryServe(ws);
      return;
    }

    if (ws.type === WORKSTATION_TYPES.PLATE) {
      if (this.player.inventory.length > 0 && ws.ingredients.length < ws.maxIngredients) {
        this.moveInventoryIngredientToWorkstation(ws);
      } else if (ws.ingredients.length > 0 && this.player.inventory.length < this.player.maxInventory) {
        this.pickupReadyIngredientsFromWorkstation(ws);
      }
      return;
    }

    if (ws.ingredients.length > 0 && this.player.inventory.length < this.player.maxInventory) {
      this.pickupReadyIngredientsFromWorkstation(ws);
    } else if (this.player.inventory.length > 0) {
      this.moveInventoryIngredientToWorkstation(ws);
    }
  }

  isIngredientReadyForPickup(ws, ingredient) {
    if (ws.type === WORKSTATION_TYPES.COOK) {
      return ingredient.cookPhase === 'cooked' || ingredient.cookPhase === 'burnt' || !ingredient.processingType;
    }
    return !ingredient.processingType;
  }

  pickupReadyIngredientsFromWorkstation(ws) {
    const freeSlots = this.player.maxInventory - this.player.inventory.length;
    if (freeSlots <= 0) return;

    const ready = ws.ingredients.filter(ingredient => this.isIngredientReadyForPickup(ws, ingredient));
    const pickupCount = ws.type === WORKSTATION_TYPES.PLATE ? freeSlots : 1;

    for (const ingredient of ready.slice(-pickupCount)) {
      if (!ws.removeIngredient(ingredient)) continue;
      if (!this.player.pickup(ingredient)) {
        ws.addIngredient(ingredient);
        break;
      }
    }
  }

  moveInventoryIngredientToWorkstation(ws) {
    for (let i = this.player.inventory.length - 1; i >= 0; i--) {
      const ing = this.player.inventory[i];
      if (ws.canAccept(ing)) {
        this.player.inventory.splice(i, 1);
        ws.addIngredient(ing);
        ing.isHeld = false;
        this.player.updateInventoryDisplay();
        return true;
      }
    }
    return false;
  }

  tryPickupNearby() {
    if (this.player.inventory.length >= this.player.maxInventory) return;

    for (let i = this.ingredients.length - 1; i >= 0; i--) {
      const ing = this.ingredients[i];
      if (ing.isHeld || ing.onWorkstation) continue;
      const d = Math.hypot(ing.x - this.player.x, ing.y - this.player.y);
      if (d < 50) {
        this.player.pickup(ing);
        break;
      }
    }
  }

  tryServe(serveWs) {
    const plateWs = this.workstations.find(w => w.type === WORKSTATION_TYPES.PLATE);
    const deliverySources = [
      {
        ingredients: this.player.inventory,
        types: this.player.getInventoryTypes(),
        clear: ingredients => {
          for (const ing of ingredients) {
            const idx = this.ingredients.indexOf(ing);
            if (idx >= 0) this.ingredients.splice(idx, 1);
            ing.destroy();
          }
          this.player.clearInventory();
        }
      },
      {
        ingredients: plateWs ? plateWs.ingredients : [],
        types: plateWs ? plateWs.getProcessedTypes() : [],
        clear: ingredients => {
          for (const ing of ingredients) {
            if (plateWs) plateWs.removeIngredient(ing);
            const idx = this.ingredients.indexOf(ing);
            if (idx >= 0) this.ingredients.splice(idx, 1);
            ing.destroy();
          }
          if (plateWs) plateWs.updateIngredientPositions();
        }
      }
    ].filter(source => source.ingredients.length > 0);

    if (deliverySources.length === 0) return;

    let matched = false;
    for (const order of this.orders) {
      if (order.completed || order.failed) continue;
      if (order.targetTable !== serveWs.tableNumber) continue;
      for (const source of deliverySources) {
        if (order.checkDish(source.types)) {
          matched = true;
          this.completeOrder(order);
          source.clear([...source.ingredients]);
          break;
        }
      }
      if (matched) {
        break;
      }
    }

    if (!matched) {
      this.addScore(-WRONG_ORDER_PENALTY, serveWs.x, serveWs.y, '送错了!');
      this.combo = 0;
      const source = this.player.inventory.length > 0 ? this.player.inventory : (plateWs ? plateWs.ingredients : []);
      for (const ing of [...source]) {
        if (plateWs && ing.onWorkstation === plateWs) {
          plateWs.removeIngredient(ing);
        }
        const idx = this.ingredients.indexOf(ing);
        if (idx < 0) this.ingredients.push(ing);
        ing.isHeld = false;
        ing.setPosition(serveWs.x + (Math.random() - 0.5) * 30, serveWs.y + 50);
      }
      this.player.clearInventory();
      if (plateWs) plateWs.updateIngredientPositions();
    }
  }

  completeOrder(order) {
    order.completed = true;
    this.ordersCompleted++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.consecutiveDodges = 0;

    const effectiveCombo = this.combo + this.globalComboBonus;
    const scoreResult = order.calculateScore(effectiveCombo, this.globalScoreMultiplier);

    this.addScore(scoreResult.total, 640, 200, `+${scoreResult.total}`);

    if (scoreResult.tip > 0) {
      setTimeout(() => {
        this.showFloatFeedback(640, 250, `小费 +${scoreResult.tip} 💰`, 'positive');
      }, 200);
    }

    if (order.chainEffect) {
      setTimeout(() => {
        this.activateChainEffect(order.chainEffect);
      }, 400);
    }

    const guestConfig = GUEST_CONFIG[order.guestType];
    if (guestConfig && guestConfig.orderRefreshSpeed) {
      this.orderSpawnTimer = Math.min(this.orderSpawnTimer, ORDER_SPAWN_INTERVAL * guestConfig.orderRefreshSpeed);
    }

    if (this.combo >= 3) {
      setTimeout(() => {
        this.showFloatFeedback(640, 300, `${this.combo} 连击!`, 'combo');
      }, 100);
    }
  }

  onOrderFailed(order) {
    this.ordersFailed++;
    this.combo = 0;
    this.consecutiveDodges = 0;
    this.activeChainEffects = [];
    this.recalculateGlobalModifiers();
    this.showFloatFeedback(640, 300, `${order.guestName}不耐烦地离开了!`, 'negative');
  }

  onPlayerHitByTrap() {
    const result = this.player.takeDamage(true);
    if (result && result.damaged) {
      this.addScore(-TRAP_DAMAGE_PENALTY, this.player.x, this.player.y - 40, '受伤!');
      this.combo = 0;
      this.consecutiveDodges = 0;

      if (result.dropped && result.dropped.length > 0) {
        for (const ing of result.dropped) {
          if (!this.ingredients.includes(ing)) {
            this.ingredients.push(ing);
          }
        }
        this.showFloatFeedback(this.player.x, this.player.y - 70, '菜品掉落!', 'negative');
      }
      if (this.player.isDead()) {
        this.endGame();
      }
    }
  }

  onPlayerTeleport() {
    this.showFloatFeedback(this.player.x, this.player.y - 40, '传送!', 'positive');
  }

  addScore(amount, x, y, label) {
    this.score = Math.max(0, this.score + amount);
    this.hud.updateScore(this.score);
    if (label) {
      this.showFloatFeedback(x, y, label, amount >= 0 ? 'positive' : 'negative');
    }
  }

  showFloatFeedback(x, y, text, type) {
    const rect = document.getElementById('game-container').getBoundingClientRect();
    this.feedback.showFloat(x, y, text, type);
  }

  updateUI() {
    this.hud.updateTime(this.timeLeft);
    this.hud.updateCombo(this.combo);
    this.hud.updateHealth(this.player.health, PLAYER_MAX_HEALTH);
    this.hud.updateInventory(this.player.inventory);
    this.hud.updateChainEffects(this.activeChainEffects);
    this.hud.updateSpeedBoost(this.player.speedBoostStacks, this.player.getSpeedBoostPercent());
    this.orderPanel.updateOrders(this.orders);
  }

  endGame() {
    this.isGameOver = true;
    this.cameras.main.fadeOut(600, 0, 0, 0, (_, progress) => {
      if (progress >= 1) {
        this.hud.destroy();
        this.orderPanel.destroy();
        this.overlay.remove();
        this.scene.start('GameOverScene', {
          score: this.score,
          maxCombo: this.maxCombo,
          ordersCompleted: this.ordersCompleted,
          ordersFailed: this.ordersFailed,
          trapDodgeCount: this.trapDodgeCount
        });
      }
    });
  }
}

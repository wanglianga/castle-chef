export class OrderPanel {
  constructor(container) {
    this.container = container;
    this.orders = [];

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'order-panel';
    container.appendChild(this.panelEl);
  }

  updateOrders(orders) {
    this.orders = orders;
    this.panelEl.innerHTML = '';

    const sortedOrders = [...orders]
      .filter(o => !o.completed && !o.failed)
      .sort((a, b) => a.priority - b.priority);

    for (const order of sortedOrders) {
      const card = document.createElement('div');
      card.className = 'order-card' + (order.isUrgent() ? ' urgent' : '') + ` priority-${order.priority}`;

      const timePercent = order.getTimePercent();
      const ingredientsHtml = order.getRequiredDisplay()
        .map(emoji => `<span class="order-card-ingredient">${emoji}</span>`)
        .join('');

      const priorityStars = '★'.repeat(5 - order.priority) + '☆'.repeat(order.priority - 1);

      card.innerHTML = `
        <div class="order-card-guest">
          <span class="order-card-guest-emoji">${order.guestEmoji}</span>
          <span class="order-card-guest-name">${order.guestName}</span>
          <span class="order-card-priority" title="优先级">${priorityStars}</span>
        </div>
        <span class="order-card-table">桌${order.targetTable}</span>
        <div class="order-card-header">
          <span class="order-card-name">${order.name}</span>
          <span class="order-card-emoji">${order.emoji}</span>
        </div>
        <div class="order-card-timer">
          <div class="order-card-timer-fill ${order.isUrgent() ? 'urgent' : ''}" style="width: ${timePercent * 100}%"></div>
          <span class="order-card-time">${Math.ceil(order.timeLeft)}s</span>
        </div>
        <div class="order-card-ingredients">
          ${ingredientsHtml}
        </div>
        <div class="order-card-bonus">
          <span class="bonus-tip" title="小费倍率">💰 x${order.tipMultiplier.toFixed(1)}</span>
          <span class="bonus-score" title="分数倍率">⭐ x${order.scoreMultiplier.toFixed(1)}</span>
        </div>
      `;

      this.panelEl.appendChild(card);
    }
  }

  destroy() {
    this.panelEl.remove();
  }
}

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

    for (const order of orders) {
      if (order.completed || order.failed) continue;

      const card = document.createElement('div');
      card.className = 'order-card' + (order.isUrgent() ? ' urgent' : '');

      const timePercent = order.getTimePercent();
      const ingredientsHtml = order.getRequiredDisplay()
        .map(emoji => `<span class="order-card-ingredient">${emoji}</span>`)
        .join('');

      card.innerHTML = `
        <span class="order-card-table">桌${order.targetTable}</span>
        <div class="order-card-header">
          <span class="order-card-name">${order.name}</span>
          <span class="order-card-emoji">${order.emoji}</span>
        </div>
        <div class="order-card-timer">
          <div class="order-card-timer-fill ${order.isUrgent() ? 'urgent' : ''}" style="width: ${timePercent * 100}%"></div>
        </div>
        <div class="order-card-ingredients">
          ${ingredientsHtml}
        </div>
      `;

      this.panelEl.appendChild(card);
    }
  }

  destroy() {
    this.panelEl.remove();
  }
}

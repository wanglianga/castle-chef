export class Feedback {
  constructor(container) {
    this.container = container;
  }

  showFloat(x, y, text, type = 'positive') {
    const el = document.createElement('div');
    el.className = `feedback-float ${type}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

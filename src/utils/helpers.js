export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function arraysEqualAsSets(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((item, index) => item === sorted2[index]);
}

export function getHighScore() {
  try {
    return parseInt(localStorage.getItem('castle_chef_highscore') || '0', 10);
  } catch {
    return 0;
  }
}

export function setHighScore(score) {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem('castle_chef_highscore', String(score));
      return true;
    }
  } catch {}
  return false;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

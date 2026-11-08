// Небольшие общие утилиты. Без зависимостей, работают и в браузере, и в Node (для тестов).

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// Минимальная разметка учебных текстов: **жирный**, _курсив_. Всё остальное экранируется.
export const md = (text) => esc(text)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/(^|[\s(«])_(.+?)_(?=[\s.,;:!?)»]|$)/g, '$1<i>$2</i>');

export function hash(str) {
  let h = 5381;
  for (const ch of String(str)) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0;
  return h.toString(36);
}

// Детерминированная перетасовка: один и тот же seed — один и тот же порядок.
export function shuffle(arr, seed = Math.random()) {
  const a = [...arr];
  let s = typeof seed === 'number' ? Math.floor(seed * 2 ** 31) || 1 : parseInt(hash(seed), 36) || 1;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

export const DAY = 24 * 60 * 60 * 1000;
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Статистика для исследовательского модуля. Непараметрические критерии подходят
// для небольших выборок класса, где нормальность распределения не гарантирована.
// Результаты совпадают со scipy.stats (см. tests/stats.test.mjs).

export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
export function sd(a) {
  if (a.length < 2) return NaN;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}
export function median(a) {
  if (!a.length) return NaN;
  const b = [...a].sort((x, y) => x - y);
  const k = Math.floor(b.length / 2);
  return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2;
}

// Нормированное изменение (Marx & Cummings, 2007) — развитие нормированного прироста Хейка:
// при росте — доля возможного роста, (post − pre) / (max − pre); при снижении — доля возможного падения, (post − pre) / pre.
// Если оба результата одинаково максимальны или нулевы, участник из расчёта исключается (null).
export function normalizedGain(pre, post, max) {
  if (pre === post) return pre === max || pre === 0 ? null : 0;
  return post > pre ? (post - pre) / (max - pre) : (post - pre) / pre;
}

// Функция распределения стандартного нормального закона (приближение Абрамовица — Стиган, точность ~1e-7).
export function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

function rank(values) {
  const idx = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const ranks = new Array(values.length);
  const ties = [];
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j += 1;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[idx[k][1]] = r;
    if (j > i) ties.push(j - i + 1);
    i = j + 1;
  }
  return { ranks, ties };
}

// Критерий знаковых рангов Уилкоксона для связанных выборок (до/после).
// Нулевые разности исключаются; нормальная аппроксимация с поправкой на связи и непрерывность.
export function wilcoxon(before, after) {
  const d = after.map((v, i) => v - before[i]).filter((x) => x !== 0);
  const n = d.length;
  if (n < 1) return { n: 0, W: NaN, z: NaN, p: NaN };
  const { ranks, ties } = rank(d.map(Math.abs));
  const wPlus = d.reduce((s, x, i) => s + (x > 0 ? ranks[i] : 0), 0);
  const wMinus = n * (n + 1) / 2 - wPlus;
  const W = Math.min(wPlus, wMinus);
  const mu = n * (n + 1) / 4;
  const sigma = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24 - ties.reduce((s, t) => s + (t ** 3 - t), 0) / 48);
  let diff = W - mu;
  diff -= 0.5 * Math.sign(diff);
  const z = sigma > 0 ? diff / sigma : 0;
  const p = Math.min(1, 2 * normCdf(-Math.abs(z)));
  return { n, W, wPlus, wMinus, z, p };
}

// Критерий Манна — Уитни для независимых выборок (например, прирост в экспериментальной и контрольной группах).
export function mannWhitney(a, b) {
  const n1 = a.length, n2 = b.length;
  if (!n1 || !n2) return { U: NaN, z: NaN, p: NaN };
  const { ranks, ties } = rank([...a, ...b]);
  const r1 = ranks.slice(0, n1).reduce((s, x) => s + x, 0);
  const U = r1 - n1 * (n1 + 1) / 2;
  const N = n1 + n2;
  const mu = n1 * n2 / 2;
  const sigma = Math.sqrt(n1 * n2 / 12 * ((N + 1) - ties.reduce((s, t) => s + (t ** 3 - t), 0) / (N * (N - 1))));
  let diff = U - mu;
  diff -= 0.5 * Math.sign(diff);
  const z = sigma > 0 ? diff / sigma : 0;
  const p = Math.min(1, 2 * normCdf(-Math.abs(z)));
  return { U, z, p };
}

// Ранговая корреляция Спирмена (с усреднением рангов при связях).
export function spearman(x, y) {
  const n = x.length;
  if (n < 3) return { rho: NaN, n };
  const rx = rank(x).ranks, ry = rank(y).ranks;
  const mx = mean(rx), my = mean(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; }
  const rho = dx && dy ? num / Math.sqrt(dx * dy) : NaN;
  // Значимость — через t-распределение приближённо нормальным законом при n ≥ 10.
  const t = rho * Math.sqrt((n - 2) / Math.max(1e-12, 1 - rho * rho));
  const p = n >= 10 && Number.isFinite(t) ? Math.min(1, 2 * normCdf(-Math.abs(t))) : NaN;
  return { rho, n, p };
}

// Размер эффекта r = |z| / √N (Коэн: 0,1 — малый, 0,3 — средний, 0,5 — большой).
export const effectR = (z, N) => (N > 0 && Number.isFinite(z) ? Math.abs(z) / Math.sqrt(N) : NaN);

export const fmt = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—');
export const fmtP = (p) => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0,001' : p.toFixed(3).replace('.', ','));

// Модель знаний ученика — байесовское отслеживание знаний (Bayesian Knowledge Tracing, BKT;
// Corbett & Anderson, 1995). Классический метод искусственного интеллекта в образовании,
// лежащий в основе интеллектуальных обучающих систем.
//
// Для каждой темы модель хранит вероятность P(L) того, что ученик владеет правилом,
// и пересчитывает её после каждой первой попытки по формуле Байеса с учётом
// вероятности угадать (G), ошибиться по невнимательности (S) и научиться на задании (T).
// Параметры — типичные значения из исследований BKT; их можно уточнить по данным,
// которые экспортирует исследовательский модуль.

import { parseGaps, parseMarked, parsePunct } from './check.js';

export const BKT = { L0: 0.25, T: 0.12, S: 0.1 };
export const MASTERY = 0.95; // общепринятый порог освоения в BKT

// Вероятность угадать ответ зависит от формы задания: при выборе из двух — 50 %, при вводе слова — почти ноль.
export function guessProbability(item) {
  switch (item.t) {
    case 'gap': return parseGaps(item.text).filter((p) => p.gap).reduce((g, p) => g / p.options.length, 1);
    case 'choice': return 1 / item.opts.length;
    case 'multi': return 1 / 2 ** item.opts.length;
    case 'sort': return 1 / item.cats.length ** item.items.length;
    case 'spot': return 1 / parseMarked(item.word).letters.length;
    case 'morph': return 0.03;
    case 'fix': return 0.08;
    case 'punct': return 1 / 2 ** Math.min(6, parsePunct(item.text).words.length - 1);
    case 'type': return 0.01;
    default: return 0.2;
  }
}

// Обновление по одному наблюдению. correct — верно с первой попытки и без подсказок.
export function bktUpdate(pL, correct, item, params = BKT) {
  const G = Math.min(0.5, Math.max(0.01, guessProbability(item)));
  const S = params.S;
  const posterior = correct
    ? (pL * (1 - S)) / (pL * (1 - S) + (1 - pL) * G)
    : (pL * S) / (pL * S + (1 - pL) * (1 - G));
  return posterior + (1 - posterior) * params.T;
}

// Сколько верных ответов подряд нужно ещё, чтобы модель признала тему освоенной (для объяснения ученику).
export function stepsToMastery(pL, item = { t: 'gap', text: '[а/о]' }) {
  let p = pL, n = 0;
  while (p < MASTERY && n < 20) { p = bktUpdate(p, true, item); n += 1; }
  return n;
}

const STEP_ORDER = ['n', 'r', 'a', 't'];

// Адаптивный выбор следующего задания тренировки.
// Низкая оценка — задания на обнаружение и распознавание; средняя — применение; высокая — перенос в текст.
// После ошибки система опускается на шаг ниже (возврат к предшествующей операции).
export function targetStep(pL, lastWrongStep) {
  let step = pL < 0.35 ? 'r' : pL < 0.7 ? 'a' : 't';
  if (pL < 0.2) step = 'n';
  if (lastWrongStep) {
    const lower = STEP_ORDER[Math.max(0, STEP_ORDER.indexOf(lastWrongStep) - 1)];
    if (STEP_ORDER.indexOf(lower) < STEP_ORDER.indexOf(step)) step = lower;
  }
  return step;
}

export function pickNext({ items, used, pL, lastWrongStep, inReview = new Set(), itemStats = {}, rnd = Math.random, step }) {
  const pool = items.filter((i) => !used.has(i.id));
  if (!pool.length) return null;
  const want = step || targetStep(pL, lastWrongStep);
  const dist = (i) => Math.abs(STEP_ORDER.indexOf(i.s) - STEP_ORDER.indexOf(want));
  const score = (i) => {
    const st = itemStats[i.id];
    let s = dist(i) * 10;
    if (inReview.has(i.id)) s -= 4; // сначала — задания, где уже была ошибка
    else if (!st) s -= 2; // затем — новые
    else if (st.last) s += 3; // решённые самостоятельно — в последнюю очередь
    return s + rnd();
  };
  return pool.sort((a, b) => score(a) - score(b))[0];
}

export function shouldStop({ pL, done, max = 12, min = 5 }) {
  return done >= max || (done >= min && pL >= MASTERY);
}

export const levelLabel = (pL) => (pL >= MASTERY ? 'освоено' : pL >= 0.7 ? 'почти освоено' : pL >= 0.4 ? 'в процессе' : 'начальный уровень');

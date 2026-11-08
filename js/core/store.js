// Прогресс ученика хранится только в этом браузере (localStorage).
// Никаких персональных данных: ни имени, ни класса, ни школы. Сервер не нужен.

import { DAY, today } from './util.js';
import { BKT, bktUpdate } from './model.js';

export const STORAGE_KEY = 'orfozor:v2';
const BOXES = [1, 3, 7, 14, 30]; // интервалы повторения в днях

export function emptyState() {
  return {
    v: 2,
    settings: { grade: null, cat: true, board: false, readable: false },
    topics: {},
    items: {},
    review: {},
    diag: {},
    log: { fixedInReview: 0, days: [], ms: 0 },
    model: {}, // BKT: { [topicId]: { pL, n } }
    errors: [], // { topicId, itemId, code, ts }
    tests: [], // входные и итоговые срезы
    profile: { code: '', group: '' }, // анонимный код для исследования
  };
}

function sanitize(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object' || raw.v !== 2) return base;
  const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  return {
    v: 2,
    settings: { ...base.settings, ...obj(raw.settings) },
    topics: obj(raw.topics),
    items: obj(raw.items),
    review: obj(raw.review),
    diag: obj(raw.diag),
    log: { ...base.log, ...obj(raw.log), days: Array.isArray(raw.log?.days) ? raw.log.days.slice(-400) : [] },
    model: obj(raw.model),
    errors: Array.isArray(raw.errors) ? raw.errors.slice(-1000) : [],
    tests: Array.isArray(raw.tests) ? raw.tests.slice(-50) : [],
    profile: { ...base.profile, ...obj(raw.profile) },
  };
}

export function createStore(storage = globalThis.localStorage) {
  let available = true;
  let state;
  try {
    state = sanitize(JSON.parse(storage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    available = false;
    state = emptyState();
  }
  const listeners = new Set();

  function persist() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      available = true;
    } catch {
      available = false;
    }
    listeners.forEach((fn) => fn(state));
  }

  const topic = (id) => (state.topics[id] ||= { practiced: 0, checks: [], masteredAt: null, securedAt: null });

  function markDay() {
    const d = new Date().toISOString().slice(0, 10);
    if (!state.log.days.includes(d)) state.log.days.push(d);
  }

  return {
    get state() { return state; },
    get available() { return available; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    setting(key, value) {
      state.settings[key] = value;
      persist();
    },

    // Результат одного ответа. firstTry — верно с первой попытки и без подсказок.
    // item передаётся, чтобы модель знаний учла форму задания (вероятность угадать).
    recordItem({ id, topicId, firstTry, mode, item, errorCode, ms = 0 }) {
      const rec = (state.items[id] ||= { seen: 0, right: 0 });
      rec.seen += 1;
      if (firstTry) rec.right += 1;
      rec.last = firstTry;
      if (item) {
        const m = (state.model[topicId] ||= { pL: BKT.L0, n: 0 });
        m.pL = bktUpdate(m.pL, firstTry, item);
        m.n += 1;
        m.updated = Date.now();
      }
      if (errorCode) {
        state.errors.push({ topicId, itemId: id, code: errorCode, ts: Date.now(), mode });
        if (state.errors.length > 1000) state.errors.splice(0, state.errors.length - 1000);
      }
      state.log.ms = (state.log.ms || 0) + Math.min(ms, 5 * 60 * 1000);
      if (mode !== 'test') {
        const inReview = state.review[id];
        if (!firstTry) {
          // Ошибка или помощь → задание возвращается завтра.
          state.review[id] = { topic: topicId, box: 0, due: today() + DAY };
        } else if (inReview && mode === 'review') {
          const box = inReview.box + 1;
          if (box >= BOXES.length) delete state.review[id];
          else state.review[id] = { ...inReview, box, due: today() + BOXES[box] * DAY };
          state.log.fixedInReview += 1;
        }
      }
      markDay();
      persist();
    },

    logError({ topicId, itemId, code, mode }) {
      state.errors.push({ topicId, itemId, code, ts: Date.now(), mode });
      persist();
    },

    pL(topicId) {
      return state.model[topicId]?.pL ?? null;
    },

    saveTest(record) {
      state.tests.push(record);
      persist();
    },

    setProfile(profile) {
      state.profile = { ...state.profile, ...profile };
      persist();
    },

    finishPractice(topicId) {
      const t = topic(topicId);
      t.practiced += 1;
      t.lastPractice = Date.now();
      persist();
    },

    // Проверка темы: «освоено» — не меньше 5 из 6 без подсказок;
    // «закреплено» — повторная успешная проверка не раньше чем через 2 дня.
    finishCheck(topicId, score, total) {
      const t = topic(topicId);
      const now = Date.now();
      const passed = score / total >= 5 / 6;
      t.checks.push({ date: now, score, total });
      t.checks = t.checks.slice(-10);
      if (passed) {
        if (t.masteredAt && !t.securedAt && now - t.masteredAt >= 2 * DAY) t.securedAt = now;
        if (!t.masteredAt) t.masteredAt = now;
      }
      markDay();
      persist();
      return { passed, secured: !!t.securedAt };
    },

    finishDiagnostic(grade, results) {
      state.diag[grade] = { date: Date.now(), results };
      persist();
    },

    dueReview(now = Date.now()) {
      return Object.entries(state.review).filter(([, r]) => r.due <= now).map(([id, r]) => ({ id, ...r }));
    },

    topicStatus(id) {
      const t = state.topics[id];
      if (!t) return 'new';
      if (t.securedAt) return 'secured';
      if (t.masteredAt) return 'mastered';
      if (t.practiced || t.checks.length) return 'progress';
      return 'new';
    },

    reset() {
      const settings = { ...state.settings };
      state = emptyState();
      state.settings = settings;
      persist();
    },

    exportJSON() {
      return JSON.stringify({ app: 'orfozor', exportedAt: new Date().toISOString(), state }, null, 2);
    },

    importJSON(text) {
      const data = JSON.parse(text);
      if (data?.app !== 'orfozor' || data?.state?.v !== 2) throw new Error('Это не файл прогресса Орфозора.');
      state = sanitize(data.state);
      persist();
    },
  };
}

export const STATUS_LABEL = {
  new: 'не начата',
  progress: 'в работе',
  mastered: 'освоена',
  secured: 'закреплена',
};

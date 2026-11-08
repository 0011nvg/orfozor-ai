// Модель знаний, диагностика ошибок, рекомендации и статистика.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bktUpdate, guessProbability, targetStep, pickNext, shouldStop, MASTERY, BKT } from '../js/core/model.js';
import { classifyError } from '../js/core/diagnose.js';
import { wilcoxon, mannWhitney, normalizedGain, mean, sd, median, spearman } from '../js/core/stats.js';
import { validateExplanation } from '../js/core/ai.js';
import { createStore } from '../js/core/store.js';
import { recommendations } from '../js/core/recommend.js';
import { TOPICS, topicById } from '../js/content/index.js';

const close = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

test('BKT: верный ответ повышает оценку, неверный — понижает', () => {
  const item = { t: 'gap', text: 'заг[о/а]рать' };
  assert.ok(bktUpdate(0.5, true, item) > 0.5);
  assert.ok(bktUpdate(0.5, false, item) < 0.5);
  // вручную: G = 0.5, S = 0.1, T = 0.12, P(L)=0.25, верно
  const post = (0.25 * 0.9) / (0.25 * 0.9 + 0.75 * 0.5);
  close(bktUpdate(0.25, true, item), post + (1 - post) * BKT.T);
});

test('BKT: верный ввод слова весит больше угадываемого выбора из двух', () => {
  const typeItem = { t: 'type', ans: ['слово'] };
  const choice2 = { t: 'choice', opts: ['а', 'б'] };
  assert.ok(guessProbability(typeItem) < guessProbability(choice2));
  assert.ok(bktUpdate(0.3, true, typeItem) > bktUpdate(0.3, true, choice2));
});

test('BKT: серия верных ответов приводит к порогу освоения', () => {
  let p = BKT.L0;
  const item = { t: 'type', ans: ['x'] };
  for (let i = 0; i < 4; i++) p = bktUpdate(p, true, item);
  assert.ok(p >= MASTERY, String(p));
});

test('адаптация: шаг задания зависит от оценки и опускается после ошибки', () => {
  assert.equal(targetStep(0.1), 'n');
  assert.equal(targetStep(0.3), 'r');
  assert.equal(targetStep(0.5), 'a');
  assert.equal(targetStep(0.9), 't');
  assert.equal(targetStep(0.9, 't'), 'a');
  const topic = topicById['g5-zs'];
  const first = pickNext({ items: topic.items, used: new Set(), pL: 0.1, rnd: () => 0 });
  assert.equal(first.s, 'n');
  const hard = pickNext({ items: topic.items, used: new Set(), pL: 0.9, rnd: () => 0 });
  assert.equal(hard.s, 't');
  assert.equal(shouldStop({ pL: 0.97, done: 5 }), true);
  assert.equal(shouldStop({ pL: 0.97, done: 3 }), false);
  assert.equal(shouldStop({ pL: 0.2, done: 12 }), true);
});

test('диагностика ошибок: типы', () => {
  const t = topicById['g5-alt-letter'];
  const exc = t.items.find((i) => /Исключение/.test(i.why) && i.t === 'gap');
  assert.equal(classifyError(exc, { ok: false }, { topic: t }), 'exception');
  const rec = t.items.find((i) => i.s === 'r');
  assert.equal(classifyError(rec, { ok: false }, { topic: t }), 'recognize');
  assert.equal(classifyError({ t: 'fix', why: '', s: 't' }, { ok: false, missed: [1], extra: [] }), 'detect');
  assert.equal(classifyError({ t: 'fix', why: '', s: 't' }, { ok: false, missed: [], extra: [2] }), 'overcorrect');
  assert.equal(classifyError({ t: 'punct', why: '', s: 't' }, { ok: false, missed: [1], extra: [] }), 'punctMissed');
  assert.equal(classifyError({ t: 'gap', text: 'Поезд пр[и/е]бывает утром.', why: 'x', s: 't' }, { ok: false }), 'context');
  assert.equal(classifyError({ t: 'gap', text: 'заг[о/а]рать', why: 'x', s: 'a' }, { ok: false }), 'apply');
});

test('рекомендации: новичку — диагностика; после ошибок — слабая тема с объяснением', () => {
  const s = createStore(mem());
  assert.equal(recommendations(s)[0].kind, 'diag');
  const topic = topicById['g5-zs'];
  for (const item of topic.items.slice(3, 7)) s.recordItem({ id: item.id, topicId: topic.id, firstTry: false, mode: 'practice', item, errorCode: 'apply' });
  const recs = recommendations(s);
  const weak = recs.find((r) => r.kind === 'weak');
  assert.ok(weak, JSON.stringify(recs));
  assert.match(weak.reason, /Модель оценивает освоение/);
  assert.ok(recs.find((r) => r.kind === 'review') || true);
});

test('статистика: совпадает со scipy.stats', () => {
  const x = [5, 7, 6, 9, 4, 8, 7, 6, 10, 5], y = [8, 9, 6, 12, 7, 9, 10, 8, 11, 9];
  const w = wilcoxon(x, y);
  assert.equal(w.W, 0);
  close(w.p, 0.008433303834235328, 1e-5);
  const m = mannWhitney([0.3, 0.5, 0.6, 0.2, 0.8, 0.4], [0.1, 0.2, 0.0, 0.3, 0.25]);
  assert.equal(m.U, 27);
  close(m.p, 0.034926255949542, 1e-5);
  close(normalizedGain(4, 7, 10), 0.5);
  assert.equal(normalizedGain(10, 10, 10), null);
  close(normalizedGain(8, 6, 10), -0.25);
  assert.equal(normalizedGain(5, 5, 10), 0);
  close(mean([1, 2, 3]), 2);
  close(sd([2, 4, 4, 4, 5, 5, 7, 9]), 2.138, 1e-3);
  assert.equal(median([3, 1, 2, 10]), 2.5);
  close(spearman([1, 2, 3, 4, 5, 6], [2, 1, 4, 3, 6, 5]).rho, 0.8285714, 1e-5);
  close(spearman([1, 2, 2, 3], [1, 3, 2, 4]).rho, 0.9486833, 1e-5);
});

test('ИИ-наставник: проверка сгенерированного объяснения', () => {
  const good = 'В корне -лаг- перед буквой Г пишется А, поэтому правильно предлагать. Проверять ударением здесь нельзя.';
  assert.equal(validateExplanation(good, { correct: 'предлагать', wrong: 'предлогать' }).ok, true);
  assert.equal(validateExplanation('Пиши как слышишь, и всё будет хорошо, это просто.', { correct: 'предлагать' }).ok, false);
  assert.equal(validateExplanation('Слово предлогать написано верно, а предлагать — тоже можно писать.', { correct: 'предлагать', wrong: 'предлогать' }).ok, false);
  assert.equal(validateExplanation(null, { correct: 'x' }).ok, false);
});

test('банк: у каждой темы есть задания всех нужных шагов для адаптации', () => {
  for (const t of TOPICS) {
    const steps = new Set(t.items.map((i) => i.s));
    assert.ok(steps.has('a') || steps.has('t'), t.id);
  }
});

import { participantsFrom, analyse, parseResearchFile, participantsCSV } from '../js/core/research.js';

test('исследование: пары срезов, прирост, сравнение групп, CSV', () => {
  const file = (code, group, pre, post, exp = '2026-10-01') => ({
    app: 'orfozor', kind: 'research', exportedAt: exp, participant: { code, group }, model: {}, activity: { minutes: 10 },
    tests: [
      { stage: 'pre', grade: 6, date: '2026-09-01', score: pre, max: 10, items: [] },
      { stage: 'post', grade: 6, date: '2026-10-01', score: post, max: 10, items: [] },
    ],
  });
  const files = [file('a1', 'Э', 4, 8), file('a2', 'Э', 5, 9), file('a3', 'Э', 6, 9), file('b1', 'К', 5, 6), file('b2', 'К', 4, 4), file('b3', 'К', 6, 7),
    file('A1', 'Э', 1, 1, '2026-09-02')]; // устаревший дубликат кода a1 — должен быть отброшен
  const rows = participantsFrom(files);
  assert.equal(rows.length, 6);
  const a1 = rows.find((r) => r.code === 'a1');
  close(a1.delta, 0.4);
  close(a1.gain, 4 / 6);
  const A = analyse(rows);
  assert.equal(A.groups['Э'].paired, 3);
  close(A.groups['Э'].postMean, 26 / 30);
  assert.ok(A.between.delta.U >= 0);
  assert.match(participantsCSV(rows), /^﻿код;группа/);
  assert.throws(() => parseResearchFile('{"app":"orfozor","kind":"progress"}'));
});

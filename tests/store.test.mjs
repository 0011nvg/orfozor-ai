// Логика прогресса: повторение, освоение темы, перенос и восстановление данных.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY } from '../js/core/store.js';
import { DAY } from '../js/core/util.js';

const memory = (init = {}) => {
  const m = { ...init };
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, raw: m };
};

test('ошибка отправляет задание в повторение на завтра', () => {
  const s = createStore(memory());
  s.recordItem({ id: 'a', topicId: 't', ok: false, firstTry: false, mode: 'practice' });
  assert.equal(Object.keys(s.state.review).length, 1);
  assert.equal(s.dueReview().length, 0);
  assert.equal(s.dueReview(Date.now() + 2 * DAY).length, 1);
});

test('верный ответ в повторении отодвигает задание, а после всех интервалов убирает его', () => {
  const s = createStore(memory());
  s.recordItem({ id: 'a', topicId: 't', ok: true, firstTry: false, mode: 'practice' });
  for (let i = 0; i < 5; i++) s.recordItem({ id: 'a', topicId: 't', ok: true, firstTry: true, mode: 'review' });
  assert.equal(s.state.review.a, undefined);
  assert.equal(s.state.log.fixedInReview, 5);
});

test('освоение и закрепление темы', (t) => {
  const s = createStore(memory());
  assert.equal(s.topicStatus('x'), 'new');
  assert.equal(s.finishCheck('x', 4, 6).passed, false);
  assert.equal(s.topicStatus('x'), 'progress');
  assert.equal(s.finishCheck('x', 5, 6).passed, true);
  assert.equal(s.topicStatus('x'), 'mastered');
  s.finishCheck('x', 6, 6); // сразу же — ещё не закрепление
  assert.equal(s.topicStatus('x'), 'mastered');
  const now = Date.now();
  t.mock.method(Date, 'now', () => now + 3 * DAY);
  s.finishCheck('x', 6, 6);
  assert.equal(s.topicStatus('x'), 'secured');
});

test('повреждённые данные не ломают приложение', () => {
  const s = createStore(memory({ [STORAGE_KEY]: '{не json' }));
  assert.equal(s.state.v, 2);
  const s2 = createStore(memory({ [STORAGE_KEY]: JSON.stringify({ v: 2, topics: [], items: null, settings: { cat: false } }) }));
  assert.deepEqual(s2.state.topics, {});
  assert.equal(s2.state.settings.cat, false);
});

test('экспорт и импорт прогресса; чужой файл отклоняется', () => {
  const a = createStore(memory());
  a.finishCheck('x', 6, 6);
  const b = createStore(memory());
  b.importJSON(a.exportJSON());
  assert.equal(b.topicStatus('x'), 'mastered');
  assert.throws(() => b.importJSON('{"hello":1}'));
});

test('сброс сохраняет настройки', () => {
  const s = createStore(memory());
  s.setting('board', true);
  s.finishCheck('x', 6, 6);
  s.reset();
  assert.equal(s.topicStatus('x'), 'new');
  assert.equal(s.state.settings.board, true);
});

test('недоступное хранилище: работа продолжается в памяти', () => {
  const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
  const s = createStore(broken);
  s.finishCheck('x', 6, 6);
  assert.equal(s.available, false);
  assert.equal(s.topicStatus('x'), 'mastered');
});

// Проверка нормализации и логики проверки ответов.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, checkItem, parseGaps, parsePunct, parseFix, parseMarked, fillGaps } from '../js/core/check.js';

test('нормализация: регистр, пробелы, конечная точка', () => {
  assert.equal(normalize('  Прикасаться. '), 'прикасаться');
  assert.equal(normalize('Нас   поджидала  невзгода!'), 'нас поджидала невзгода');
});

test('нормализация: дефисы любых видов и пробелы вокруг них', () => {
  for (const v of ['кто-нибудь', 'кто‑нибудь', 'кто–нибудь', 'кто - нибудь', 'кто—нибудь']) {
    assert.equal(normalize(v), 'кто-нибудь', v);
  }
});

test('нормализация: Ё равна Е, если тема не про Ё', () => {
  assert.equal(normalize('звёздный'), normalize('звездный'));
  assert.notEqual(normalize('жёны', { yo: true }), normalize('жены', { yo: true }));
});

test('нормализация: знак ударения не мешает', () => {
  assert.equal(normalize('во́ды'), 'воды');
});

test('ввод: верный ответ с Е вместо Ё принимается вне темы «Ё»', () => {
  const item = { t: 'type', ans: ['звёздный'] };
  assert.equal(checkItem(item, 'Звездный').ok, true);
});

test('ввод: в теме «Ё» буква Е вместо Ё даёт отдельную подсказку', () => {
  const item = { t: 'type', ans: ['жёны'], yo: true };
  const r = checkItem(item, 'жены');
  assert.equal(r.ok, false);
  assert.equal(r.yoOnly, true);
});

test('ввод: несколько допустимых ответов', () => {
  const item = { t: 'type', ans: ['кое-что', 'кое что'] };
  assert.equal(checkItem(item, 'КОЕ-ЧТО').ok, true);
});

test('пропуски: разбор, пустой вариант и порядок вариантов', () => {
  const parts = parseGaps('опас[/т]ный');
  assert.equal(parts[1].correct, '');
  assert.deepEqual(parts[1].options, ['т', '']);
  assert.equal(fillGaps('пят[/ь]надцат[ь/]', ['', 'ь']), 'пятнадцать');
  const item = { t: 'gap', text: 'пят[/ь]надцат[ь/]' };
  assert.equal(checkItem(item, ['', 'ь']).ok, true);
  assert.equal(checkItem(item, ['ь', 'ь']).ok, false);
  assert.deepEqual(checkItem(item, ['ь', 'ь']).marks, [false, true]);
});

test('выбор: верен только первый вариант данных', () => {
  const item = { t: 'choice', opts: ['а', 'б', 'в'] };
  assert.equal(checkItem(item, 'а').ok, true);
  assert.equal(checkItem(item, 'б').ok, false);
});

test('несколько ответов: нужен точный набор', () => {
  const item = { t: 'multi', opts: [['x', true], ['y', true], ['z', false]] };
  assert.equal(checkItem(item, ['y', 'x']).ok, true);
  assert.equal(checkItem(item, ['x']).ok, false);
  assert.equal(checkItem(item, ['x', 'y', 'z']).ok, false);
});

test('запятые: слоты и лишние/пропущенные', () => {
  const { words, commas } = parsePunct('Мы купили яблоки, груши и сливы.');
  assert.deepEqual(words, ['Мы', 'купили', 'яблоки', 'груши', 'и', 'сливы.']);
  assert.deepEqual([...commas], [2]);
  const item = { t: 'punct', text: 'Мы купили яблоки, груши и сливы.' };
  assert.equal(checkItem(item, [2]).ok, true);
  const r = checkItem(item, [2, 3]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.extra, [3]);
  assert.equal(checkItem({ t: 'punct', text: 'Мама ушла на работу.' }, []).ok, true);
});

test('исправление ошибок: токены и проверка', () => {
  const tokens = parseFix('Не *прикосайся|прикасайся* к стеклу.');
  const wrong = tokens.findIndex((t) => t.wrong);
  assert.equal(tokens[wrong].fix, 'прикасайся');
  const item = { t: 'fix', text: 'Не *прикосайся|прикасайся* к стеклу.' };
  assert.equal(checkItem(item, [wrong]).ok, true);
  assert.equal(checkItem(item, [0]).ok, false);
});

test('поиск буквы и морфемы', () => {
  const { letters, targets } = parseMarked('под{вод}ный');
  assert.equal(letters.join(''), 'подводный');
  assert.deepEqual(targets, [3, 4, 5]);
  const item = { t: 'morph', word: 'под{вод}ный' };
  assert.equal(checkItem(item, [5, 4, 3]).ok, true);
  assert.equal(checkItem(item, [3, 4]).ok, false);
});

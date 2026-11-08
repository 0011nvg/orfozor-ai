// Проверка учебного банка: структура, решаемость, однозначность и орфография.
// Русский словарь Hunspell (dictionary-ru) служит независимой «второй парой глаз»:
// верные написания должны в нём находиться, а неверные варианты — нет.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { TOPICS, SECTIONS } from '../js/content/index.js';
import { checkItem, solution, parseGaps, parseMarked, parseFix, parsePunct, fillGaps, solvedGaps } from '../js/core/check.js';

const require = createRequire(import.meta.url);
const nspell = require('nspell');
const dicDir = new URL('../node_modules/dictionary-ru/', import.meta.url);
const spell = nspell(fs.readFileSync(new URL('index.aff', dicDir)), fs.readFileSync(new URL('index.dic', dicDir)));

// Слова, которых нет в словаре Hunspell, но которые нормативны (проверены по орфографическому словарю на Грамоте).
const KNOWN_GOOD = new Set(['выгарки', 'зоревать', 'зарянка', 'межинститутский', 'предыюльский', 'лисицын', 'сестрицын']);
// Пары, где оба варианта — существующие слова, а выбор решает смысл предложения.
const BOTH_EXIST = new Set(['поласкать', 'полоскать', 'развевается', 'развивается', 'прибывает', 'пребывает', 'горячий', 'ставь']);

const words = (s) => s.toLowerCase().replace(/[.,!?:;«»"()…]/g, ' ').split(/[\s-]+/).filter((w) => /[а-яё]/.test(w));
const known = (w) => KNOWN_GOOD.has(w) || spell.correct(w) || spell.correct(w.replace(/ё/g, 'е')) || spell.correct(w[0].toUpperCase() + w.slice(1));

test('темы: обязательные поля и разделы', () => {
  const ids = new Set();
  for (const t of TOPICS) {
    assert.ok(!ids.has(t.id), 'повтор id темы ' + t.id);
    ids.add(t.id);
    for (const f of ['title', 'short', 'frp', 'goal', 'rule', 'steps', 'examples', 'pitfalls', 'hints', 'memo', 'use', 'items']) {
      assert.ok(t[f] && (typeof t[f] === 'string' ? t[f].trim() : t[f].length), `${t.id}: нет поля ${f}`);
    }
    assert.ok([5, 6].includes(t.grade), t.id);
    assert.ok(SECTIONS[t.section], `${t.id}: неизвестный раздел`);
    assert.equal(t.hints.length, 2, `${t.id}: нужно две подсказки`);
    assert.ok(t.items.length >= 9, `${t.id}: мало заданий (${t.items.length})`);
    const checkable = t.items.filter((i) => i.s === 'a' || i.s === 't');
    assert.ok(checkable.length >= 6, `${t.id}: для проверки темы нужно ≥ 6 заданий на применение (${checkable.length})`);
  }
});

test('задания: уникальные идентификаторы', () => {
  const seen = new Set();
  for (const t of TOPICS) for (const i of t.items) {
    assert.ok(!seen.has(i.id), 'повтор задания ' + i.id + ' ' + (i.text || i.q));
    seen.add(i.id);
  }
});

test('задания: корректная структура', () => {
  for (const t of TOPICS) for (const i of t.items) {
    const where = `${t.id} / ${i.text || i.word || i.q}`;
    assert.ok(i.why && i.why.length > 5, where + ': нет объяснения');
    assert.ok(['n', 'r', 'a', 't'].includes(i.s), where);
    switch (i.t) {
      case 'gap': {
        const gaps = parseGaps(i.text).filter((p) => p.gap);
        assert.ok(gaps.length >= 1, where);
        for (const g of gaps) {
          assert.ok(g.options.length >= 2, where + ': мало вариантов');
          assert.ok(g.options.includes(g.correct), where);
        }
        break;
      }
      case 'choice':
        assert.ok(i.opts.length >= 2 && new Set(i.opts).size === i.opts.length, where);
        break;
      case 'multi':
        assert.ok(i.opts.some((o) => o[1]) && i.opts.some((o) => !o[1]), where);
        assert.equal(new Set(i.opts.map((o) => o[0])).size, i.opts.length, where);
        break;
      case 'sort':
        assert.ok(i.cats.length >= 2, where);
        i.cats.forEach((_, ci) => assert.ok(i.items.some((x) => x[1] === ci), where + ': пустая категория'));
        assert.ok(i.items.every((x) => Number.isInteger(x[1]) && x[1] < i.cats.length), where);
        assert.equal(new Set(i.items.map((x) => x[0])).size, i.items.length, where);
        break;
      case 'spot':
      case 'morph': {
        const { targets } = parseMarked(i.word);
        assert.ok(targets.length >= 1, where);
        if (i.t === 'morph') assert.equal(targets[targets.length - 1] - targets[0] + 1, targets.length, where + ': морфема должна быть сплошной');
        break;
      }
      case 'fix': {
        const toks = parseFix(i.text);
        assert.ok(toks.some((x) => x.wrong), where);
        toks.filter((x) => x.wrong).forEach((x) => assert.notEqual(x.text, x.fix, where));
        break;
      }
      case 'punct':
        assert.ok(parsePunct(i.text).words.length >= 2, where);
        break;
      case 'type':
        assert.ok(i.ans.length >= 1 && i.ans.every((a) => a.trim()), where);
        break;
      default:
        assert.fail('неизвестный тип ' + i.t);
    }
  }
});

test('задания: эталонное решение принимается', () => {
  for (const t of TOPICS) for (const i of t.items) {
    assert.equal(checkItem(i, solution(i)).ok, true, `${t.id}: ${i.text || i.word || i.q}`);
  }
});

test('задания: неверные варианты не принимаются (нет двух правильных ответов)', () => {
  for (const t of TOPICS) for (const i of t.items) {
    if (i.t === 'gap') {
      const gaps = parseGaps(i.text).filter((p) => p.gap);
      const right = gaps.map((g) => g.correct);
      gaps.forEach((g, gi) => g.options.filter((o) => o !== g.correct).forEach((o) => {
        const resp = [...right];
        resp[gi] = o;
        assert.equal(checkItem(i, resp).ok, false, i.text);
      }));
    }
    if (i.t === 'choice') i.opts.slice(1).forEach((o) => assert.equal(checkItem(i, o).ok, false, i.q));
  }
});

test('орфография: верные написания есть в словаре', () => {
  const unknown = [];
  for (const t of TOPICS) for (const i of t.items) {
    const texts = [];
    if (i.t === 'gap') texts.push(solvedGaps(i.text));
    if (i.t === 'sort') i.items.forEach((x) => texts.push(solvedGaps(x[0])));
    if (i.t === 'fix') parseFix(i.text).forEach((x) => texts.push(x.wrong ? x.fix : x.text));
    if (i.t === 'type') texts.push(i.ans[0]);
    if (i.t === 'spot' || i.t === 'morph') texts.push(parseMarked(i.word).plain);
    if (i.t === 'punct') texts.push(i.text);
    for (const txt of texts) for (const w of words(txt)) if (!known(w)) unknown.push(`${t.id}: ${w}`);
  }
  assert.deepEqual(unknown, [], 'Нет в словаре:\n' + unknown.join('\n'));
});

test('орфография: неверные варианты действительно ошибочны', () => {
  const realWords = [];
  for (const t of TOPICS) for (const i of t.items) {
    // Задания на выбор грамматической формы в предложении: неверный вариант — тоже слово, но другая форма.
    if (t.formChoice || i.ctx) {
      if (i.text) assert.ok(/\s/.test(i.text), `${t.id}: контекстное задание должно быть предложением: ${i.text}`);
      continue;
    }
    if (i.t === 'gap') {
      const gaps = parseGaps(i.text).filter((p) => p.gap);
      const right = gaps.map((g) => g.correct);
      const correctWords = new Set(words(solvedGaps(i.text)));
      gaps.forEach((g, gi) => g.options.filter((o) => o !== g.correct).forEach((o) => {
        const resp = [...right];
        resp[gi] = o;
        for (const w of words(fillGaps(i.text, resp))) {
          if (correctWords.has(w) || BOTH_EXIST.has(w)) continue;
          if (spell.correct(w)) realWords.push(`${t.id}: «${w}» (вариант для ${i.text})`);
        }
      }));
    }
    if (i.t === 'fix') parseFix(i.text).filter((x) => x.wrong).forEach((x) => {
      for (const w of words(x.text)) if (!words(x.fix).includes(w) && !BOTH_EXIST.has(w) && spell.correct(w) && !/^не/.test(x.fix)) realWords.push(`${t.id}: «${w}» в задании на исправление`);
    });
  }
  assert.deepEqual(realWords, [], 'Отвлекающий вариант оказался существующим словом — задание может быть неоднозначным:\n' + realWords.join('\n'));
});

/* ---------- контрольно-измерительные материалы (срезы) ---------- */
import { TESTS } from '../js/content/tests.js';
import { topicById as TOPIC_BY_ID } from '../js/content/index.js';

test('срезы: параллельные формы покрывают одинаковые темы', () => {
  for (const [grade, forms] of Object.entries(TESTS)) {
    const topicsA = forms.A.map((i) => i.topicId).sort().join();
    const topicsB = forms.B.map((i) => i.topicId).sort().join();
    assert.equal(topicsA, topicsB, `класс ${grade}`);
    for (const i of [...forms.A, ...forms.B]) {
      assert.ok(TOPIC_BY_ID[i.topicId], i.topicId);
      assert.equal(TOPIC_BY_ID[i.topicId].grade, Number(grade), i.topicId);
      assert.equal(checkItem(i, solution(i)).ok, true, i.text || i.q);
    }
  }
});

test('срезы: задания не повторяют тренировочные', () => {
  const practice = new Set(TOPICS.flatMap((t) => t.items.map((i) => (i.text ? solvedGaps(i.text) : i.q))));
  const practiceWords = new Set(TOPICS.flatMap((t) => t.items.filter((i) => i.t === 'gap').flatMap((i) => words(solvedGaps(i.text)))));
  for (const forms of Object.values(TESTS)) for (const i of [...forms.A, ...forms.B]) {
    const key = i.text ? solvedGaps(i.text) : i.q;
    assert.ok(!practice.has(key), 'повтор задания: ' + key);
    if (i.t === 'gap' && !i.ctx) for (const w of words(solvedGaps(i.text))) assert.ok(!practiceWords.has(w), `слово «${w}» уже есть в тренировке`);
  }
});

test('срезы: орфография верных и неверных вариантов', () => {
  const problems = [];
  for (const forms of Object.values(TESTS)) for (const i of [...forms.A, ...forms.B]) {
    if (i.t !== 'gap') continue;
    for (const w of words(solvedGaps(i.text))) if (!known(w)) problems.push('нет в словаре: ' + w);
    if (i.ctx || /[-]/.test(i.text)) continue;
    const gaps = parseGaps(i.text).filter((p) => p.gap);
    const right = gaps.map((g) => g.correct);
    gaps.forEach((g, gi) => g.options.filter((o) => o !== g.correct).forEach((o) => {
      const resp = [...right];
      resp[gi] = o;
      for (const w of words(fillGaps(i.text, resp))) if (!words(solvedGaps(i.text)).includes(w) && spell.correct(w)) problems.push(`вариант «${w}» существует`);
    }));
  }
  assert.deepEqual(problems, []);
});

// Отрисовка заданий всех типов. Каждый тип возвращает единый контроллер:
// getResponse(), isComplete(), mark(result), reveal(), unlock(), focus().
// Всё управляется и мышью, и пальцем, и с клавиатуры (Tab / Enter / пробел).

import { esc, shuffle } from '../core/util.js';
import { parseGaps, parseMarked, parseFix, parsePunct, maskedGaps, solvedGaps } from '../core/check.js';

const DEFAULT_Q = {
  gap: 'Вставь пропущенную букву.',
  sort: 'Распредели слова по группам.',
};

// После неудачной попытки отметки «верно/неверно» остаются видны, пока ученик не начнёт исправлять.
const clearMarks = (body) => body.querySelectorAll('.is-right, .is-wrong, .is-missed').forEach((el) => el.classList.remove('is-right', 'is-wrong', 'is-missed'));

const optLabel = (o) => (o === '' ? '—' : o);
const optAria = (o) => (o === '' ? 'ничего не писать' : o);

export function mountExercise(root, item, { onChange = () => {}, seed } = {}) {
  const q = item.q || DEFAULT_Q[item.t] || '';
  root.innerHTML = `<p class="ex-q" id="exq-${item.id ? item.id.replace(/[^\w-]/g, '') : 'x'}">${esc(q)}</p><div class="ex-body ex-${item.t}"></div>`;
  const body = root.querySelector('.ex-body');
  const ctl = TYPES[item.t](body, item, onChange, seed ?? item.id);
  return ctl;
}

/* ------------------------- gap ------------------------- */
function gapType(body, item, onChange) {
  const parts = parseGaps(item.text);
  const gaps = parts.filter((p) => p.gap);
  const resp = gaps.map(() => undefined);
  let active = 0;
  let locked = false;
  const isSentence = /\s/.test(item.text.replace(/\[[^\]]*\]/g, ''));
  let gi = 0;
  body.innerHTML = `<div class="gap-text ${isSentence ? 'is-sentence' : 'is-word'}">${parts.map((p) => (p.gap ? `<button type="button" class="gap-slot" data-g="${gi++}" aria-label="Пропуск ${gi}">…</button>` : `<span>${esc(p)}</span>`)).join('')}</div>
  <div class="gap-options" role="group" aria-label="Варианты"></div>`;
  const slots = [...body.querySelectorAll('.gap-slot')];
  const optBox = body.querySelector('.gap-options');

  function drawOptions() {
    const g = gaps[active];
    optBox.innerHTML = (gaps.length > 1 ? `<span class="gap-which">Пропуск ${active + 1} из ${gaps.length}</span>` : '') +
      g.options.map((o) => `<button type="button" class="opt opt-letter" data-o="${esc(o)}" aria-label="${esc(optAria(o))}" aria-pressed="${resp[active] === o}">${esc(optLabel(o))}</button>`).join('');
    slots.forEach((s, i) => s.classList.toggle('is-active', i === active && !locked));
  }
  function drawSlots() {
    slots.forEach((s, i) => {
      const v = resp[i];
      s.textContent = v === undefined ? '…' : v === '' ? '∅' : v;
      s.classList.toggle('is-filled', v !== undefined);
      s.classList.toggle('is-empty-choice', v === '');
    });
  }
  body.addEventListener('click', (e) => {
    if (locked) return;
    clearMarks(body);
    const slot = e.target.closest('.gap-slot');
    if (slot) { active = +slot.dataset.g; drawOptions(); return; }
    const opt = e.target.closest('.opt');
    if (!opt) return;
    resp[active] = opt.dataset.o;
    const next = resp.findIndex((v) => v === undefined);
    if (next >= 0) active = next;
    drawSlots();
    drawOptions();
    onChange();
  });
  drawSlots();
  drawOptions();
  return {
    getResponse: () => [...resp],
    isComplete: () => resp.every((v) => v !== undefined),
    mark(result) {
      slots.forEach((s, i) => { s.classList.remove('is-right', 'is-wrong'); s.classList.add(result.marks[i] ? 'is-right' : 'is-wrong'); });
    },
    reveal() {
      gaps.forEach((g, i) => { resp[i] = g.correct; });
      drawSlots();
      slots.forEach((s) => { s.classList.remove('is-wrong'); s.classList.add('is-right'); });
    },
    lock() { locked = true; body.classList.add('is-locked'); optBox.hidden = true; slots.forEach((s) => s.classList.remove('is-active')); },
    unlock() { locked = false; body.classList.remove('is-locked'); optBox.hidden = false; drawOptions(); },
    focus() { (optBox.querySelector('.opt') || slots[0])?.focus(); },
  };
}

/* ------------------------- choice / multi ------------------------- */
function choiceType(body, item, onChange, seed) {
  const multi = item.t === 'multi';
  const opts = shuffle(multi ? item.opts.map((o) => o[0]) : item.opts, seed);
  const chosen = new Set();
  let locked = false;
  body.innerHTML = `${item.text ? `<p class="ex-text">${esc(item.text)}</p>` : ''}${multi ? '<p class="ex-note">Верных ответов может быть несколько.</p>' : ''}
  <div class="choice-list" role="group">${opts.map((o, i) => `<button type="button" class="opt opt-choice" data-i="${i}" aria-pressed="false"><span class="opt-mark" aria-hidden="true"></span><span class="opt-text">${esc(o)}</span></button>`).join('')}</div>`;
  const buttons = [...body.querySelectorAll('.opt-choice')];
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.opt-choice');
    if (!b || locked) return;
    clearMarks(body);
    const v = opts[+b.dataset.i];
    if (multi) { chosen.has(v) ? chosen.delete(v) : chosen.add(v); } else { chosen.clear(); chosen.add(v); }
    buttons.forEach((x) => x.setAttribute('aria-pressed', chosen.has(opts[+x.dataset.i])));
    onChange();
  });
  const rightSet = new Set(multi ? item.opts.filter((o) => o[1]).map((o) => o[0]) : [item.opts[0]]);
  return {
    getResponse: () => (multi ? [...chosen] : [...chosen][0]),
    isComplete: () => chosen.size > 0,
    mark() {
      buttons.forEach((b) => {
        const v = opts[+b.dataset.i];
        b.classList.remove('is-right', 'is-wrong', 'is-missed');
        if (chosen.has(v)) b.classList.add(rightSet.has(v) ? 'is-right' : 'is-wrong');
      });
    },
    reveal() {
      buttons.forEach((b) => {
        const v = opts[+b.dataset.i];
        if (rightSet.has(v) && !chosen.has(v)) b.classList.add('is-missed');
        if (rightSet.has(v)) b.classList.add('is-right');
      });
    },
    lock() { locked = true; body.classList.add('is-locked'); },
    unlock() { locked = false; body.classList.remove('is-locked'); },
    focus() { buttons[0]?.focus(); },
  };
}

/* ------------------------- sort ------------------------- */
function sortType(body, item, onChange, seed) {
  const rows = shuffle(item.items, seed);
  const resp = {};
  let locked = false;
  body.innerHTML = `<div class="sort-list">${rows.map(([w], ri) => `<div class="sort-row" data-r="${ri}"><span class="sort-word">${esc(maskedGaps(w))}</span><span class="sort-cats" role="group" aria-label="Группа для «${esc(maskedGaps(w))}»">${item.cats.map((c, ci) => `<button type="button" class="opt opt-cat" data-c="${ci}" aria-pressed="false">${esc(c)}</button>`).join('')}</span></div>`).join('')}</div>`;
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.opt-cat');
    if (!b || locked) return;
    clearMarks(body);
    const row = b.closest('.sort-row');
    const w = rows[+row.dataset.r][0];
    resp[w] = +b.dataset.c;
    row.querySelectorAll('.opt-cat').forEach((x) => x.setAttribute('aria-pressed', x === b));
    onChange();
  });
  const rowEls = [...body.querySelectorAll('.sort-row')];
  return {
    getResponse: () => ({ ...resp }),
    isComplete: () => rows.every(([w]) => resp[w] !== undefined),
    // При второй попытке не показываем, какие именно строки неверны (при двух группах это выдало бы ответ),
    // а только сколько. Построчная разметка появляется вместе с правильным ответом.
    mark(result) { if (result.ok) rowEls.forEach((r) => r.classList.add('is-right')); },
    reveal() {
      rowEls.forEach((r) => {
        const [w, c] = rows[+r.dataset.r];
        r.classList.add(resp[w] === c ? 'is-right' : 'is-wrong');
        r.querySelector('.sort-word').textContent = solvedGaps(w);
        r.querySelectorAll('.opt-cat').forEach((x) => x.classList.toggle('is-right', +x.dataset.c === c));
      });
    },
    lock() { locked = true; body.classList.add('is-locked'); },
    unlock() { locked = false; body.classList.remove('is-locked'); },
    focus() { body.querySelector('.opt-cat')?.focus(); },
  };
}

/* ------------------------- spot / morph ------------------------- */
function lettersType(body, item, onChange) {
  const { letters, targets } = parseMarked(item.word);
  const range = item.t === 'morph';
  let sel = new Set();
  let anchor = null;
  let locked = false;
  body.innerHTML = `${range ? '<p class="ex-note">Нажми на первую и последнюю букву. Чтобы начать заново, нажми на любую букву ещё раз.</p>' : ''}<div class="letters ${range ? 'is-range' : ''} ${letters.length > 10 ? 'is-long' : ''}" role="group" aria-label="Буквы слова">${letters.map((l, i) => `<button type="button" class="letter" data-i="${i}" aria-pressed="false" aria-label="${i + 1}-я буква: ${esc(l)}">${esc(l)}</button>`).join('')}</div>`;
  const btns = [...body.querySelectorAll('.letter')];
  const draw = () => btns.forEach((b, i) => b.setAttribute('aria-pressed', sel.has(i)));
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.letter');
    if (!b || locked) return;
    clearMarks(body);
    const i = +b.dataset.i;
    if (!range) { sel = sel.has(i) ? new Set() : new Set([i]); }
    else if (anchor === null) { anchor = i; sel = new Set([i]); }
    else { const [a, z] = [Math.min(anchor, i), Math.max(anchor, i)]; sel = new Set(Array.from({ length: z - a + 1 }, (_, k) => a + k)); anchor = null; }
    draw();
    onChange();
  });
  const tset = new Set(targets);
  return {
    getResponse: () => [...sel],
    isComplete: () => sel.size > 0,
    mark(result) { btns.forEach((b, i) => { b.classList.remove('is-right', 'is-wrong'); if (sel.has(i)) b.classList.add(result.ok ? 'is-right' : tset.has(i) ? 'is-right' : 'is-wrong'); }); },
    reveal() { btns.forEach((b, i) => { b.classList.toggle('is-target', tset.has(i)); }); },
    lock() { locked = true; body.classList.add('is-locked'); },
    unlock() { locked = false; anchor = null; body.classList.remove('is-locked'); },
    focus() { btns[0]?.focus(); },
  };
}

/* ------------------------- fix ------------------------- */
function fixType(body, item, onChange) {
  const tokens = parseFix(item.text);
  const sel = new Set();
  let locked = false;
  body.innerHTML = `<p class="ex-note">Нажми на слова, в которых есть ошибка. Ошибок может быть несколько.</p><p class="fix-text">${tokens.map((t, i) => (t.space ? ' ' : `<button type="button" class="token" data-i="${i}" aria-pressed="false">${esc(t.text)}</button>`)).join('')}</p>`;
  const btns = [...body.querySelectorAll('.token')];
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.token');
    if (!b || locked) return;
    clearMarks(body);
    const i = +b.dataset.i;
    sel.has(i) ? sel.delete(i) : sel.add(i);
    b.setAttribute('aria-pressed', sel.has(i));
    onChange();
  });
  return {
    getResponse: () => [...sel],
    isComplete: () => sel.size > 0,
    mark() { btns.forEach((b) => { const t = tokens[+b.dataset.i]; b.classList.remove('is-right', 'is-wrong'); if (sel.has(+b.dataset.i)) b.classList.add(t.wrong ? 'is-right' : 'is-wrong'); }); },
    reveal() {
      btns.forEach((b) => {
        const t = tokens[+b.dataset.i];
        if (t.wrong) { b.classList.add('is-fixed'); b.innerHTML = `<s>${esc(t.text)}</s> <ins>${esc(t.fix)}</ins>`; }
      });
    },
    lock() { locked = true; body.classList.add('is-locked'); },
    unlock() { locked = false; body.classList.remove('is-locked'); },
    focus() { btns[0]?.focus(); },
  };
}

/* ------------------------- punct ------------------------- */
function punctType(body, item, onChange) {
  const { words, commas } = parsePunct(item.text);
  const sel = new Set();
  let locked = false;
  body.innerHTML = `<p class="punct-text">${words.map((w, i) => `<span class="pw">${esc(w)}</span>${i < words.length - 1 ? `<button type="button" class="pslot" data-i="${i}" aria-pressed="false" aria-label="Запятая после слова «${esc(w)}»"><span aria-hidden="true">,</span></button>` : ''}`).join(' ')}</p>`;
  const slots = [...body.querySelectorAll('.pslot')];
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.pslot');
    if (!b || locked) return;
    clearMarks(body);
    const i = +b.dataset.i;
    sel.has(i) ? sel.delete(i) : sel.add(i);
    b.setAttribute('aria-pressed', sel.has(i));
    onChange();
  });
  return {
    getResponse: () => [...sel],
    isComplete: () => true, // «запятые не нужны» — тоже ответ
    mark() { slots.forEach((s) => { const i = +s.dataset.i; s.classList.remove('is-right', 'is-wrong'); if (sel.has(i)) s.classList.add(commas.has(i) ? 'is-right' : 'is-wrong'); }); }, // пропущенные места не подсвечиваем: иначе вторая попытка теряет смысл
    reveal() { slots.forEach((s) => { const i = +s.dataset.i; s.setAttribute('aria-pressed', commas.has(i)); s.classList.toggle('is-right', commas.has(i)); s.classList.remove('is-wrong'); }); },
    lock() { locked = true; body.classList.add('is-locked'); },
    unlock() { locked = false; body.classList.remove('is-locked'); },
    focus() { slots[0]?.focus(); },
  };
}

/* ------------------------- type ------------------------- */
function typeType(body, item, onChange) {
  body.innerHTML = `<label class="type-field"><span class="sr-only">Твой ответ</span><input class="type-input" type="text" lang="ru" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Напиши ответ"></label>${item.yo ? '<p class="ex-note">В этом задании буква Ё обязательна.</p>' : ''}<p class="type-answer" hidden></p>`;
  const input = body.querySelector('input');
  input.addEventListener('input', () => { input.classList.remove('is-right', 'is-wrong'); onChange(); });
  const ans = body.querySelector('.type-answer');
  return {
    getResponse: () => input.value,
    isComplete: () => input.value.trim().length > 0,
    mark(result) { input.classList.remove('is-right', 'is-wrong'); input.classList.add(result.ok ? 'is-right' : 'is-wrong'); },
    reveal() { ans.hidden = false; ans.innerHTML = `Верно: <b>${esc(item.ans[0])}</b>`; },
    lock() { input.readOnly = true; },
    unlock() { input.readOnly = false; input.select(); },
    focus() { input.focus(); },
  };
}

const TYPES = { gap: gapType, choice: choiceType, multi: choiceType, sort: sortType, spot: lettersType, morph: lettersType, fix: fixType, punct: punctType, type: typeType };

// Сколько осмысленных попыток даёт задание: при выборе из двух вторая попытка — это угадывание.
export function attemptsFor(item) {
  if (item.t === 'choice') return item.opts.length > 2 ? 2 : 1;
  if (item.t === 'gap') return parseGaps(item.text).some((p) => p.gap && p.options.length > 2) ? 2 : 1;
  return 2;
}

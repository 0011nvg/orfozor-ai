// Разбор разметки заданий и проверка ответов.
// Модуль не зависит от DOM: его целиком покрывают тесты в tests/.
//
// Разметка в данных:
//   gap   — «заг[о/а]рать»: в скобках варианты, ПЕРВЫЙ — верный; пустой вариант «[ь/]» = «ничего не пишем».
//   spot  — «пр{и}вязать»: в фигурных скобках буквы-мишени.
//   morph — «под{вод}ный»: в фигурных скобках выделяемая морфема.
//   fix   — «Мы *прикосались|прикасались* к стеклу»: *ошибка|исправление*.
//   punct — обычное предложение с верными запятыми: «Мы купили яблоки, груши и сливы.»

const DASHES = /[‐-―−]/g;

export function normalize(input, { yo = false, keepPunct = false } = {}) {
  let s = String(input ?? '')
    .normalize('NFC')
    .replace(/́/g, '') // знак ударения
    .replace(DASHES, '-')
    .replace(/[«»„“”"]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-') // «кто - нибудь» и «кто‑нибудь» считаем одним написанием
    .trim();
  if (!keepPunct) s = s.replace(/[.!?…;:,]+$/u, '').trim();
  if (!yo) s = s.replace(/ё/g, 'е');
  return s;
}

/* ---------- gap ---------- */
export function parseGaps(text) {
  const parts = [];
  const re = /\[([^\]]*)\]/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const options = m[1].split('/');
    parts.push({ gap: true, correct: options[0], options: sortOptions(options) });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Варианты в фиксированном «алфавитном» порядке, пустой — последним: позиция не подсказывает ответ.
export function sortOptions(options) {
  const uniq = [...new Set(options)];
  return uniq.sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'ru')));
}

export const gapCount = (text) => parseGaps(text).filter((p) => p.gap).length;

export function fillGaps(text, choices) {
  let i = 0;
  return parseGaps(text).map((p) => (p.gap ? (choices[i++] ?? '…') : p)).join('');
}

export const solvedGaps = (text) => parseGaps(text).map((p) => (p.gap ? p.correct : p)).join('');

export const maskedGaps = (text, mark = '..') => parseGaps(text).map((p) => (p.gap ? mark : p)).join('');

/* ---------- spot / morph ---------- */
export function parseMarked(word) {
  const letters = [];
  const targets = [];
  let inside = false;
  for (const ch of [...word]) {
    if (ch === '{') { inside = true; continue; }
    if (ch === '}') { inside = false; continue; }
    if (inside) targets.push(letters.length);
    letters.push(ch);
  }
  return { letters, targets, plain: letters.join('') };
}

/* ---------- fix ---------- */
export function parseFix(text) {
  const tokens = [];
  const re = /\*([^*|]+)\|([^*]+)\*/g;
  let last = 0, m;
  const pushPlain = (chunk) => {
    for (const w of chunk.split(/(\s+)/)) if (w) tokens.push({ text: w, space: /^\s+$/.test(w) });
  };
  while ((m = re.exec(text))) {
    pushPlain(text.slice(last, m.index));
    tokens.push({ text: m[1], wrong: true, fix: m[2] });
    last = re.lastIndex;
  }
  pushPlain(text.slice(last));
  return tokens;
}

export const fixedText = (text) => text.replace(/\*([^*|]+)\|([^*]+)\*/g, '$2');
export const brokenText = (text) => text.replace(/\*([^*|]+)\|([^*]+)\*/g, '$1');

/* ---------- punct ---------- */
// Слоты между словами: slot i — после слова i. Запятые снимаются, остальная пунктуация остаётся у слова.
export function parsePunct(text) {
  const raw = text.trim().split(/\s+/);
  const words = [];
  const commas = new Set();
  raw.forEach((tok, i) => {
    if (tok.endsWith(',') && i < raw.length - 1) {
      commas.add(i);
      words.push(tok.slice(0, -1));
    } else words.push(tok);
  });
  return { words, commas };
}

export function punctText(words, slots) {
  return words.map((w, i) => (slots.has(i) ? w + ',' : w)).join(' ');
}

/* ---------- проверка ---------- */
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

export function checkItem(item, response) {
  switch (item.t) {
    case 'gap': {
      const gaps = parseGaps(item.text).filter((p) => p.gap);
      const marks = gaps.map((g, i) => response?.[i] === g.correct);
      return { ok: marks.every(Boolean), marks, complete: gaps.every((_, i) => response?.[i] !== undefined) };
    }
    case 'choice':
      return { ok: response === item.opts[0], complete: response !== undefined && response !== null };
    case 'multi': {
      const right = new Set(item.opts.filter((o) => o[1]).map((o) => o[0]));
      const got = new Set(response || []);
      return { ok: setEq(right, got), complete: got.size > 0, missed: [...right].filter((x) => !got.has(x)), extra: [...got].filter((x) => !right.has(x)) };
    }
    case 'sort': {
      const marks = item.items.map(([w, c]) => response?.[w] === c);
      return { ok: marks.every(Boolean), marks, complete: item.items.every(([w]) => response?.[w] !== undefined) };
    }
    case 'spot': {
      const { targets } = parseMarked(item.word);
      const got = new Set(response || []);
      return { ok: setEq(new Set(targets), got), complete: got.size > 0 };
    }
    case 'morph': {
      const { targets } = parseMarked(item.word);
      const got = new Set(response || []);
      return { ok: setEq(new Set(targets), got), complete: got.size > 0 };
    }
    case 'fix': {
      const tokens = parseFix(item.text);
      const right = new Set(tokens.map((t, i) => (t.wrong ? i : -1)).filter((i) => i >= 0));
      const got = new Set(response || []);
      return { ok: setEq(right, got), complete: got.size > 0, missed: [...right].filter((i) => !got.has(i)), extra: [...got].filter((i) => !right.has(i)) };
    }
    case 'punct': {
      const { commas } = parsePunct(item.text);
      const got = new Set(response || []);
      return { ok: setEq(commas, got), complete: true, missed: [...commas].filter((i) => !got.has(i)), extra: [...got].filter((i) => !commas.has(i)) };
    }
    case 'type': {
      const typed = String(response ?? '');
      const yo = !!item.yo;
      const answers = item.ans;
      const ok = answers.some((a) => normalize(a, { yo }) === normalize(typed, { yo }));
      // Ученик написал «е» вместо обязательной «ё» — отдельная подсказка, а не загадочная ошибка.
      const yoOnly = !ok && yo && answers.some((a) => normalize(a) === normalize(typed));
      return { ok, yoOnly, complete: typed.trim().length > 0 };
    }
    default:
      throw new Error('Неизвестный тип задания: ' + item.t);
  }
}

// Верный ответ в человекочитаемом виде — для обратной связи, ключей учителя и печати.
export function answerText(item) {
  switch (item.t) {
    case 'gap': return solvedGaps(item.text);
    case 'choice': return item.opts[0];
    case 'multi': return item.opts.filter((o) => o[1]).map((o) => o[0]).join(', ');
    case 'sort': return item.cats.map((c, ci) => `${c}: ${item.items.filter((x) => x[1] === ci).map((x) => solvedGaps(x[0])).join(', ')}`).join('; ');
    case 'spot': {
      const { letters, targets } = parseMarked(item.word);
      return letters.map((l, i) => (targets.includes(i) ? l.toUpperCase() : l)).join('');
    }
    case 'morph': {
      const { letters, targets } = parseMarked(item.word);
      return letters.map((l, i) => (targets[0] === i ? '[' : '') + l + (targets[targets.length - 1] === i ? ']' : '')).join('');
    }
    case 'fix': return fixedText(item.text);
    case 'punct': return item.text;
    case 'type': return item.ans[0];
    default: return '';
  }
}

// Однозначное «эталонное» решение — нужно тестам, чтобы доказать, что каждое задание решаемо.
export function solution(item) {
  switch (item.t) {
    case 'gap': return parseGaps(item.text).filter((p) => p.gap).map((p) => p.correct);
    case 'choice': return item.opts[0];
    case 'multi': return item.opts.filter((o) => o[1]).map((o) => o[0]);
    case 'sort': return Object.fromEntries(item.items.map(([w, c]) => [w, c]));
    case 'spot':
    case 'morph': return parseMarked(item.word).targets;
    case 'fix': return parseFix(item.text).map((t, i) => (t.wrong ? i : -1)).filter((i) => i >= 0);
    case 'punct': return [...parsePunct(item.text).commas];
    case 'type': return item.ans[0];
    default: return null;
  }
}

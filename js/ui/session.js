// Прохождение серии заданий: тренировка, проверка темы, повторение, диагностика,
// смешанная практика и задание по ссылке учителя. Одна логика — разные настройки.

import { esc, md, plural, shuffle } from '../core/util.js';
import { checkItem, answerText } from '../core/check.js';
import { mountExercise, attemptsFor } from './exercise.js';
import { catSays } from './cat.js';
import { topicById, topicsOfGrade } from '../content/index.js';
import { STEP_LABEL } from '../content/build.js';

const PRAISE = ['Верно!', 'Точно.', 'Да, так и есть.', 'Правильно.'];

export const MODES = {
  practice: { hints: true, retry: true, label: 'Тренировка' },
  check: { hints: false, retry: false, label: 'Проверь себя' },
  review: { hints: true, retry: true, label: 'Повторение' },
  diagnostic: { hints: false, retry: false, label: 'Диагностика' },
  mixed: { hints: true, retry: true, label: 'Смешанная практика', recognize: true },
  assignment: { hints: true, retry: true, label: 'Задание' },
};

export function runSession(main, { store, mode, items, title, backHref, backLabel = 'Назад', onFinish, hintsAllowed }) {
  const cfg = MODES[mode];
  const allowHints = hintsAllowed ?? cfg.hints;
  const showCat = store.state.settings.cat !== false;
  const queue = cfg.recognize ? items.flatMap((it) => [{ recognize: true, item: it }, { item: it }]) : items.map((it) => ({ item: it }));
  const log = [];
  let idx = 0;

  main.innerHTML = `<section class="run" aria-labelledby="run-title">
    <div class="run-head">
      <a class="back-link" href="${backHref}">← ${esc(backLabel)}</a>
      <div class="run-title-row"><h1 id="run-title" class="run-title">${esc(title)}</h1><span class="run-count" aria-live="polite"></span></div>
      <div class="run-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${queue.length}" aria-label="Пройдено заданий"><span></span></div>
    </div>
    <div class="run-stage"></div>
  </section>`;
  const stage = main.querySelector('.run-stage');
  const bar = main.querySelector('.run-bar');
  const count = main.querySelector('.run-count');

  function progress() {
    bar.setAttribute('aria-valuenow', idx);
    bar.firstElementChild.style.width = `${(idx / queue.length) * 100}%`;
    count.textContent = `${Math.min(idx + 1, queue.length)} / ${queue.length}`;
  }

  function next() {
    if (idx >= queue.length) return finish();
    progress();
    const step = queue[idx];
    if (step.recognize) renderRecognize(step.item);
    else renderItem(step.item);
  }

  // Смешанная практика: сначала определить орфограмму, потом решить.
  function renderRecognize(item) {
    const topic = topicById[item.topicId];
    const others = shuffle(topicsOfGrade(topic.grade).filter((t) => t.id !== topic.id), item.id).slice(0, 2);
    const fake = {
      id: item.id + ':rec', topicId: topic.id, t: 'choice', s: 'r',
      q: 'Какое правило нужно применить, чтобы заполнить пропуск?',
      text: item.text ? item.text.replace(/\[[^\]]*\]/g, '..') : '',
      opts: [topic.title, ...others.map((t) => t.title)],
      why: `Здесь работает правило «${topic.title}». ${topic.short}.`,
    };
    renderItem(fake, { recognizeStep: true });
  }

  function renderItem(item, { recognizeStep = false } = {}) {
    const topic = topicById[item.topicId];
    const maxAttempts = cfg.retry ? attemptsFor(item) : 1;
    let attempts = 0;
    let hintsUsed = 0;
    let done = false;
    const stepLabel = recognizeStep ? 'Определяю правило' : STEP_LABEL[item.s];

    stage.innerHTML = `<article class="ex-card" aria-labelledby="ex-topic" data-item="${esc(item.id)}" data-type="${item.t}">
      <div class="ex-meta"><span class="chip chip-step">${esc(stepLabel)}</span>${mode !== 'practice' && mode !== 'check' ? `<span class="ex-topic" id="ex-topic">${recognizeStep ? 'Смешанная практика' : esc(topic.title)}</span>` : '<span id="ex-topic" class="sr-only">' + esc(topic.title) + '</span>'}</div>
      <div class="ex-root"></div>
    </article>
    <div class="run-feedback" aria-live="polite"></div>
    <div class="run-actions">
      ${allowHints && !recognizeStep ? '<button type="button" class="btn btn-ghost js-hint">Подсказка <span class="hint-left">(2)</span></button>' : '<span></span>'}
      <button type="button" class="btn btn-primary js-check" disabled>Проверить</button>
    </div>`;
    const root = stage.querySelector('.ex-root');
    const fb = stage.querySelector('.run-feedback');
    const checkBtn = stage.querySelector('.js-check');
    const hintBtn = stage.querySelector('.js-hint');
    const ctl = mountExercise(root, item, { onChange: () => { checkBtn.disabled = !ctl.isComplete(); } });
    checkBtn.disabled = !ctl.isComplete();

    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (hintsUsed >= 2 || done) return;
        const text = item.hint && hintsUsed === 1 ? item.hint : topic.hints[hintsUsed];
        hintsUsed += 1;
        fb.innerHTML = catSays(`<b>Подсказка ${hintsUsed}.</b> ${md(text)}`, { mood: 'think', show: showCat, tone: 'is-hint' });
        hintBtn.querySelector('.hint-left').textContent = `(${2 - hintsUsed})`;
        if (hintsUsed >= 2) hintBtn.disabled = true;
      });
    }

    function retryMessage(res) {
      if (res.yoOnly) return 'Почти! Проверь букву Ё: в этом слове она нужна.';
      if (item.t === 'fix') return res.extra?.length ? 'Одно из отмеченных слов написано верно. Посмотри ещё раз.' : 'Ты нашёл не все ошибки. Прочитай предложение ещё раз.';
      if (item.t === 'punct') return res.extra?.length && !res.missed?.length ? 'Есть лишняя запятая.' : res.missed?.length && !res.extra?.length ? 'Не хватает запятой.' : 'Запятые стоят не на своих местах.';
      if (item.t === 'multi') return res.extra?.length ? 'Среди отмеченных есть лишний вариант.' : 'Ты отметил не все верные варианты.';
      if (item.t === 'sort') { const n = res.marks.filter((m) => !m).length; return `${n} ${plural(n, 'слово попало', 'слова попали', 'слов попали')} не в ту группу.`; }
      if (item.t === 'gap' && res.marks?.length > 1) return 'Не все пропуски заполнены верно — они отмечены.';
      return 'Пока не так.';
    }

    function check() {
      if (done || !ctl.isComplete()) return;
      const res = checkItem(item, ctl.getResponse());
      attempts += 1;
      ctl.mark(res);
      ctl.lock();
      if (res.ok) {
        done = true;
        const firstTry = attempts === 1 && hintsUsed === 0;
        const head = firstTry ? PRAISE[(idx + item.id.length) % PRAISE.length] : 'Верно.';
        fb.innerHTML = catSays(`<b>${head}</b> ${md(item.why)}`, { mood: 'happy', show: showCat, tone: 'is-right' });
        settle(true, firstTry);
      } else if (attempts < maxAttempts) {
        const hint = topic.hints[Math.min(hintsUsed, 1)];
        fb.innerHTML = catSays(`<b>${esc(retryMessage(res))}</b> ${md(hint)}`, { mood: 'think', show: showCat, tone: 'is-retry' });
        setTimeout(() => { ctl.unlock(); checkBtn.disabled = !ctl.isComplete(); ctl.focus(); }, 0);
      } else {
        done = true;
        ctl.reveal();
        const back = mode === 'diagnostic' ? '' : ' <span class="fb-note">Это задание вернётся к тебе в повторении.</span>';
        fb.innerHTML = catSays(`<b>Правильный ответ: ${esc(answerText(item))}.</b> ${md(item.why)}${back}`, { mood: 'oops', show: showCat, tone: 'is-wrong' });
        settle(false, false);
      }
    }

    function settle(ok, firstTry) {
      if (hintBtn) hintBtn.disabled = true;
      log.push({ item, ok, firstTry, hints: hintsUsed, recognizeStep });
      if (!recognizeStep) store.recordItem({ id: item.id, topicId: item.topicId, ok, firstTry, mode });
      checkBtn.textContent = idx + 1 >= queue.length ? 'Завершить' : 'Дальше';
      checkBtn.disabled = false;
      checkBtn.classList.add('is-next');
      checkBtn.focus({ preventScroll: true });
      fb.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    checkBtn.addEventListener('click', () => {
      if (done) { idx += 1; next(); return; }
      check();
    });
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); checkBtn.click(); }
    });
    // Фокус — на формулировку задания, а не на первый вариант: иначе рамка фокуса выглядит как выбранный ответ.
    const q = root.querySelector('.ex-q');
    if (q) { q.setAttribute('tabindex', '-1'); if (idx > 0) q.focus({ preventScroll: false }); }
  }

  function finish() {
    bar.firstElementChild.style.width = '100%';
    count.textContent = '';
    const solved = log.filter((l) => !l.recognizeStep);
    const total = solved.length;
    const independent = solved.filter((l) => l.firstTry).length;
    const helped = solved.filter((l) => l.ok && !l.firstTry).length;
    const missed = solved.filter((l) => !l.ok);
    const result = { total, independent, helped, missed, log };
    stage.innerHTML = onFinish ? onFinish(result) : defaultSummary(result);
    stage.querySelector('h2, .btn')?.focus?.();
  }

  function defaultSummary({ total, independent, helped }) {
    return `<div class="summary">${catSays(`Ты выполнил ${total} ${plural(total, 'задание', 'задания', 'заданий')}. Сам и с первой попытки — ${independent}, с подсказкой или со второй попытки — ${helped}.`, { mood: 'happy', show: showCat })}</div>`;
  }

  next();
}

export function summaryStats({ total, independent, helped }) {
  return `<dl class="stats">
    <div><dt>Сам, с первой попытки</dt><dd>${independent} <small>из ${total}</small></dd></div>
    <div><dt>С подсказкой или со второй попытки</dt><dd>${helped}</dd></div>
    <div><dt>Вернутся в повторение</dt><dd>${total - independent}</dd></div>
  </dl>`;
}

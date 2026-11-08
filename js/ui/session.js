// Прохождение серии заданий: адаптивная тренировка, проверка темы, повторение, диагностика,
// смешанная практика, задание по ссылке и исследовательский срез. Одна логика — разные режимы.

import { esc, md, plural, shuffle } from '../core/util.js';
import { checkItem, answerText, fillGaps } from '../core/check.js';
import { classifyError, ERROR_TYPES } from '../core/diagnose.js';
import { aiEnabled, explainDifferently } from '../core/ai.js';
import { levelLabel } from '../core/model.js';
import { mountExercise, attemptsFor } from './exercise.js';
import { note } from './note.js';
import { topicById, topicsOfGrade } from '../content/index.js';
import { STEP_LABEL } from '../content/build.js';

const PRAISE = ['Верно.', 'Точно.', 'Правильно.', 'Да, так.'];
const STEP_PURPOSE = { n: 'находить орфограмму', r: 'распознавать условие выбора', a: 'применять правило', t: 'переносить правило в предложение' };

export const MODES = {
  practice: { hints: true, retry: true, feedback: true },
  check: { hints: false, retry: false, feedback: true },
  review: { hints: true, retry: true, feedback: true },
  diagnostic: { hints: false, retry: false, feedback: true },
  mixed: { hints: true, retry: true, feedback: true, recognize: true },
  assignment: { hints: true, retry: true, feedback: true },
  test: { hints: false, retry: false, feedback: false },
};

const pct = (p) => Math.round(p * 100);

function studentAnswerText(item, resp) {
  if (item.t === 'gap') return fillGaps(item.text, resp || []);
  if (item.t === 'choice' || item.t === 'type') return String(resp ?? '');
  return '';
}

/**
 * items — готовый список заданий, либо pick({ log, used }) — функция адаптивного выбора
 * следующего задания (возвращает задание или null) вместе с maxCount для шкалы прогресса.
 */
export function runSession(main, { store, mode, items, pick, maxCount, title, backHref, backLabel = 'Назад', onFinish, hintsAllowed, adaptiveTopic }) {
  const cfg = MODES[mode];
  const allowHints = hintsAllowed ?? cfg.hints;
  const fixed = items ? (cfg.recognize ? items.flatMap((it) => [{ recognize: true, item: it }, { item: it }]) : items.map((it) => ({ item: it }))) : null;
  const total = fixed ? fixed.length : maxCount;
  const log = [];
  const used = new Set();
  let idx = 0;

  main.innerHTML = `<section class="run" aria-labelledby="run-title">
    <div class="run-head">
      <a class="back-link" href="${backHref}">← ${esc(backLabel)}</a>
      <div class="run-title-row"><h1 id="run-title" class="run-title">${esc(title)}</h1><span class="run-count" aria-live="polite"></span></div>
      <div class="run-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-label="Пройдено заданий"><span></span></div>
      ${adaptiveTopic ? '<div class="model-meter" aria-live="polite"></div>' : ''}
    </div>
    <div class="run-stage"></div>
  </section>`;
  const stage = main.querySelector('.run-stage');
  const bar = main.querySelector('.run-bar');
  const count = main.querySelector('.run-count');
  const meter = main.querySelector('.model-meter');

  function drawMeter() {
    if (!meter) return;
    const p = store.pL(adaptiveTopic.id) ?? 0.25;
    meter.innerHTML = `<span class="mm-label">Модель знаний: освоение темы</span><span class="mm-track"><span style="width:${pct(p)}%"></span></span><b>${pct(p)} %</b><span class="mm-state">${levelLabel(p)}</span>`;
  }

  function progress() {
    bar.setAttribute('aria-valuenow', idx);
    bar.firstElementChild.style.width = `${(idx / total) * 100}%`;
    count.textContent = fixed ? `${Math.min(idx + 1, total)} / ${total}` : `${idx + 1}`;
    drawMeter();
  }

  function next() {
    let step;
    if (fixed) {
      if (idx >= fixed.length) return finish();
      step = fixed[idx];
    } else {
      const it = pick({ log, used });
      if (!it) return finish();
      step = { item: it, adaptive: true };
    }
    progress();
    if (step.recognize) renderRecognize(step.item);
    else renderItem(step.item, { adaptive: step.adaptive });
  }

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

  function renderItem(item, { recognizeStep = false, adaptive = false } = {}) {
    const topic = topicById[item.topicId];
    const maxAttempts = cfg.retry ? attemptsFor(item) : 1;
    const started = performance.now();
    let attempts = 0;
    let hintsUsed = 0;
    let done = false;
    let firstError = null;
    let lastResponse;
    used.add(item.id);
    const stepLabel = recognizeStep ? 'Определяю правило' : STEP_LABEL[item.s];
    const showTopic = !['practice', 'check', 'test'].includes(mode);
    const pLnow = adaptiveTopic ? store.pL(adaptiveTopic.id) ?? 0.25 : null;
    const why = adaptive ? `<p class="ex-why">Подобрано моделью: оценка освоения ${pct(pLnow)} % — сейчас полезнее всего ${STEP_PURPOSE[item.s]}.</p>` : '';

    stage.innerHTML = `<article class="ex-card" aria-labelledby="ex-topic" data-item="${esc(item.id)}" data-type="${item.t}">
      <div class="ex-meta"><span class="chip chip-step">${esc(stepLabel)}</span>${showTopic ? `<span class="ex-topic" id="ex-topic">${recognizeStep ? 'Смешанная практика' : esc(topic.title)}</span>` : `<span id="ex-topic" class="sr-only">${esc(topic.title)}</span>`}</div>
      ${why}
      <div class="ex-root"></div>
    </article>
    <div class="run-feedback" aria-live="polite"></div>
    <div class="run-actions">
      ${allowHints && !recognizeStep ? '<button type="button" class="btn btn-ghost js-hint">Подсказка <span class="hint-left">(2)</span></button>' : '<span></span>'}
      <button type="button" class="btn btn-primary js-check" disabled>${cfg.feedback ? 'Проверить' : 'Ответить'}</button>
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
        fb.innerHTML = note(md(text), { tone: 'is-hint', label: `Подсказка ${hintsUsed}` });
        hintBtn.querySelector('.hint-left').textContent = `(${2 - hintsUsed})`;
        if (hintsUsed >= 2) hintBtn.disabled = true;
      });
    }

    function retryMessage(res) {
      if (res.yoOnly) return 'Почти! Проверь букву Ё: в этом слове она нужна.';
      if (item.t === 'fix') return res.extra?.length ? 'Одно из отмеченных слов написано верно.' : 'Найдены не все ошибки.';
      if (item.t === 'punct') return res.extra?.length && !res.missed?.length ? 'Есть лишняя запятая.' : res.missed?.length && !res.extra?.length ? 'Не хватает запятой.' : 'Запятые стоят не на своих местах.';
      if (item.t === 'multi') return res.extra?.length ? 'Среди отмеченных есть лишний вариант.' : 'Отмечены не все верные варианты.';
      if (item.t === 'sort') { const n = res.marks.filter((m) => !m).length; return `${n} ${plural(n, 'слово попало', 'слова попали', 'слов попали')} не в ту группу.`; }
      if (item.t === 'gap' && res.marks?.length > 1) return 'Не все пропуски заполнены верно — они отмечены.';
      return 'Пока не так.';
    }

    const errorNote = (code) => code ? `<span class="fb-diag"><b>Тип ошибки:</b> ${esc(ERROR_TYPES[code].title.toLowerCase())}. ${esc(ERROR_TYPES[code].advice)}</span>` : '';

    function check() {
      if (done || !ctl.isComplete()) return;
      lastResponse = ctl.getResponse();
      const res = checkItem(item, lastResponse);
      attempts += 1;
      if (!res.ok && !firstError) firstError = classifyError(item, res, { topic, recognizeStep });
      if (!cfg.feedback) {
        done = true;
        ctl.lock();
        fb.innerHTML = note('Ответ записан.', { tone: 'is-tip' });
        settle(res.ok, res.ok);
        return;
      }
      ctl.mark(res);
      ctl.lock();
      if (res.ok) {
        done = true;
        const firstTry = attempts === 1 && hintsUsed === 0;
        const head = firstTry ? PRAISE[(idx + item.id.length) % PRAISE.length] : 'Верно.';
        fb.innerHTML = note(md(item.why), { tone: 'is-right', label: head });
        settle(true, firstTry);
      } else if (attempts < maxAttempts) {
        const hint = topic.hints[Math.min(hintsUsed, 1)];
        fb.innerHTML = note(md(hint), { tone: 'is-retry', label: esc(retryMessage(res)) });
        setTimeout(() => { ctl.unlock(); checkBtn.disabled = !ctl.isComplete(); ctl.focus(); }, 0);
      } else {
        done = true;
        ctl.reveal();
        const back = mode === 'diagnostic' ? '' : '<span class="fb-note">Задание вернётся в повторении.</span>';
        const ai = aiEnabled() && item.t !== 'sort' ? '<button type="button" class="btn btn-ghost btn-sm js-ai">Объясни по-другому</button>' : '';
        fb.innerHTML = note(`${md(item.why)}${errorNote(firstError)}${back}${ai}`, { tone: 'is-wrong', label: `Правильный ответ: ${esc(answerText(item))}.` });
        fb.querySelector('.js-ai')?.addEventListener('click', askAI);
        settle(false, false);
      }
    }

    async function askAI(e) {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = 'ИИ-наставник думает…';
      const out = document.createElement('div');
      fb.append(out);
      try {
        const text = await explainDifferently({
          topic: topic.title, rule: topic.rule, steps: topic.steps, task: item.q || '', text: item.text || item.word || '',
          correct: answerText(item), studentAnswer: studentAnswerText(item, lastResponse), explanation: item.why,
          errorType: firstError ? ERROR_TYPES[firstError].title : '', grade: topic.grade,
        });
        out.innerHTML = note(esc(text), { tone: 'is-ai', label: 'ИИ-наставник (объяснение сгенерировано и проверено по правилу темы)' });
        btn.remove();
      } catch {
        out.innerHTML = note('Не удалось получить другое объяснение. Перечитай алгоритм темы — он работает всегда.', { tone: 'is-tip' });
        btn.remove();
      }
    }

    function settle(ok, firstTry) {
      if (hintBtn) hintBtn.disabled = true;
      const ms = Math.round(performance.now() - started);
      log.push({ item, ok, firstTry, hints: hintsUsed, recognizeStep, ms, error: firstError || (!firstTry && hintsUsed ? 'hint' : null) });
      if (recognizeStep) {
        if (!firstTry) store.logError({ topicId: item.topicId, itemId: item.id, code: 'recognize', mode });
      } else {
        store.recordItem({ id: item.id, topicId: item.topicId, firstTry, mode, item, errorCode: firstError, ms });
      }
      drawMeter();
      const last = fixed ? idx + 1 >= fixed.length : false;
      checkBtn.textContent = last ? 'Завершить' : 'Дальше';
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
    const q = root.querySelector('.ex-q');
    if (q) { q.setAttribute('tabindex', '-1'); if (idx > 0) q.focus({ preventScroll: false }); }
  }

  function finish() {
    bar.firstElementChild.style.width = '100%';
    count.textContent = '';
    drawMeter();
    const solved = log.filter((l) => !l.recognizeStep);
    const result = {
      total: solved.length,
      independent: solved.filter((l) => l.firstTry).length,
      helped: solved.filter((l) => l.ok && !l.firstTry).length,
      missed: solved.filter((l) => !l.ok),
      log,
    };
    stage.innerHTML = onFinish(result);
    stage.querySelector('h2')?.focus?.();
  }

  next();
}

export function summaryStats({ total, independent, helped }) {
  return `<dl class="stats">
    <div><dt>Самостоятельно, с первой попытки</dt><dd>${independent} <small>из ${total}</small></dd></div>
    <div><dt>С подсказкой или со второй попытки</dt><dd>${helped}</dd></div>
    <div><dt>Вернутся в повторение</dt><dd>${total - independent}</dd></div>
  </dl>`;
}


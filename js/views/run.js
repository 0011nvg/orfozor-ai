import { esc, plural, shuffle } from '../core/util.js';
import { note } from '../ui/note.js';
import { runSession, summaryStats } from '../ui/session.js';
import { topicById, topicsOfGrade, itemById } from '../content/index.js';
import { TESTS, STAGES } from '../content/tests.js';
import { pickNext, shouldStop, MASTERY, levelLabel } from '../core/model.js';
import { errorProfile } from '../core/diagnose.js';

const ORDER = { n: 0, r: 1, a: 2, t: 3 };
const byStep = (a, b) => ORDER[a.s] - ORDER[b.s];
const pct = (p) => Math.round(p * 100);
const notFound = (main) => { main.innerHTML = '<section class="page narrow"><h1>Тема не найдена</h1><p><a href="#/learn">Ко всем темам</a></p></section>'; };

export function selectCheck(topic, store, seed = Math.random()) {
  const pool = shuffle(topic.items.filter((i) => i.s === 'a' || i.s === 't'), seed);
  const seen = (i) => store.state.items[i.id]?.seen || 0;
  return pool.sort((a, b) => seen(a) - seen(b)).slice(0, 6).sort(byStep);
}

function errorsBlock(log) {
  const errs = log.filter((l) => l.error && l.error !== 'hint').map((l) => ({ code: l.error }));
  const prof = errorProfile(errs);
  if (!prof.length) return '';
  return `<div class="diag-box"><h3 class="h4">Анализ ошибок этого занятия</h3><ul>${prof.map((p) => `<li><b>${esc(p.title)}</b> — ${p.n} ${plural(p.n, 'раз', 'раза', 'раз')}. ${esc(p.advice)}</li>`).join('')}</ul></div>`;
}

// Адаптивная тренировка: следующее задание выбирает модель знаний (см. js/core/model.js).
export function renderPractice(main, { store, args }) {
  const topic = topicById[args[0]];
  if (!topic) return notFound(main);
  const before = store.pL(topic.id);
  const inReview = new Set(Object.keys(store.state.review));
  runSession(main, {
    store, mode: 'practice', title: topic.title, adaptiveTopic: topic, maxCount: 12,
    backHref: `#/topic/${topic.id}`, backLabel: 'К правилу',
    pick({ log, used }) {
      const pL = store.pL(topic.id) ?? 0.25;
      if (shouldStop({ pL, done: log.length })) return null;
      const last = log.at(-1);
      // Первое знакомство с темой всегда начинается с поиска орфограммы.
      const step = !log.length && !store.state.model[topic.id] ? 'n' : undefined;
      return pickNext({ items: topic.items, used, pL, lastWrongStep: last && !last.firstTry ? last.item.s : null, inReview, itemStats: store.state.items, step });
    },
    onFinish(r) {
      store.finishPractice(topic.id);
      const p = store.pL(topic.id) ?? 0.25;
      const reached = p >= MASTERY;
      const msg = reached
        ? 'Модель считает правило освоенным. Подтверди это проверкой без подсказок.'
        : p >= 0.6
          ? 'Хороший прогресс. Ещё одна тренировка — и можно переходить к проверке.'
          : 'Тема пока даётся непросто — это нормально. Перечитай правило с примерами и потренируйся ещё раз: модель подберёт задания попроще.';
      return `<div class="summary">
        <h2 tabindex="-1">Тренировка завершена</h2>
        ${summaryStats(r)}
        <div class="model-change"><span>Оценка освоения темы</span><b>${before === null ? '—' : pct(before) + ' %'} → ${pct(p)} %</b><span>${levelLabel(p)}</span></div>
        ${errorsBlock(r.log)}
        ${note(msg, { tone: 'is-tip' })}
        <div class="actions">
          <a class="btn btn-primary" href="#/check/${topic.id}">Проверить себя</a>
          <button class="btn btn-ghost" type="button" data-reload>Потренироваться ещё</button>
          <a class="btn btn-ghost" href="#/topic/${topic.id}">Перечитать правило</a>
        </div>
      </div>`;
    },
  });
}

export function renderCheck(main, { store, args }) {
  const topic = topicById[args[0]];
  if (!topic) return notFound(main);
  runSession(main, {
    store, mode: 'check', items: selectCheck(topic, store), title: `Проверь себя: ${topic.title}`,
    backHref: `#/topic/${topic.id}`, backLabel: 'К правилу',
    onFinish(r) {
      const { passed, secured } = store.finishCheck(topic.id, r.independent, r.total);
      const msg = secured
        ? 'Тема закреплена: проверка пройдена повторно, спустя время. Это устойчивый результат.'
        : passed
          ? `Тема освоена: ${r.independent} из ${r.total}. Через два-три дня проверь себя ещё раз — так знание закрепится.`
          : `${r.independent} из ${r.total}. Для освоения нужно 5 из 6. Задания с ошибками уже в повторении.`;
      return `<div class="summary">
        <h2 tabindex="-1">${passed ? 'Проверка пройдена' : 'Проверка завершена'}</h2>
        ${summaryStats(r)}
        ${errorsBlock(r.log)}
        ${note(msg, { tone: passed ? 'is-right' : 'is-tip' })}
        <div class="actions">
          ${passed ? `<a class="btn btn-primary" href="#/path">Что дальше?</a>` : `<a class="btn btn-primary" href="#/practice/${topic.id}">Тренироваться</a>`}
          <a class="btn btn-ghost" href="#/topic/${topic.id}">К правилу</a>
        </div>
      </div>`;
    },
  });
}

export function renderReview(main, { store, params }) {
  const topicFilter = params.get('topic');
  let due = store.dueReview().filter((r) => itemById[r.id] && (!topicFilter || r.topic === topicFilter));
  if (!due.length && params.get('early') === '1') due = Object.entries(store.state.review).map(([id, r]) => ({ id, ...r })).filter((r) => itemById[r.id] && (!topicFilter || r.topic === topicFilter));
  if (!due.length) {
    const waiting = Object.keys(store.state.review).length;
    main.innerHTML = `<section class="page narrow">
      <p class="eyebrow">Повторение</p>
      <h1>Сейчас повторять нечего</h1>
      ${note(waiting ? `В очереди ${waiting} ${plural(waiting, 'задание', 'задания', 'заданий')}, но их время ещё не пришло. Повторение работает лучше, когда между попытками есть перерыв: 1, 3, 7, 14 и 30 дней.` : 'Сюда попадают задания, в которых была ошибка или понадобилась подсказка. Пока таких нет.', { tone: 'is-tip' })}
      <div class="actions">${waiting ? '<a class="btn btn-ghost" href="#/review?early=1">Всё равно повторить сейчас</a>' : ''}<a class="btn btn-primary" href="#/learn">К темам</a></div>
    </section>`;
    return;
  }
  const items = shuffle(due, Date.now()).slice(0, 12).map((r) => itemById[r.id]);
  runSession(main, {
    store, mode: 'review', items, title: topicFilter ? `Повторение: ${topicById[topicFilter].title}` : 'Повторение',
    backHref: topicFilter ? `#/topic/${topicFilter}` : '#/learn', backLabel: topicFilter ? 'К теме' : 'К темам',
    onFinish(r) {
      const left = store.dueReview().length;
      return `<div class="summary">
        <h2 tabindex="-1">Повторение завершено</h2>
        ${summaryStats(r)}
        ${note(`Задания, решённые самостоятельно, вернутся реже. Остальные встретятся снова завтра.${left ? ` Сейчас ещё ждут: ${left}.` : ''}`, { tone: 'is-tip' })}
        <div class="actions">${left ? '<button class="btn btn-primary" type="button" data-reload>Продолжить повторение</button>' : ''}<a class="btn btn-ghost" href="#/path">Мой путь</a></div>
      </div>`;
    },
  });
}

export function renderDiagnostic(main, { store, args }) {
  const grade = Number(args[0]);
  const topics = topicsOfGrade(grade);
  const seed = Date.now();
  const items = topics.map((t) => {
    const pool = t.items.filter((i) => i.s === 'a' && (i.t === 'gap' || i.t === 'choice' || i.t === 'punct'));
    return shuffle(pool.length ? pool : t.items.filter((i) => i.s === 'a' || i.s === 't'), seed + t.id.length)[0];
  });
  main.innerHTML = `<section class="page narrow">
    <p class="eyebrow">Диагностика · ${grade} класс</p>
    <h1>С чего начать?</h1>
    ${note(`${items.length} ${plural(items.length, 'задание', 'задания', 'заданий')} — по одному на каждую тему ${grade} класса. Подсказок не будет, после каждого ответа — объяснение. Это не контрольная: результаты дадут модели знаний стартовые оценки, и она подскажет, с каких тем начать.`, { tone: 'is-tip' })}
    <div class="actions"><button class="btn btn-primary btn-lg js-start" type="button">Начать</button><a class="btn btn-ghost" href="#/learn?grade=${grade}">Сразу к темам</a></div>
  </section>`;
  main.querySelector('.js-start').addEventListener('click', () => runSession(main, {
    store, mode: 'diagnostic', items, title: `Диагностика · ${grade} класс`,
    backHref: `#/learn?grade=${grade}`, backLabel: 'Прервать',
    onFinish(r) {
      const results = Object.fromEntries(r.log.map((l) => [l.item.topicId, l.firstTry]));
      store.finishDiagnostic(grade, results);
      const weak = topics.filter((t) => results[t.id] === false);
      const ok = topics.filter((t) => results[t.id]);
      return `<div class="summary">
        <h2 tabindex="-1">Результат диагностики</h2>
        <p>Верно: <b>${ok.length} из ${topics.length}</b>. Одно задание на тему — ориентир, а не оценка.</p>
        ${weak.length ? `<h3 class="h4">Начни с этих тем</h3><ul class="topic-list">${weak.map((t) => `<li><a class="topic-row" href="#/topic/${t.id}"><span class="topic-row-main"><b>${esc(t.title)}</b><span>${esc(t.short)}</span></span><span class="status status-progress"><span class="status-dot"></span>потренировать</span></a></li>`).join('')}</ul>` : note('Все задания решены верно. Пройди проверки тем, чтобы убедиться в устойчивости знаний.', { tone: 'is-right' })}
        ${errorsBlock(r.log)}
        <div class="actions"><a class="btn btn-primary" href="#/path">Мой путь и рекомендации</a><a class="btn btn-ghost" href="#/learn?grade=${grade}">Ко всем темам</a></div>
      </div>`;
    },
  }));
}

export function renderMixed(main, { store, args }) {
  const grade = Number(args[0]);
  const eligible = (t) => t.items.filter((i) => i.t === 'gap' && i.s === 'a' && !/\s/.test(i.text));
  const all = topicsOfGrade(grade).filter((t) => eligible(t).length);
  let topics = all.filter((t) => store.topicStatus(t.id) !== 'new');
  if (topics.length < 3) topics = all;
  const seed = Date.now();
  const items = shuffle(topics, seed).slice(0, 8).map((t) => shuffle(eligible(t), seed)[0]);
  runSession(main, {
    store, mode: 'mixed', items, title: `Смешанная практика · ${grade} класс`,
    backHref: `#/learn?grade=${grade}`, backLabel: 'К темам',
    onFinish(r) {
      const rec = r.log.filter((l) => l.recognizeStep);
      const recOk = rec.filter((l) => l.firstTry).length;
      return `<div class="summary">
        <h2 tabindex="-1">Смешанная практика завершена</h2>
        <p>Правило определено сразу: <b>${recOk} из ${rec.length}</b>. Узнать орфограмму среди других — главное умение орфографической зоркости.</p>
        ${summaryStats(r)}
        ${errorsBlock(r.log)}
        <div class="actions"><button class="btn btn-primary" type="button" data-reload>Ещё раз</button><a class="btn btn-ghost" href="#/learn?grade=${grade}">К темам</a></div>
      </div>`;
    },
  });
}

// Задание по ссылке учителя: #/run?items=id1,id2&title=...&hints=0
export function renderAssignment(main, { store, params }) {
  const ids = (params.get('items') || '').split(',').filter(Boolean);
  const items = ids.map((id) => itemById[id]).filter(Boolean);
  const title = (params.get('title') || 'Задание от учителя').slice(0, 80);
  if (!items.length) {
    main.innerHTML = '<section class="page narrow"><h1>Задание не найдено</h1><p>Ссылка повреждена или задания обновились. Попроси учителя прислать новую ссылку.</p><p><a class="btn btn-primary" href="#/learn">К темам</a></p></section>';
    return;
  }
  const lost = ids.length - items.length;
  main.innerHTML = `<section class="page narrow">
    <p class="eyebrow">Задание по ссылке</p>
    <h1>${esc(title)}</h1>
    ${note(`${items.length} ${plural(items.length, 'задание', 'задания', 'заданий')}. ${params.get('hints') === '0' ? 'Подсказок не будет.' : 'Можно брать подсказки — это отразится в итоге.'} В конце появится итог, который можно показать учителю.${lost ? ` (${lost} — из старой версии ссылки и больше не существует.)` : ''}`, { tone: 'is-tip' })}
    <div class="actions"><button class="btn btn-primary btn-lg js-start" type="button">Начать</button></div>
  </section>`;
  main.querySelector('.js-start').addEventListener('click', () => runSession(main, {
    store, mode: 'assignment', items, title, hintsAllowed: params.get('hints') !== '0',
    backHref: '#/learn', backLabel: 'Выйти',
    onFinish(r) {
      const when = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
      const lines = r.log.map((l, i) => `${i + 1}. ${topicById[l.item.topicId].title}: ${l.firstTry ? 'самостоятельно' : l.ok ? 'с помощью' : 'ошибка'}`);
      const text = `${title}\n${when}\nСамостоятельно с первой попытки: ${r.independent} из ${r.total}\n${lines.join('\n')}`;
      setTimeout(() => {
        main.querySelector('.js-copy')?.addEventListener('click', async (e) => {
          try { await navigator.clipboard.writeText(text); e.target.textContent = 'Скопировано'; } catch { e.target.textContent = 'Не удалось скопировать — покажи экран'; }
        });
      });
      return `<div class="summary result-card">
        <h2 tabindex="-1">Итог для учителя</h2>
        <p class="result-meta">${esc(title)} · ${esc(when)}</p>
        ${summaryStats(r)}
        <ol class="result-list">${r.log.map((l) => `<li><span>${esc(topicById[l.item.topicId].title)}</span><b class="${l.firstTry ? 'ok' : l.ok ? 'mid' : 'bad'}">${l.firstTry ? 'самостоятельно' : l.ok ? 'с помощью' : 'ошибка'}</b></li>`).join('')}</ol>
        ${errorsBlock(r.log)}
        <div class="actions"><button class="btn btn-primary js-copy" type="button">Скопировать итог</button><a class="btn btn-ghost" href="#/learn">К темам</a></div>
      </div>`;
    },
  }));
}

// Исследовательский срез: #/test/5/pre?group=Э
export function renderTest(main, { store, args, params }) {
  const grade = Number(args[0]);
  const stage = args[1];
  const st = STAGES[stage];
  const items = TESTS[grade]?.[st?.form];
  if (!st || !items) return notFound(main);
  const group = ['Э', 'К'].includes(params.get('group')) ? params.get('group') : store.state.profile.group || '';
  const code = store.state.profile.code || '';
  main.innerHTML = `<section class="page narrow">
    <p class="eyebrow">Исследование · ${grade} класс</p>
    <h1>${st.title}</h1>
    ${note(`${items.length} ${plural(items.length, 'задание', 'задания', 'заданий')} по орфографии, примерно 10 минут. Подсказок и объяснений во время работы не будет — так результат честно покажет, что ты уже умеешь. В конце увидишь свой итог.`, { tone: 'is-tip' })}
    <form class="test-form">
      <label class="field">Твой код участника <span class="muted small">— его даёт учитель, например «6Б-07». Не пиши имя и фамилию.</span>
        <input type="text" name="code" required maxlength="20" pattern="[A-Za-zА-Яа-яЁё0-9\\-_]{1,20}" value="${esc(code)}" autocomplete="off"></label>
      ${group ? `<input type="hidden" name="group" value="${esc(group)}">` : ''}
      <p class="form-msg muted small" role="status"></p>
      <div class="actions"><button class="btn btn-primary btn-lg" type="submit">Начать срез</button></div>
    </form>
  </section>`;
  main.querySelector('.test-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = e.target.code.value.trim();
    if (!/^[A-Za-zА-Яа-яЁё0-9\-_]{1,20}$/.test(val)) { main.querySelector('.form-msg').textContent = 'Код: только буквы, цифры и дефис, до 20 знаков.'; return; }
    store.setProfile({ code: val, group: group || store.state.profile.group });
    const started = Date.now();
    runSession(main, {
      store, mode: 'test', items, title: `${st.title} · ${grade} класс`,
      backHref: '#/', backLabel: 'Прервать',
      onFinish(r) {
        const record = {
          kind: 'test', grade, stage, form: st.form, code: val, group: group || store.state.profile.group || '',
          date: new Date().toISOString(), durationMs: Date.now() - started,
          score: r.independent, max: r.total,
          items: r.log.map((l) => ({ id: l.item.id, topicId: l.item.topicId, ok: l.ok, ms: l.ms, error: l.error })),
        };
        store.saveTest(record);
        const wrong = r.log.filter((l) => !l.ok);
        return `<div class="summary result-card">
          <h2 tabindex="-1">${st.title} завершён</h2>
          <p class="result-meta">Код участника: ${esc(val)}</p>
          <dl class="stats"><div><dt>Верно</dt><dd>${r.independent} <small>из ${r.total}</small></dd></div><div><dt>Время</dt><dd>${Math.max(1, Math.round(record.durationMs / 60000))} <small>мин</small></dd></div></dl>
          ${wrong.length ? `<h3 class="h4">Темы, которые стоит повторить</h3><ul class="plain-list">${[...new Set(wrong.map((l) => l.item.topicId))].map((id) => `<li><a href="#/topic/${id}">${esc(topicById[id].title)}</a></li>`).join('')}</ul>` : ''}
          ${note('Результат сохранён на этом устройстве. Если учитель попросит, сохрани файл для исследования на странице «Мой путь».', { tone: 'is-tip' })}
          <div class="actions"><a class="btn btn-primary" href="#/path">Мой путь</a></div>
        </div>`;
      },
    });
  });
}

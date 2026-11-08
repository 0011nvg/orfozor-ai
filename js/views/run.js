import { esc, plural, shuffle } from '../core/util.js';
import { catSays } from '../ui/cat.js';
import { runSession, summaryStats } from '../ui/session.js';
import { topicById, topicsOfGrade, itemById } from '../content/index.js';

const ORDER = { n: 0, r: 1, a: 2, t: 3 };
const byStep = (a, b) => ORDER[a.s] - ORDER[b.s];
const notFound = (main) => { main.innerHTML = '<section class="page narrow"><h1>Тема не найдена</h1><p><a href="#/learn">Ко всем темам</a></p></section>'; };

// Тренировка: все задания «заметить» и «распознать» + часть заданий на применение;
// остальные задания на применение остаются для проверки.
export function selectPractice(topic, seed = Math.random()) {
  const early = topic.items.filter((i) => i.s === 'n' || i.s === 'r');
  const late = shuffle(topic.items.filter((i) => i.s === 'a' || i.s === 't'), seed);
  const take = Math.max(4, Math.ceil(late.length / 2));
  return [...early, ...late.slice(0, take)].sort(byStep);
}

export function selectCheck(topic, store, seed = Math.random()) {
  const pool = shuffle(topic.items.filter((i) => i.s === 'a' || i.s === 't'), seed);
  const seen = (i) => store.state.items[i.id]?.seen || 0;
  return pool.sort((a, b) => seen(a) - seen(b)).slice(0, 6).sort(byStep);
}

export function renderPractice(main, { store, args }) {
  const topic = topicById[args[0]];
  if (!topic) return notFound(main);
  const showCat = store.state.settings.cat !== false;
  runSession(main, {
    store, mode: 'practice', items: selectPractice(topic), title: topic.title,
    backHref: `#/topic/${topic.id}`, backLabel: 'К правилу',
    onFinish(r) {
      store.finishPractice(topic.id);
      const share = r.total ? r.independent / r.total : 0;
      const msg = share >= 0.8
        ? 'Отлично получается! Теперь можно проверить себя без подсказок.'
        : share >= 0.5
          ? 'Неплохо. Перечитай алгоритм и потренируйся ещё раз — или переходи к проверке, если чувствуешь уверенность.'
          : 'Тема пока даётся непросто — это нормально. Перечитай правило с примерами и попробуй ещё раз.';
      return `<div class="summary">
        <h2 tabindex="-1">Тренировка завершена</h2>
        ${summaryStats(r)}
        ${catSays(msg, { mood: share >= 0.5 ? 'happy' : 'idle', show: showCat })}
        <div class="actions">
          <a class="btn btn-primary" href="#/check/${topic.id}">Проверить себя</a>
          <a class="btn btn-ghost" href="#/topic/${topic.id}">Перечитать правило</a>
          <button class="btn btn-ghost" type="button" data-reload>Потренироваться ещё</button>
        </div>
      </div>`;
    },
  });
}

export function renderCheck(main, { store, args }) {
  const topic = topicById[args[0]];
  if (!topic) return notFound(main);
  const showCat = store.state.settings.cat !== false;
  runSession(main, {
    store, mode: 'check', items: selectCheck(topic, store), title: `Проверь себя: ${topic.title}`,
    backHref: `#/topic/${topic.id}`, backLabel: 'К правилу',
    onFinish(r) {
      const { passed, secured } = store.finishCheck(topic.id, r.independent, r.total);
      const msg = secured
        ? `Тема закреплена: ты успешно прошёл проверку повторно, спустя время. Это настоящее, устойчивое знание.`
        : passed
          ? `Тема освоена: ${r.independent} из ${r.total}. Через пару дней проверь себя ещё раз — так знание закрепится.`
          : `${r.independent} из ${r.total}. Для освоения нужно 5 из 6. Ошибки уже ждут тебя в повторении — разберись с ними и попробуй снова.`;
      return `<div class="summary">
        <h2 tabindex="-1">${passed ? 'Проверка пройдена' : 'Проверка завершена'}</h2>
        ${summaryStats(r)}
        ${catSays(msg, { mood: passed ? 'happy' : 'idle', show: showCat })}
        <div class="actions">
          ${passed ? `<a class="btn btn-primary" href="#/learn?grade=${topic.grade}">К другим темам</a>` : `<a class="btn btn-primary" href="#/review?topic=${topic.id}">Повторить ошибки</a>`}
          <a class="btn btn-ghost" href="#/topic/${topic.id}">К правилу</a>
        </div>
      </div>`;
    },
  });
}

export function renderReview(main, { store, params }) {
  const topicFilter = params.get('topic');
  const showCat = store.state.settings.cat !== false;
  let due = store.dueReview().filter((r) => itemById[r.id] && (!topicFilter || r.topic === topicFilter));
  const early = params.get('early') === '1';
  if (!due.length && early) due = Object.entries(store.state.review).map(([id, r]) => ({ id, ...r })).filter((r) => itemById[r.id]);
  if (!due.length) {
    const waiting = Object.keys(store.state.review).length;
    main.innerHTML = `<section class="page narrow">
      <p class="eyebrow">Повторение</p>
      <h1>Сейчас повторять нечего</h1>
      ${catSays(waiting ? `В очереди ${waiting} ${plural(waiting, 'задание', 'задания', 'заданий')}, но их время ещё не пришло. Повторение работает лучше, когда между попытками есть перерыв.` : 'Сюда попадают задания, в которых была ошибка или понадобилась подсказка. Пока таких нет.', { show: showCat })}
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
        ${catSays(`Задания, решённые сразу, вернутся реже — через несколько дней. Остальные встретятся снова завтра.${left ? ` Сейчас ещё ждут: ${left}.` : ''}`, { mood: 'happy', show: showCat })}
        <div class="actions">${left ? '<button class="btn btn-primary" type="button" data-reload>Продолжить повторение</button>' : ''}<a class="btn btn-ghost" href="#/progress">Мой прогресс</a></div>
      </div>`;
    },
  });
}

export function renderDiagnostic(main, { store, args }) {
  const grade = Number(args[0]);
  const showCat = store.state.settings.cat !== false;
  const topics = topicsOfGrade(grade);
  const seed = Date.now();
  const items = topics.map((t) => {
    const pool = t.items.filter((i) => i.s === 'a' && (i.t === 'gap' || i.t === 'choice' || i.t === 'punct'));
    return shuffle(pool.length ? pool : t.items.filter((i) => i.s === 'a' || i.s === 't'), seed + t.id.length)[0];
  });
  main.innerHTML = `<section class="page narrow">
    <p class="eyebrow">Диагностика · ${grade} класс</p>
    <h1>Что ты уже знаешь?</h1>
    ${catSays(`Сейчас будет ${items.length} ${plural(items.length, 'задание', 'задания', 'заданий')} — по одному на каждую тему ${grade} класса. Подсказок не будет, но после каждого ответа я объясню правило. Это не контрольная: результат нужен, чтобы понять, с каких тем начать.`, { show: showCat })}
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
        <p>Верно: <b>${ok.length} из ${topics.length}</b>. Одно задание на тему — это ориентир, а не оценка: оно показывает, с чего начать.</p>
        ${weak.length ? `<h3 class="h4">Начни с этих тем</h3><ul class="topic-list">${weak.map((t) => `<li><a class="topic-row" href="#/topic/${t.id}"><span class="topic-row-main"><b>${esc(t.title)}</b><span>${esc(t.short)}</span></span><span class="status status-progress"><span class="status-dot"></span>потренировать</span></a></li>`).join('')}</ul>` : catSays('Все задания решены верно. Загляни в темы и пройди проверки — так ты убедишься, что знаешь их уверенно.', { mood: 'happy', show: showCat })}
        ${ok.length ? `<details class="details"><summary>Получилось (${ok.length})</summary><ul class="plain-list">${ok.map((t) => `<li><a href="#/topic/${t.id}">${esc(t.title)}</a></li>`).join('')}</ul></details>` : ''}
        <div class="actions"><a class="btn btn-primary" href="#/learn?grade=${grade}">Ко всем темам</a></div>
      </div>`;
    },
  }));
}

export function renderMixed(main, { store, args }) {
  const grade = Number(args[0]);
  const showCat = store.state.settings.cat !== false;
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
        <p>Правило определено сразу: <b>${recOk} из ${rec.length}</b>. Умение узнать орфограмму среди других — главное в орфографической зоркости.</p>
        ${summaryStats(r)}
        ${catSays('Смешанная практика труднее тренировки по одной теме — и поэтому полезнее для настоящего письма.', { mood: 'happy', show: showCat })}
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
  const showCat = store.state.settings.cat !== false;
  if (!items.length) {
    main.innerHTML = '<section class="page narrow"><h1>Задание не найдено</h1><p>Ссылка повреждена или задания обновились. Попроси учителя прислать новую ссылку.</p><p><a class="btn btn-primary" href="#/learn">К темам</a></p></section>';
    return;
  }
  const lost = ids.length - items.length;
  main.innerHTML = `<section class="page narrow">
    <p class="eyebrow">Задание по ссылке</p>
    <h1>${esc(title)}</h1>
    ${catSays(`${items.length} ${plural(items.length, 'задание', 'задания', 'заданий')}. ${params.get('hints') === '0' ? 'Подсказок не будет.' : 'Можно брать подсказки — учитель увидит, сколько их было.'} В конце появится итог, который можно показать учителю.${lost ? ` (${lost} ${plural(lost, 'задание из ссылки больше не существует', 'задания из ссылки больше не существуют', 'заданий из ссылки больше не существуют')}.)` : ''}`, { show: showCat })}
    <div class="actions"><button class="btn btn-primary btn-lg js-start" type="button">Начать</button></div>
  </section>`;
  main.querySelector('.js-start').addEventListener('click', () => runSession(main, {
    store, mode: 'assignment', items, title, hintsAllowed: params.get('hints') !== '0',
    backHref: '#/learn', backLabel: 'Выйти',
    onFinish(r) {
      const when = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
      const lines = r.log.map((l, i) => `${i + 1}. ${topicById[l.item.topicId].title}: ${l.firstTry ? 'сам' : l.ok ? 'с помощью' : 'ошибка'}`);
      const text = `${title}\n${when}\nСам с первой попытки: ${r.independent} из ${r.total}\n${lines.join('\n')}`;
      setTimeout(() => {
        main.querySelector('.js-copy')?.addEventListener('click', async (e) => {
          try { await navigator.clipboard.writeText(text); e.target.textContent = 'Скопировано'; } catch { e.target.textContent = 'Не удалось скопировать — покажи экран'; }
        });
      });
      return `<div class="summary result-card">
        <h2 tabindex="-1">Итог для учителя</h2>
        <p class="result-meta">${esc(title)} · ${esc(when)}</p>
        ${summaryStats(r)}
        <ol class="result-list">${r.log.map((l) => `<li><span>${esc(topicById[l.item.topicId].title)}</span><b class="${l.firstTry ? 'ok' : l.ok ? 'mid' : 'bad'}">${l.firstTry ? 'сам' : l.ok ? 'с помощью' : 'ошибка'}</b></li>`).join('')}</ol>
        <div class="actions"><button class="btn btn-primary js-copy" type="button">Скопировать итог</button><a class="btn btn-ghost" href="#/learn">К темам</a></div>
      </div>`;
    },
  }));
}


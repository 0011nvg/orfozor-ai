import { esc, md, plural } from '../core/util.js';
import { catSays } from '../ui/cat.js';
import { sectionsOfGrade, topicById, topicsOfGrade } from '../content/index.js';
import { statusChip, paras, gradeTabs, pickGrade, crumbs } from './shared.js';

const norm = (s) => s.toLowerCase().replace(/ё/g, 'е');

export function renderLearn(main, { store, params }) {
  const grade = pickGrade(store, params);
  const sections = sectionsOfGrade(grade);
  const due = store.dueReview().filter((r) => topicById[r.topic]?.grade === grade).length;
  const startedTopics = topicsOfGrade(grade).filter((t) => store.topicStatus(t.id) !== 'new').length;

  main.innerHTML = `<section class="page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Темы</p>
        <h1>Русский язык, ${grade} класс</h1>
      </div>
      ${gradeTabs(grade, '#/learn')}
    </div>
    <div class="quick">
      <a class="quick-item" href="#/diagnostic/${grade}"><b>Диагностика</b><span>По одному заданию на каждую тему: покажет, с чего начать.</span></a>
      <a class="quick-item" href="#/mixed/${grade}"><b>Смешанная практика</b><span>Задания из разных тем вперемешку: сначала узнай правило, потом реши.${startedTopics ? '' : ' Лучше после нескольких тем.'}</span></a>
      <a class="quick-item" href="#/review"><b>Повторение</b><span>${due ? `${due} ${plural(due, 'задание ждёт', 'задания ждут', 'заданий ждут')} тебя.` : 'Сейчас повторять нечего.'}</span></a>
    </div>
    <div class="search">
      <label for="topic-search">Найти тему или слово</label>
      <input id="topic-search" type="search" placeholder="Например: приставки, -тся, пол-, кое-что" autocomplete="off" spellcheck="false">
    </div>
    <p class="search-empty" hidden>Ничего не нашлось. Попробуй другое слово или посмотри темы другого класса.</p>
    ${sections.map((sec) => `<section class="topic-section" data-section>
      <h2 class="h3">${esc(sec.title)}</h2>
      <ul class="topic-list">${sec.topics.map((t) => {
        const hay = norm([t.title, t.short, ...t.examples.map((e) => e[0]), ...t.traps.map((e) => e[0])].join(' '));
        return `<li data-hay="${esc(hay)}"><a class="topic-row" href="#/topic/${t.id}"><span class="topic-row-main"><b>${esc(t.title)}</b><span>${esc(t.short)}</span></span>${statusChip(store.topicStatus(t.id))}</a></li>`;
      }).join('')}</ul>
    </section>`).join('')}
  </section>`;

  const input = main.querySelector('#topic-search');
  input.addEventListener('input', () => {
    const q = norm(input.value.trim());
    let any = false;
    main.querySelectorAll('[data-section]').forEach((sec) => {
      let shown = 0;
      sec.querySelectorAll('li').forEach((li) => {
        const ok = !q || li.dataset.hay.includes(q);
        li.hidden = !ok;
        if (ok) shown += 1;
      });
      sec.hidden = !shown;
      any ||= shown > 0;
    });
    main.querySelector('.search-empty').hidden = any;
  });
}

export function renderTopic(main, { store, args }) {
  const t = topicById[args[0]];
  if (!t) { main.innerHTML = '<section class="page narrow"><h1>Тема не найдена</h1><p><a href="#/learn">Ко всем темам</a></p></section>'; return; }
  const st = store.state.topics[t.id];
  const status = store.topicStatus(t.id);
  const lastCheck = st?.checks?.at(-1);
  const showCat = store.state.settings.cat !== false;
  const due = store.dueReview().filter((r) => r.topic === t.id).length;

  main.innerHTML = `<article class="page topic-page">
    ${crumbs([['#/learn?grade=' + t.grade, `${t.grade} класс`], [null, t.title]])}
    <header class="topic-head">
      <h1>${esc(t.title)}</h1>
      <p class="lead">${esc(t.short)}</p>
      <div class="topic-status">${statusChip(status)}${lastCheck ? `<span class="muted">Последняя проверка: ${lastCheck.score} из ${lastCheck.total}</span>` : ''}</div>
    </header>

    <div class="topic-grid">
      <div class="topic-main">
        <section class="rule-card" aria-labelledby="rule-h">
          <h2 id="rule-h" class="h3">Правило</h2>
          ${paras(t.rule)}
        </section>
        ${catSays(md(t.cat), { mood: 'idle', show: showCat, tone: 'is-tip' })}
        <section aria-labelledby="steps-h">
          <h2 id="steps-h" class="h3">Как рассуждать</h2>
          <ol class="algo">${t.steps.map((s) => `<li>${md(s)}</li>`).join('')}</ol>
        </section>
        <section aria-labelledby="ex-h">
          <h2 id="ex-h" class="h3">Примеры</h2>
          <ul class="examples">${t.examples.map(([w, c]) => `<li><b>${esc(w)}</b>${c ? `<span>${esc(c)}</span>` : ''}</li>`).join('')}</ul>
        </section>
        ${t.traps.length ? `<section aria-labelledby="tr-h" class="traps">
          <h2 id="tr-h" class="h3">Будь внимателен</h2>
          <ul class="examples">${t.traps.map(([w, c]) => `<li><b>${esc(w)}</b><span>${esc(c)}</span></li>`).join('')}</ul>
        </section>` : ''}
      </div>
      <aside class="topic-side" aria-label="Занятия по теме">
        <div class="side-card">
          <h2 class="h4">Потренироваться</h2>
          <p>Задания по шагам: заметить → распознать → применить → перенести в предложение. Есть подсказки.</p>
          <a class="btn btn-primary btn-block" href="#/practice/${t.id}">Начать тренировку</a>
        </div>
        <div class="side-card">
          <h2 class="h4">Проверить себя</h2>
          <p>6 заданий без подсказок. ${status === 'mastered' ? 'Повтори проверку не раньше чем через два дня — так тема закрепится.' : 'Пять верных ответов — тема освоена.'}</p>
          <a class="btn btn-ghost btn-block" href="#/check/${t.id}">Пройти проверку</a>
        </div>
        ${due ? `<div class="side-card side-accent"><h2 class="h4">Повторение</h2><p>${due} ${plural(due, 'задание', 'задания', 'заданий')} по этой теме ${plural(due, 'ждёт', 'ждут', 'ждут')} повторения.</p><a class="btn btn-ghost btn-block" href="#/review?topic=${t.id}">Повторить</a></div>` : ''}
      </aside>
    </div>
  </article>`;
}

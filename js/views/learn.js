import { esc, md, plural } from '../core/util.js';
import { levelLabel } from '../core/model.js';
import { errorProfile } from '../core/diagnose.js';
import { sectionsOfGrade, topicById, topicsOfGrade } from '../content/index.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const paragraphNo = (t) => topicsOfGrade(t.grade).indexOf(t) + 1;
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
        <p class="eyebrow">Учебник · орфография и пунктуация</p>
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
    ${sections.map((sec, si) => `<section class="topic-section" data-section>
      <h2 class="chapter"><span class="chapter-no">Глава ${ROMAN[si]}</span>${esc(sec.title)}</h2>
      <ul class="topic-list">${sec.topics.map((t) => {
        const hay = norm([t.title, t.short, ...t.examples.map((e) => e[0]), ...t.traps.map((e) => e[0])].join(' '));
        const p = store.pL(t.id);
        return `<li data-hay="${esc(hay)}"><a class="topic-row" href="#/topic/${t.id}"><span class="para-no">§ ${paragraphNo(t)}</span><span class="topic-row-main"><b>${esc(t.title)}</b><span>${esc(t.short)}</span></span><span class="topic-row-side">${statusChip(store.topicStatus(t.id))}${p !== null ? `<span class="mini-meter" title="Оценка модели знаний"><span style="width:${Math.round(p * 100)}%"></span></span>` : ''}</span></a></li>`;
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
  const due = store.dueReview().filter((r) => r.topic === t.id).length;
  const p = store.pL(t.id);
  const prof = errorProfile(store.state.errors, t.id).slice(0, 2);

  main.innerHTML = `<article class="page topic-page">
    ${crumbs([['#/learn?grade=' + t.grade, `${t.grade} класс`], [null, t.title]])}
    <header class="topic-head">
      <p class="eyebrow">§ ${paragraphNo(t)} · ${t.grade} класс</p>
      <h1>${esc(t.title)}</h1>
      <p class="lead">${esc(t.short)}</p>
      <div class="topic-status">${statusChip(status)}${lastCheck ? `<span class="muted">Последняя проверка: ${lastCheck.score} из ${lastCheck.total}</span>` : ''}</div>
    </header>

    <div class="topic-grid">
      <div class="topic-main">
        <section class="rule-card" aria-labelledby="rule-h">
          <h2 id="rule-h" class="rule-title">Правило</h2>
          <div class="rule-text">${paras(t.rule)}</div>
          <p class="rule-memo"><span class="memo-label">Запомни</span>${md(t.memo)}</p>
        </section>
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
        ${p !== null ? `<div class="side-card side-model"><h2 class="h4">Модель знаний</h2><div class="model-big"><b>${Math.round(p * 100)} %</b><span>${levelLabel(p)}</span></div><span class="mm-track"><span style="width:${Math.round(p * 100)}%"></span></span>${prof.length ? `<p class="small">Чаще всего: ${prof.map((x) => `«${esc(x.title.toLowerCase())}»`).join(', ')}.</p>` : ''}</div>` : ''}
        <div class="side-card">
          <h2 class="h4">Адаптивная тренировка</h2>
          <p>Задания подбирает модель знаний: от «заметить орфограмму» до «применить в предложении». Есть подсказки.</p>
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

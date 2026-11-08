import { esc, plural } from '../core/util.js';
import { catSVG, catSays } from '../ui/cat.js';
import { mountExercise } from '../ui/exercise.js';
import { checkItem } from '../core/check.js';
import { TOPICS, topicsOfGrade } from '../content/index.js';

const DEMO = { id: 'demo', t: 'spot', q: 'В каком месте этого слова легко ошибиться? Нажми на букву.', word: 'предл{а}гать' };

export function renderHome(main, { store }) {
  const s = store.state;
  const due = store.dueReview().length;
  const inProgress = TOPICS.filter((t) => store.topicStatus(t.id) === 'progress').sort((a, b) => (s.topics[b.id]?.lastPractice || 0) - (s.topics[a.id]?.lastPractice || 0));
  const returning = inProgress.length || due || Object.keys(s.topics).length;
  const showCat = s.settings.cat !== false;

  main.innerHTML = `
  <section class="hero">
    <div class="hero-text">
      <p class="eyebrow">Русский язык · 5–6 класс</p>
      <h1 class="hero-title">Замечай орфограммы.<br>Объясняй выбор.<br><span class="ink-red">Пиши грамотно.</span></h1>
      <p class="lead">Орфозор — тренажёр по школьной программе: правило простыми словами, задания с объяснением каждого ответа и повторение именно тех мест, где была ошибка.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="#/learn">Выбрать тему</a>
        <a class="btn btn-ghost btn-lg" href="#/diagnostic/${s.settings.grade || 5}">Проверить, что я уже знаю</a>
      </div>
    </div>
    <div class="hero-demo">
      <div class="demo-card ex-card">
        <div class="demo-cat" aria-hidden="true">${showCat ? catSVG({ size: 92, mood: 'idle', label: '' }) : ''}</div>
        <p class="eyebrow">Попробуй прямо сейчас</p>
        <div class="demo-root"></div>
        <div class="demo-fb" aria-live="polite"></div>
      </div>
    </div>
  </section>

  ${returning ? `<section class="band">
    <h2 class="h2">Продолжим?</h2>
    <div class="grid grid-3">
      ${due ? `<a class="tile tile-accent" href="#/review"><span class="tile-kicker">Повторение</span><b>${due} ${plural(due, 'задание ждёт', 'задания ждут', 'заданий ждут')}</b><span>Задания, в которых была ошибка или подсказка.</span></a>` : ''}
      ${inProgress.slice(0, due ? 2 : 3).map((t) => `<a class="tile" href="#/topic/${t.id}"><span class="tile-kicker">${t.grade} класс · в работе</span><b>${esc(t.title)}</b><span>${esc(t.short)}</span></a>`).join('')}
      ${!due && !inProgress.length ? '<a class="tile" href="#/progress"><span class="tile-kicker">Мой прогресс</span><b>Посмотреть карту тем</b><span>Что уже освоено и что стоит повторить.</span></a>' : ''}
    </div>
  </section>` : ''}

  <section class="band">
    <h2 class="h2">С чего начать</h2>
    <div class="grid grid-2">
      ${[5, 6].map((g) => {
        const n = topicsOfGrade(g).length;
        return `<article class="grade-card">
          <div class="grade-num" aria-hidden="true">${g}</div>
          <h3>${g} класс</h3>
          <p>${n} ${plural(n, 'тема', 'темы', 'тем')} по Федеральной рабочей программе: ${g === 5 ? 'корни, приставки, существительное, глагол, запятые при однородных членах и обращении' : 'ПРЕ-/ПРИ-, сложные слова, Н/НН, числительные, местоимения, повелительное наклонение'}.</p>
          <div class="actions">
            <a class="btn btn-primary" href="#/learn?grade=${g}">Темы ${g} класса</a>
            <a class="btn btn-ghost" href="#/diagnostic/${g}">Диагностика</a>
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>

  <section class="band">
    <h2 class="h2">Как устроена каждая тема</h2>
    <ol class="steps-row">
      <li><b>Разобраться</b><span>Правило простыми словами, алгоритм рассуждения, примеры и ловушки.</span></li>
      <li><b>Потренироваться</b><span>От «заметить орфограмму» до «применить в предложении». Подсказки не выдают ответ.</span></li>
      <li><b>Проверить себя</b><span>Шесть заданий без подсказок. Пять верных — тема освоена.</span></li>
      <li><b>Повторить</b><span>Задания с ошибкой возвращаются через 1, 3, 7, 14 и 30 дней — пока не станут решаться сразу.</span></li>
    </ol>
  </section>

  <section class="band band-teacher">
    <div>
      <h2 class="h2">Учителю</h2>
      <p>Цели и ключи ко всем заданиям, типичные ошибки, печатные листы с ответами и ссылки на подборку заданий для класса — без регистрации.</p>
    </div>
    <a class="btn btn-ghost" href="#/teacher">Материалы для учителя</a>
  </section>`;

  const root = main.querySelector('.demo-root');
  const fb = main.querySelector('.demo-fb');
  const ctl = mountExercise(root, DEMO, {
    onChange: () => {
      const res = checkItem(DEMO, ctl.getResponse());
      ctl.mark(res);
      fb.innerHTML = res.ok
        ? catSays('<b>Да!</b> В корне <b>-лаг-/-лож-</b> гласную не проверишь ударением — выбор зависит от буквы после неё: перед Г пишется А. <a href="#/topic/g5-alt-letter">Разобрать правило →</a>', { mood: 'happy', show: false, tone: 'is-right' })
        : catSays('Здесь ошибиться трудно. Найди гласную, которую нельзя проверить ударением.', { mood: 'think', show: false, tone: 'is-retry' });
      main.querySelector('.demo-cat .cat')?.setAttribute('data-mood', res.ok ? 'happy' : 'think');
    },
  });
}

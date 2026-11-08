import { esc, plural } from '../core/util.js';
import { note } from '../ui/note.js';
import { mountExercise } from '../ui/exercise.js';
import { checkItem } from '../core/check.js';
import { recommendations } from '../core/recommend.js';
import { topicsOfGrade } from '../content/index.js';

const DEMO = { id: 'demo', t: 'spot', q: 'В каком месте этого слова легко ошибиться? Нажми на букву.', word: 'предл{а}гать' };

export const recCards = (recs) => `<ol class="recs">${recs.map((r, i) => `<li class="rec rec-${r.kind}">
  <span class="rec-num" aria-hidden="true">${['I', 'II', 'III', 'IV'][i]}</span>
  <div class="rec-body"><b>${esc(r.title)}</b><p>${esc(r.reason)}</p></div>
  <a class="btn btn-ghost btn-sm" href="${r.href}">${esc(r.action)}</a>
</li>`).join('')}</ol>`;

export function renderHome(main, { store }) {
  const s = store.state;
  const grade = s.settings.grade || 5;
  const recs = recommendations(store);
  const active = Object.keys(s.model).length > 0;

  main.innerHTML = `
  <section class="hero">
    <div class="hero-text">
      <p class="eyebrow">Русский язык · 5–6 класс</p>
      <h1 class="hero-title">Орфозор</h1>
      <p class="hero-sub">Интеллектуальный тренажёр орфографии: замечать орфограммы, понимать правило, писать грамотно.</p>
      <p class="lead">Адаптивная модель знаний подбирает задания под ученика, анализирует ошибки по типам и даёт объяснимые рекомендации. Содержание соответствует Федеральной рабочей программе по русскому языку.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="#/learn">Открыть учебник</a>
        <a class="btn btn-ghost btn-lg" href="#/diagnostic/${grade}">Пройти диагностику</a>
      </div>
    </div>
    <figure class="hero-art">
      <img src="assets/art/books.webp" alt="" width="300" height="268">
      <blockquote class="epigraph">
        <p>«Во дни сомнений, во дни тягостных раздумий о судьбах моей родины, — ты один мне поддержка и опора, о великий, могучий, правдивый и свободный русский язык!»</p>
        <footer>— И. С. Тургенев, 1882</footer>
      </blockquote>
    </figure>
  </section>

  <section class="band">
    <div class="band-head"><h2 class="h2">${active ? 'Что делать дальше' : 'С чего начать'}</h2><span class="band-note">Рекомендации модели — с объяснением, почему</span></div>
    ${recCards(recs)}
  </section>

  <section class="band">
    <div class="band-head"><h2 class="h2">Попробуйте</h2></div>
    <div class="demo">
      <div class="ex-card demo-card"><div class="demo-root"></div><div class="demo-fb" aria-live="polite"></div></div>
      <div class="demo-text">
        <p>Орфографическая зоркость начинается с умения <b>заметить</b> место, где можно ошибиться. Затем — <b>распознать</b>, какое правило здесь работает, <b>применить</b> его и <b>перенести</b> в собственное письмо.</p>
        <p class="muted">Так устроена каждая тренировка в Орфозоре: модель знаний решает, какой из этих шагов ученику нужнее сейчас.</p>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="band-head"><h2 class="h2">Как работает интеллектуальная часть</h2><a class="band-link" href="#/about">Подробнее о методике →</a></div>
    <div class="grid grid-4 ai-cards">
      <article class="ai-card"><span class="ai-kicker">Модель знаний</span><b>Байесовское отслеживание знаний</b><p>После каждого ответа система пересчитывает вероятность того, что ученик владеет правилом, с поправкой на угадывание и случайную ошибку.</p></article>
      <article class="ai-card"><span class="ai-kicker">Адаптация</span><b>Подбор следующего задания</b><p>Низкая оценка — задания на обнаружение и распознавание; высокая — перенос в предложение. После ошибки — шаг назад.</p></article>
      <article class="ai-card"><span class="ai-kicker">Анализ ошибок</span><b>Восемь типов затруднений</b><p>Не замечена орфограмма, не определено условие, не учтено исключение, контекст… Для каждого типа — свой совет.</p></article>
      <article class="ai-card"><span class="ai-kicker">Рекомендации</span><b>Объяснимый план</b><p>Что повторить, какую тему закрепить, к какой перейти — и почему именно это.</p></article>
    </div>
  </section>

  <section class="band">
    <div class="band-head"><h2 class="h2">Учебник</h2></div>
    <div class="grid grid-2">
      ${[5, 6].map((g) => {
        const n = topicsOfGrade(g).length;
        return `<article class="grade-card">
          <img src="assets/art/${g === 5 ? 'backpack' : 'glasses'}.webp" alt="" width="140" height="140">
          <div>
            <p class="eyebrow">${g === 5 ? 'Часть первая' : 'Часть вторая'}</p>
            <h3>${g} класс</h3>
            <p>${n} ${plural(n, 'тема', 'темы', 'тем')}: ${g === 5 ? 'корни с проверяемыми и чередующимися гласными, приставки, существительное, глагол, запятые при однородных членах и обращении' : 'ПРЕ-/ПРИ-, сложные слова, Н/НН, -К-/-СК-, числительные, местоимения, повелительное наклонение'}.</p>
            <div class="actions"><a class="btn btn-primary" href="#/learn?grade=${g}">Темы ${g} класса</a><a class="btn btn-ghost" href="#/diagnostic/${g}">Диагностика</a></div>
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>

  <section class="band">
    <div class="grid grid-2">
      <a class="feature-card" href="#/teacher"><img src="assets/art/notebook.webp" alt="" width="120" height="108"><div><b>Учителю</b><p>Цели и ключи ко всем заданиям, типичные ошибки, печатные листы и ссылки на подборки для класса.</p></div></a>
      <a class="feature-card" href="#/research"><img src="assets/art/magnifier.webp" alt="" width="120" height="104"><div><b>Педагогическое исследование</b><p>Входной и итоговый срезы, сводка по классу, прирост результатов и статистическая проверка.</p></div></a>
    </div>
  </section>`;

  const root = main.querySelector('.demo-root');
  const fb = main.querySelector('.demo-fb');
  const ctl = mountExercise(root, DEMO, {
    onChange: () => {
      const res = checkItem(DEMO, ctl.getResponse());
      ctl.mark(res);
      fb.innerHTML = res.ok
        ? note('В корне <b>-лаг-/-лож-</b> гласную не проверить ударением: выбор зависит от буквы после неё. Перед Г пишется А. <a href="#/topic/g5-alt-letter">Разобрать правило →</a>', { tone: 'is-right', label: 'Да, именно здесь.' })
        : note('Найди гласную, которую нельзя проверить ударением.', { tone: 'is-retry', label: 'Здесь ошибиться трудно.' });
    },
  });
}

import { esc, md, plural, shuffle } from '../core/util.js';
import { maskedGaps, answerText, parseMarked, brokenText, parsePunct } from '../core/check.js';
import { topicById, itemById, sectionsOfGrade } from '../content/index.js';
import { STEP_LABEL } from '../content/build.js';
import { paras, crumbs } from './shared.js';
import { selectCheck } from './run.js';

const TYPE_LABEL = { gap: 'вставка буквы', choice: 'выбор ответа', multi: 'несколько ответов', sort: 'распределение', spot: 'поиск орфограммы', morph: 'выделение морфемы', fix: 'поиск ошибок', punct: 'запятые', type: 'запись слова' };

const baseUrl = () => location.href.split('#')[0];
export const assignmentLink = (ids, title, hints) => `${baseUrl()}#/run?items=${ids.join(',')}&title=${encodeURIComponent(title)}${hints ? '' : '&hints=0'}`;
export const printLink = (ids, title) => `#/print?items=${ids.join(',')}&title=${encodeURIComponent(title)}`;

// Текст задания в «бумажном» виде — для таблицы учителя и для печати.
export function itemPlain(item) {
  switch (item.t) {
    case 'gap': return maskedGaps(item.text);
    case 'choice': return `${item.q}${item.text ? ' ' + item.text : ''}`;
    case 'multi': return item.q;
    case 'sort': return `${item.q} ${item.items.map((x) => maskedGaps(x[0])).join(', ')}`;
    case 'spot': return `${item.q} ${parseMarked(item.word).plain}`;
    case 'morph': return `${item.q.replace(': нажми на первую и последнюю букву корня', '')} ${parseMarked(item.word).plain}`;
    case 'fix': return brokenText(item.text);
    case 'punct': return parsePunct(item.text).words.join(' ');
    case 'type': return item.q;
    default: return '';
  }
}

export function renderTeacher(main) {
  main.innerHTML = `<section class="page">
    <p class="eyebrow">Учителю</p>
    <h1>Орфозор на уроке и дома</h1>
    <p class="lead">Каждая тема снабжена методическим паспортом: дидактическая цель, пункт ФРП, типичные ошибки, рекомендации и ключи ко всем заданиям.</p>
    <div class="grid grid-3 use-cases">
      <article class="tile"><span class="tile-kicker">В классе</span><b>Фронтальная работа на интерактивной панели</b><span>Включите «режим доски» на странице «Мой путь»: текст и кнопки станут крупнее. Удобно разбирать задания всем классом, обсуждая алгоритм до проверки.</span></article>
      <article class="tile"><span class="tile-kicker">Дома и в классе</span><b>Ссылка на подборку заданий</b><span>Отметьте задания в теме и отправьте ссылку. Ученик выполняет их без регистрации и в конце видит итог, который можно показать или скопировать вам.</span></article>
      <article class="tile"><span class="tile-kicker">На бумаге</span><b>Печатный лист с ключом</b><span>Любую подборку можно распечатать: задания на одной странице, ответы и объяснения — на отдельной.</span></article>
    </div>
    <a class="feature-card" href="#/research"><img src="assets/art/magnifier.webp" alt="" width="110" height="96"><div><b>Исследование и оценка результатов</b><p>Входной и итоговый срезы с параллельными формами, сбор обезличенных файлов учеников, сравнение групп и статистика.</p></div></a>
    <div class="note">
      <h2 class="h4">Что важно знать</h2>
      <ul>
        <li>Все задания составлены для проекта и проверяются автоматическими тестами: верные написания сверяются со словарём, неверные варианты — на неоднозначность. Перед контрольным использованием всё же просмотрите подборку: окончательное слово за учителем.</li>
        <li>Ответы в Орфозоре открыты: это тренажёр, а не система контроля. Ученик, который хочет, может их найти. Для оценивания используйте печатные листы или собственные варианты.</li>
        <li>Прогресс учеников хранится только в их браузерах. Сервиса для сбора результатов класса нет — мы сознательно не собираем данные детей.</li>
      </ul>
    </div>
    ${[5, 6].map((g) => `<section class="map-grade">
      <h2 class="h3">${g} класс</h2>
      ${sectionsOfGrade(g).map((sec) => `<h3 class="map-section-title">${esc(sec.title)}</h3>
      <ul class="teacher-list">${sec.topics.map((t) => `<li><a href="#/teacher/${t.id}" class="topic-row"><span class="topic-row-main"><b>${esc(t.title)}</b><span>${esc(t.goal)}</span></span><span class="muted small">${t.items.length} ${plural(t.items.length, 'задание', 'задания', 'заданий')}</span></a></li>`).join('')}</ul>`).join('')}
    </section>`).join('')}
  </section>`;
}

export function renderTeacherTopic(main, { store, args }) {
  const t = topicById[args[0]];
  if (!t) { main.innerHTML = '<section class="page narrow"><h1>Тема не найдена</h1><p><a href="#/teacher">Ко всем темам</a></p></section>'; return; }
  const checkSet = new Set(selectCheck(t, store, 1).map((i) => i.id));

  main.innerHTML = `<article class="page">
    ${crumbs([['#/teacher', 'Учителю'], [null, t.title]])}
    <h1>${esc(t.title)} <span class="muted h-sub">${t.grade} класс</span></h1>
    <div class="teacher-grid">
      <section class="note"><h2 class="h4">Дидактическая цель</h2><p>${md(t.goal)}</p></section>
      <section class="note"><h2 class="h4">По Федеральной рабочей программе</h2><p>${md(t.frp)}</p></section>
      <section class="note"><h2 class="h4">Типичные ошибки</h2><ul>${t.pitfalls.map((p) => `<li>${md(p)}</li>`).join('')}</ul></section>
      <section class="note"><h2 class="h4">Как использовать</h2><p>${md(t.use)}</p></section>
    </div>
    <details class="details"><summary>Правило и алгоритм в том виде, в каком их видит ученик</summary><div class="rule-card">${paras(t.rule)}<ol class="algo">${t.steps.map((s) => `<li>${md(s)}</li>`).join('')}</ol></div></details>

    <h2 class="h3">Задания и ключи</h2>
    <p class="muted small">Отметьте задания, чтобы собрать ссылку для учеников или печатный лист. Шаги: «замечаю» и «распознаю» — подготовительные; «применяю» и «переношу» — основные, из них собирается проверка темы.</p>
    <div class="builder">
      <div class="builder-row">
        <button class="btn btn-ghost btn-sm js-all" type="button">Отметить все</button>
        <button class="btn btn-ghost btn-sm js-check" type="button">Как проверка темы (6)</button>
        <button class="btn btn-ghost btn-sm js-none" type="button">Снять отметки</button>
      </div>
      <div class="table-wrap"><table class="keys">
        <thead><tr><th scope="col"><span class="sr-only">Выбрать</span></th><th scope="col">Шаг</th><th scope="col">Задание</th><th scope="col">Ответ и объяснение</th></tr></thead>
        <tbody>${t.items.map((i, n) => `<tr>
          <td><input type="checkbox" class="js-pick" value="${i.id}" aria-label="Выбрать задание ${n + 1}" ${checkSet.has(i.id) ? 'checked' : ''}></td>
          <td><span class="chip chip-step">${STEP_LABEL[i.s]}</span><br><span class="muted small">${TYPE_LABEL[i.t]}</span></td>
          <td>${esc(itemPlain(i))}${i.t === 'choice' || i.t === 'multi' ? `<ul class="opts-plain">${(i.t === 'multi' ? i.opts : i.opts.map((o, k) => [o, k === 0])).map(([o, ok]) => `<li class="${ok ? 'is-key' : ''}">${esc(o)}${ok ? ' <span class="sr-only">(верно)</span>' : ''}</li>`).join('')}</ul>` : ''}</td>
          <td><b>${esc(answerText(i))}</b><br><span class="small">${md(i.why)}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <div class="builder-out">
        <label class="field">Название для учеников <input type="text" class="js-title" value="${esc(t.title)}" maxlength="80"></label>
        <label class="switch"><input type="checkbox" class="js-hints" checked><span>Разрешить подсказки</span></label>
        <div class="actions">
          <button class="btn btn-primary js-link" type="button">Ссылка для учеников</button>
          <a class="btn btn-ghost js-print" href="#">Печатный лист</a>
          <a class="btn btn-ghost" href="#/topic/${t.id}">Открыть как ученик</a>
        </div>
        <div class="link-out" hidden><label class="field">Ссылка <input type="text" readonly class="js-url"></label><p class="muted small js-link-msg" role="status"></p></div>
      </div>
    </div>
  </article>`;

  const picks = () => [...main.querySelectorAll('.js-pick:checked')].map((x) => x.value);
  const title = () => main.querySelector('.js-title').value.trim() || t.title;
  const setAll = (fn) => main.querySelectorAll('.js-pick').forEach((x) => { x.checked = fn(x.value); });
  main.querySelector('.js-all').addEventListener('click', () => setAll(() => true));
  main.querySelector('.js-none').addEventListener('click', () => setAll(() => false));
  main.querySelector('.js-check').addEventListener('click', () => setAll((id) => checkSet.has(id)));
  const msg = main.querySelector('.js-link-msg');
  main.querySelector('.js-link').addEventListener('click', async () => {
    const ids = picks();
    const out = main.querySelector('.link-out');
    out.hidden = false;
    if (!ids.length) { main.querySelector('.js-url').value = ''; msg.textContent = 'Сначала отметьте хотя бы одно задание.'; return; }
    const url = assignmentLink(ids, title(), main.querySelector('.js-hints').checked);
    const field = main.querySelector('.js-url');
    field.value = url;
    field.select();
    try { await navigator.clipboard.writeText(url); msg.textContent = `Ссылка скопирована (${ids.length} ${plural(ids.length, 'задание', 'задания', 'заданий')}).`; } catch { msg.textContent = 'Скопируйте ссылку из поля.'; }
  });
  main.querySelector('.js-print').addEventListener('click', (e) => {
    e.preventDefault();
    const ids = picks();
    if (!ids.length) { main.querySelector('.link-out').hidden = false; msg.textContent = 'Сначала отметьте хотя бы одно задание.'; return; }
    location.hash = printLink(ids, title());
  });
}

export function renderPrint(main, { params }) {
  const items = (params.get('items') || '').split(',').map((id) => itemById[id]).filter(Boolean);
  const title = params.get('title') || 'Русский язык';
  if (!items.length) { main.innerHTML = '<section class="page narrow"><h1>Лист пуст</h1><p>Выберите задания на странице темы в разделе «Учителю».</p><p><a class="btn btn-primary" href="#/teacher">Учителю</a></p></section>'; return; }
  const LETTERS = 'абвгдеж';
  const body = (i) => {
    switch (i.t) {
      case 'gap': return `<p class="pr-task"><span class="pr-instr">Вставь пропущенные буквы.</span> ${esc(maskedGaps(i.text))}</p>`;
      case 'choice': case 'multi': {
        const opts = shuffle(i.t === 'multi' ? i.opts.map((o) => o[0]) : i.opts, i.id);
        return `<p class="pr-task">${esc(i.q)}${i.t === 'multi' ? ' <i>(несколько ответов)</i>' : ''}${i.text ? ' ' + esc(i.text) : ''}</p><p class="pr-opts">${opts.map((o, k) => `${LETTERS[k]}) ${esc(o)}`).join('&emsp; ')}</p>`;
      }
      case 'sort': return `<p class="pr-task">${esc(i.q)} ${i.items.map((x) => esc(maskedGaps(x[0]))).join(', ')}</p>${i.cats.map((c) => `<p class="pr-line">${esc(c)}: <span class="pr-blank"></span></p>`).join('')}`;
      case 'spot': return `<p class="pr-task"><span class="pr-instr">Подчеркни букву, в которой можно ошибиться.</span> ${esc(parseMarked(i.word).plain)}</p>`;
      case 'morph': return `<p class="pr-task"><span class="pr-instr">Выдели корень.</span> ${esc(parseMarked(i.word).plain)}</p>`;
      case 'fix': return `<p class="pr-task"><span class="pr-instr">Найди и исправь ошибки.</span> ${esc(brokenText(i.text))}</p>`;
      case 'punct': return `<p class="pr-task"><span class="pr-instr">Расставь запятые.</span> ${esc(parsePunct(i.text).words.join(' '))}</p>`;
      case 'type': return `<p class="pr-task">${esc(i.q)}</p><p class="pr-line"><span class="pr-blank"></span></p>`;
      default: return '';
    }
  };
  main.innerHTML = `<section class="page print-page">
    <div class="no-print print-bar"><button class="btn btn-ghost js-back" type="button">← Назад</button><button class="btn btn-primary js-print-now" type="button">Печать</button><span class="muted small">Ключ печатается на отдельной странице.</span></div>
    <div class="sheet">
      <header class="sheet-head"><h1>${esc(title)}</h1><p>Фамилия, имя: <span class="pr-blank"></span> Класс: <span class="pr-blank short"></span> Дата: <span class="pr-blank short"></span></p></header>
      <ol class="pr-list">${items.map((i) => `<li>${body(i)}</li>`).join('')}</ol>
      <p class="sheet-foot">Орфозор · ${esc(new Set(items.map((i) => topicById[i.topicId].title)).size === 1 ? topicById[items[0].topicId].title : 'смешанная подборка')}</p>
    </div>
    <div class="sheet sheet-key">
      <header class="sheet-head"><h2>Ключ: ${esc(title)}</h2></header>
      <ol class="pr-list">${items.map((i) => `<li><b>${esc(answerText(i))}</b> — ${md(i.why)}</li>`).join('')}</ol>
    </div>
  </section>`;
  main.querySelector('.js-back').addEventListener('click', () => history.back());
  main.querySelector('.js-print-now').addEventListener('click', () => window.print());
}

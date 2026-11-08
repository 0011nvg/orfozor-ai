import { esc } from '../core/util.js';
import { sectionsOfGrade, TOPICS } from '../content/index.js';
import { STATUS_LABEL } from '../core/store.js';
import { recommendations } from '../core/recommend.js';
import { errorProfile } from '../core/diagnose.js';
import { levelLabel, MASTERY } from '../core/model.js';
import { recCards } from './home.js';

const pct = (p) => Math.round(p * 100);

function achievements(store) {
  const s = store.state;
  const statuses = TOPICS.map((t) => store.topicStatus(t.id));
  const mastered = statuses.filter((x) => x === 'mastered' || x === 'secured').length;
  const secured = statuses.filter((x) => x === 'secured').length;
  return [
    { title: 'Первый шаг', how: 'Реши первое задание.', got: Object.keys(s.items).length > 0 },
    { title: 'Разведчик', how: 'Пройди диагностику 5 или 6 класса.', got: Object.keys(s.diag).length > 0 },
    { title: 'Тема освоена', how: 'Пройди проверку темы на 5 из 6.', got: mastered >= 1 },
    { title: 'Пять тем', how: 'Освой пять тем.', got: mastered >= 5 },
    { title: 'Знание надолго', how: 'Повторно пройди проверку темы через 2 дня или позже.', got: secured >= 1 },
    { title: 'Работа над ошибками', how: 'Реши в повторении 10 заданий, где раньше ошибался.', got: s.log.fixedInReview >= 10, progress: Math.min(s.log.fixedInReview, 10) + ' / 10' },
    { title: 'Семь дней занятий', how: 'Занимайся в семь разных дней — не обязательно подряд.', got: s.log.days.length >= 7, progress: Math.min(s.log.days.length, 7) + ' / 7' },
  ];
}

// Обезличенный файл для исследования: только код участника, срезы, модель знаний и профиль ошибок.
export function researchExport(store) {
  const s = store.state;
  const items = Object.values(s.items);
  const byTopic = {};
  for (const e of s.errors) {
    if (e.mode === 'test') continue;
    (byTopic[e.topicId] ||= {})[e.code] = (byTopic[e.topicId][e.code] || 0) + 1;
  }
  return {
    app: 'orfozor', kind: 'research', version: 1, exportedAt: new Date().toISOString(),
    participant: { code: s.profile.code || '', group: s.profile.group || '' },
    tests: s.tests,
    model: s.model,
    topics: Object.fromEntries(Object.entries(s.topics).map(([id, t]) => [id, { practiced: t.practiced, checks: t.checks, mastered: !!t.masteredAt, secured: !!t.securedAt }])),
    activity: {
      attempts: items.reduce((n, r) => n + r.seen, 0),
      independent: items.reduce((n, r) => n + r.right, 0),
      days: s.log.days.length,
      minutes: Math.round((s.log.ms || 0) / 60000),
      fixedInReview: s.log.fixedInReview,
      inReview: Object.keys(s.review).length,
    },
    errors: Object.fromEntries(errorProfile(s.errors.filter((e) => e.mode !== 'test')).map((p) => [p.code, p.n])),
    errorsByTopic: byTopic,
  };
}

function download(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function renderPath(main, { store }) {
  const s = store.state;
  const all = TOPICS.map((t) => store.topicStatus(t.id));
  const count = (st) => all.filter((x) => x === st).length;
  const modelled = TOPICS.filter((t) => s.model[t.id]);
  const modelMastered = modelled.filter((t) => s.model[t.id].pL >= MASTERY).length;
  const prof = errorProfile(s.errors.filter((e) => e.mode !== 'test'));
  const maxErr = Math.max(1, ...prof.map((p) => p.n));
  const ach = achievements(store);

  main.innerHTML = `<section class="page">
    <p class="eyebrow">Мой путь</p>
    <h1>Мой путь в орфографии</h1>

    <section class="band-plain">
      <div class="band-head"><h2 class="h3">Рекомендации</h2><span class="band-note">составлены по модели знаний, ошибкам и очереди повторения</span></div>
      ${recCards(recommendations(store, { limit: 4 }))}
    </section>

    <dl class="stats stats-wide">
      <div><dt>Темы, освоенные по модели</dt><dd>${modelMastered} <small>из ${modelled.length || 0} начатых</small></dd></div>
      <div><dt>Проверка пройдена</dt><dd>${count('mastered') + count('secured')}</dd></div>
      <div><dt>Закреплено</dt><dd>${count('secured')}</dd></div>
      <div><dt>В повторении</dt><dd>${Object.keys(s.review).length}</dd></div>
    </dl>

    <section class="band-plain">
      <h2 class="h3">Карта тем</h2>
      <p class="muted small">Полоса — оценка модели знаний (вероятность, что правило освоено; порог — ${pct(MASTERY)} %). Подпись — результат проверки темы: <b>освоена</b> — 5 из 6 без подсказок, <b>закреплена</b> — повторно через 2+ дня.</p>
      ${[5, 6].map((g) => `<div class="map-grade"><h3 class="h4">${g} класс</h3>
        ${sectionsOfGrade(g).map((sec) => `<div class="map-section"><p class="map-section-title">${esc(sec.title)}</p><ul class="map">${sec.topics.map((t) => {
          const st = store.topicStatus(t.id);
          const p = s.model[t.id]?.pL;
          return `<li><a class="map-tile map-${st}" href="#/topic/${t.id}"><b>${esc(t.title)}</b><span class="mm-track"><span style="width:${p === undefined ? 0 : pct(p)}%"></span></span><span class="map-st">${p === undefined ? 'нет данных' : `${pct(p)} % · ${levelLabel(p)}`} · ${STATUS_LABEL[st]}</span></a></li>`;
        }).join('')}</ul></div>`).join('')}
      </div>`).join('')}
    </section>

    <section class="band-plain">
      <h2 class="h3">Мои типичные ошибки</h2>
      ${prof.length ? `<ul class="err-bars">${prof.map((p) => `<li><span class="err-name">${esc(p.title)}</span><span class="err-bar"><span style="width:${(p.n / maxErr) * 100}%"></span></span><b>${p.n}</b><p class="small muted">${esc(p.advice)}</p></li>`).join('')}</ul>` : '<p class="muted">Пока ошибок нет — или ты ещё не начал заниматься.</p>'}
    </section>

    <section class="band-plain">
      <h2 class="h3">Достижения</h2>
      <p class="muted small">Только за учебные шаги. Очков и рейтингов нет, за ошибки ничего не снимается.</p>
      <ul class="badges">${ach.map((a) => `<li class="badge ${a.got ? 'is-got' : ''}"><span class="badge-icon" aria-hidden="true">${a.got ? '✦' : '✧'}</span><b>${esc(a.title)}</b><span>${esc(a.how)}${!a.got && a.progress ? ` <i>(${a.progress})</i>` : ''}</span><span class="sr-only">${a.got ? 'получено' : 'пока не получено'}</span></li>`).join('')}</ul>
    </section>

    <section class="band-plain" aria-labelledby="research-h">
      <h2 class="h3" id="research-h">Участие в исследовании</h2>
      ${s.tests.length ? `<ul class="plain-list">${s.tests.map((t) => `<li>${t.stage === 'pre' ? 'Входной' : 'Итоговый'} срез, ${t.grade} класс — ${t.score} из ${t.max} (${new Date(t.date).toLocaleDateString('ru-RU')})</li>`).join('')}</ul>` : '<p class="muted">Срезы ещё не выполнялись. Ссылку на срез даёт учитель.</p>'}
      <p>Код участника: <b>${esc(s.profile.code || 'не задан')}</b>${s.profile.group ? ` · группа ${esc(s.profile.group)}` : ''}. В файл для исследования попадают только код, результаты срезов, оценки модели и количество ошибок по типам — без имени и без ответов.</p>
      <div class="actions"><button class="btn btn-ghost js-research" type="button">Сохранить файл для исследования</button></div>
    </section>

    <section class="band-plain" aria-labelledby="settings-h">
      <h2 class="h3" id="settings-h">Настройки</h2>
      <div class="settings">
        <label class="switch"><input type="checkbox" data-set="board" ${s.settings.board ? 'checked' : ''}><span>Режим интерактивной доски — крупный текст и кнопки</span></label>
        <label class="switch"><input type="checkbox" data-set="readable" ${s.settings.readable ? 'checked' : ''}><span>Удобное чтение — больше расстояние между буквами и строками</span></label>
      </div>
    </section>

    <section class="band-plain" aria-labelledby="data-h">
      <h2 class="h3" id="data-h">Где хранится прогресс</h2>
      <p>Только в этом браузере на этом устройстве. Чтобы продолжить на другом устройстве, сохрани файл и загрузи его там.</p>
      <div class="actions">
        <button class="btn btn-ghost js-export" type="button">Сохранить весь прогресс</button>
        <label class="btn btn-ghost file-btn">Загрузить из файла<input type="file" accept="application/json,.json" class="js-import"></label>
        <button class="btn btn-ghost btn-danger js-reset" type="button">Начать заново</button>
      </div>
      <p class="js-data-msg muted" role="status"></p>
    </section>
  </section>`;

  main.querySelectorAll('[data-set]').forEach((el) => el.addEventListener('change', () => store.setting(el.dataset.set, el.checked)));
  const msg = main.querySelector('.js-data-msg');
  const day = new Date().toISOString().slice(0, 10);
  main.querySelector('.js-research').addEventListener('click', () => {
    download(`orfozor-research-${(s.profile.code || 'uchastnik').replace(/[^\wА-Яа-яЁё-]/g, '')}-${day}.json`, JSON.stringify(researchExport(store), null, 2));
  });
  main.querySelector('.js-export').addEventListener('click', () => {
    download(`orfozor-progress-${day}.json`, store.exportJSON());
    msg.textContent = 'Файл сохранён в папку загрузок.';
  });
  main.querySelector('.js-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importJSON(await file.text());
      renderPath(main, { store });
      main.querySelector('.js-data-msg').textContent = 'Прогресс загружен.';
    } catch (err) {
      msg.textContent = 'Не получилось загрузить: ' + (err.message || 'файл повреждён') + '.';
    }
  });
  const reset = main.querySelector('.js-reset');
  reset.addEventListener('click', () => {
    if (reset.dataset.confirm) {
      store.reset();
      renderPath(main, { store });
      main.querySelector('.js-data-msg').textContent = 'Прогресс удалён. Настройки сохранены.';
      return;
    }
    reset.dataset.confirm = '1';
    reset.textContent = 'Точно удалить весь прогресс?';
    msg.textContent = 'Нажми ещё раз, чтобы подтвердить. Это действие нельзя отменить.';
  });
}

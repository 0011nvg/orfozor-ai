import { esc } from '../core/util.js';
import { sectionsOfGrade, TOPICS } from '../content/index.js';
import { STATUS_LABEL } from '../core/store.js';
import { catSays } from '../ui/cat.js';

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

export function renderProgress(main, { store }) {
  const s = store.state;
  const showCat = s.settings.cat !== false;
  const all = TOPICS.map((t) => store.topicStatus(t.id));
  const count = (st) => all.filter((x) => x === st).length;
  const queue = Object.keys(s.review).length;
  const due = store.dueReview().length;
  const ach = achievements(store);

  main.innerHTML = `<section class="page">
    <p class="eyebrow">Мой прогресс</p>
    <h1>Карта тем</h1>
    <div class="stats stats-wide">
      <div><dt>Закреплено</dt><dd>${count('secured')}</dd></div>
      <div><dt>Освоено</dt><dd>${count('mastered')}</dd></div>
      <div><dt>В работе</dt><dd>${count('progress')}</dd></div>
      <div><dt>В повторении</dt><dd>${queue} <small>${due ? `· сегодня ${due}` : ''}</small></dd></div>
    </div>
    <p class="muted legend">${['new', 'progress', 'mastered', 'secured'].map((k) => `<span class="status status-${k}"><span class="status-dot" aria-hidden="true"></span>${STATUS_LABEL[k]}</span>`).join(' ')}</p>
    <p class="muted small"><b>Освоена</b> — проверка темы пройдена на 5 из 6 без подсказок. <b>Закреплена</b> — проверка пройдена ещё раз, не раньше чем через два дня.</p>

    ${[5, 6].map((g) => `<section class="map-grade">
      <h2 class="h3">${g} класс</h2>
      ${sectionsOfGrade(g).map((sec) => `<div class="map-section"><h3 class="map-section-title">${esc(sec.title)}</h3><ul class="map">${sec.topics.map((t) => {
        const st = store.topicStatus(t.id);
        return `<li><a class="map-tile map-${st}" href="#/topic/${t.id}"><b>${esc(t.title)}</b><span class="sr-only">: </span><span class="map-st">${STATUS_LABEL[st]}</span></a></li>`;
      }).join('')}</ul></div>`).join('')}
    </section>`).join('')}

    <section class="band-plain">
      <h2 class="h3">Достижения</h2>
      <p class="muted small">Награды даются только за учебные шаги. Очков и рейтингов нет, за ошибки ничего не снимается.</p>
      <ul class="badges">${ach.map((a) => `<li class="badge ${a.got ? 'is-got' : ''}"><span class="badge-icon" aria-hidden="true">${a.got ? '★' : '☆'}</span><b>${esc(a.title)}</b><span>${esc(a.how)}${!a.got && a.progress ? ` <i>(${a.progress})</i>` : ''}</span><span class="sr-only">${a.got ? 'получено' : 'пока не получено'}</span></li>`).join('')}</ul>
    </section>

    <section class="band-plain" aria-labelledby="settings-h">
      <h2 class="h3" id="settings-h">Настройки</h2>
      <div class="settings">
        <label class="switch"><input type="checkbox" data-set="cat" ${s.settings.cat !== false ? 'checked' : ''}><span>Показывать кота Зорика</span></label>
        <label class="switch"><input type="checkbox" data-set="board" ${s.settings.board ? 'checked' : ''}><span>Режим интерактивной доски — крупный текст и кнопки</span></label>
        <label class="switch"><input type="checkbox" data-set="readable" ${s.settings.readable ? 'checked' : ''}><span>Удобное чтение — больше расстояние между буквами и строками</span></label>
      </div>
    </section>

    <section class="band-plain" aria-labelledby="data-h">
      <h2 class="h3" id="data-h">Где хранится прогресс</h2>
      <p>Только в этом браузере на этом устройстве. Мы не собираем имена и не отправляем данные на сервер. Чтобы продолжить на другом устройстве, сохрани файл и загрузи его там.</p>
      <div class="actions">
        <button class="btn btn-ghost js-export" type="button">Сохранить прогресс в файл</button>
        <label class="btn btn-ghost file-btn">Загрузить из файла<input type="file" accept="application/json,.json" class="js-import"></label>
        <button class="btn btn-ghost btn-danger js-reset" type="button">Начать заново</button>
      </div>
      <p class="js-data-msg muted" role="status"></p>
    </section>
    ${catSays('Главное здесь — не цифры, а то, что ты понимаешь, почему слово пишется именно так.', { show: showCat, tone: 'is-tip' })}
  </section>`;

  main.querySelectorAll('[data-set]').forEach((el) => el.addEventListener('change', () => {
    store.setting(el.dataset.set, el.checked);
    if (el.dataset.set === 'cat') renderProgress(main, { store });
  }));
  const msg = main.querySelector('.js-data-msg');
  main.querySelector('.js-export').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orfozor-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    msg.textContent = 'Файл сохранён в папку загрузок.';
  });
  main.querySelector('.js-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importJSON(await file.text());
      renderProgress(main, { store });
      main.querySelector('.js-data-msg').textContent = 'Прогресс загружен.';
    } catch (err) {
      msg.textContent = 'Не получилось загрузить: ' + (err.message || 'файл повреждён') + '.';
    }
  });
  const reset = main.querySelector('.js-reset');
  reset.addEventListener('click', () => {
    if (reset.dataset.confirm) {
      store.reset();
      renderProgress(main, { store });
      main.querySelector('.js-data-msg').textContent = 'Прогресс удалён. Настройки сохранены.';
      return;
    }
    reset.dataset.confirm = '1';
    reset.textContent = 'Точно удалить весь прогресс?';
    msg.textContent = 'Нажми ещё раз, чтобы подтвердить. Это действие нельзя отменить.';
  });
}

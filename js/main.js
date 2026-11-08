// Точка входа: хранилище, маршрутизация по hash, общие настройки интерфейса.
import { createStore } from './core/store.js';
import { renderHome } from './views/home.js';
import { renderLearn, renderTopic } from './views/learn.js';
import { renderPractice, renderCheck, renderReview, renderDiagnostic, renderMixed, renderAssignment } from './views/run.js';
import { renderProgress } from './views/progress.js';
import { renderTeacher, renderTeacherTopic, renderPrint } from './views/teacher.js';
import { renderAbout } from './views/about.js';

const store = createStore();
const main = document.getElementById('main');

const routes = [
  [/^$/, renderHome],
  [/^learn$/, renderLearn],
  [/^topic\/([\w-]+)$/, renderTopic],
  [/^practice\/([\w-]+)$/, renderPractice],
  [/^check\/([\w-]+)$/, renderCheck],
  [/^review$/, renderReview],
  [/^diagnostic\/([56])$/, renderDiagnostic],
  [/^mixed\/([56])$/, renderMixed],
  [/^run$/, renderAssignment],
  [/^progress$/, renderProgress],
  [/^teacher$/, renderTeacher],
  [/^teacher\/([\w-]+)$/, renderTeacherTopic],
  [/^print$/, renderPrint],
  [/^about$/, renderAbout],
];

function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [path, query = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), params: new URLSearchParams(query) };
}

function applySettings() {
  const s = store.state.settings;
  document.documentElement.classList.toggle('mode-board', !!s.board);
  document.documentElement.classList.toggle('mode-readable', !!s.readable);
}

function updateNav(path) {
  const section = path.split('/')[0];
  const map = { topic: 'learn', practice: 'learn', check: 'learn', diagnostic: 'learn', mixed: 'learn', print: 'teacher' };
  const current = map[section] || section || 'home';
  document.querySelectorAll('.nav a').forEach((a) => {
    if (a.dataset.nav === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const due = store.dueReview().length;
  const badge = document.querySelector('.nav-badge');
  badge.textContent = due || '';
  badge.hidden = !due;
  badge.setAttribute('aria-label', due ? `${due} заданий ждут повторения` : '');
}

function route() {
  const { path, params } = parseHash();
  let found = false;
  for (const [re, view] of routes) {
    const m = path.match(re);
    if (m) {
      found = true;
      view(main, { store, params, args: m.slice(1) });
      break;
    }
  }
  if (!found) {
    main.innerHTML = '<section class="page narrow"><h1>Такой страницы нет</h1><p>Возможно, ссылка устарела.</p><p><a class="btn btn-primary" href="#/">На главную</a></p></section>';
  }
  applySettings();
  updateNav(path);
  document.querySelector('.nav')?.classList.remove('is-open');
  document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
  // Фокус на заголовок новой страницы — для экранных дикторов и клавиатуры.
  const h1 = main.querySelector('h1');
  if (h1 && !main.querySelector('.run')) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  const title = h1 ? h1.textContent.trim() : '';
  document.title = title && path ? `${title} — Орфозор` : 'Орфозор — русский язык, 5–6 класс';
}

document.querySelector('.nav-toggle').addEventListener('click', (e) => {
  const nav = document.querySelector('.nav');
  const open = nav.classList.toggle('is-open');
  e.currentTarget.setAttribute('aria-expanded', open);
});

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-reload]')) route();
});

store.subscribe(applySettings);
window.addEventListener('hashchange', route);
route();

if (!store.available) {
  document.querySelector('.storage-warning').hidden = false;
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

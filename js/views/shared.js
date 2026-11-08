import { esc, md } from '../core/util.js';
import { STATUS_LABEL } from '../core/store.js';

export const statusChip = (status) => `<span class="status status-${status}"><span class="status-dot" aria-hidden="true"></span>${STATUS_LABEL[status]}</span>`;

// Абзацы учебного текста: пустая строка разделяет абзацы.
export const paras = (text) => text.split(/\n\n+/).map((p) => `<p>${md(p)}</p>`).join('');

export const gradeTabs = (grade, base) => `<div class="tabs" role="tablist" aria-label="Класс">${[5, 6].map((g) => `<a role="tab" class="tab" href="${base}?grade=${g}" aria-selected="${g === grade}">${g} класс</a>`).join('')}</div>`;

export function pickGrade(store, params) {
  const fromUrl = Number(params.get('grade'));
  if (fromUrl === 5 || fromUrl === 6) {
    if (store.state.settings.grade !== fromUrl) store.setting('grade', fromUrl);
    return fromUrl;
  }
  return store.state.settings.grade || 5;
}

export const crumbs = (list) => `<nav class="crumbs" aria-label="Вы здесь"><ol>${list.map(([href, label]) => `<li>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join('')}</ol></nav>`;

// «Помета на полях» — обратная связь в духе учительских пометок на полях тетради.
// Вместо персонажа — типографская форма: значок-перо, короткая подпись, текст объяснения.

const ICONS = {
  right: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  wrong: '<path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  // перо
  pen: '<path d="M19.5 3.5c-6 1-11 6.5-12.5 13l-1.5 4 3.8-1.8C15.6 17 20.4 11 20.5 4.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5.5 20.5L14 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  // раскрытая книга
  book: '<path d="M12 6.5C9.5 4.8 6.5 4.5 3.5 5v13c3-.5 6-.2 8.5 1.5 2.5-1.7 5.5-2 8.5-1.5V5c-3-.5-6-.2-8.5 1.5zM12 6.5v13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
};

export const icon = (name, size = 22) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const DEFAULT_ICON = { 'is-right': 'right', 'is-wrong': 'wrong', 'is-retry': 'pen', 'is-hint': 'pen', 'is-tip': 'book', 'is-ai': 'spark' };

export function note(html, { tone = 'is-tip', label = '' } = {}) {
  return `<div class="note-line ${tone}"><span class="note-ico">${icon(DEFAULT_ICON[tone] || 'pen')}</span><div class="note-body">${label ? `<span class="note-label">${label}</span>` : ''}${html}</div></div>`;
}

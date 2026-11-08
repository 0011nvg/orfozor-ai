// Зорик — кот-помощник Орфозора. Оригинальный рисунок, собран из простых фигур.
// Настроение задаётся атрибутом data-mood: idle | think | happy | oops.

import { esc } from '../core/util.js';

export function catSVG({ mood = 'idle', size = 96, label = 'Кот Зорик' } = {}) {
  return `<svg class="cat" data-mood="${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${esc(label)}">
  <g class="cat-tail"><path d="M86 104c18 0 26-10 24-22-1-8-8-11-12-7" fill="none" stroke="var(--cat-fur)" stroke-width="9" stroke-linecap="round"/></g>
  <ellipse cx="60" cy="94" rx="30" ry="23" fill="var(--cat-fur)"/>
  <ellipse cx="60" cy="100" rx="15" ry="14" fill="var(--cat-belly)"/>
  <ellipse cx="47" cy="114" rx="9" ry="5" fill="var(--cat-fur)"/><ellipse cx="73" cy="114" rx="9" ry="5" fill="var(--cat-fur)"/>
  <g class="cat-head">
    <path d="M27 40 L31 9 L53 27 Z" fill="var(--cat-fur)"/><path d="M33 33 L35 17 L46 27 Z" fill="var(--cat-ear)"/>
    <path d="M93 40 L89 9 L67 27 Z" fill="var(--cat-fur)"/><path d="M87 33 L85 17 L74 27 Z" fill="var(--cat-ear)"/>
    <g class="cat-pencil" transform="rotate(-38 95 22)"><rect x="80" y="19" width="30" height="6" rx="1.5" fill="var(--cat-pencil)"/><path d="M110 19 L117 22 L110 25 Z" fill="#F3D9B1"/><path d="M114.5 21 L117 22 L114.5 23 Z" fill="#2B2B2B"/></g>
    <ellipse cx="60" cy="52" rx="35" ry="30" fill="var(--cat-fur)"/>
    <ellipse cx="60" cy="64" rx="17" ry="11" fill="var(--cat-belly)" opacity=".95"/>
    <g class="eyes-open">
      <ellipse cx="46" cy="50" rx="8" ry="9" fill="var(--cat-eye)"/><ellipse cx="74" cy="50" rx="8" ry="9" fill="var(--cat-eye)"/>
      <ellipse class="pupil" cx="46" cy="51" rx="2.6" ry="6.5" fill="#15192A"/><ellipse class="pupil" cx="74" cy="51" rx="2.6" ry="6.5" fill="#15192A"/>
      <circle cx="48.5" cy="46.5" r="1.8" fill="#fff"/><circle cx="76.5" cy="46.5" r="1.8" fill="#fff"/>
      <rect class="lid" x="36" y="40" width="48" height="0" fill="var(--cat-fur)"/>
    </g>
    <g class="eyes-happy"><path d="M38 52 Q46 42 54 52" fill="none" stroke="var(--cat-eye)" stroke-width="4" stroke-linecap="round"/><path d="M66 52 Q74 42 82 52" fill="none" stroke="var(--cat-eye)" stroke-width="4" stroke-linecap="round"/></g>
    <g class="brows-oops"><path d="M37 37 L52 40" stroke="var(--cat-belly)" stroke-width="2.5" stroke-linecap="round"/><path d="M83 37 L68 40" stroke="var(--cat-belly)" stroke-width="2.5" stroke-linecap="round"/></g>
    <path d="M56 60 L64 60 L60 64.5 Z" fill="var(--cat-nose)"/>
    <path class="mouth-idle" d="M53 67 Q56.5 70.5 60 66.5 Q63.5 70.5 67 67" fill="none" stroke="#15192A" stroke-width="2" stroke-linecap="round"/>
    <path class="mouth-happy" d="M52 66.5 Q60 79 68 66.5 Z" fill="#7A2E3A"/>
    <path class="mouth-oops" d="M54 70 Q60 66 66 70" fill="none" stroke="#15192A" stroke-width="2" stroke-linecap="round"/>
    <g stroke="var(--cat-belly)" stroke-width="1.4" stroke-linecap="round" opacity=".8"><path d="M40 63 L22 60"/><path d="M40 67 L23 69"/><path d="M80 63 L98 60"/><path d="M80 67 L97 69"/></g>
  </g>
</svg>`;
}

// Реплика Зорика рядом с заданием. Если кот выключен в настройках — только текст.
export function catSays(html, { mood = 'idle', show = true, tone = '' } = {}) {
  return `<div class="cat-line ${tone}" data-cat="${show ? 'on' : 'off'}">${show ? `<div class="cat-line-avatar" aria-hidden="true">${catSVG({ mood, size: 64, label: '' })}</div>` : ''}<div class="cat-line-bubble">${html}</div></div>`;
}

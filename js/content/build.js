// Компактные конструкторы заданий. Формат каждого типа описан в js/core/check.js.
// s — учебный шаг: n — замечаю, r — распознаю, a — применяю, t — переношу в текст.

export const gap = (text, why, o = {}) => ({ t: 'gap', s: 'a', text, why, ...o });
export const choice = (q, opts, why, o = {}) => ({ t: 'choice', s: 'r', q, opts, why, ...o });
export const multi = (q, opts, why, o = {}) => ({ t: 'multi', s: 'r', q, opts, why, ...o });
export const sort = (q, cats, items, why, o = {}) => ({ t: 'sort', s: 'a', q, cats, items, why, ...o });
export const spot = (q, word, why, o = {}) => ({ t: 'spot', s: 'n', q, word, why, ...o });
export const morph = (q, word, why, o = {}) => ({ t: 'morph', s: 'n', q, word, why, ...o });
export const fix = (text, why, o = {}) => ({ t: 'fix', s: 't', q: 'Найди и отметь слова с ошибками.', text, why, ...o });
export const punct = (text, why, o = {}) => ({ t: 'punct', s: 't', q: 'Нажми между словами там, где нужна запятая.', text, why, ...o });
export const type = (q, ans, why, o = {}) => ({ t: 'type', s: 't', q, ans: Array.isArray(ans) ? ans : [ans], why, ...o });

export const STEP_LABEL = { n: 'Замечаю', r: 'Распознаю', a: 'Применяю', t: 'Переношу' };

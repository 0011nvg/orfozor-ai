// Персональные рекомендации: что делать дальше и почему.
// Источник — модель знаний (BKT), профиль ошибок, очередь интервального повторения и порядок тем программы.
// Каждая рекомендация сопровождается объяснением, чтобы ученик и учитель видели логику системы.

import { TOPICS, topicById } from '../content/index.js';
import { MASTERY } from './model.js';
import { errorProfile } from './diagnose.js';
import { DAY } from './util.js';

// Тема опирается на ранее изученные: например, -кас-/-кос- — на корни с чередованием из 5 класса.
export const PREREQ = {
  'g6-kas': ['g5-alt-ei', 'g5-alt-letter'],
  'g6-prepri': ['g5-zs', 'g5-yi-prefix'],
  'g6-compound': ['g5-root'],
  'g6-nn': ['g5-root'],
  'g5-alt-letter': ['g5-vowel'],
  'g5-alt-stress': ['g5-vowel'],
  'g5-ne-adj': ['g5-ne-noun'],
  'g5-yi-prefix': ['g5-root'],
};

const pct = (p) => Math.round(p * 100);

export function recommendations(store, { now = Date.now(), limit = 3 } = {}) {
  const s = store.state;
  const recs = [];
  const due = store.dueReview(now).filter((r) => topicById[r.topic]);
  if (due.length) {
    recs.push({
      kind: 'review', href: '#/review', action: 'Повторить',
      title: `Повторение: ${due.length} ${due.length === 1 ? 'задание' : due.length < 5 ? 'задания' : 'заданий'}`,
      reason: 'Эти задания вызвали затруднение раньше. Интервальное повторение возвращает их, пока они не начнут решаться самостоятельно.',
    });
  }

  const started = TOPICS.filter((t) => (s.model[t.id]?.n || 0) >= 3 && s.model[t.id].pL < MASTERY)
    .sort((a, b) => s.model[a.id].pL - s.model[b.id].pL);
  for (const t of started.slice(0, 2)) {
    const prof = errorProfile(s.errors, t.id)[0];
    recs.push({
      kind: 'weak', href: `#/practice/${t.id}`, action: 'Тренироваться',
      title: t.title,
      reason: `Модель оценивает освоение темы в ${pct(s.model[t.id].pL)} %.${prof ? ` Чаще всего: «${prof.title.toLowerCase()}». ${prof.advice}` : ''}`,
    });
  }

  const toSecure = TOPICS.filter((t) => s.topics[t.id]?.masteredAt && !s.topics[t.id]?.securedAt && now - s.topics[t.id].masteredAt >= 2 * DAY);
  if (toSecure.length) {
    const t = toSecure[0];
    recs.push({
      kind: 'secure', href: `#/check/${t.id}`, action: 'Пройти проверку',
      title: `Закрепить: ${t.title}`,
      reason: 'Тема освоена больше двух дней назад. Повторная проверка покажет, сохранилось ли знание, — это и есть настоящий результат.',
    });
  }

  const grade = s.settings.grade || 5;
  const fresh = TOPICS.filter((t) => t.grade === grade && !s.model[t.id] && !s.topics[t.id]);
  const diag = s.diag[grade]?.results;
  // После диагностики сначала — темы, где была ошибка; иначе — по порядку программы, если освоены опорные темы.
  const ordered = diag ? [...fresh.filter((t) => diag[t.id] === false), ...fresh.filter((t) => diag[t.id] !== false)] : fresh;
  const ready = ordered.find((t) => (PREREQ[t.id] || []).every((p) => (s.model[p]?.pL ?? 0) >= 0.7 || s.topics[p]?.masteredAt)) || ordered[0];
  if (ready) {
    const pre = (PREREQ[ready.id] || []).filter((p) => s.model[p] || s.topics[p]).map((p) => `«${topicById[p].title}»`);
    recs.push({
      kind: 'new', href: `#/topic/${ready.id}`, action: 'Открыть тему',
      title: ready.title,
      reason: diag && diag[ready.id] === false
        ? 'В диагностике задание по этой теме вызвало затруднение — с неё стоит начать.'
        : pre.length ? `Опирается на тему ${pre.join(' и ')}, с которой ты уже работал.` : 'Следующая тема в порядке программы.',
    });
  }

  if (!Object.keys(s.diag).length && !Object.keys(s.model).length) {
    recs.unshift({
      kind: 'diag', href: `#/diagnostic/${grade}`, action: 'Пройти диагностику',
      title: `Диагностика · ${grade} класс`,
      reason: 'Одно задание на каждую тему. По результатам модель знаний получит стартовые оценки и подскажет, с чего начать.',
    });
  }
  return recs.slice(0, limit);
}

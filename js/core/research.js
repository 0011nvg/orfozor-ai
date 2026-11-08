// Обработка файлов участников исследования (без DOM — покрыто тестами).
import { mean, sd, median, wilcoxon, mannWhitney, normalizedGain, spearman, effectR } from './stats.js';

export function parseResearchFile(text) {
  const data = JSON.parse(text);
  if (data?.app !== 'orfozor' || data?.kind !== 'research') throw new Error('не файл исследования Орфозора');
  if (!data.participant?.code) throw new Error('в файле нет кода участника');
  return data;
}

const latest = (tests, stage, grade) => tests.filter((t) => t.stage === stage && (!grade || t.grade === grade)).sort((a, b) => b.date.localeCompare(a.date))[0];

// Объединяет файлы (последний файл участника имеет приоритет) и строит строки участников.
export function participantsFrom(files, { grade } = {}) {
  const byCode = new Map();
  for (const f of files) {
    const key = f.participant.code.trim().toLowerCase();
    const prev = byCode.get(key);
    if (!prev || (f.exportedAt || '') > (prev.exportedAt || '')) byCode.set(key, f);
  }
  return [...byCode.values()].map((f) => {
    const pre = latest(f.tests || [], 'pre', grade);
    const post = latest(f.tests || [], 'post', grade);
    const prePct = pre ? pre.score / pre.max : null;
    const postPct = post ? post.score / post.max : null;
    const testTopics = [...new Set([...(pre?.items || []), ...(post?.items || [])].map((i) => i.topicId))];
    const modelVals = testTopics.map((t) => f.model?.[t]?.pL).filter((x) => typeof x === 'number');
    return {
      code: f.participant.code,
      group: f.participant.group || pre?.group || post?.group || '',
      grade: pre?.grade || post?.grade || grade || null,
      pre, post, prePct, postPct,
      delta: prePct !== null && postPct !== null ? postPct - prePct : null,
      gain: prePct !== null && postPct !== null ? normalizedGain(prePct, postPct, 1) : null,
      minutes: f.activity?.minutes ?? 0,
      attempts: f.activity?.attempts ?? 0,
      days: f.activity?.days ?? 0,
      modelMean: modelVals.length ? mean(modelVals) : null,
      errors: f.errors || {},
      demo: !!f.demo,
    };
  });
}

export function groupSummary(rows) {
  const paired = rows.filter((r) => r.prePct !== null && r.postPct !== null);
  const pre = paired.map((r) => r.prePct), post = paired.map((r) => r.postPct);
  const gains = paired.map((r) => r.gain).filter((g) => g !== null);
  const w = wilcoxon(pre, post);
  return {
    n: rows.length, paired: paired.length,
    preMean: mean(pre), preSd: sd(pre), postMean: mean(post), postSd: sd(post),
    deltaMean: mean(paired.map((r) => r.delta)), gainMean: mean(gains), gainMedian: median(gains),
    wilcoxon: { ...w, r: effectR(w.z, w.n) },
  };
}

export function analyse(rows) {
  const groups = {};
  for (const r of rows) (groups[r.group || '—'] ||= []).push(r);
  const summaries = Object.fromEntries(Object.entries(groups).map(([g, list]) => [g, groupSummary(list)]));
  let between = null;
  if (groups['Э'] && groups['К']) {
    const ge = groups['Э'].filter((r) => r.delta !== null).map((r) => r.delta);
    const gk = groups['К'].filter((r) => r.delta !== null).map((r) => r.delta);
    const preE = groups['Э'].filter((r) => r.prePct !== null).map((r) => r.prePct);
    const preK = groups['К'].filter((r) => r.prePct !== null).map((r) => r.prePct);
    const mwPre = mannWhitney(preE, preK);
    const mwDelta = mannWhitney(ge, gk);
    between = { pre: { ...mwPre, r: effectR(mwPre.z, preE.length + preK.length) }, delta: { ...mwDelta, r: effectR(mwDelta.z, ge.length + gk.length) } };
  }
  // Согласованность модели знаний с итоговым срезом (валидность оценки модели).
  const withModel = rows.filter((r) => r.modelMean !== null && r.postPct !== null);
  const validity = spearman(withModel.map((r) => r.modelMean), withModel.map((r) => r.postPct));
  return { groups: summaries, between, validity };
}

// Доля верных ответов по темам до и после.
export function byTopic(rows) {
  const acc = {};
  for (const r of rows) for (const [stage, test] of [['pre', r.pre], ['post', r.post]]) {
    for (const it of test?.items || []) {
      const a = (acc[it.topicId] ||= { pre: [0, 0], post: [0, 0] });
      a[stage][0] += it.ok ? 1 : 0;
      a[stage][1] += 1;
    }
  }
  return acc;
}

const csvCell = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return String(Math.round(v * 1000) / 1000).replace('.', ',');
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCSV = (header, rows) => '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');

export function participantsCSV(rows) {
  return toCSV(
    ['код', 'группа', 'класс', 'входной_верно', 'входной_всего', 'входной_доля', 'итоговый_верно', 'итоговый_всего', 'итоговый_доля', 'прирост_доли', 'нормированный_прирост', 'минут_в_тренажёре', 'попыток', 'дней_занятий', 'оценка_модели_по_темам_среза', 'демо'],
    rows.map((r) => [r.code, r.group, r.grade, r.pre?.score, r.pre?.max, r.prePct, r.post?.score, r.post?.max, r.postPct, r.delta, r.gain, r.minutes, r.attempts, r.days, r.modelMean, r.demo ? 'да' : '']),
  );
}

export function itemsCSV(rows) {
  const out = [];
  for (const r of rows) for (const t of [r.pre, r.post]) for (const it of t?.items || []) out.push([r.code, r.group, t.grade, t.stage === 'pre' ? 'входной' : 'итоговый', t.form, it.topicId, it.id, it.ok ? 1 : 0, Math.round((it.ms || 0) / 100) / 10, it.error || '']);
  return toCSV(['код', 'группа', 'класс', 'срез', 'форма', 'тема', 'задание', 'верно', 'секунд', 'тип_ошибки'], out);
}

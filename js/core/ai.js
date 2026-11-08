// Клиент генеративного ИИ-наставника.
// Модель не решает, верен ли ответ, и не придумывает правил: она получает проверенное правило
// и разбор задания из банка и только переформулирует объяснение для конкретной ошибки ученика.
// Ответ проверяется (validateExplanation); при любом сомнении показывается проверенный текст из банка.

import { CONFIG } from '../config.js';
import { normalize } from './check.js';

export const aiEnabled = () => typeof CONFIG.aiEndpoint === 'string' && CONFIG.aiEndpoint.startsWith('https://');

export function validateExplanation(text, { correct, wrong }) {
  if (typeof text !== 'string') return { ok: false, reason: 'пустой ответ' };
  const t = text.trim();
  if (t.length < 30 || t.length > 900) return { ok: false, reason: 'длина' };
  const n = normalize(t, { keepPunct: true });
  const single = (s) => s && !/\s/.test(s.trim()) && s.trim().length <= 30;
  // Верное написание должно прозвучать в объяснении.
  if (single(correct) && !n.includes(normalize(correct))) return { ok: false, reason: 'нет верного написания' };
  // Ошибочное написание не должно называться верным.
  if (wrong && single(wrong) && normalize(wrong) !== normalize(correct)) {
    const w = normalize(wrong);
    const re = new RegExp(`${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^.!?]{0,40}(верно|правильн|можно писать)`, 'u');
    if (re.test(n) && !new RegExp(`(не|неверно|ошибочно)[^.!?]{0,20}${w}`, 'u').test(n)) return { ok: false, reason: 'ошибочное написание названо верным' };
  }
  if (/как языковая модель|не могу|я не уверен|не уверена/i.test(t)) return { ok: false, reason: 'служебный ответ' };
  return { ok: true };
}

export async function explainDifferently(payload, { timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error('Сервис недоступен');
    const data = await res.json();
    const check = validateExplanation(data.text, { correct: payload.correct, wrong: payload.studentAnswer });
    if (!check.ok) throw new Error('Объяснение не прошло проверку: ' + check.reason);
    return data.text.trim();
  } finally {
    clearTimeout(timer);
  }
}

// Серверная функция ИИ-наставника Орфозора (Supabase Edge Functions / Deno).
// Получает проверенное правило темы и разбор задания, просит языковую модель
// переформулировать объяснение для конкретной ошибки ученика и проверяет ответ.
// Ключ доступа к модели хранится только на сервере (секрет ANTHROPIC_API_KEY).

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://0011nvg.github.io').split(',');
const MODEL = Deno.env.get('MODEL') ?? 'claude-haiku-5-5';
const API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const SYSTEM = `Ты — доброжелательный учитель русского языка для учеников 5–6 классов.
Тебе дают проверенное правило, задание, верный ответ и ответ ученика.
Объясни ученику его ошибку другими словами, чем в готовом разборе.
Строгие условия:
— опирайся только на переданное правило; не добавляй других правил и исключений;
— обязательно назови верное написание;
— не называй ответ ученика правильным;
— 2–4 коротких предложения, не больше 70 слов, простыми словами, на «ты»;
— без приветствий, без похвалы за ошибку, без эмодзи, без markdown.`;

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 12; // не больше 12 запросов в минуту с одного адреса
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const cors = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Vary': 'Origin',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST' || !ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403, headers: cors });
  if (!API_KEY) return new Response('Not configured', { status: 503, headers: cors });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  if (rateLimited(ip)) return new Response('Too many requests', { status: 429, headers: cors });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response('Bad request', { status: 400, headers: cors }); }
  const correct = str(body.correct, 200);
  if (!correct) return new Response('Bad request', { status: 400, headers: cors });

  const user = [
    `Тема: ${str(body.topic, 120)} (${Number(body.grade) || ''} класс)`,
    `Правило: ${str(body.rule, 1500)}`,
    `Алгоритм: ${Array.isArray(body.steps) ? body.steps.map((s) => str(s, 200)).join(' → ') : ''}`,
    `Задание: ${str(body.task, 300)} ${str(body.text, 300)}`,
    `Верный ответ: ${correct}`,
    `Ответ ученика: ${str(body.studentAnswer, 200) || '(не указан)'}`,
    `Тип ошибки: ${str(body.errorType, 120)}`,
    `Готовый разбор (не повторяй дословно): ${str(body.explanation, 600)}`,
  ].join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 300, temperature: 0.3, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) return new Response('Upstream error', { status: 502, headers: cors });
  const data = await res.json();
  const text = String(data?.content?.[0]?.text ?? '').trim();

  // Серверная проверка дублирует клиентскую: верное написание обязательно, длина ограничена.
  const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');
  const single = !/\s/.test(correct.trim());
  if (text.length < 30 || text.length > 900 || (single && !norm(text).includes(norm(correct)))) {
    return new Response('Validation failed', { status: 422, headers: cors });
  }
  return new Response(JSON.stringify({ text }), { headers: { ...cors, 'content-type': 'application/json' } });
});

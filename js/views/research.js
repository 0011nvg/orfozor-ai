import { esc, plural } from '../core/util.js';
import { TESTS, STAGES } from '../content/tests.js';
import { topicById } from '../content/index.js';
import { ERROR_TYPES } from '../core/diagnose.js';
import { parseResearchFile, participantsFrom, analyse, byTopic, participantsCSV, itemsCSV } from '../core/research.js';
import { fmt, fmtP } from '../core/stats.js';

const pct = (x) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : `${Math.round(x * 100)} %`);
const baseUrl = () => location.href.split('#')[0];
let loaded = []; // файлы, загруженные в этой вкладке (не сохраняются)

// Демонстрационный набор: показывает, как работает анализ, и явно помечен как ненастоящий.
function demoFiles(grade = 6) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const files = [];
  for (const group of ['Э', 'К']) {
    for (let k = 1; k <= 12; k++) {
      const ability = 0.35 + rnd() * 0.35;
      const growth = group === 'Э' ? 0.15 + rnd() * 0.2 : 0.02 + rnd() * 0.12;
      const make = (stage, p) => {
        const items = TESTS[grade][STAGES[stage].form].map((it) => ({ id: it.id, topicId: it.topicId, ok: rnd() < p, ms: 8000 + rnd() * 20000 }));
        return { kind: 'test', grade, stage, form: STAGES[stage].form, code: `${group}-${k}`, group, date: `2026-${stage === 'pre' ? '09' : '10'}-15T10:00:00Z`, score: items.filter((i) => i.ok).length, max: items.length, items };
      };
      const post = Math.min(0.97, ability + growth);
      files.push({
        app: 'orfozor', kind: 'research', version: 1, demo: true, exportedAt: '2026-10-20T00:00:00Z',
        participant: { code: `ДЕМО-${group}${k}`, group },
        tests: [make('pre', ability), make('post', post)],
        model: Object.fromEntries(TESTS[grade].A.map((it) => [it.topicId, { pL: Math.min(0.99, post + (rnd() - 0.5) * 0.2), n: 10 }])),
        activity: { minutes: group === 'Э' ? Math.round(60 + rnd() * 120) : 0, attempts: group === 'Э' ? Math.round(80 + rnd() * 150) : 0, days: group === 'Э' ? Math.round(5 + rnd() * 10) : 0 },
        errors: group === 'Э' ? { apply: Math.round(rnd() * 20), exception: Math.round(rnd() * 10), recognize: Math.round(rnd() * 8), context: Math.round(rnd() * 6) } : {},
      });
    }
  }
  return files;
}

function download(name, text, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function resultsHTML(rows) {
  if (!rows.length) return '';
  const demo = rows.some((r) => r.demo);
  const A = analyse(rows);
  const topics = byTopic(rows);
  const errTotals = {};
  for (const r of rows) for (const [code, n] of Object.entries(r.errors)) errTotals[code] = (errTotals[code] || 0) + n;
  const groupName = (g) => (g === 'Э' ? 'Экспериментальная' : g === 'К' ? 'Контрольная' : 'Без группы');
  return `${demo ? '<p class="demo-banner" role="alert">ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ. Сгенерированы для показа работы анализа и не являются результатами исследования.</p>' : ''}
  <h3 class="h3">Сводка по группам</h3>
  <div class="table-wrap"><table class="keys"><thead><tr><th>Группа</th><th>n (пары)</th><th>Входной срез, M (SD)</th><th>Итоговый срез, M (SD)</th><th>Прирост</th><th>Нормир. прирост g, M / Me</th><th>Уилкоксон: W, z, p, r</th></tr></thead>
  <tbody>${Object.entries(A.groups).map(([g, s]) => `<tr><td><b>${groupName(g)}</b></td><td>${s.n} (${s.paired})</td><td>${pct(s.preMean)} (${fmt(s.preSd * 100, 1)})</td><td>${pct(s.postMean)} (${fmt(s.postSd * 100, 1)})</td><td>${s.deltaMean >= 0 ? '+' : ''}${pct(s.deltaMean)}</td><td>${fmt(s.gainMean)} / ${fmt(s.gainMedian)}</td><td>W = ${fmt(s.wilcoxon.W, 1)}, z = ${fmt(s.wilcoxon.z)}, p = ${fmtP(s.wilcoxon.p)}, r = ${fmt(s.wilcoxon.r)}</td></tr>`).join('')}</tbody></table></div>
  ${A.between ? `<div class="note-plain"><p><b>Сравнение групп (критерий Манна — Уитни).</b> Входной срез: U = ${fmt(A.between.pre.U, 1)}, p = ${fmtP(A.between.pre.p)} — ${A.between.pre.p >= 0.05 ? 'группы на старте статистически не различаются, это условие корректного эксперимента выполнено' : 'группы различаются уже на старте: учтите это при интерпретации'}. Прирост: U = ${fmt(A.between.delta.U, 1)}, z = ${fmt(A.between.delta.z)}, p = ${fmtP(A.between.delta.p)}, r = ${fmt(A.between.delta.r)} — ${A.between.delta.p < 0.05 ? 'различие прироста статистически значимо (p < 0,05)' : 'различие прироста статистически не значимо'}.</p></div>` : '<p class="muted small">Для сравнения групп нужны участники с пометкой «Э» и «К».</p>'}
  <div class="note-plain"><p><b>Валидность модели знаний.</b> Корреляция Спирмена между средней оценкой модели по темам среза и итоговым результатом: ρ = ${fmt(A.validity.rho)}${Number.isFinite(A.validity.p) ? `, p = ${fmtP(A.validity.p)}` : ''} (n = ${A.validity.n}). Чем выше ρ, тем точнее модель предсказывает реальный результат ученика.</p></div>

  <h3 class="h3">Результаты по темам</h3>
  <div class="table-wrap"><table class="keys"><thead><tr><th>Тема</th><th>Входной срез</th><th>Итоговый срез</th><th>Изменение</th></tr></thead><tbody>
  ${Object.entries(topics).map(([id, a]) => { const pre = a.pre[1] ? a.pre[0] / a.pre[1] : null; const post = a.post[1] ? a.post[0] / a.post[1] : null; return `<tr><td>${esc(topicById[id]?.title || id)}</td><td>${pct(pre)}</td><td>${pct(post)}</td><td>${pre !== null && post !== null ? (post - pre >= 0 ? '+' : '') + pct(post - pre) : '—'}</td></tr>`; }).join('')}
  </tbody></table></div>

  ${Object.keys(errTotals).length ? `<h3 class="h3">Ошибки в тренировке по типам</h3><ul class="err-bars">${Object.entries(errTotals).sort((a, b) => b[1] - a[1]).map(([code, n]) => `<li><span class="err-name">${esc(ERROR_TYPES[code]?.title || code)}</span><span class="err-bar"><span style="width:${(n / Math.max(...Object.values(errTotals))) * 100}%"></span></span><b>${n}</b></li>`).join('')}</ul>` : ''}

  <h3 class="h3">Участники</h3>
  <div class="table-wrap"><table class="keys"><thead><tr><th>Код</th><th>Группа</th><th>Входной</th><th>Итоговый</th><th>g</th><th>Минут</th><th>Модель</th></tr></thead><tbody>
  ${rows.map((r) => `<tr><td>${esc(r.code)}</td><td>${esc(r.group || '—')}</td><td>${r.pre ? `${r.pre.score}/${r.pre.max}` : '—'}</td><td>${r.post ? `${r.post.score}/${r.post.max}` : '—'}</td><td>${fmt(r.gain)}</td><td>${r.minutes}</td><td>${pct(r.modelMean)}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="actions"><button class="btn btn-primary js-csv1" type="button">Таблица участников (CSV)</button><button class="btn btn-ghost js-csv2" type="button">Ответы по заданиям (CSV)</button></div>`;
}

export function renderResearch(main) {
  main.innerHTML = `<section class="page research">
    <p class="eyebrow">Педагогическое исследование</p>
    <h1>Оценка эффективности обучения</h1>
    <p class="lead">Инструменты для опытно-экспериментальной работы: срезы с параллельными формами, обезличенный сбор результатов, сравнение групп и статистическая проверка гипотез.</p>

    <section class="band-plain">
      <h2 class="h3">Протокол эксперимента</h2>
      <ol class="algo">
        <li><b>Подготовка.</b> Получите согласие родителей (законных представителей). Выдайте ученикам коды участников вида «6Б-07» — имена в системе не используются.</li>
        <li><b>Входной срез</b> (форма А) — в экспериментальной (Э) и контрольной (К) группах. Убедитесь, что группы не различаются на старте (критерий Манна — Уитни ниже).</li>
        <li><b>Обучение</b> 3–6 недель. Группа Э регулярно занимается в Орфозоре (адаптивные тренировки, повторение, проверки тем); группа К учится по обычной программе.</li>
        <li><b>Итоговый срез</b> (форма Б: те же темы и трудность, другие слова) в обеих группах.</li>
        <li><b>Сбор данных.</b> Каждый ученик на странице «Мой путь» сохраняет файл для исследования и передаёт учителю. Загрузите файлы ниже.</li>
        <li><b>Анализ.</b> Сравнение до/после внутри групп (критерий Уилкоксона), сравнение прироста между группами (Манн — Уитни), нормированный прирост, проверка валидности модели знаний; выгрузка в CSV для Excel или SPSS.</li>
      </ol>
    </section>

    <section class="band-plain">
      <h2 class="h3">Ссылка на срез для учеников</h2>
      <div class="link-builder">
        <label class="field">Класс <select class="js-g"><option value="5">5 класс (${TESTS[5].A.length} заданий)</option><option value="6">6 класс (${TESTS[6].A.length} заданий)</option></select></label>
        <label class="field">Срез <select class="js-s"><option value="pre">Входной (форма А)</option><option value="post">Итоговый (форма Б)</option></select></label>
        <label class="field">Группа <select class="js-grp"><option value="Э">Экспериментальная (Э)</option><option value="К">Контрольная (К)</option><option value="">Без группы</option></select></label>
      </div>
      <div class="actions"><button class="btn btn-primary js-make" type="button">Создать ссылку</button><a class="btn btn-ghost js-try" href="#">Открыть срез</a></div>
      <label class="field link-out" hidden>Ссылка <input type="text" readonly class="js-url"></label>
      <p class="muted small js-link-msg" role="status"></p>
    </section>

    <section class="band-plain">
      <h2 class="h3">Анализ результатов</h2>
      <p>Выберите файлы участников (можно сразу все). Файлы обрабатываются только в этом браузере и никуда не отправляются.</p>
      <div class="actions">
        <label class="btn btn-primary file-btn">Загрузить файлы участников<input type="file" multiple accept="application/json,.json" class="js-files"></label>
        <button class="btn btn-ghost js-demo" type="button">Показать на демонстрационных данных</button>
        <label class="field inline">Класс для анализа <select class="js-ag"><option value="">любой</option><option value="5">5</option><option value="6">6</option></select></label>
      </div>
      <p class="muted small js-files-msg" role="status"></p>
      <div class="results"></div>
    </section>

    <section class="band-plain">
      <h2 class="h3">Как читать результаты</h2>
      <ul class="plain-list">
        <li><b>Нормированный прирост g</b> (Р. Хейк) — доля возможного роста, которая достигнута: g = (итог − вход) / (1 − вход). Ниже 0,3 — низкий, 0,3–0,7 — средний, выше 0,7 — высокий. Если результат снизился, используется нормированное изменение (Marx, Cummings, 2007): (итог − вход) / вход, поэтому g всегда лежит в пределах от −1 до 1.</li>
        <li><b>p</b> — вероятность получить такое или большее различие случайно. Различие принято считать значимым при p &lt; 0,05.</li>
        <li><b>r</b> — размер эффекта: 0,1 — малый, 0,3 — средний, 0,5 — большой. При малых выборках важнее размер эффекта, чем значимость.</li>
        <li>Используются непараметрические критерии: в выборке одного-двух классов нормальность распределения не гарантирована. Расчёты сверены с библиотекой SciPy.</li>
      </ul>
    </section>
  </section>`;

  const url = () => `${baseUrl()}#/test/${main.querySelector('.js-g').value}/${main.querySelector('.js-s').value}${main.querySelector('.js-grp').value ? `?group=${encodeURIComponent(main.querySelector('.js-grp').value)}` : ''}`;
  main.querySelector('.js-make').addEventListener('click', async () => {
    const field = main.querySelector('.js-url');
    main.querySelector('.link-out').hidden = false;
    field.value = url();
    field.select();
    try { await navigator.clipboard.writeText(field.value); main.querySelector('.js-link-msg').textContent = 'Ссылка скопирована.'; } catch { main.querySelector('.js-link-msg').textContent = 'Скопируйте ссылку из поля.'; }
  });
  main.querySelector('.js-try').addEventListener('click', (e) => { e.preventDefault(); location.href = url(); });

  const results = main.querySelector('.results');
  const msg = main.querySelector('.js-files-msg');
  function draw() {
    const grade = Number(main.querySelector('.js-ag').value) || undefined;
    const rows = participantsFrom(loaded, { grade });
    results.innerHTML = resultsHTML(rows);
    results.querySelector('.js-csv1')?.addEventListener('click', () => download('orfozor-uchastniki.csv', participantsCSV(rows)));
    results.querySelector('.js-csv2')?.addEventListener('click', () => download('orfozor-otvety.csv', itemsCSV(rows)));
  }
  main.querySelector('.js-ag').addEventListener('change', draw);
  main.querySelector('.js-files').addEventListener('change', async (e) => {
    const errors = [];
    const files = [];
    for (const f of e.target.files) {
      try { files.push(parseResearchFile(await f.text())); } catch (err) { errors.push(`${f.name}: ${err.message}`); }
    }
    loaded = [...loaded.filter((f) => !f.demo), ...files];
    msg.textContent = `Загружено файлов: ${files.length}${errors.length ? `. Не удалось прочитать ${errors.length}: ${errors.join('; ')}` : ''}.`;
    draw();
  });
  main.querySelector('.js-demo').addEventListener('click', () => {
    loaded = demoFiles(6);
    main.querySelector('.js-ag').value = '6';
    msg.textContent = `Загружено ${loaded.length} демонстрационных ${plural(loaded.length, 'файл', 'файла', 'файлов')}.`;
    draw();
  });
  if (loaded.length) draw();
}

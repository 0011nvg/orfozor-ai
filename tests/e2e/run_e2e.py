"""Сквозная проверка Орфозора в настоящем браузере (Playwright + Chrome/Chromium).

Запуск:  python3 -m http.server 8765  (в корне проекта), затем
         python3 tests/e2e/run_e2e.py http://localhost:8765/

Что проверяется:
 1. Каждое из всех заданий банка проходится через интерфейс верными действиями
    (клики по буквам, вариантам, запятым, ввод слова) и засчитывается как верное.
 2. Ошибочный ответ, подсказки, попадание в повторение и само повторение.
 3. Проверка темы и статус «освоена», сохранение прогресса после перезагрузки.
 4. Все маршруты открываются без ошибок JavaScript, на телефоне нет горизонтальной прокрутки.
 5. Учительская страница: ссылка для учеников и печатный лист.
"""
import asyncio
import json
import sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
CHROME = '/usr/bin/google-chrome'

PLAN_JS = """
async (id) => {
  const { itemById } = await import('./js/content/index.js');
  const { TESTS } = await import('./js/content/tests.js');
  const C = await import('./js/core/check.js');
  const testItems = Object.values(TESTS).flatMap((f) => [...f.A, ...f.B]);
  const it = itemById[id] || testItems.find((x) => x.id === id);
  const card = document.querySelector('.ex-card');
  const acts = [];
  const sel = (s) => ({ click: s });
  switch (it.t) {
    case 'gap': C.parseGaps(it.text).filter(p => p.gap).forEach((g, i) => { acts.push(sel(`.gap-slot[data-g="${i}"]`)); acts.push(sel(`.gap-options .opt[data-o="${g.correct}"]`)); }); break;
    case 'choice': case 'multi': {
      const right = it.t === 'multi' ? it.opts.filter(o => o[1]).map(o => o[0]) : [it.opts[0]];
      card.querySelectorAll('.opt-choice').forEach(b => { if (right.includes(b.querySelector('.opt-text').textContent)) acts.push(sel(`.opt-choice[data-i="${b.dataset.i}"]`)); });
      break;
    }
    case 'sort': card.querySelectorAll('.sort-row').forEach(r => { const w = r.querySelector('.sort-word').textContent; const x = it.items.find(x => C.maskedGaps(x[0]) === w); acts.push(sel(`.sort-row[data-r="${r.dataset.r}"] .opt-cat[data-c="${x[1]}"]`)); }); break;
    case 'spot': C.parseMarked(it.word).targets.forEach(t => acts.push(sel(`.letter[data-i="${t}"]`))); break;
    case 'morph': { const t = C.parseMarked(it.word).targets; acts.push(sel(`.letter[data-i="${t[0]}"]`)); acts.push(sel(`.letter[data-i="${t[t.length-1]}"]`)); break; }
    case 'fix': C.parseFix(it.text).forEach((tok, i) => { if (tok.wrong) acts.push(sel(`.token[data-i="${i}"]`)); }); break;
    case 'punct': [...C.parsePunct(it.text).commas].forEach(i => acts.push(sel(`.pslot[data-i="${i}"]`))); break;
    case 'type': acts.push({ fill: '.type-input', value: it.ans[0] }); break;
  }
  return acts;
}
"""


async def solve_current(page, wrong=False):
    item_id = await page.get_attribute('.ex-card', 'data-item')
    acts = await page.evaluate(PLAN_JS, item_id)
    for a in acts:
        if 'fill' in a:
            await page.fill(a['fill'], 'неверно' if wrong else a['value'])
        else:
            await page.click(a['click'])
    return item_id


async def main():
    failures = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME)

        # ---------- 1. Все задания банка через интерфейс ----------
        page = await browser.new_page(viewport={'width': 1280, 'height': 900})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(BASE)
        ids = await page.evaluate("(async () => (await import('./js/content/index.js')).TOPICS.flatMap(t => t.items.map(i => i.id)))()")
        print('Заданий в банке:', len(ids))
        await page.goto(BASE + '#/run?items=' + ','.join(ids) + '&title=All')
        await page.click('.js-start')
        solved = 0
        for n in range(len(ids)):
            item_id = await solve_current(page)
            await page.click('.js-check')
            ok = await page.locator('.run-feedback .note-line.is-right').count()
            if not ok:
                fb = await page.inner_text('.run-feedback')
                failures.append(f'Верный ответ не принят: {item_id}: {fb[:120]}')
            else:
                solved += 1
            await page.click('.js-check')  # «Дальше»
        summary = await page.inner_text('.summary')
        print(f'Принято верных ответов через интерфейс: {solved} из {len(ids)}')
        if f'{len(ids)}' not in summary:
            failures.append('Итоговая карточка не показывает общее число заданий')
        if errors:
            failures.append('Ошибки JS при прохождении: ' + '; '.join(errors[:5]))

        # ---------- 2. Ошибка, подсказка, повторение ----------
        ctx = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(BASE + '#/practice/g5-zs')
        await page.wait_for_selector('.ex-card')
        # первое задание: берём подсказку, затем отвечаем верно → не «сам», уходит в повторение
        await page.click('.js-hint')
        if not await page.locator('.note-line.is-hint').count():
            failures.append('Подсказка не показана')
        await solve_current(page)
        await page.click('.js-check')
        await page.click('.js-check')
        # второе задание: отвечаем неверно
        typ = await page.get_attribute('.ex-card', 'data-type')
        if typ == 'choice':
            # выбираем неверный вариант
            right = await page.evaluate("""async () => { const {itemById} = await import('./js/content/index.js'); return itemById[document.querySelector('.ex-card').dataset.item].opts[0]; }""")
            for b in await page.query_selector_all('.opt-choice'):
                if (await b.inner_text()).strip() != right:
                    await b.click(); break
            await page.click('.js-check')
            state = await page.locator('.run-feedback .note-line').get_attribute('class')
            if 'is-right' in state:
                failures.append('Неверный вариант засчитан как верный')
        # дорешиваем тренировку
        for _ in range(20):
            if await page.locator('.summary').count():
                break
            if await page.locator('.js-check.is-next').count() == 0:
                if 'disabled' in (await page.get_attribute('.js-check', 'class') or '') or await page.locator('.js-check[disabled]').count():
                    await solve_current(page)
                await page.click('.js-check')
                if await page.locator('.js-check.is-next').count() == 0:
                    # дали вторую попытку — отвечаем верно
                    await solve_current(page)
                    await page.click('.js-check')
            await page.click('.js-check')
        if not await page.locator('.summary').count():
            failures.append('Тренировка не дошла до итогов')
        review = await page.evaluate("Object.keys(JSON.parse(localStorage.getItem('orfozor:v2')).review).length")
        print('В очереди повторения после тренировки:', review)
        if review < 1:
            failures.append('Задание с подсказкой не попало в повторение')
        # повторение «раньше срока»
        await page.goto(BASE + '#/review?early=1')
        await page.wait_for_selector('.ex-card')
        for _ in range(15):
            if await page.locator('.summary').count():
                break
            await solve_current(page)
            await page.click('.js-check')
            await page.click('.js-check')
        fixed = await page.evaluate("JSON.parse(localStorage.getItem('orfozor:v2')).log.fixedInReview")
        print('Исправлено в повторении:', fixed)
        if fixed < 1:
            failures.append('Повторение не учитывает исправленные задания')

        # ---------- 3. Проверка темы → «освоена», сохранение после перезагрузки ----------
        await page.goto(BASE + '#/check/g5-zs')
        await page.wait_for_selector('.ex-card')
        if await page.locator('.js-hint').count():
            failures.append('В проверке темы доступны подсказки')
        for _ in range(6):
            await solve_current(page)
            await page.click('.js-check')
            await page.click('.js-check')
        await page.reload()
        await page.goto(BASE + '#/topic/g5-zs')
        st = await page.inner_text('.topic-status')
        print('Статус темы после проверки:', st.strip())
        if 'освоена' not in st:
            failures.append('Тема не получила статус «освоена»')

        # ---------- 4. Все маршруты, ошибки JS, ширина на телефоне ----------
        routes = ['/', '/learn', '/learn?grade=6', '/topic/g6-nn', '/practice/g6-num', '/check/g5-homo', '/review', '/diagnostic/5', '/mixed/5', '/mixed/6', '/path', '/teacher', '/teacher/g5-address', '/research', '/test/5/pre', '/about', '/nope']
        for r in routes:
            await page.goto(BASE + '#' + r)
            await page.wait_for_timeout(250)
            over = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
            if over > 1:
                failures.append(f'Горизонтальная прокрутка {over}px на телефоне: {r}')
        await page.goto(BASE + '#/diagnostic/6')
        await page.click('.js-start')
        for _ in range(9):
            await solve_current(page)
            await page.click('.js-check')
            await page.click('.js-check')
        txt = await page.inner_text('.summary')
        if 'Верно: 9 из 9' not in txt:
            failures.append('Диагностика 6 класса: неверный итог: ' + txt[:80])
        if errors:
            failures.append('Ошибки JS: ' + '; '.join(errors[:5]))

        # ---------- 5. Учитель: ссылка и печать ----------
        await ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        await page.goto(BASE + '#/teacher/g6-pron')
        await page.click('.js-link')
        url = await page.input_value('.js-url')
        if '#/run?items=' not in url:
            failures.append('Ссылка для учеников не сформирована')
        await page.click('.js-print')
        await page.wait_for_selector('.sheet')
        n_tasks = await page.locator('.sheet:not(.sheet-key) .pr-list > li').count()
        n_keys = await page.locator('.sheet-key .pr-list > li').count()
        print('Печатный лист: заданий', n_tasks, 'ключей', n_keys)
        if not n_tasks or n_tasks != n_keys:
            failures.append('Печатный лист: число заданий и ключей не совпадает')
        await page.goto(url)
        await page.click('.js-start')
        if not await page.locator('.ex-card').count():
            failures.append('Ссылка для учеников не открывает задания')

        # ---------- 6. Исследование: срез → файл участника → анализ ----------
        await page.goto(BASE + '#/test/6/pre?group=Э')
        await page.fill('input[name=code]', '6Б-07')
        await page.click('.test-form button[type=submit]')
        await page.wait_for_selector('.ex-card')
        if await page.locator('.js-hint').count():
            failures.append('В срезе доступны подсказки')
        n_test = 0
        while not await page.locator('.summary').count():
            await solve_current(page)
            await page.click('.js-check')
            if await page.locator('.note-line.is-right').count():
                failures.append('Срез показывает правильность ответа до окончания')
                break
            await page.click('.js-check')
            n_test += 1
        txt = await page.inner_text('.summary')
        if f'{n_test} из {n_test}' not in txt:
            failures.append('Срез: неверный итог ' + txt[:60])
        await page.goto(BASE + '#/path')
        async with page.expect_download() as dl:
            await page.click('.js-research')
        path = await (await dl.value).path()
        data = json.load(open(path, encoding='utf-8'))
        if data.get('participant', {}).get('code') != '6Б-07' or data['participant'].get('group') != 'Э' or not data.get('tests'):
            failures.append('Файл исследования неполный')
        if 'name' in json.dumps(data, ensure_ascii=False).lower():
            failures.append('В файле исследования есть поле name')
        await page.goto(BASE + '#/research')
        await page.set_input_files('.js-files', path)
        await page.wait_for_selector('.results table')
        res_text = await page.inner_text('.results')
        if '6Б-07' not in res_text:
            failures.append('Файл участника не попал в анализ')
        await page.click('.js-demo')
        await page.wait_for_selector('.demo-banner')
        res_text = await page.inner_text('.results')
        if 'Уилкоксон' not in res_text or 'Спирмена' not in res_text:
            failures.append('Анализ демонстрационных данных не построен')
        async with page.expect_download() as dl2:
            await page.click('.js-csv1')
        csv = open(await (await dl2.value).path(), encoding='utf-8-sig').read()
        if not csv.startswith('код;группа') or csv.count('\n') < 24:
            failures.append('CSV участников некорректен')

        # ---------- 7. Адаптивная тренировка: модель знаний меняется ----------
        await page.goto(BASE + '#/practice/g5-root')
        await page.wait_for_selector('.model-meter')
        first_step = await page.inner_text('.chip-step')
        if 'ЗАМЕЧАЮ' not in first_step.upper():
            failures.append('Первое задание новой темы не на поиск орфограммы: ' + first_step)
        for _ in range(14):
            if await page.locator('.summary').count():
                break
            await solve_current(page)
            await page.click('.js-check')
            await page.click('.js-check')
        change = await page.inner_text('.model-change') if await page.locator('.model-change').count() else ''
        print('Модель знаний после тренировки:', change.replace('\n', ' '))
        import re
        after = re.findall(r'→\s*(\d+)', change)
        if not after or int(after[0]) < 95:
            failures.append('Модель знаний не достигла порога после верных ответов: ' + change)

        # ---------- 8. ИИ-наставник (сервис подменён заглушкой) ----------
        ai_ctx = await browser.new_context(viewport={'width': 1280, 'height': 900})
        ai = await ai_ctx.new_page()
        await ai.route('**/js/config.js', lambda r: r.fulfill(content_type='text/javascript', body="export const CONFIG = { aiEndpoint: 'https://ai.example.test/tutor' };"))
        await ai.route('https://ai.example.test/**', lambda r: r.fulfill(content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps({'text': 'Корень -лаг- проверять ударением нельзя: перед Г пишется А, поэтому верно предлагать.'})))
        await ai.goto(BASE)
        gid = await ai.evaluate("(async () => (await import('./js/content/index.js')).topicById['g5-alt-letter'].items.find(i => i.t === 'gap' && i.text === 'предл[а/о]гать').id)()")
        await ai.goto(BASE + '#/run?items=' + gid + '&title=AI')
        await ai.click('.js-start')
        await ai.click('.gap-options .opt[data-o="о"]')
        await ai.click('.js-check')
        if not await ai.locator('.js-ai').count():
            failures.append('Кнопка ИИ-наставника не появилась при подключённом сервисе')
        else:
            await ai.click('.js-ai')
            await ai.wait_for_selector('.note-line.is-ai')
            if 'предлагать' not in await ai.inner_text('.note-line.is-ai'):
                failures.append('Ответ ИИ-наставника не показан')
        await ai_ctx.close()

        await browser.close()

    print()
    if failures:
        print('ОШИБКИ:')
        for f in failures:
            print(' -', f)
        sys.exit(1)
    print('Все сквозные проверки пройдены.')


asyncio.run(main())

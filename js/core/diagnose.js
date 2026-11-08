// Диагностика ошибок. Каждая ошибка относится к одному из типов, соответствующих
// составу орфографического действия: обнаружить орфограмму → определить её тип и условие
// выбора → применить правило → проверить себя в тексте. Отдельно выделены исключения,
// смысловой контекст и «ложные исправления».
// Это прозрачный алгоритм (экспертные правила), а не нейросеть: каждое решение можно объяснить.

export const ERROR_TYPES = {
  detect: {
    title: 'Не замечена орфограмма',
    advice: 'Перед выбором буквы найди «опасное место»: безударную гласную, стык приставки и корня, суффикс. Помогают задания «Замечаю» и смешанная практика.',
  },
  recognize: {
    title: 'Не определено правило или условие выбора',
    advice: 'Назови, какое это правило и от чего зависит выбор: от ударения, следующей буквы, суффикса, значения. Перечитай алгоритм темы.',
  },
  apply: {
    title: 'Правило применено неверно',
    advice: 'Проговаривай алгоритм по шагам и не пропускай ни одного: каждый шаг — это вопрос, на который нужно ответить.',
  },
  exception: {
    title: 'Не учтено исключение',
    advice: 'Выпиши исключения темы и повтори их. В разделе «Будь внимателен» на странице темы они собраны вместе.',
  },
  context: {
    title: 'Не учтён смысл или форма слова в предложении',
    advice: 'Дочитывай предложение до конца: выбор зависит от значения, вопроса к слову или противопоставления.',
  },
  overcorrect: {
    title: 'Лишняя правка',
    advice: 'Прежде чем исправить слово или поставить знак, назови правило. Нет правила — нет исправления.',
  },
  punctMissed: {
    title: 'Пропущен знак препинания',
    advice: 'Найди однородные члены или обращение и проверь, нужен ли знак между ними.',
  },
  yo: {
    title: 'Буква Ё',
    advice: 'В корнях после шипящих под ударением Ё пишется, если есть родственное слово с Е.',
  },
};

const EXC = /исключени/i;

export function classifyError(item, result, { topic, recognizeStep = false } = {}) {
  if (recognizeStep) return 'recognize';
  if (result?.yoOnly) return 'yo';
  if (item.t === 'punct') return result?.extra?.length && !result?.missed?.length ? 'overcorrect' : 'punctMissed';
  if (item.t === 'fix') return result?.extra?.length && !result?.missed?.length ? 'overcorrect' : 'detect';
  if (item.t === 'spot' || item.t === 'morph') return 'detect';
  if (EXC.test(item.why)) return 'exception';
  if (item.s === 'r') return 'recognize';
  const inSentence = typeof item.text === 'string' && /\s/.test(item.text.replace(/\[[^\]]*\]/g, ''));
  if (item.ctx || topic?.formChoice || (item.s === 't' && inSentence)) return 'context';
  return 'apply';
}

// Профиль ошибок: сколько ошибок какого типа, по всем темам или по одной.
export function errorProfile(errors, topicId) {
  const list = topicId ? errors.filter((e) => e.topicId === topicId) : errors;
  const counts = {};
  for (const e of list) counts[e.code] = (counts[e.code] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([code, n]) => ({ code, n, ...ERROR_TYPES[code] }));
}

import { topics5 } from './topics-5.js';
import { topics6 } from './topics-6.js';
import { hash } from '../core/util.js';

export const SECTIONS = {
  morphemics: 'Морфемика',
  roots: 'Корни',
  prefixes: 'Приставки',
  letters: 'Буквы после Ц, Ъ и Ь',
  noun: 'Имя существительное',
  adjective: 'Имя прилагательное',
  numeral: 'Имя числительное',
  pronoun: 'Местоимение',
  verb: 'Глагол',
  punctuation: 'Синтаксис и пунктуация',
};

export const GRADES = [5, 6];

// Устойчивый идентификатор задания: меняется только при изменении самого задания.
function itemId(topicId, item) {
  const key = [item.t, item.q, item.text, item.word, item.opts && JSON.stringify(item.opts), item.items && JSON.stringify(item.items), item.ans && item.ans.join('|')].join('¦');
  return `${topicId}:${hash(key)}`;
}

export const TOPICS = [...topics5, ...topics6].map((topic) => ({
  ...topic,
  items: topic.items.map((item) => ({ ...item, id: itemId(topic.id, item), topicId: topic.id })),
}));

export const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
export const itemById = Object.fromEntries(TOPICS.flatMap((t) => t.items.map((i) => [i.id, i])));

export const topicsOfGrade = (grade) => TOPICS.filter((t) => t.grade === grade);

export function sectionsOfGrade(grade) {
  const out = [];
  for (const t of topicsOfGrade(grade)) {
    let s = out.find((x) => x.id === t.section);
    if (!s) out.push((s = { id: t.section, title: SECTIONS[t.section], topics: [] }));
    s.topics.push(t);
  }
  return out;
}

// Источники и ссылки для раздела «Методика». Только проверяемые документы.
export const SOURCES = [
  { title: 'ФГОС основного общего образования (приказ Минпросвещения России от 31.05.2021 № 287)', url: 'http://publication.pravo.gov.ru/Document/View/0001202107050028' },
  { title: 'Федеральная образовательная программа основного общего образования (приказ Минпросвещения России от 18.05.2023 № 370)', url: 'http://publication.pravo.gov.ru/document/0001202307140040' },
  { title: 'Федеральная рабочая программа основного общего образования «Русский язык» (5–9 классы) — входит в ФОП ООО', url: 'https://edsoo.ru/' },
  { title: 'Правила русской орфографии и пунктуации. Полный академический справочник / под ред. В. В. Лопатина', url: 'https://gramota.ru/biblioteka/spravochniki/pravila-russkoy-orfografii-i-punktuatsii' },
  { title: 'Справочно-информационный портал «Грамота.ру»: правила и словари', url: 'https://gramota.ru/' },
];

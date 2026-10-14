const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const main = $('#main');
const toast = $('#toast');

const demoStudents = [
  {id:'s1', name:'Алина К.', class:'6Б', completion:92, trend:+11, risk:'ПРЕ-/ПРИ-', hints:6, sessions:8},
  {id:'s2', name:'Марк С.', class:'6Б', completion:78, trend:+4, risk:'Ы/И после приставок', hints:14, sessions:7},
  {id:'s3', name:'Софья Н.', class:'6Б', completion:96, trend:+15, risk:'перенос в текст', hints:3, sessions:10},
  {id:'s4', name:'Илья Р.', class:'6Б', completion:64, trend:-2, risk:'КОС-/КАС-', hints:19, sessions:5},
  {id:'s5', name:'Лев Т.', class:'6Б', completion:83, trend:+7, risk:'соединительные О/Е', hints:8, sessions:8},
];

const orthograms = [
  {id:'kos', title:'КОС-/КАС-', source:'Узорова, Нефёдова, 6 класс: правило и упражнения 52–59', rule:'В безударном корне КОС-/КАС- пишется А, если после корня есть суффикс -А-; без этого суффикса — О.', examples:['прикасаться','прикоснуться'], skills:['обнаружить гласную в корне','увидеть суффикс -А- после корня','выбрать букву','объяснить решение']},
  {id:'gor', title:'ГОР-/ГАР-', source:'Узорова, Нефёдова, 6 класс: правило и упражнения 60–66', rule:'В корнях с чередованием ГОР-/ГАР- в безударном положении пишется О.', examples:['загорать','загар'], skills:['определить ударность','распознать чередующийся корень','применить правило']},
  {id:'yi', title:'Ы/И после приставок', source:'Узорова, Нефёдова, 6 класс: упражнения 73–83', rule:'После приставки на согласную вместо начального И корня пишется Ы. После СВЕРХ-, МЕЖ-, ДЕЗ-, КОНТР- сохраняется И.', examples:['разыграть','сверхинтересный'], skills:['выделить приставку','найти начальную И в исходном слове','проверить исключающие приставки','выбрать Ы/И']},
  {id:'prepri', title:'ПРЕ-/ПРИ-', source:'Узорова, Нефёдова, 6 класс: упражнения 84–101; Ларионова: блок «Правописание приставок при- и пре-»', rule:'ПРИ-: присоединение, приближение, близость, неполное действие. ПРЕ-: значение близко к «очень» или к ПЕРЕ-.', examples:['привязать','пресильный'], skills:['заметить приставку','определить значение','соотнести со смысловой группой','проверить написание в контексте']},
  {id:'oe', title:'Соединительные О/Е', source:'Узорова, Нефёдова, 6 класс: упражнения 102–111', rule:'В сложных словах после твёрдых согласных пишется соединительная О, после мягких согласных, шипящих и Ц — Е.', examples:['паровоз','землемер'], skills:['найти границу основ','определить конечный согласный первой основы','выбрать О/Е']},
  {"id": "chik", "title": "-ЧИК- / -ЩИК-", "source": "Узорова—Нефёдова: суффиксы существительных -ЧИК-/-ЩИК-", "rule": "После д, т, з, с, ж перед суффиксом лица пишется -чик-, в других случаях обычно -щик-.", "examples": ["переводчик", "каменщик"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "ekik", "title": "-ЕК- / -ИК-", "source": "Узорова—Нефёдова: суффиксы существительных -ЕК-/-ИК-", "rule": "Если при изменении формы слова гласная суффикса выпадает, пишется -ек-; если сохраняется — -ик-.", "examples": ["замочек", "ключик"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "nne", "title": "Н / НН в прилагательных", "source": "Узорова—Нефёдова: одна и две Н в суффиксах прилагательных", "rule": "В отымённых прилагательных НН пишется в суффиксах -онн-, -енн- (традиционный, жизненный), а также при добавлении суффикса -н- к основе на Н (длина → длинный; осень → осенний). В суффиксах -ан-, -ян-, -ин- обычно одна Н (кожаный, глиняный, гусиный). Исключения: стеклянный, оловянный, деревянный. Краткая форма сохраняет число Н полной: длинный — длинна.", "examples": ["деревянный", "глиняный"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "imper", "title": "Ь в повелительном наклонении", "source": "Узорова—Нефёдова: мягкий знак в повелительном наклонении", "rule": "В повелительном наклонении после мягких согласных и шипящих на конце глагола пишется Ь; он сохраняется перед -ся и -те.", "examples": ["отрежь", "отрежьте"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "verbs", "title": "-ОВА-/-ЕВА- и -ЫВА-/-ИВА-", "source": "Узорова—Нефёдова: гласные в суффиксах глаголов", "rule": "Форма на -ую/-юю помогает выбрать -ова-/-ева-, форма на -ываю/-иваю — -ыва-/-ива-.", "examples": ["советовать", "опаздывать"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "hyphen", "title": "Дефис в местоимениях", "source": "Узорова—Нефёдова: дефис в неопределённых местоимениях", "rule": "Неопределённые местоимения с кое-, -то, -либо, -нибудь пишутся через дефис; при предлоге после кое слова пишутся раздельно.", "examples": ["кто-нибудь", "кое с кем"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "neNoun", "title": "НЕ с существительными", "source": "Узорова—Нефёдова: НЕ с существительными", "rule": "НЕ пишется слитно, если слово без НЕ не употребляется или можно подобрать синоним без НЕ; при противопоставлении с союзом А — раздельно.", "examples": ["неправда", "не друг, а враг"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "neAdj", "title": "НЕ с прилагательными", "source": "Узорова—Нефёдова: НЕ с прилагательными", "rule": "НЕ может писаться слитно при замене синонимом без НЕ; раздельно при противопоставлении с союзом А и в ряде других контекстов.", "examples": ["невысокий", "не высокий, а низкий"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "numeral", "title": "Ь в числительных", "source": "Узорова—Нефёдова: мягкий знак в числительных", "rule": "В числительных от 5 до 20 и 30 мягкий знак пишется на конце, а в формах 50–80 и 500–900 — в середине.", "examples": ["пять", "пятьдесят"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},
  {"id": "oesh", "title": "О/Е после шипящих в суффиксах существительных", "source": "Узорова—Нефёдова: О/Е после шипящих в суффиксах существительных", "rule": "Под ударением после шипящих в суффиксах существительных пишется О, без ударения — Е.", "examples": ["дружок", "орешек"], "skills": ["заметить опасную позицию", "распознать морфему или условие", "объяснить написание", "применить в контексте"]},

];

const diagnosticTasks = [
  {
    "id": "d1",
    "type": "spot",
    "stage": 1,
    "topic": "kos",
    "title": "Найди опасное место",
    "prompt": "Нажми на букву, где нужно применить орфографическое правило.",
    "word": "прикасаться",
    "correct": [
      4
    ],
    "explanation": "Опасное место — гласная А в корне -кас-. Сначала важно заметить позицию, а уже потом применять правило."
  },
  {
    "id": "d2",
    "type": "choice",
    "stage": 2,
    "topic": "kos",
    "title": "Распознай условие",
    "prompt": "Что определяет выбор А/О в корне КОС-/КАС-?",
    "options": [
      "Есть ли суффикс -А- после корня",
      "Какая часть речи перед нами",
      "Стоит ли слово в конце предложения"
    ],
    "correct": 0,
    "explanation": "Для этой орфограммы ключевой признак — суффикс -А- после корня."
  },
  {
    "id": "d3",
    "type": "choice",
    "stage": 3,
    "topic": "yi",
    "title": "Выбери написание",
    "prompt": "Как написать слово?",
    "stem": "раз…грать",
    "options": [
      "разыграть",
      "разиграть"
    ],
    "correct": 0,
    "explanation": "После приставки раз- на согласную начальное И корня меняется на Ы."
  },
  {
    "id": "d4",
    "type": "choice",
    "stage": 2,
    "topic": "prepri",
    "title": "Определи значение",
    "prompt": "Почему в слове «прибежать» пишется ПРИ-?",
    "options": [
      "приближение",
      "значение «очень»",
      "значение ПЕРЕ-"
    ],
    "correct": 0,
    "explanation": "В этом слове приставка обозначает приближение."
  },
  {
    "id": "d5",
    "type": "choice",
    "stage": 3,
    "topic": "oe",
    "title": "Выбери соединительную гласную",
    "prompt": "Какое написание верно?",
    "options": [
      "паровоз",
      "паревоз"
    ],
    "correct": 0,
    "explanation": "После твёрдого согласного первой основы используется соединительная О."
  },
  {
    "id": "d6",
    "type": "editor",
    "stage": 4,
    "topic": "kos",
    "title": "Редактор",
    "prompt": "Исправь слово и введи правильный вариант.",
    "text": "прикосаться",
    "expected": "прикасаться",
    "explanation": "В слове есть суффикс -а- после корня, поэтому пишется -кас-."
  },
  {
    "id": "d7",
    "type": "choice",
    "stage": 3,
    "topic": "yi",
    "title": "Объясни правило",
    "prompt": "Почему пишется И в слове «сверхинтересный»?",
    "explanation": "После сверх- и меж- начальная И корня сохраняется. Здесь не нужен подбор проверочного слова.",
    "options": [
      "После сверх- сохраняется начальная И корня.",
      "После любой приставки на согласную пишется Ы.",
      "Гласную И здесь нужно проверить ударением."
    ],
    "correct": 0
  }
];

const trainerBank = [
  {
    "id": "t1",
    "type": "spot",
    "stage": 1,
    "topic": "prepri",
    "title": "ЗАМЕЧАЮ",
    "prompt": "Где находится место выбора в слове?",
    "word": "привязать",
    "correct": [
      2
    ],
    "explanation": "Ты отметил гласную в приставке при-. Это и есть позиция, где возможна ошибка."
  },
  {
    "id": "t2",
    "type": "choice",
    "stage": 2,
    "topic": "prepri",
    "title": "РАСПОЗНАЮ",
    "prompt": "Какое значение у ПРИ- в слове «привязать»?",
    "options": [
      "присоединение",
      "очень",
      "пере-"
    ],
    "correct": 0,
    "explanation": "«Привязать» связано с присоединением одного к другому."
  },
  {
    "id": "t3",
    "type": "choice",
    "stage": 3,
    "topic": "prepri",
    "title": "ОБЪЯСНЯЮ",
    "prompt": "Выбери алгоритм для слова «приморский».",
    "options": [
      "Определить значение приставки",
      "Проверить ударением",
      "Найти суффикс -А-"
    ],
    "correct": 0,
    "explanation": "Для ПРЕ-/ПРИ- сначала определяем значение приставки в конкретном слове."
  },
  {
    "id": "t4",
    "type": "editor",
    "stage": 4,
    "topic": "prepri",
    "title": "ПРИМЕНЯЮ",
    "prompt": "Исправь ошибку.",
    "text": "присмешной рассказ",
    "expected": "пресмешной рассказ",
    "explanation": "ПРЕ- здесь близко по значению к «очень»: очень смешной."
  },
  {
    "id": "t5",
    "type": "spot",
    "stage": 1,
    "topic": "yi",
    "title": "ЗАМЕЧАЮ",
    "prompt": "Найди букву, где срабатывает правило после приставки.",
    "word": "разыграть",
    "correct": [
      3
    ],
    "explanation": "Опасное место — Ы после приставки раз-."
  },
  {
    "id": "t6",
    "type": "choice",
    "stage": 2,
    "topic": "yi",
    "title": "РАСПОЗНАЮ",
    "prompt": "Какая приставка сохраняет И?",
    "options": [
      "сверх-",
      "раз-",
      "без-"
    ],
    "correct": 0,
    "explanation": "После СВЕРХ- сохраняется И."
  },
  {
    "id": "t7",
    "type": "choice",
    "stage": 3,
    "topic": "yi",
    "title": "ОБЪЯСНЯЮ",
    "prompt": "Выбери верное написание.",
    "options": [
      "безыдейный",
      "безидейный"
    ],
    "correct": 0,
    "explanation": "После приставки без- на согласную начальное И меняется на Ы."
  },
  {
    "id": "t8",
    "type": "editor",
    "stage": 4,
    "topic": "yi",
    "title": "ПРИМЕНЯЮ",
    "prompt": "Исправь сочетание.",
    "text": "сверхынтересный проект",
    "expected": "сверхинтересный проект",
    "explanation": "СВЕРХ- входит в группу приставок, после которых И сохраняется."
  },
  {
    "id": "t9",
    "type": "spot",
    "stage": 1,
    "topic": "kos",
    "title": "ЗАМЕЧАЮ",
    "prompt": "Найди орфографически опасную гласную.",
    "word": "прикоснуться",
    "correct": [
      4
    ],
    "explanation": "Опасная гласная — О в корне -кос-."
  },
  {
    "id": "t10",
    "type": "choice",
    "stage": 2,
    "topic": "kos",
    "title": "РАСПОЗНАЮ",
    "prompt": "Есть ли после корня суффикс -А- в слове «прикасаться»?",
    "options": [
      "да",
      "нет"
    ],
    "correct": 0,
    "explanation": "После корня -кас- есть суффикс -а-."
  },
  {
    "id": "t11",
    "type": "choice",
    "stage": 3,
    "topic": "kos",
    "title": "ОБЪЯСНЯЮ",
    "prompt": "Выбери правильную пару.",
    "options": [
      "прикасаться — прикоснуться",
      "прикосаться — прикаснуться"
    ],
    "correct": 0,
    "explanation": "Наличие суффикса -А- после корня определяет написание -кас-."
  },
  {
    "id": "t12",
    "type": "editor",
    "stage": 4,
    "topic": "kos",
    "title": "ПРИМЕНЯЮ",
    "prompt": "Исправь предложение.",
    "text": "Не прикосайся к стеклу.",
    "expected": "Не прикасайся к стеклу.",
    "explanation": "В форме «прикасайся» после корня стоит -а-, поэтому пишется -кас-."
  },
  {
    "id": "t13",
    "type": "choice",
    "stage": 1,
    "topic": "oe",
    "title": "ЗАМЕЧАЮ",
    "prompt": "Где находится соединительная гласная в слове «паровоз»?",
    "options": [
      "между двумя основами",
      "в окончании",
      "в приставке"
    ],
    "correct": 0,
    "explanation": "Соединительная гласная связывает основы сложного слова."
  },
  {
    "id": "t14",
    "type": "choice",
    "stage": 2,
    "topic": "oe",
    "title": "РАСПОЗНАЮ",
    "prompt": "После какого согласного первой основы обычно выбираем О?",
    "options": [
      "твёрдого",
      "мягкого",
      "шипящего"
    ],
    "correct": 0,
    "explanation": "После твёрдого согласного пишется соединительная О."
  },
  {
    "id": "t15",
    "type": "editor",
    "stage": 4,
    "topic": "oe",
    "title": "ПРИМЕНЯЮ",
    "prompt": "Исправь слово.",
    "text": "паревоз",
    "expected": "паровоз",
    "explanation": "После твёрдого Р первой основы — соединительная О."
  },
  {
    "id": "new-chik-spot",
    "type": "spot",
    "stage": 1,
    "topic": "chik",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "переводчик",
    "correct": [
      7
    ],
    "explanation": "После д пишется -чик-."
  },
  {
    "id": "new-chik-rule",
    "type": "choice",
    "stage": 2,
    "topic": "chik",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «переводчик»?",
    "options": [
      "После д, т, з, с, ж перед суффиксом лица пишется -чик-, в других случаях обычно -щик-.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "После д пишется -чик-."
  },
  {
    "id": "new-chik-choose",
    "type": "choice",
    "stage": 3,
    "topic": "chik",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "переводчик",
      "переводщик"
    ],
    "correct": 0,
    "explanation": "После д пишется -чик-."
  },
  {
    "id": "new-chik-editor",
    "type": "editor",
    "stage": 4,
    "topic": "chik",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "переводщик",
    "expected": "переводчик",
    "explanation": "После д пишется -чик-."
  },
  {
    "id": "new-ekik-spot",
    "type": "spot",
    "stage": 1,
    "topic": "ekik",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "замочек",
    "correct": [
      5
    ],
    "explanation": "Замочек — замочка: гласная выпадает, поэтому -ек-."
  },
  {
    "id": "new-ekik-rule",
    "type": "choice",
    "stage": 2,
    "topic": "ekik",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «замочек»?",
    "options": [
      "Если при изменении формы слова гласная суффикса выпадает, пишется -ек-; если сохраняется — -ик-.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "Замочек — замочка: гласная выпадает, поэтому -ек-."
  },
  {
    "id": "new-ekik-choose",
    "type": "choice",
    "stage": 3,
    "topic": "ekik",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "замочек",
      "замочик"
    ],
    "correct": 0,
    "explanation": "Замочек — замочка: гласная выпадает, поэтому -ек-."
  },
  {
    "id": "new-ekik-editor",
    "type": "editor",
    "stage": 4,
    "topic": "ekik",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "замочик",
    "expected": "замочек",
    "explanation": "Замочек — замочка: гласная выпадает, поэтому -ек-."
  },
  {
    "id": "new-nne-spot",
    "type": "spot",
    "stage": 1,
    "topic": "nne",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "глиняный",
    "correct": [
      5
    ],
    "explanation": "В суффиксе -ян- обычно пишется одна Н."
  },
  {
    "id": "new-nne-rule",
    "type": "choice",
    "stage": 2,
    "topic": "nne",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «глиняный»?",
    "options": [
      "В отымённых прилагательных НН пишется в суффиксах -енн-, -онн- и при присоединении -н- к основе на Н; в -ан-, -ян-, -ин- обычно одна Н, кроме слов деревянный, стеклянный, оловянный.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "В суффиксе -ян- обычно пишется одна Н."
  },
  {
    "id": "new-nne-choose",
    "type": "choice",
    "stage": 3,
    "topic": "nne",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "глиняный",
      "глинянный"
    ],
    "correct": 0,
    "explanation": "В суффиксе -ян- обычно пишется одна Н."
  },
  {
    "id": "new-nne-editor",
    "type": "editor",
    "stage": 4,
    "topic": "nne",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "глинянный",
    "expected": "глиняный",
    "explanation": "В суффиксе -ян- обычно пишется одна Н."
  },
  {
    "id": "new-imper-spot",
    "type": "spot",
    "stage": 1,
    "topic": "imper",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "отрежь",
    "correct": [
      5
    ],
    "explanation": "В форме повелительного наклонения после ж пишется Ь."
  },
  {
    "id": "new-imper-rule",
    "type": "choice",
    "stage": 2,
    "topic": "imper",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «отрежь»?",
    "options": [
      "В повелительном наклонении после мягких согласных и шипящих на конце глагола пишется Ь; он сохраняется перед -ся и -те.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "В форме повелительного наклонения после ж пишется Ь."
  },
  {
    "id": "new-imper-choose",
    "type": "choice",
    "stage": 3,
    "topic": "imper",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "отрежь",
      "отреж"
    ],
    "correct": 0,
    "explanation": "В форме повелительного наклонения после ж пишется Ь."
  },
  {
    "id": "new-imper-editor",
    "type": "editor",
    "stage": 4,
    "topic": "imper",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "отреж",
    "expected": "отрежь",
    "explanation": "В форме повелительного наклонения после ж пишется Ь."
  },
  {
    "id": "new-verbs-spot",
    "type": "spot",
    "stage": 1,
    "topic": "verbs",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "советовать",
    "correct": [
      5
    ],
    "explanation": "Советую — значит, в инфинитиве -ова-."
  },
  {
    "id": "new-verbs-rule",
    "type": "choice",
    "stage": 2,
    "topic": "verbs",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «советовать»?",
    "options": [
      "Форма на -ую/-юю помогает выбрать -ова-/-ева-, форма на -ываю/-иваю — -ыва-/-ива-.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "Советую — значит, в инфинитиве -ова-."
  },
  {
    "id": "new-verbs-choose",
    "type": "choice",
    "stage": 3,
    "topic": "verbs",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "советовать",
      "советывать"
    ],
    "correct": 0,
    "explanation": "Советую — значит, в инфинитиве -ова-."
  },
  {
    "id": "new-verbs-editor",
    "type": "editor",
    "stage": 4,
    "topic": "verbs",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "советывать",
    "expected": "советовать",
    "explanation": "Советую — значит, в инфинитиве -ова-."
  },
  {
    "id": "new-hyphen-spot",
    "type": "spot",
    "stage": 1,
    "topic": "hyphen",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "кто-нибудь",
    "correct": [
      3
    ],
    "explanation": "Частица -нибудь пишется через дефис."
  },
  {
    "id": "new-hyphen-rule",
    "type": "choice",
    "stage": 2,
    "topic": "hyphen",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «кто-нибудь»?",
    "options": [
      "Неопределённые местоимения с кое-, -то, -либо, -нибудь пишутся через дефис; при предлоге после кое слова пишутся раздельно.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "Частица -нибудь пишется через дефис."
  },
  {
    "id": "new-hyphen-choose",
    "type": "choice",
    "stage": 3,
    "topic": "hyphen",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "кто-нибудь",
      "кто нибудь"
    ],
    "correct": 0,
    "explanation": "Частица -нибудь пишется через дефис."
  },
  {
    "id": "new-hyphen-editor",
    "type": "editor",
    "stage": 4,
    "topic": "hyphen",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "кто нибудь",
    "expected": "кто-нибудь",
    "explanation": "Частица -нибудь пишется через дефис."
  },
  {
    "id": "new-neNoun-spot",
    "type": "spot",
    "stage": 1,
    "topic": "neNoun",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "неправда",
    "correct": [
      1
    ],
    "explanation": "Неправда = ложь: можно подобрать синоним без НЕ."
  },
  {
    "id": "new-neNoun-rule",
    "type": "choice",
    "stage": 2,
    "topic": "neNoun",
    "title": "Выбери объяснение",
    "prompt": "Какое правило объясняет «Он рассказал неправду (=ложь)» без противопоставления?",
    "options": [
      "НЕ пишется слитно, если слово без НЕ не употребляется или можно подобрать синоним без НЕ; при противопоставлении с союзом А — раздельно.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "Неправда = ложь: можно подобрать синоним без НЕ."
  },
  {
    "id": "new-neNoun-choose",
    "type": "choice",
    "stage": 3,
    "topic": "neNoun",
    "title": "Орфографическая дуэль",
    "prompt": "Где НЕ с существительным написано по смыслу предложения?",
    "stem": "Он сказал …, чтобы скрыть ошибку (значение: ложь).",
    "options": [
      "Это была не правда, а вымысел.",
      "Это была неправда, а вымысел."
    ],
    "correct": 0,
    "explanation": "Противопоставление «не правда, а вымысел» требует раздельного написания НЕ."
  },
  {
    "id": "new-neNoun-editor",
    "type": "editor",
    "stage": 4,
    "topic": "neNoun",
    "title": "Литературный редактор",
    "prompt": "Исправь НЕ при явном противопоставлении.",
    "text": "Это была неправда, а вымысел.",
    "expected": "Это была не правда, а вымысел.",
    "explanation": "При противопоставлении с союзом А пишем НЕ отдельно: не правда, а вымысел."
  },
  {
    "id": "new-neAdj-spot",
    "type": "spot",
    "stage": 1,
    "topic": "neAdj",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "невысокий",
    "correct": [
      1
    ],
    "explanation": "Невысокий = низкий: без противопоставления возможно слитное написание."
  },
  {
    "id": "new-neAdj-rule",
    "type": "choice",
    "stage": 2,
    "topic": "neAdj",
    "title": "Выбери объяснение",
    "prompt": "Какое правило объясняет «невысокий дом» в значении «низкий дом» (без противопоставления)?",
    "options": [
      "НЕ может писаться слитно при замене синонимом без НЕ; раздельно при противопоставлении с союзом А и в ряде других контекстов.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "Невысокий = низкий: без противопоставления возможно слитное написание."
  },
  {
    "id": "new-neAdj-choose",
    "type": "choice",
    "stage": 3,
    "topic": "neAdj",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание верно при явном противопоставлении? Прочитай предложение полностью.",
    "stem": "Подбери написание, если слово означает «низкий» и противопоставления нет: … дом.",
    "options": [
      "На выставке стоял не высокий, а низкий шкаф.",
      "На выставке стоял невысокий, а низкий шкаф."
    ],
    "correct": 0,
    "explanation": "При противопоставлении с союзом А: не высокий, а низкий. Частица НЕ пишется раздельно."
  },
  {
    "id": "new-neAdj-editor",
    "type": "editor",
    "stage": 4,
    "topic": "neAdj",
    "title": "Литературный редактор",
    "prompt": "Исправь НЕ с прилагательным в контексте противопоставления.",
    "text": "Это невысокий, а низкий забор.",
    "expected": "Это не высокий, а низкий забор.",
    "explanation": "В предложении противопоставляются признаки «высокий» и «низкий», поэтому пишем НЕ отдельно: не высокий, а низкий."
  },
  {
    "id": "new-numeral-spot",
    "type": "spot",
    "stage": 1,
    "topic": "numeral",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "пятьдесят",
    "correct": [
      3
    ],
    "explanation": "В числительном пятьдесят мягкий знак пишется в середине."
  },
  {
    "id": "new-numeral-rule",
    "type": "choice",
    "stage": 2,
    "topic": "numeral",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «пятьдесят»?",
    "options": [
      "В числительных от 5 до 20 и 30 мягкий знак пишется на конце, а в формах 50–80 и 500–900 — в середине.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "В числительном пятьдесят мягкий знак пишется в середине."
  },
  {
    "id": "new-numeral-choose",
    "type": "choice",
    "stage": 3,
    "topic": "numeral",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "пятьдесят",
      "пятдесят"
    ],
    "correct": 0,
    "explanation": "В числительном пятьдесят мягкий знак пишется в середине."
  },
  {
    "id": "new-numeral-editor",
    "type": "editor",
    "stage": 4,
    "topic": "numeral",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "пятдесят",
    "expected": "пятьдесят",
    "explanation": "В числительном пятьдесят мягкий знак пишется в середине."
  },
  {
    "id": "new-oesh-spot",
    "type": "spot",
    "stage": 1,
    "topic": "oesh",
    "title": "Найди орфограмму",
    "prompt": "Нажми на букву или знак, требующие особого внимания.",
    "word": "дружок",
    "correct": [
      4
    ],
    "explanation": "В суффиксе -ок- после ж под ударением пишется О."
  },
  {
    "id": "new-oesh-rule",
    "type": "choice",
    "stage": 2,
    "topic": "oesh",
    "title": "Выбери объяснение",
    "prompt": "Какое правило поможет объяснить написание «дружок»?",
    "options": [
      "Под ударением после шипящих в суффиксах существительных пишется О, без ударения — Е.",
      "Нужно подобрать проверочное слово с ударной гласной в корне.",
      "Это написание всегда зависит только от части речи."
    ],
    "correct": 0,
    "explanation": "В суффиксе -ок- после ж под ударением пишется О."
  },
  {
    "id": "new-oesh-choose",
    "type": "choice",
    "stage": 3,
    "topic": "oesh",
    "title": "Орфографическая дуэль",
    "prompt": "Какое написание правильно в данном примере?",
    "options": [
      "дружок",
      "дружек"
    ],
    "correct": 0,
    "explanation": "В суффиксе -ок- после ж под ударением пишется О."
  },
  {
    "id": "new-oesh-editor",
    "type": "editor",
    "stage": 4,
    "topic": "oesh",
    "title": "Литературный редактор",
    "prompt": "Исправь орфографическую ошибку и запиши слово верно.",
    "text": "дружек",
    "expected": "дружок",
    "explanation": "В суффиксе -ок- после ж под ударением пишется О."
  }
];

const basePassport = {
  detection:72, recognition:64, ruleUse:76, selfCorrection:58, transfer:61,
  mastered:['ГОР-/ГАР-'], training:['ПРЕ-/ПРИ-','Ы/И после приставок'],
  recurrent:['не всегда определяет смысл ПРИ-','после СВЕРХ- иногда выбирает Ы'],
  speed:'22 с/задание', streak:6,
};

let state = JSON.parse(localStorage.getItem('orfozor-state') || 'null') || {
  diagnosticIndex:0, diagnosticResults:[], diagnosticDone:false,
  trainingIndex:0, trainingQueue:['t1','t2','t3','t4','t5','t6'], trainingResults:[],
  hintsUsed:0, currentHint:0, lastStudentId:'s4',
};
function save(){localStorage.setItem('orfozor-state',JSON.stringify(state));}
function resetDemo(){localStorage.removeItem('orfozor-state'); location.hash='#home'; location.reload();}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}

const routeMap = {
  home:renderHome, diagnosis:renderDiagnosis, trainer:renderTrainer, result:renderResult,
  passport:renderPassport, student:renderStudent, teacher:renderTeacher, class:renderClass,
  studentprofile:renderStudentProfile, creator:renderCreator, worksheet:renderWorksheet, library:renderLibrary, games:renderGames,
  research:renderResearch, method:renderMethod, about:renderAbout
};
function navigate(route){location.hash='#'+route;}
function route(){const r=(location.hash||'#home').slice(1).split('?')[0];(routeMap[r]||renderHome)();window.scrollTo(0,0);closeMenu();}
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{const game=e.target.closest('[data-game]');if(game){navigate('games?mode='+game.dataset.game);return;}const btn=e.target.closest('[data-route]');if(btn) navigate(btn.dataset.route)});
$('#navToggle').addEventListener('click',()=>{const n=$('#mainNav');const open=n.classList.toggle('open');$('#navToggle').setAttribute('aria-expanded',open)});
function closeMenu(){$('#mainNav').classList.remove('open');$('#navToggle').setAttribute('aria-expanded','false')}

function page(inner, cls=''){main.innerHTML=`<div class="page ${cls}">${inner}<div class="footer-note">ОрфоЗор AI · литературная лаборатория правописания · интерактивный прототип. Все данные учеников вымышлены и обезличены.</div></div>`}
function metricCard(title,value,sub,extra=''){return `<article class="card ${extra}"><h3>${title}</h3><div class="metric">${value}</div><div class="metric-sub">${sub}</div></article>`}
function progress(label,value){return `<div class="progress-label"><span>${label}</span><strong>${value}%</strong></div><div class="progress" aria-label="${label}: ${value}%"><span style="width:${value}%"></span></div>`}

function renderHome(){
 page(`
   <section class="hero literary-hero reference-hero" aria-labelledby="orfo-title">
     <div class="hero-story">
       <div class="edition-line"><span>ОРФОЗОР AI / ЛИТЕРАТУРНАЯ МАСТЕРСКАЯ</span><span class="edition-issue">5–6 классы · выпуск 01</span></div>
       <p class="marginal-note">Замечать.<br>Понимать.<br>Писать уверенно. <span aria-hidden="true">♡</span></p>
       <p class="eyebrow hero-overline">Русский язык — это больше, чем правила</p>
       <h1 id="orfo-title">Лаборатория<br><span>русского</span><br>слова</h1>
       <p class="hero-lead">Развиваем орфографическую зоркость у учеников 5–6 классов.</p>
       <p class="hero-copy">Замечаем орфограммы, понимаем закономерности, разбираем слова и учимся писать грамотно — шаг за шагом.</p>
       <div class="hero-actions"><button class="btn blue" data-route="diagnosis">Начать диагностику <span aria-hidden="true">↗</span></button><button class="btn secondary" data-route="library">Открыть библиотеку <span aria-hidden="true">→</span></button></div>
       <div class="hero-colophon"><span aria-hidden="true">✧</span><span>ЗАМЕЧАЮ · РАСПОЗНАЮ · ОБЪЯСНЯЮ · ПРИМЕНЯЮ</span></div>
     </div>
     <div class="hero-collage reference-collage" aria-label="Журнальный коллаж с буквами «Русский язык», книгами, тетрадью и письменными заметками">
       <div class="hero-art" aria-hidden="true"></div>
       <div class="hero-demo" aria-label="Интерактивная орфографическая разминка">
         <div class="demo-label"><span>ПРОБА ПЕРА · № 01</span><span>1 действие</span></div>
         <p class="word-prompt">Где прячется орфограмма?</p>
         <div class="word-stage"><div class="big-word" id="heroWord" aria-label="Слово прикасаться"></div></div>
         <div id="heroFeedback" class="feedback" aria-live="polite"></div>
         <p class="micro">Нажми на букву, написание которой нужно объяснить правилом.</p>
       </div>
     </div>
   </section>
   <section class="section entry-section reference-entry" aria-labelledby="entry-heading">
     <div class="section-head"><div><p class="eyebrow">СТРАНИЦА 02 / КОМУ И ЧЕМ ПОМОЖЕМ</p><h2 id="entry-heading">Найди свою <em>страницу</em></h2></div><p class="section-intro">От маленького открытия до уверенной грамотности. Каждому — своя дорога.</p></div>
     <div class="entry-grid">
       <button class="entry-card entry-learner" data-route="student"><span class="entry-num">01 / УЧЕНИКУ</span><span class="entry-art" aria-hidden="true"></span><strong>Я ученик <span aria-hidden="true">↗</span></strong><span>Играй, тренируйся и открывай русский язык.</span></button>
       <button class="entry-card entry-teacher" data-route="teacher"><span class="entry-num">02 / УЧИТЕЛЮ</span><span class="entry-art" aria-hidden="true"></span><strong>Я учитель <span aria-hidden="true">↗</span></strong><span>Диагностика, задания и работа с классом.</span></button>
       <button class="entry-card entry-library" data-route="library"><span class="entry-num">03 / БИБЛИОТЕКА</span><span class="entry-art" aria-hidden="true"></span><strong>Орфограммы <span aria-hidden="true">↗</span></strong><span>Правила, алгоритмы, примеры и тренажёры.</span></button>
       <button class="entry-card entry-print" data-route="worksheet"><span class="entry-num">04 / МАСТЕРСКАЯ</span><span class="entry-art" aria-hidden="true"></span><strong>Печатные работы <span aria-hidden="true">↗</span></strong><span>Собери варианты заданий и ключи к ним.</span></button>
     </div>
   </section>
   <section class="section home-games" aria-labelledby="home-games-title">
     <div class="section-head"><div><p class="eyebrow">СТРАНИЦА 03 / УЧИМСЯ ИГРАЯ</p><h2 id="home-games-title">Игровая <em>практика</em></h2></div><p class="section-intro handnote">Играй. Ищи подсказки.<br>Находи закономерности. ♡</p></div>
     <div class="home-games-grid">
       <button class="home-game game-hunt" data-game="hunt"><span class="home-game-index">ДЕЛО № 01</span><span class="home-game-art" aria-hidden="true"></span><strong>Орфоохота <span aria-hidden="true">↗</span></strong><span>Найди опасные места в словах.</span><small>ВНИМАТЕЛЬНОСТЬ</small></button>
       <button class="home-game game-editor" data-game="editor"><span class="home-game-index">ДЕЛО № 02</span><span class="home-game-art" aria-hidden="true"></span><strong>Редактор вырезок <span aria-hidden="true">↗</span></strong><span>Исправь ошибки в газетных заметках.</span><small>САМОИСПРАВЛЕНИЕ</small></button>
       <button class="home-game game-build" data-game="build"><span class="home-game-index">ДЕЛО № 03</span><span class="home-game-art" aria-hidden="true"></span><strong>Слово-конструктор <span aria-hidden="true">↗</span></strong><span>Выбери букву и объясни правило.</span><small>АЛГОРИТМ</small></button>
       <button class="home-game game-detective" data-game="detective"><span class="home-game-index">ДЕЛО № 04</span><span class="home-game-art" aria-hidden="true"></span><strong>Орфо-детектив <span aria-hidden="true">↗</span></strong><span>Разбери причину ошибки.</span><small>АНАЛИЗ ОШИБОК</small></button>
     </div>
   </section>
   <section class="section method-section reference-method" aria-labelledby="method-heading">
     <div class="section-head"><div><p class="eyebrow">СТРАНИЦА 04 / МЕТОДИКА</p><h2 id="method-heading">Как работает <em>ОрфоЗор</em></h2></div><p class="section-intro">Не просто проверяем букву, а учимся понимать, почему она пишется именно так.</p></div>
     <div class="flow"><div class="flow-step"><b>01 · Диагностика</b>Находим сильные стороны и зоны роста.</div><div class="flow-step"><b>02 · Анализ</b>Выясняем, на каком шаге появилась трудность.</div><div class="flow-step"><b>03 · Практика</b>Подбираем упражнения и игровые задания.</div><div class="flow-step"><b>04 · Поддержка</b>Объясняем правило и предлагаем подсказки.</div><div class="flow-step"><b>05 · Динамика</b>Видим прогресс, а не только количество ошибок.</div></div>
     <p class="method-footnote">Маленькие шаги — большие открытия. <span aria-hidden="true">♡</span></p>
   </section>
   <div class="collage-bottom" aria-hidden="true"></div>
 `);
 renderClickableWord('heroWord','прикасаться',[4],(ok)=>{const f=$('#heroFeedback');f.className='feedback show '+(ok?'ok':'retry');f.innerHTML=ok?'✓ <strong>Верно.</strong> Ты заметил орфограмму.':'↺ <strong>Попробуй ещё.</strong> Найди гласную корня, написание которой зависит от суффикса -А-.'});
}

function renderClickableWord(containerId, word, correctIndices, cb){
 const box=$('#'+containerId); if(!box)return;
 box.innerHTML=[...word].map((ch,i)=>`<button class="letter" aria-label="Буква ${ch}, позиция ${i+1}" data-i="${i}">${ch}</button>`).join('');
 $$('.letter',box).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i;$$('.letter',box).forEach(x=>x.classList.remove('selected'));b.classList.add('selected');const ok=correctIndices.includes(i);if(ok)b.classList.add('correct');cb(ok,i)}));
}

function renderDiagnosis(){
 if(state.diagnosticDone){navigate('result');return}
 const t=diagnosticTasks[state.diagnosticIndex];
 const pct=Math.round((state.diagnosticIndex/diagnosticTasks.length)*100);
 page(`<section class="task-shell">
  <p class="eyebrow">Стартовая диагностика</p>
  <div class="task-top"><div><div class="task-type">${t.title}</div><h1>${t.prompt}</h1></div><div style="min-width:180px">${progress(`${state.diagnosticIndex+1} из ${diagnosticTasks.length}`,pct)}</div></div>
  <div class="callout"><strong>Давай узнаем, какие задания тебе уже даются легко, а что стоит потренировать.</strong> Это не контрольная работа. Здесь важно понять, как ты рассуждаешь.</div>
  <div class="task-card" id="diagnosticTask"></div>
 </section>`,'compact');
 renderTask(t,'diagnosticTask','diagnostic');
}

function taskBody(t, mode){
 const feedback=`<div class="feedback" id="taskFeedback" aria-live="polite"></div><div id="hintArea"></div>`;
 const footer=`<div class="task-footer"><div class="why-box">${mode==='training'?'Следующее задание выбирается по твоему предыдущему действию.':'Система сохраняет: правильность, попытки, время и тип затруднения.'}</div><div class="actions" style="margin:0"><button class="btn secondary small" id="hintBtn">Подсказка</button><button class="btn blue" id="checkBtn">Проверить</button></div></div>`;
 if(t.type==='spot') return `<div class="big-word" id="taskWord"></div>${feedback}${footer}`;
 if(t.type==='choice') return `${t.stem?`<div class="metric" style="font-size:2rem">${t.stem}</div>`:''}<div class="choice-list">${t.options.map((o,i)=>`<button class="choice" data-choice="${i}">${o}</button>`).join('')}</div>${feedback}${footer}`;
 if(t.type==='editor') return `<div class="pill yellow">Текст с ошибкой</div><div class="metric" style="font-size:clamp(1.8rem,5vw,3.4rem);margin:24px 0">${t.text}</div><div class="field"><label for="editorInput">Твой вариант</label><input class="text-input" id="editorInput" autocomplete="off" /></div>${feedback}${footer}`;
 if(t.type==='explain') return `<div class="metric" style="font-size:clamp(1.8rem,5vw,3.4rem);margin:24px 0">сверхинтересный</div><div class="field"><label for="explainInput">Объяснение своими словами</label><textarea id="explainInput" placeholder="Например: после ... сохраняется ..."></textarea></div><p class="micro">В демо анализируется наличие смысловых компонентов, а не стиль речи.</p>${feedback}${footer}`;
}

function renderTask(t, containerId, mode){
 const c=$('#'+containerId); c.innerHTML=taskBody(t,mode);
 let selected=null, attempts=0, start=Date.now(), completed=false, completedElapsed=0;
 if(t.type==='spot') renderClickableWord('taskWord',t.word,t.correct,(_,i)=>selected=i);
 if(t.type==='choice') $$('.choice',c).forEach(b=>b.addEventListener('click',()=>{$$('.choice',c).forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=+b.dataset.choice}));
 $('#hintBtn',c).addEventListener('click',()=>{ if(!completed) useHint(t,c); });
 const checkBtn=$('#checkBtn',c);
 checkBtn.addEventListener('click',()=>{
   if(completed){finishTask(t,mode,true,attempts,completedElapsed);return;}
   attempts++;
   let ok=false;
   if(t.type==='spot'){ if(selected===null){attempts--;showToast('Сначала выбери букву.');return} ok=t.correct.includes(selected); }
   if(t.type==='choice'){ if(selected===null){attempts--;showToast('Сначала выбери вариант.');return} ok=selected===t.correct; }
   if(t.type==='editor'){const v=$('#editorInput',c).value.trim().replace(/\s+/g,' ').toLowerCase();if(!v){attempts--;showToast('Введи свой вариант.');return}ok=v===t.expected.toLowerCase();}
   if(t.type==='explain'){const v=$('#explainInput',c).value.trim().toLowerCase();if(!v){attempts--;showToast('Напиши короткое объяснение.');return}ok=t.keywords.every(k=>v.includes(k));}
   const elapsed=Math.max(1,Math.round((Date.now()-start)/1000));
   const f=$('#taskFeedback',c);f.className='feedback show '+(ok?'ok':'retry');
   if(ok){
     completed=true; completedElapsed=elapsed;
     f.innerHTML=`<span class="icon">✅</span><strong>Верно.</strong> ${t.explanation}`;
     checkBtn.textContent=mode==='diagnostic'?'Дальше':'Следующее';
     $('#hintBtn',c).disabled=true;
   } else {
     f.innerHTML=`<span class="icon">↺</span><strong>Пока не совпало.</strong> ${errorFeedback(t,mode)}`;
     recordSoftError(t,mode,attempts,elapsed);
   }
 });
}
function errorFeedback(t){
 if(t.stage===1) return 'Посмотри ещё раз на слово: сначала нужно заметить опасное место.';
 if(t.stage===2) return 'Орфограмму ты видишь. Теперь проверь, правильно ли определён её тип или смысл.';
 if(t.stage===3) return 'Ошибка появилась на этапе выбора алгоритма. Используй подсказку, если нужно.';
 return 'Попробуй исправить себя самостоятельно. Правильный ответ пока не показываем.';
}
function useHint(t,c){
 if(state.currentHint>=3){showToast('Все три подсказки уже показаны. Попробуй объяснить правило своими словами.');return;}
 state.hintsUsed++;
 state.currentHint++;
 save();
 const topicHints={
  kos:'Найди корень КОС-/КАС- и проверь, стоит ли сразу после него суффикс -А-.',
  gor:'Определи, падает ли ударение на гласную корня ГОР-/ГАР-.',
  yi:'Выдели приставку. На что она оканчивается? Не относится ли она к исключениям (сверх-, меж- и др.)?',
  prepri:'Объясни значение приставки именно в этом слове: приближение, близость, присоединение, неполнота действия или близость к «очень» / ПЕРЕ-.',
  oe:'Найди две основы сложного слова и проверь последний согласный первой основы.',
  chik:'Найди суффикс названия лица и согласную непосредственно перед ним.',
  ekik:'Измени существительное: в родительном падеже гласная Е/И выпадает или остаётся?',
  nne:'Определи, от какого слова образовано прилагательное, какой суффикс добавлен и не является ли слово исключением.',
  imper:'Проверь форму повелительного наклонения: нужна ли буква Ь на конце или перед -те?',
  verbs:'Поставь глагол в форму 1-го лица ед. числа: -ую/-юю или -ываю/-иваю?',
  hyphen:'Выдели местоимение и частицы кое-, -то, -либо, -нибудь; есть ли между кое и местоимением предлог?',
  neNoun:'Выясни, употребляется ли существительное без НЕ, есть ли синоним без НЕ или противопоставление.',
  neAdj:'Прочитай всё предложение: утверждается новый признак или есть противопоставление с союзом А и усиление отрицания?',
  numeral:'Сначала назови числительное. У 5–20, 30 Ь на конце; у 50–80 и 500–900 — в середине.',
  oesh:'Определи морфему после шипящей и поставь ударение на гласную суффикса.'
 };
 const hints={
  1:'Сначала выдели морфему, в которой находится орфограмма. Не выбирай букву наугад.',
  2:topicHints[t.topic]||'Найди условие, от которого зависит правильное написание.',
  3:t.explanation
 };
 const target=$('#hintArea',c);
 if(target)target.innerHTML='<div class="hint-box"><strong>Подсказка '+state.currentHint+'/3.</strong> '+hints[state.currentHint]+'</div>';
}
function recordSoftError(t,mode,attempts,elapsed){
 // Ошибки до финального ответа учитываются как попытки; событие сохраняется после завершения задания.
}
function finishTask(t,mode,ok,attempts,elapsed){
 const result={taskId:t.id,topic:t.topic,stage:t.stage,ok,attempts,hints:state.currentHint,time:elapsed,ts:Date.now()};
 state.currentHint=0;
 if(mode==='diagnostic'){
   state.diagnosticResults.push(result);state.diagnosticIndex++;
   if(state.diagnosticIndex>=diagnosticTasks.length){state.diagnosticDone=true;save();navigate('result')} else {save();renderDiagnosis()}
 } else {
   state.trainingResults.push(result);
   adaptQueue(t,result);
   state.trainingIndex++;
   save();
   if(state.trainingIndex>=Math.min(state.trainingQueue.length,8)) navigate('result'); else renderTrainer();
 }
}
function adaptQueue(task,result){
 const topic=task.topic;
 if(result.attempts>=2 || result.hints>=2){
   const fallback=trainerBank.find(x=>x.topic===topic && x.stage===Math.max(1,task.stage-1));
   if(fallback && !state.trainingQueue.slice(state.trainingIndex+1).includes(fallback.id)) state.trainingQueue.splice(state.trainingIndex+1,0,fallback.id);
 } else {
   const recent=state.trainingResults.filter(x=>x.topic===topic).slice(-3);
   if(recent.length>=2 && recent.every(x=>x.attempts===1 && x.hints===0)){
     const harder=trainerBank.find(x=>x.topic===topic && x.stage===Math.min(4,task.stage+1));
     if(harder && !state.trainingQueue.includes(harder.id)) state.trainingQueue.push(harder.id);
   }
 }
}

function diagnosticSummary(){
 const r=state.diagnosticResults;
 const topicStats={}; orthograms.forEach(o=>topicStats[o.id]={n:0,score:0});
 r.forEach(x=>{if(topicStats[x.topic]){topicStats[x.topic].n++;topicStats[x.topic].score+=(x.attempts===1?1:.55)-(x.hints*.1)}});
 const ranked=Object.entries(topicStats).filter(([,v])=>v.n).map(([k,v])=>({topic:k,score:v.score/v.n})).sort((a,b)=>a.score-b.score);
 return {weak:ranked[0]?.topic||'prepri', strong:ranked.at(-1)?.topic||'gor', accuracy:r.length?Math.round(r.filter(x=>x.attempts===1).length/r.length*100):0};
}
function labelTopic(id){return orthograms.find(o=>o.id===id)?.title||id}
function renderResult(){
 const isDiag=state.diagnosticDone && state.trainingResults.length===0;
 const s=diagnosticSummary();
 const results=isDiag?state.diagnosticResults:state.trainingResults;
 const independence=results.length?Math.round(results.filter(x=>x.hints===0).length/results.length*100):0;
 const self=results.length?Math.round(results.filter(x=>x.attempts>1 && x.ok).length/results.length*100):0;
 page(`<p class="eyebrow">${isDiag?'Диагностика завершена':'Результат занятия'}</p><h1>${isDiag?'Твой маршрут готов.':'Сегодня ты потренировался.'}</h1>
 <div class="grid" style="margin-top:26px">${metricCard('Точность с первой попытки',`${results.length?Math.round(results.filter(x=>x.attempts===1).length/results.length*100):0}%`,'не смешиваем с ответами после подсказки','yellow')}${metricCard('Самостоятельность',`${independence}%`,'ответы без подсказок')}${metricCard('Самоисправления',`${self}%`,'ошибка → повторная попытка → верный ответ','blue')}</div>
 <section class="section"><div class="grid"><article class="card wide"><h3>Твоя сильная сторона</h3><div class="metric" style="font-size:2rem">${labelTopic(s.strong)}</div><p>Здесь можно постепенно убирать опоры и переходить к смешанным заданиям.</p></article><article class="card"><h3>Зона роста</h3><div class="metric" style="font-size:2rem">${labelTopic(s.weak)}</div><p>Система вернёт тебя к тому шагу, где появляется затруднение.</p></article><article class="card full pink"><h3>Сегодня потренируем</h3><p style="font-size:1.15rem;max-width:760px">Сначала — обнаружение и распознавание орфограммы, затем — объяснение алгоритма и перенос в предложение.</p><button class="btn" data-route="trainer">Продолжить тренировку</button></article></div></section>
 <div class="actions"><button class="btn secondary" data-route="passport">Открыть паспорт зоркости</button><button class="btn secondary" data-route="student">В кабинет ученика</button></div>`);
}

function renderTrainer(){
 if(!state.diagnosticDone&&!state.directTopic){navigate('diagnosis');return}
 const id=state.trainingQueue[state.trainingIndex] || state.trainingQueue[0];
 const t=trainerBank.find(x=>x.id===id) || trainerBank[0];
 const pct=Math.round((state.trainingIndex/Math.max(6,state.trainingQueue.length))*100);
 page(`<section class="task-shell"><p class="eyebrow">Персональная тренировка · ~10 минут</p><div class="task-top"><div><div class="task-type">${t.title} · ${labelTopic(t.topic)}</div><h1>${t.prompt}</h1></div><div style="min-width:190px">${progress('Тренировка',pct)}</div></div>
 <div class="stage-map"><div class="stage ${t.stage>1?'done':t.stage===1?'current':''}"><b>1 · ЗАМЕЧАЮ</b><small>нахожу опасное место</small></div><div class="stage ${t.stage>2?'done':t.stage===2?'current':''}"><b>2 · РАСПОЗНАЮ</b><small>определяю тип</small></div><div class="stage ${t.stage>3?'done':t.stage===3?'current':''}"><b>3 · ОБЪЯСНЯЮ</b><small>выбираю алгоритм</small></div><div class="stage ${t.stage===4?'current':''}"><b>4 · ПРИМЕНЯЮ</b><small>переношу в контекст</small></div></div>
 <div class="task-card" id="trainerTask" style="margin-top:18px"></div>
 <div class="callout"><strong>Почему выбрано это задание?</strong>${adaptiveReason(t)}</div></section>`,'compact');
 renderTask(t,'trainerTask','training');
}
function adaptiveReason(t){if(t.stage===1)return 'В предыдущих действиях важнее укрепить обнаружение орфограммы — система уменьшает сложность не количеством вопросов, а возвращением к нужной операции.';if(t.stage===2)return 'Опасное место уже замечается, но нужно стабилизировать классификацию орфограммы.';if(t.stage===3)return 'Распознавание достаточно устойчиво; сейчас тренируется выбор правила и алгоритма.';return 'Базовые шаги выполнены: пора проверить перенос навыка в самостоятельное редактирование.'}

function calcPassport(){
 const p={...basePassport};
 const all=[...state.diagnosticResults,...state.trainingResults];
 if(all.length){p.detection=Math.min(96,60+all.filter(x=>x.stage===1&&x.attempts===1).length*7);p.recognition=Math.min(94,58+all.filter(x=>x.stage===2&&x.attempts===1).length*8);p.ruleUse=Math.min(95,62+all.filter(x=>x.stage===3&&x.attempts===1).length*7);p.selfCorrection=Math.min(92,52+all.filter(x=>x.attempts>1&&x.ok).length*8);p.transfer=Math.min(90,54+all.filter(x=>x.stage===4&&x.attempts===1).length*9)}
 return p;
}
function renderPassport(){const p=calcPassport();page(`<p class="eyebrow">Паспорт орфографической зоркости</p><h1>Не «7 из 10». А профиль действий.</h1><div class="grid" style="margin-top:28px"><article class="card wide"><h3>Пять наблюдаемых компонентов</h3>${skill('Обнаружение орфограмм',p.detection)}${skill('Распознавание типа',p.recognition)}${skill('Применение правила',p.ruleUse)}${skill('Самоисправление',p.selfCorrection)}${skill('Перенос в текст',p.transfer)}</article><article class="card yellow"><h3>Серия занятий</h3><div class="metric">${p.streak}</div><p>регулярных тренировок</p><p><strong>${p.speed}</strong><br><span class="micro">средняя скорость</span></p></article><article class="card"><h3>Сейчас тренируем</h3><div class="kicker-row">${p.training.map(x=>`<span class="pill blue">${x}</span>`).join('')}</div><h3 style="margin-top:20px">Освоено</h3><div class="kicker-row">${p.mastered.map(x=>`<span class="pill yellow">✓ ${x}</span>`).join('')}</div></article><article class="card wide"><h3>Повторяющиеся паттерны</h3><p>• ${p.recurrent[0]}</p><p>• ${p.recurrent[1]}</p><div class="callout"><strong>Следующее педагогическое действие</strong>Дать короткий блок на смысловые группы ПРИ-, затем вернуть слова с СВЕРХ- в смешанное задание через 2 занятия.</div></article></div><div class="actions"><button class="btn blue" data-route="trainer">Продолжить тренировку</button><button class="btn secondary" data-route="student">К кабинету ученика</button></div>`)}
function skill(name,val){return `<div class="skill-row"><b>${name}</b><div class="progress"><span style="width:${val}%"></span></div><div class="score">${val}%</div></div>`}

function sparkline(values){
 const w=520,h=122,pad=8,lo=Math.min(...values)-6,hi=Math.max(...values)+6;
 const points=values.map((n,i)=>`${pad+(i*(w-2*pad)/(values.length-1))},${h-pad-(n-lo)*(h-2*pad)/(hi-lo)}`).join(' ');
 return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Динамика по демо-данным: рост с ${values[0]} до ${values[values.length-1]} процентов"><polyline points="${points}" fill="none" stroke="#955D6B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pad}" cy="${h-pad-(values[0]-lo)*(h-2*pad)/(hi-lo)}" r="5" fill="#35435E"/><circle cx="${w-pad}" cy="${h-pad-(values.at(-1)-lo)*(h-2*pad)/(hi-lo)}" r="6" fill="#955D6B"/></svg>`;
}

function renderStudent(){const p=calcPassport();page(`<p class="eyebrow">Кабинет ученика · демо</p><h1>Привет, Илья.</h1><div class="grid" style="margin-top:28px"><article class="card wide blue"><h3>Тренировка на сегодня</h3><div class="metric" style="font-size:2.2rem">ПРЕ-/ПРИ- + повторение Ы/И</div><p>7 заданий · примерно 11 минут</p>${progress('Сегодня',43)}<button class="btn yellow" data-route="trainer" style="margin-top:20px">Продолжить</button></article><article class="card"><h3>Моя орфографическая зоркость</h3><div class="metric">${Math.round((p.detection+p.recognition+p.ruleUse+p.transfer)/4)}%</div><p>индекс для навигации по прогрессу, не школьная отметка</p><button class="btn secondary small" data-route="passport">Открыть паспорт</button></article><article class="card"><h3>Повторение</h3><p><strong>ГОР-/ГАР-</strong><br><span class="micro">вернём сегодня в смешанном контексте</span></p><div class="pill yellow">через 2 задания</div></article><article class="card"><h3>Новое</h3><p><strong>Соединительные О/Е</strong></p><div class="pill">после повторения</div></article><article class="card wide"><h3>Динамика</h3>${sparkline([48,53,57,61,64,69,73,76])}<p class="micro">Демо-данные: индекс освоения растёт, но система отдельно хранит самостоятельность, подсказки и перенос.</p></article><article class="card yellow"><h3>Личное достижение</h3><div class="metric" style="font-size:1.85rem">Исправляю себя самостоятельно</div><p>3 самоисправления за последние 2 занятия</p></article></div>
<section class="section kids-section" aria-labelledby="kids-games-heading"><div class="section-head"><div><p class="eyebrow">Игровая практика</p><h2 id="kids-games-heading">Учимся через игру, наблюдение и маленькие открытия</h2></div><p class="section-intro">Форматы ниже помогают удерживать внимание детей 5–6 классов: они тренируют орфографическую зоркость, но выглядят как игра, расследование или творческая задача.</p></div><div class="game-grid"><article class="game-card game-card-hunt"><div class="game-sticker">игра 5–7 минут</div><div class="game-icon" aria-hidden="true">01</div><h3>Орфоохота</h3><p>Найди все «опасные места» в коротком тексте или строке слов. Хорошо работает как разминка в начале занятия.</p><div class="game-meta"><span class="pill">замечаю</span><span class="pill">индивидуально</span></div><button class="btn secondary small" data-game="hunt">Попробовать формат</button></article><article class="game-card game-card-editor"><div class="game-sticker">игра 8–10 минут</div><div class="game-icon" aria-hidden="true">А/О</div><h3>Редактор вырезок</h3><p>Исправь орфографические ошибки в «газетных» заметках, заголовках и подписях. Ребёнок чувствует себя настоящим редактором.</p><div class="game-meta"><span class="pill pink">объясняю</span><span class="pill">в паре</span></div><button class="btn secondary small" data-game="editor">Перейти к заданию</button></article><article class="game-card game-card-build"><div class="game-sticker">игра 6–8 минут</div><div class="game-icon" aria-hidden="true">±</div><h3>Слово-конструктор</h3><p>Собери слово из морфем или карточек, а потом объясни, почему в нём пишется именно эта буква.</p><div class="game-meta"><span class="pill yellow">распознаю</span><span class="pill">мини-группа</span></div><button class="btn secondary small" data-game="build">Собрать слово</button></article><article class="game-card game-card-detective"><div class="game-sticker">игра 7–9 минут</div><div class="game-icon" aria-hidden="true">?</div><h3>Орфо-детектив</h3><p>Определи, почему герой «ошибся»: не заметил орфограмму, перепутал правило или поспешил. Это помогает обсуждать ход мысли.</p><div class="game-meta"><span class="pill blue">анализ</span><span class="pill">обсуждение</span></div><button class="btn secondary small" data-game="detective">Открыть расследование</button></article></div><div class="clip-note"><strong>Методический смысл.</strong> Игровые форматы здесь не ради развлечения: каждый из них закрепляет определённое действие — обнаружение орфограммы, распознавание типа, объяснение выбора или перенос в текст.</div></section>`)}


// Игровая лаборатория: самостоятельные механики, основанные на проверенных орфограммах.
// Никакие ответы не отправляются на сервер. Игра не подменяет диагностику и паспорт ученика.
const gameCatalog = {
  hunt:{title:'Орфоохота',meta:'Обнаружение орфограмм',label:'Замечаю',intro:'Найди слово с указанной орфограммой. Сначала замечаем опасное место, потом объясняем.',rounds:[
    {task:'Найди слово с приставкой ПРИ-, которая обозначает близость к школе.',words:['доброта','пришкольный','зелёный','дружок'],answer:'пришкольный',reason:'Пришкольный — расположенный около школы. В приставке ПРИ- выражено значение близости.',hint:'Подумай, как назвать участок рядом со школой.'},
    {task:'Найди слово с чередованием КОС-/КАС-, где после корня нет суффикса -А-.',words:['касаться','прикоснуться','касается','прикасался'],answer:'прикоснуться',reason:'В слове «прикоснуться» после корня -кос- нет суффикса -а-, поэтому пишется О.',hint:'Сравни «прикасаться» и «прикоснуться».'},
    {task:'Найди слово с Ы после приставки на согласную.',words:['проиграть','сверхинтересный','разыграть','поиграть'],answer:'разыграть',reason:'В слове «разыграть» приставка раз- оканчивается на согласную: раз- + играть → разыграть.',hint:'После приставок на гласную И сохраняется, после раз- пишем Ы.'}
  ]},
  editor:{title:'Редактор вырезок',meta:'Самостоятельное исправление',label:'Применяю',intro:'В журнальной заметке обнаружилась ошибка. Запиши исправленный вариант, не изменяя смысл.',rounds:[
    {task:'Исправь одно слово в заметке.',before:'На афише выступления указан переводщик.',expected:'переводчик',reason:'После Д в суффиксе со значением лица пишется -ЧИК-: переводчик.',hint:'Посмотри, какой согласный стоит перед суффиксом.'},
    {task:'Исправь орфографическую ошибку.',before:'В заметке написали: «Не прикосайся к экспонатам».',expected:'прикасайся',reason:'После корня есть суффикс -А-: прикасайся.',hint:'После корня -кас- стоит суффикс -а-.'},
    {task:'Исправь слово на билете.',before:'Возраст участников — пятдесят лет.',expected:'пятьдесят',reason:'В числительном пятьдесят мягкий знак пишется в середине.',hint:'Проверь мягкий знак между частями сложного числительного.'}
  ]},
  build:{title:'Слово-конструктор',meta:'Условие выбора орфограммы',label:'Распознаю',intro:'Выбери нужный фрагмент слова. Важно понять, какое условие управляет написанием.',rounds:[
    {task:'Собери слово со значением «дотрагиваться». Сразу после корня есть суффикс -А-.',prefix:'при',suffix:'аться',choices:['кас','кос'],answer:'кас',reason:'Суффикс -А- после корня определяет написание -КАС-: прикасаться.',hint:'В правиле КОС-/КАС- наличие -А- после корня означает А в корне.'},
    {task:'Собери слово со значением «коснуться один раз». После корня нет суффикса -А-.',prefix:'при',suffix:'нуться',choices:['кос','кас'],answer:'кос',reason:'Без суффикса -А- после корня пишется О: прикоснуться.',hint:'В этом слове после корня стоит -ну-, а не -а-.'},
    {task:'Собери слово «играть после приставки раз-».',prefix:'раз',suffix:'грать',choices:['ы','и'],answer:'ы',reason:'После приставки раз- на согласную начальное И корня меняется на Ы: разыграть.',hint:'Сравни играть и разыграть.'}
  ]},
  detective:{title:'Орфо-детектив',meta:'Анализ причины ошибки',label:'Объясняю',intro:'Восстанови ход рассуждения ученика. Что именно пошло не так?',rounds:[
    {task:'Миша написал «косаться»: орфограмму заметил, но решил подобрать проверочное слово «косы». Где ошибка?',choices:['Не увидел орфограмму','Выбрал неверный способ проверки','Неправильно записал дату'],answer:'Выбрал неверный способ проверки',reason:'Это чередующийся корень КОС-/КАС-. Здесь не подбирают проверочное слово, а ищут суффикс -А-.',hint:'Он увидел опасное место, но применил не то правило.'},
    {task:'Лена подчеркнула ПРИ- в слове «приморский», но объяснила: «значит очень морской». Где ошибка?',choices:['Неверно определила значение приставки','Не заметила приставку','Неверно определила часть речи'],answer:'Неверно определила значение приставки',reason:'«Приморский» — находящийся рядом с морем, значение близости. Орфограмму Лена заметила.',hint:'Она нашла приставку, но перепутала её значение.'},
    {task:'Игорь написал «разиграть», хотя выделил приставку раз- и знает, что она оканчивается на согласную. Где возникло затруднение?',choices:['Не увидел место выбора','Ошибся при применении известного правила','Выбрал правило для суффикса'],answer:'Ошибся при применении известного правила',reason:'Опасное место Игорь обнаружил, условие понял, но применил его неверно: нужно разыграть.',hint:'Игорь знал условие и заметил приставку.'}
  ]}
};
let gameState={mode:null,index:0,success:0,errors:0,solved:false};
function renderGames(){
  const mode=(location.hash.split('mode=')[1]||'').split('&')[0];
  if(!gameCatalog[mode]){
    gameState={mode:null,index:0,success:0,errors:0,solved:false};
    page(`<p class="eyebrow">Кабинет ученика / игровые методики</p><h1>Игровая лаборатория слова</h1><p class="section-intro">Четыре коротких задания на разные операции орфографической зоркости. Игры дополняют тренировку и не заменяют педагогическую диагностику.</p><div class="game-grid game-menu">${Object.entries(gameCatalog).map(([key,g],i)=>`<article class="game-card game-card-${key}"><div class="game-sticker">0${i+1} / ${g.label}</div><h3>${g.title}</h3><p>${g.intro}</p><button class="btn secondary small" data-game="${key}">Открыть →</button></article>`).join('')}</div><div class="actions"><button class="btn secondary" data-route="student">В кабинет ученика</button></div>`);return;
  }
  const g=gameCatalog[mode];
  if(gameState.mode!==mode){gameState={mode,index:0,success:0,errors:0,solved:false};}
  if(gameState.index>=g.rounds.length){
    page(`<div class="game-play"><p class="eyebrow">Игровая лаборатория · завершено</p><h1>${g.title}</h1><div class="game-complete"><div class="game-metric">${gameState.success}/${g.rounds.length}</div><p>заданий выполнено самостоятельно или после подсказки</p><p>Ошибочных попыток: ${gameState.errors}. Здесь важно не число, а то, какое правило ты научился объяснять.</p></div><div class="actions"><button class="btn blue" id="restartGame">Сыграть ещё раз</button><button class="btn secondary" data-route="games">К другим играм</button></div></div>`);
    $('#restartGame').onclick=()=>{gameState={mode,index:0,success:0,errors:0,solved:false};renderGames()};return;
  }
  const r=g.rounds[gameState.index];
  let choices='';
  if(mode==='hunt')choices=`<div class="game-word-row">${r.words.map(w=>`<button class="game-option game-word" data-answer="${w}" aria-pressed="false">${w}</button>`).join('')}</div>`;
  if(mode==='build')choices=`<div class="game-assembly"><span>${r.prefix}</span><span id="gamePlace">…</span><span>${r.suffix}</span></div><div class="game-choice-row">${r.choices.map(w=>`<button class="game-option" data-answer="${w}" aria-pressed="false">${w}</button>`).join('')}</div>`;
  if(mode==='detective')choices=`<div class="game-choice-list">${r.choices.map(w=>`<button class="game-option" data-answer="${w}" aria-pressed="false">${w}</button>`).join('')}</div>`;
  if(mode==='editor')choices=`<blockquote class="game-newspaper">${r.before}</blockquote><label class="game-edit-label" for="gameEdit">Исправленное слово</label><input id="gameEdit" class="text-input" autocomplete="off" spellcheck="false" placeholder="Напиши слово правильно">`;
  page(`<div class="game-play"><p class="eyebrow">Игровая лаборатория / ${g.meta}</p><div class="game-play-head"><div><h1>${g.title}</h1><p>${g.intro}</p></div><div class="game-page-index">0${gameState.index+1} / 0${g.rounds.length}</div></div><article class="game-play-card"><div class="game-edition">РУССКИЙ ЯЗЫК • ЛАБОРАТОРИЯ • ${g.label.toUpperCase()}</div><h2>${r.task}</h2>${choices}<div id="gameFeedback" class="feedback game-result" role="status" aria-live="polite"></div><div class="game-controls"><button id="gameHint" class="btn secondary small">Подсказка</button><button id="gameCheck" class="btn blue">Проверить</button></div></article><div class="actions"><button class="btn secondary" data-route="games">Все игровые задания</button><button class="btn secondary" data-route="student">Кабинет ученика</button></div></div>`);
  let selected=null,tries=0;
  $$('.game-option').forEach(btn=>btn.onclick=()=>{if(gameState.solved)return;selected=btn.dataset.answer;$$('.game-option').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false')});btn.classList.add('selected');btn.setAttribute('aria-pressed','true');if(mode==='build')$('#gamePlace').textContent=selected;});
  $('#gameHint').onclick=()=>{const f=$('#gameFeedback');f.className='feedback game-result show';f.textContent='Подсказка: '+r.hint;};
  $('#gameCheck').onclick=()=>{
    if(gameState.solved){gameState.index++;gameState.solved=false;renderGames();return;}
    const val=mode==='editor'?($('#gameEdit')?.value||'').trim().toLowerCase().replace(/ё/g,'е'):selected;
    if(!val){showToast('Сначала выбери вариант или введи слово.');return;}
    const right=mode==='editor'?val===r.expected.toLowerCase().replace(/ё/g,'е'):val===r.answer;
    const f=$('#gameFeedback');tries++;
    if(right){gameState.solved=true;gameState.success++;f.className='feedback game-result show ok';f.innerHTML='<strong>✓ Верно.</strong> '+r.reason;$('#gameCheck').textContent=gameState.index===g.rounds.length-1?'Завершить игру':'Следующее задание →';$('#gameHint').disabled=true;$$('.game-option').forEach(b=>b.disabled=true);if($('#gameEdit'))$('#gameEdit').disabled=true;}
    else{gameState.errors++;f.className='feedback game-result show retry';f.textContent=tries===1?'Проверь ещё раз. '+r.hint:'Нужна опора: '+r.reason+' Попробуй исправить ответ самостоятельно.';}
  };
}

function renderTeacher(){page(`<p class="eyebrow">Кабинет учителя · демо</p><h1>6Б: где нужна педагогическая поддержка?</h1><div class="subnav"><button data-route="class">Класс</button><button data-route="creator">Создать тренажёр</button><button data-route="worksheet">Печатные работы</button><button data-route="research">Исследование</button><button data-route="method">Методическая база</button></div><div class="grid">${metricCard('Выполнение','83%','ученики завершили тренировку недели','yellow')}${metricCard('Положительная динамика','+7%','медианная динамика за 4 недели')}${metricCard('Нужна доп. тренировка','4','из 28 учеников','pink')}<article class="card wide"><h3>Проблемные орфограммы класса</h3><div class="barset">${barrow('ПРЕ-/ПРИ-',68)}${barrow('Ы/И после приставок',61)}${barrow('КОС-/КАС-',54)}${barrow('Соединительные О/Е',38)}</div></article><article class="card"><h3>Типичные затруднения</h3><p><strong>31%</strong> — не классифицируют тип</p><p><strong>24%</strong> — знают правило, но ошибаются в применении</p><p><strong>18%</strong> — пропускают опасное место</p></article><article class="card full blue"><h3>Рекомендация системы</h3><p style="font-size:1.2rem;max-width:880px">Для 4 учеников начать с обнаружения и классификации ПРЕ-/ПРИ-. Для класса в целом — короткое смешанное повторение Ы/И после приставок. Учитель может изменить это решение.</p><button class="btn yellow" data-route="creator">Настроить вручную</button></article></div>`)}
function barrow(name,v){return `<div class="barrow"><span>${name}</span><div class="bar"><span style="width:${v}%"></span></div><strong>${v}%</strong></div>`}

function renderClass(){page(`<p class="eyebrow">Страница класса · 6Б · демо</p><h1>Класс целиком — и каждый профиль отдельно.</h1><div class="actions"><button class="btn blue" data-route="creator">Назначить тему</button><button class="btn secondary" data-route="teacher">Назад к обзору</button></div><div class="table-wrap" style="margin-top:24px"><table class="data-table"><thead><tr><th>Ученик</th><th>Выполнение</th><th>Динамика</th><th>Зона риска</th><th>Подсказки</th><th>Действие</th></tr></thead><tbody>${demoStudents.map(s=>`<tr><td><strong>${s.name}</strong></td><td>${s.completion}%</td><td>${s.trend>=0?'+':''}${s.trend}%</td><td>${s.risk}</td><td>${s.hints}</td><td><button data-student="${s.id}">Профиль →</button></td></tr>`).join('')}</tbody></table></div><div class="callout"><strong>Важно</strong>Демо показывает обезличенные результаты. В исследовательском режиме персональные данные не нужны: сравнение строится по кодам и агрегированным показателям.</div>`);$$('[data-student]').forEach(b=>b.addEventListener('click',()=>{state.lastStudentId=b.dataset.student;save();navigate('studentprofile')}))}

function renderStudentProfile(){const s=demoStudents.find(x=>x.id===state.lastStudentId)||demoStudents[3];page(`<p class="eyebrow">Профиль ученика · демо</p><h1>${s.name}</h1><div class="grid" style="margin-top:28px">${metricCard('Тренировок',s.sessions,'за текущий цикл','yellow')}${metricCard('Подсказки',s.hints,'использованы за цикл')}${metricCard('Динамика',`${s.trend>=0?'+':''}${s.trend}%`,'по сопоставимым заданиям','blue')}<article class="card wide"><h3>Карта затруднений</h3><div class="barset">${barrow('Обнаружение',72)}${barrow('Классификация',58)}${barrow('Применение правила',66)}${barrow('Перенос в текст',49)}</div></article><article class="card"><h3>Частые ошибки</h3><div class="kicker-row"><span class="pill pink">${s.risk}</span><span class="pill">2+ попытки</span><span class="pill">подсказка 2</span></div><p>Система различает повторяющийся паттерн и разовую ошибку по серии сопоставимых заданий.</p></article><article class="card full yellow"><h3>Рекомендация системы</h3><p style="font-size:1.15rem">Следующую тренировку начать с уровня «РАСПОЗНАЮ», затем дать 2 задания «ОБЪЯСНЯЮ». После двух самостоятельных успехов — перенос в короткий текст.</p><div class="actions"><button class="btn" data-route="creator">Создать персональный тренажёр</button><button class="btn secondary" data-route="class">Вернуться к классу</button></div></article></div>`)}

function renderCreator(){page(`<p class="eyebrow">Учительский режим</p><h1>Создать персональный тренажёр</h1><div class="grid" style="margin-top:28px"><article class="card wide"><div class="form-grid"><div class="field"><label>Класс</label><select id="cClass"><option>6Б</option><option>6А</option><option>5В</option></select></div><div class="field"><label>Ученик / группа</label><select id="cStudent"><option>Илья Р.</option><option>4 ученика с зоной риска</option><option>Весь класс</option></select></div><div class="field"><label>Орфограмма</label><select id="cTopic">${orthograms.map(o=>`<option value="${o.id}">${o.title}</option>`).join('')}</select></div><div class="field"><label>Этап</label><select id="cStage"><option value="1">1 · Замечаю</option><option value="2">2 · Распознаю</option><option value="3" selected>3 · Объясняю</option><option value="4">4 · Применяю</option></select></div><div class="field"><label>Количество</label><select id="cCount"><option>5</option><option selected>7</option><option>10</option></select></div><div class="field"><label>Сложность</label><select id="cDifficulty"><option>поддерживающая</option><option selected>базовая</option><option>повышенная</option></select></div><div class="field"><label>Тип упражнения</label><select id="cType"><option>автоматически</option><option>найди опасное место</option><option>выбери алгоритм</option><option>редактор</option><option>смешанный вызов</option></select></div></div><div class="actions"><button class="btn blue" id="generateBtn">Сформировать вариант</button></div><div id="creatorPreview"></div></article><article class="card pink"><h3>Контроль учителя</h3><p>Демоверсия подбирает задания из подготовленного банка. Генеративный ИИ и реальная отправка ученикам не подключены. После проверки можно скачать редактируемый черновик.</p><p><strong>Перед назначением:</strong> изменить формулировку, заменить пример, удалить задание, добавить своё, сгенерировать новый вариант.</p></article></div>`);$('#generateBtn').addEventListener('click',generatePreview)}
let creatorDraft=[];
let creatorPool=[];
const creatorEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function creatorKey(t){
 if(t.manualKey)return t.manualKey;
 const main=t.type==='choice'&&t.options&&t.correct!==undefined
   ?'Верный вариант: '+t.options[t.correct]+'. '
   :t.type==='editor'&&t.expected?'Нужно написать: '+t.expected+'. '
   :t.type==='spot'&&t.word&&t.correct?'Опасное место: '+t.correct.map(i=>t.word[i]).join(', ')+'. '
   :'';
 return main+(t.explanation||'Ответ и объяснение необходимо проверить учителю.');
}

function generatePreview(){
 const topic=$('#cTopic').value,stage=+$('#cStage').value;
 const amount=+$('#cCount').value,level=$('#cDifficulty').value,type=$('#cType').value;
 let target=stage+(level==='повышенная'?1:level==='поддерживающая'?-1:0);
 target=Math.max(1,Math.min(4,target));
 creatorPool=trainerBank.filter(t=>t.topic===topic).filter(t=>
   type==='автоматически'||type==='смешанный вызов'||
   (type==='найди опасное место'&&t.type==='spot')||
   (type==='выбери алгоритм'&&t.type==='choice')||
   (type==='редактор'&&t.type==='editor')
 ).sort((a,b)=>Math.abs(a.stage-target)-Math.abs(b.stage-target));
 if(!creatorPool.length){$('#creatorPreview').innerHTML='<p class="callout">Для такой комбинации нет проверяемых примеров. Выбери другой тип упражнения.</p>';return}
 creatorDraft=Array.from({length:Math.min(amount,creatorPool.length)},(_,k)=>{
   const t=creatorPool[k];
   return {...t,prompt:String(t.prompt||'')+(t.word?' Слово: '+t.word+'.':'')+(t.text?' Текст: '+t.text:'')};
 });
 renderCreatorDraft();
}
function renderCreatorDraft(){
 const preview=$('#creatorPreview');
 if(!preview)return;
 const count=creatorDraft.length;
 preview.innerHTML='<div class="preview creator-atelier"><div class="tag">РЕДАКТОРСКИЙ ЧЕРНОВИК · '+count+' заданий · '+creatorPool.length+' доступно в банке</div>'+
 creatorDraft.map((t,i)=>'<article class="preview-item creator-draft" data-index="'+i+'">'+
  '<strong>Карточка '+(i+1)+'. '+creatorEsc(t.title)+'</strong>'+
  '<div class="creator-draft-prompt">'+creatorEsc(t.prompt)+'</div>'+
  (t.options?'<p class="micro">Варианты: '+creatorEsc(t.options.join(' / '))+'</p>':'')+
  '<p class="micro">Ключ / объяснение: '+creatorEsc(creatorKey(t))+'</p>'+
  '<div class="creator-draft-editor" hidden><label>Формулировка задания<textarea class="text-input" data-creator-prompt="'+i+'" rows="3">'+creatorEsc(t.prompt)+'</textarea></label>'+
  '<label>Ключ и объяснение<textarea class="text-input" data-creator-answer="'+i+'" rows="3">'+creatorEsc(creatorKey(t))+'</textarea></label></div>'+
  '<div class="actions" style="margin-top:9px"><button class="btn secondary small" data-creator-action="edit" data-index="'+i+'" type="button">Изменить</button>'+
  '<button class="btn secondary small" data-creator-action="replace" data-index="'+i+'" type="button">Заменить пример</button>'+
  '<button class="btn secondary small" data-creator-action="remove" data-index="'+i+'" type="button">Удалить</button></div></article>').join('')+
 '<div class="actions"><button type="button" id="creatorAdd" class="btn secondary small">+ Добавить своё задание</button></div>'+
 '<label class="checkline" style="margin-top:16px"><input type="checkbox" id="teacherCheck"><span><strong>Проверено учителем.</strong> Я изучил(а) формулировки и ключи каждого задания.</span></label>'+
 '<button class="btn blue" id="publishBtn" disabled style="margin-top:15px">Скачать проверенный черновик (.txt)</button>'+
 '<p class="micro">Задания не отправляются ученикам автоматически. Это локальный черновик, который можно отредактировать и скачать.</p></div>';
 preview.querySelectorAll('[data-creator-action]').forEach(btn=>btn.onclick=()=>{
  const idx=+btn.dataset.index;
  if(btn.dataset.creatorAction==='edit'){
   const ed=preview.querySelector('.creator-draft[data-index="'+idx+'"] .creator-draft-editor');ed.hidden=!ed.hidden;return;
  }
  if(btn.dataset.creatorAction==='remove'){creatorDraft.splice(idx,1);renderCreatorDraft();return}
  if(btn.dataset.creatorAction==='replace'){
   const unused=creatorPool.find(x=>!creatorDraft.some(y=>y.id===x.id));
   if(!unused){showToast('В выбранной теме больше нет уникальных примеров.');return}
   creatorDraft[idx]={...unused,prompt:String(unused.prompt||'')+(unused.word?' Слово: '+unused.word+'.':'')+(unused.text?' Текст: '+unused.text:'')};
   renderCreatorDraft();
  }
 });
 preview.querySelectorAll('[data-creator-prompt]').forEach(x=>x.oninput=()=>{creatorDraft[+x.dataset.creatorPrompt].prompt=x.value;const summary=x.closest('.creator-draft').querySelector('.creator-draft-prompt');summary.textContent=x.value});
 preview.querySelectorAll('[data-creator-answer]').forEach(x=>x.oninput=()=>{creatorDraft[+x.dataset.creatorAnswer].manualKey=x.value});
 preview.querySelector('#creatorAdd').onclick=()=>{
  creatorDraft.push({id:'manual-'+Date.now(),topic:$('#cTopic').value,title:'Авторское задание',prompt:'Введите формулировку задания.',explanation:'Введите обоснованный ответ.'});
  renderCreatorDraft();
  const ed=preview.querySelector('.creator-draft[data-index="'+(creatorDraft.length-1)+'"] .creator-draft-editor');
  if(ed)ed.hidden=false;
 };
 preview.querySelector('#teacherCheck').onchange=e=>preview.querySelector('#publishBtn').disabled=!e.target.checked||!creatorDraft.length;
 preview.querySelector('#publishBtn').onclick=()=>{
  const title='ОрфоЗор AI — редакторский черновик ('+$('#cClass').value+', '+$('#cTopic').selectedOptions[0].text+')';
  const lines=[title,'Кому: '+$('#cStudent').value,'Этап: '+$('#cStage').value,'Статус: подготовлено и проверено учителем','',
  ...creatorDraft.flatMap((t,i)=>[(i+1)+'. '+t.title,t.prompt,t.options?'Варианты: '+t.options.join(' | '):'','Ключ / объяснение: '+creatorKey(t),''])];
  const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orfozor_trainer_draft.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
 };
}
function startTopicTraining(topic){
 const tasks=trainerBank.filter(t=>t.topic===topic);
 if(!tasks.length){showToast('Для этой орфограммы задания готовятся.');return;}
 state.trainingQueue=tasks.map(t=>t.id);
 state.trainingIndex=0;
 state.currentHint=0;
 state.directTopic=true;
 save(); navigate('trainer');
}

function renderLibrary(){page(`<p class="eyebrow">Библиотека орфограмм</p><h1>От буквы — к правилу — к тексту</h1><p class="section-intro">Библиотека расширена по темам пособия для 6 класса; для каждой орфограммы доступны четыре этапа работы. ИИ здесь не является источником нормы.</p><div class="library-list" style="margin-top:28px">${orthograms.map(o=>`<article class="orth-item"><div class="orth-head"><div><strong>${o.title}</strong><div class="micro">${o.examples.join(' · ')}</div></div><button aria-label="Раскрыть ${o.title}">＋</button></div><div class="orth-body"><p><strong>Правило.</strong> ${o.rule}</p><p><strong>Формируемые операции:</strong> ${o.skills.join(' → ')}.</p><p class="rule-source">Основа: ${o.source}.</p><button class="btn blue small topic-train" data-topic="${o.id}">Тренировать эту орфограмму →</button><span class="micro" style="margin-left:12px">${trainerBank.filter(t=>t.topic===o.id).length} задания</span></div></article>`).join('')}</div>`);$$('.topic-train').forEach(b=>b.addEventListener('click',()=>startTopicTraining(b.dataset.topic)));$$('.orth-head').forEach(h=>h.addEventListener('click',()=>{const item=h.parentElement;item.classList.toggle('open');$('button',h).textContent=item.classList.contains('open')?'−':'＋'}))}

function renderResearch(){page(`<p class="eyebrow">Исследовательская аналитика · демо</p><h1>Сравниваем навыки, а не фамилии.</h1><div class="grid" style="margin-top:28px"><article class="card full"><h3>Динамика трёх диагностик</h3><div class="barset">${compareRow('Замечает орфограмму',54,68,79)}${compareRow('Самостоятельные исправления',22,39,57)}${compareRow('Перенос в текст',41,52,66)}${compareRow('Зависимость от подсказок ↓',62,44,29)}</div></article>${metricCard('Начальная','54%','обнаружение опасных мест','yellow')}${metricCard('Промежуточная','68%','сопоставимый показатель')}${metricCard('Итоговая','79%','сопоставимый показатель','blue')}<article class="card full"><h3>Экспорт обезличенной статистики</h3><p>CSV включает код ученика, диагностический срез, орфограмму, этап навыка, правильность, попытки, время, подсказки, самоисправление и показатель переноса.</p><button class="btn secondary" id="exportCsv">Экспорт CSV</button></article></div>`);$('#exportCsv').addEventListener('click',exportResearchCsv)}
function compareRow(name,a,b,c){return `<div><strong>${name}</strong><div class="kicker-row"><span class="pill">старт ${a}%</span><span class="pill yellow">середина ${b}%</span><span class="pill blue">итог ${c}%</span></div></div>`}
function exportResearchCsv(){const rows=[['student_code','slice','orthogram','stage','correct','attempts','hints','time_sec','self_corrected','transfer'],['S-014','start','prepri','2','0','2','1','34','1','0'],['S-014','mid','prepri','3','1','1','0','25','0','0'],['S-014','final','prepri','4','1','1','0','21','0','1']];const blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orfozor_research_demo.csv';a.click();URL.revokeObjectURL(a.href);showToast('CSV экспортирован.')}

function renderMethod(){page(`<p class="eyebrow">Методическая база</p><h1>Что взято из источников — и что является технологическим решением.</h1><section class="section"><div class="grid"><article class="card wide"><h3>Из загруженных пособий</h3><p>В обновлённой библиотеке представлены темы 6 класса и сохранена логика школьной орфографической работы: выделить морфему/опасную позицию, вставить букву, обосновать выбор, классифицировать примеры, исправить ошибки, подготовиться к диктанту, составить предложения и работать со смешанными тестами.</p><p>Базовые правила по КОС-/КАС-, ГОР-/ГАР-, Ы/И после приставок, ПРЕ-/ПРИ- и соединительным О/Е сформулированы по пособию Узорова—Нефёдова. Вариативность механик и работа в контексте поддержаны упражнениями рабочей тетради Ларионовой.</p><div class="callout"><strong>Что источники не дают.</strong>В предоставленных пособиях не найдено отдельного определения термина «орфографическая зоркость», теоретической модели её компонентов или этапов формирования навыка. Поэтому прототип не приписывает авторам такие положения: четырёхступенчатая модель ниже взята из проектного ТЗ и явно отделена от источников.</div></article><article class="card blue"><h3>Технологическое решение ОрфоЗора</h3><p>Диагностика по этапам действия, «паспорт зоркости», выбор следующего задания по типу ошибки, распределённое возвращение темы и составной mastery score — это проектная модель прототипа, а не цитата из пособий.</p></article></div></section><section class="section"><div class="section-head"><div><p class="eyebrow">Адаптация</p><h2>Ошибка меняет следующий шаг.</h2></div></div><div class="flow"><div class="flow-step"><b>Не заметил</b>Задание на поиск опасного места.</div><div class="flow-step"><b>Не распознал</b>Сравнение и классификация.</div><div class="flow-step"><b>Сбился в правиле</b>Пошаговый алгоритм.</div><div class="flow-step"><b>Справился</b>Предложение или текст.</div><div class="flow-step"><b>Навык стабилен</b>Отложенное смешанное повторение.</div></div></section><section class="section"><h2>Mastery score · прототип</h2><div class="callout"><strong>Формула не выдаётся за научную норму.</strong>В прототипе итоговый индекс использует: точность 30%, самостоятельность 20%, первая попытка 15%, стабильность 15%, отложенное повторение 10%, перенос в новый контекст 10%. В рабочем исследовании веса следует валидировать.</div></section><section class="section"><h2>Wireframe ключевых экранов</h2><div class="grid"><article class="card"><h3>Ученик</h3>${wireframe()}</article><article class="card"><h3>Тренажёр</h3>${wireframe()}</article><article class="card"><h3>Учитель</h3>${wireframe()}</article></div></section>`)}
function wireframe(){return `<div class="wireframe"><div class="wf-top"></div><div class="wf-row"><div class="wf-big"></div><div class="wf-small"></div></div><div class="wf-cards"><span></span><span></span><span></span></div></div>`}

function renderAbout(){page(`<p class="eyebrow">О проекте</p><h1>ИИ помогает персонализировать работу учителя — не заменять её.</h1><div class="grid" style="margin-top:28px"><article class="card wide"><h3>Назначение</h3><p style="font-size:1.25rem">Персонализированный интеллектуальный тренажёр формирования орфографической зоркости обучающихся 5–6 классов.</p><p>Центральная идея: фиксировать не только «правильно / неправильно», а структуру действия — заметил ли ученик орфограмму, распознал ли тип, выбрал ли алгоритм, смог ли объяснить и перенести навык.</p></article><article class="card yellow"><h3>Принцип безопасности</h3><p>Непроверенные ИИ-задания не должны автоматически попадать ученику. Учитель сохраняет право изменить любой маршрут и любой сгенерированный вариант.</p></article><article class="card"><h3>Мобильность</h3><p>Крупные интерактивные зоны, нажатие прямо на букву, высокий контраст, клавиатурная навигация.</p></article><article class="card"><h3>Доступность</h3><p>Правильность обозначается не только цветом: используются значок, текстовая обратная связь и структурное изменение элемента.</p></article><article class="card blue"><h3>Данные</h3><p>Демо-ученики вымышлены. Исследовательский экспорт — обезличенный.</p></article></div><div class="actions"><button class="btn blue" data-route="diagnosis">Попробовать диагностику</button><button class="btn secondary" onclick="resetDemo()">Сбросить демо-данные</button></div>`)}

route();


/* Конструктор печатных работ: локальная генерация только из проверяемого банка заданий.
   Не пересказывает правил и не отправляет данные детей в сеть. */
let sheetVariants=[];
const escPrint = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bankKinds={spot:'Найди орфограмму',choice:'Выбор и объяснение',editor:'Редактор',input:'Самостоятельное написание'};
const shuffleSeed=(array, seed)=>[...array].sort((a,b)=>((hashString(a.id+'-'+seed)%997)- (hashString(b.id+'-'+seed)%997)));
function hashString(s){let h=2166136261; for(const x of s){h^=x.charCodeAt(0); h=Math.imul(h,16777619);}return h>>>0}
function worksheetTask(t,k){
 const topic=labelTopic(t.topic);
 if(t.type==='spot'){
   const word=t.word||t.stem||''; const idx=(t.correct||[])[0];
   return {topic,kind:bankKinds.spot,question:`Найдите орфограмму в слове «${word}». Подчеркните опасное место и письменно объясните выбор написания.`,answer:`${word}. ${t.explanation||''}`};
 }
 if(t.type==='editor') return {topic,kind:bankKinds.editor,question:`Найдите и исправьте ошибку. Объясните исправление: «${t.text||''}».`,answer:`${t.expected||''}. ${t.explanation||''}`};
 if(t.type==='choice'){
  const options=t.options||[];const good=options[t.correct]||'';
  // Для печати превращаем выбор в открытое задание, чтобы ученик не угадывал ответ.
  return {topic,kind:bankKinds.choice,question:`${t.prompt||'Определите правильное написание.'} ${t.stem?'«'+t.stem+'». ':''}Варианты: ${options.map((x,i)=>`${'АБВГД'[i]||i+1}) ${x}`).join('; ')}. Укажите ответ и обоснуйте выбор.`,answer:`${good}. ${t.explanation||''}`};
 }
 return {topic,kind:bankKinds.input,question:`${t.prompt||'Запишите правильный ответ.'} ${t.text||t.word||t.stem||''}`,answer:`${t.expected||t.answer||''}. ${t.explanation||''}`};
}
function renderWorksheet(){
 page(`<p class="eyebrow">Для учителя · печатная мастерская</p><h1>Составьте свою<br><em>орфографическую работу.</em></h1><p class="section-intro">От точечной тренировки до тематической или смешанной проверочной работы. Выберите орфограммы и этапы навыка, проверьте задания и распечатайте варианты с отдельными ключами. Все примеры — из демонстрационной базы и требуют педагогической проверки.</p>
 <section class="sheet-layout"><div class="sheet-panel"><h2>01. Настройка</h2><div class="form-grid">
 <div class="field"><label for="sheetGrade">Класс</label><select id="sheetGrade"><option value="5">5 класс</option><option value="6" selected>6 класс</option></select></div>
 <div class="field"><label for="sheetTitle">Название</label><input id="sheetTitle" class="text-input" value="Орфографическая мастерская" maxlength="100"></div>
 <div class="field"><label for="sheetVariantCount">Количество вариантов</label><select id="sheetVariantCount">${[1,2,3,4,5,6,8,10,12,15,20,25,30].map(n=>`<option value="${n}" ${n===4?'selected':''}>${n}</option>`).join('')}</select></div>
 <div class="field"><label for="sheetTaskCount">Заданий в варианте</label><select id="sheetTaskCount">${[4,6,8,10,12,15,20,25,30].map(n=>`<option value="${n}" ${n===10?'selected':''}>${n}</option>`).join('')}</select></div>
 <div class="field"><label for="sheetStage">Этап</label><select id="sheetStage"><option value="all">Все этапы (смешанная)</option><option value="1">Замечаю</option><option value="2">Распознаю</option><option value="3">Объясняю</option><option value="4">Применяю</option></select></div>
 <div class="field"><label for="sheetMethod">Тип заданий</label><select id="sheetMethod"><option value="all">Разные механики</option><option value="spot">Поиск орфограмм</option><option value="choice">Выбор с обоснованием</option><option value="editor">Корректор</option></select></div>
 <div class="field"><label for="sheetLayout">Выдача</label><select id="sheetLayout"><option value="both">Работы + ключи</option><option value="only">Только работы</option><option value="keys">Только ключи</option></select></div>
 <div class="field"><label for="sheetSpace">Место для ответа</label><select id="sheetSpace"><option value="compact">Компактное</option><option value="spacious" selected>Для объяснения</option></select></div></div>
 <div class="field" style="margin-top:18px"><label>02. Орфограммы для подбора</label><div class="sheet-toolbar"><button class="btn secondary small" id="allSheetTopics">Выбрать все</button><button class="btn secondary small" id="clearSheetTopics">Сбросить</button></div><div class="topic-checks">${orthograms.map(o=>`<label class="topic-check"><input type="checkbox" class="sheetTopic" value="${escPrint(o.id)}" checked><span>${escPrint(o.title)}</span></label>`).join('')}</div></div>
 <div class="actions"><button id="buildSheets" class="btn blue">Сформировать варианты →</button></div><p id="sheetStatus" class="micro" role="status" aria-live="polite">Выбирайте темы с учётом реально пройденного материала: для 5 класса темы 6 класса нужно отключить.</p></div>
 <div class="sheet-panel sheet-right"><p class="eyebrow">Принцип работы</p><h2>03. Редакторский стол</h2><p>Каждый вариант содержит индивидуальную подборку из утверждённого банка. Перед печатью можно изменить формулировки и ключи первого варианта. Остальные варианты формируются из того же банка; их тоже нужно проверить.</p><div class="paper-art"><span>А</span><span>а</span><span>Я</span><p>Слово → орфограмма → объяснение</p></div><div id="sheetPreview"><div class="sheet-empty">Предварительный просмотр появится после формирования.</div></div></div></section>`);
 $('#allSheetTopics').onclick=()=>$$('.sheetTopic').forEach(x=>x.checked=true);
 $('#clearSheetTopics').onclick=()=>$$('.sheetTopic').forEach(x=>x.checked=false);
 $('#buildSheets').onclick=buildSheets;
}
function buildSheets(){
 const selected=$$('.sheetTopic:checked').map(x=>x.value), stage=$('#sheetStage').value,kind=$('#sheetMethod').value;
 if(!selected.length){$('#sheetStatus').textContent='Выберите хотя бы одну орфограмму.';return;}
 let pool=trainerBank.filter(t=>selected.includes(t.topic)&&(!t.type||['spot','choice','editor','input'].includes(t.type))&&(stage==='all'||String(t.stage)===stage)&&(kind==='all'||t.type===kind));
 if(!pool.length){$('#sheetStatus').textContent='Для такого сочетания пока нет готовых заданий. Выберите другой этап или тип.';return;}
 const count=+$('#sheetTaskCount').value,variants=+$('#sheetVariantCount').value;
 // Некоторые варианты должны повторять задания: объём банка ограничен.
 sheetVariants=Array.from({length:variants},(_,v)=>{
   let ordered=shuffleSeed(pool,v+1),offset=(v*7)%ordered.length;
   ordered=[...ordered.slice(offset),...ordered.slice(0,offset)];
   return Array.from({length:count},(_,i)=>({...worksheetTask(ordered[i%ordered.length],i),id:ordered[i%ordered.length].id+'-'+i}));
 });
 $('#sheetStatus').textContent=`Сформировано ${variants} вариант(ов) по ${count} заданий. В доступной базе ${pool.length} уникальных заданий; при нехватке задания повторяются. Проверьте формулировки перед печатью.`;
 drawSheetPreview();
}
function drawSheetPreview(){
 if(!sheetVariants.length)return;
 const first=sheetVariants[0];
 $('#sheetPreview').innerHTML=`<div class="sheet-summary"><strong>${sheetVariants.length} вариантов</strong><span>${first.length} заданий в каждом · доступно редактирование</span></div>
 <label class="checkline" style="margin:14px 0"><input id="sheetApproved" type="checkbox"><span>Я проверил(а) орфограммы, формулировки и ключи перед печатью.</span></label>
 <div class="sheet-scroll"><h3>Вариант 1 · предварительный просмотр</h3>${first.map((t,i)=>`<div class="sheet-edit"><div class="sheet-num">${i+1} <small>${escPrint(t.topic)}</small></div><textarea class="sheet-question" data-i="${i}" aria-label="Текст задания ${i+1}">${escPrint(t.question)}</textarea><details><summary>Ключ и объяснение</summary><textarea class="sheet-answer" data-i="${i}" aria-label="Ответ ${i+1}">${escPrint(t.answer)}</textarea></details></div>`).join('')}</div>
 <div class="actions"><button id="printSheets" class="btn blue" disabled>Печать / Сохранить PDF</button><button id="regenerateSheets" class="btn secondary">Другие варианты ↻</button></div><p class="micro">На печать выводятся все варианты и, по выбору, отдельные ключи. В предпросмотре можно изменить только вариант № 1. Обязательно проверь остальные варианты при печати.</p>`;
 $$('.sheet-question').forEach(el=>el.addEventListener('input',()=>sheetVariants[0][+el.dataset.i].question=el.value));
 $$('.sheet-answer').forEach(el=>el.addEventListener('input',()=>sheetVariants[0][+el.dataset.i].answer=el.value));
 $('#sheetApproved').onchange=e=>$('#printSheets').disabled=!e.target.checked;
 $('#printSheets').onclick=printSheets;
 $('#regenerateSheets').onclick=buildSheets;
}
function printSheets(){
 const grade=$('#sheetGrade').value,title=$('#sheetTitle').value||'Орфографическая работа',layout=$('#sheetLayout').value,spacious=$('#sheetSpace').value==='spacious';
 const section=(tasks,index,keys)=>`<section class="print-sheet"><header class="print-header"><div class="print-mark">ОРФОЗОР <b>AI</b> / РУССКИЙ ЯЗЫК</div><div class="print-eyebrow">${escPrint(grade)} класс · ${keys?'Ключ для учителя':'Самостоятельная работа'} · вариант ${index+1}</div><h1>${escPrint(title)}</h1>${keys?'':`<div class="identity">Фамилия, имя _______________________________ &nbsp; Класс _______ &nbsp; Дата __________</div>`}</header>
 ${tasks.map((t,i)=>`<div class="print-task"><div class="print-meta">${i+1}. <small>${escPrint(t.topic)} · ${escPrint(t.kind)}</small></div><p>${escPrint(keys?t.answer:t.question)}</p>${!keys?`<div class="answer-lines">${spacious?'______________________________________________________<br>______________________________________________________':'______________________________________________________'}</div>`:''}</div>`).join('')}
 <footer>ОРФОЗОР AI · ${keys?'Материал для проверки':'Проверьте написание и объяснение'} · ${index+1}/${sheetVariants.length}</footer></section>`;
 let content=''; if(layout!=='keys')content+=sheetVariants.map((v,i)=>section(v,i,false)).join('');if(layout!=='only')content+=sheetVariants.map((v,i)=>section(v,i,true)).join('');
 const html=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${escPrint(title)}</title><style>@page{size:A4;margin:15mm 16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#202421;margin:0;background:white}.print-sheet{page-break-after:always;break-after:page}.print-sheet:last-child{page-break-after:auto;break-after:auto}.print-header{border-bottom:2px solid #232b38;padding-bottom:14px;margin-bottom:16px}.print-mark{font-size:11px;font-weight:bold;letter-spacing:1.7px}.print-mark b{color:#4d6383}.print-eyebrow{font-size:10px;margin-top:14px;text-transform:uppercase;letter-spacing:1px;color:#555}h1{font-family:Georgia,serif;font-size:25px;line-height:1.2;margin:6px 0 16px;font-weight:500}.identity{font-size:11px}.print-task{break-inside:avoid;page-break-inside:avoid;margin:0 0 12px}.print-meta{font-size:12px;font-weight:bold}.print-meta small{font-weight:400;color:#555;font-size:10px}.print-task p{font-size:12px;line-height:1.5;margin:6px 0}.answer-lines{font-size:11px;letter-spacing:.3px;line-height:2.2;color:#8b8b8b}footer{border-top:1px solid #ddd;margin-top:12px;padding-top:8px;font-size:9px;color:#666}@media screen{body{background:#dce0e1;padding:25px}.print-sheet{background:white;width:210mm;min-height:297mm;padding:15mm 16mm;margin:0 auto 24px;box-shadow:0 10px 35px #999}}@media print{.print-sheet{padding:0;box-shadow:none}.print-task{margin-bottom:9px}} </style></head><body>${content}<script>window.addEventListener('load',()=>{setTimeout(()=>window.print(),250)});<\/script></body></html>`;
 const w=window.open('','_blank');if(!w){showToast('Разрешите всплывающие окна, чтобы распечатать работу.');return;}w.document.open();w.document.write(html);w.document.close();
}
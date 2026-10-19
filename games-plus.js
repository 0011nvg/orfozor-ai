(function installGames(){
// Rules are phrased for the school course; examples never replace the full condition.
const nativePrefixRule='После русских приставок на согласную начальная И корня заменяется на Ы; после меж- и сверх- сохраняется И. После иноязычных приставок сохраняется И. Исключение: взимать.';
const stressedNounSuffixRule='В суффиксе -ок- существительных после шипящих под ударением пишется О: дружок, крючок. В безударном суффиксе -ек- пишется Е: орешек. В этом слове суффикс -ок- под ударением.';
const huntRounds=[
{title:'Ы или И после приставки?',subtitle:'Восстанови пропущенные буквы в шести словах. Учитывай приставку и начало корня.',items:[
 ['раз·грать','ы',nativePrefixRule+' Раз- — русская приставка на согласную: играть → разыграть.'],
 ['сверх·нтересный','и',nativePrefixRule+' Сверх- — исключение из общего правила: сверхинтересный.'],
 ['без·дейный','ы',nativePrefixRule+' Без- — русская приставка на согласную: идея → безыдейный.'],
 ['пред·стория','ы',nativePrefixRule+' Пред- — русская приставка на согласную: история → предыстория.'],
 ['меж·нститутский','и',nativePrefixRule+' После меж- сохраняется И: межинститутский.'],
 ['с·грать','ы',nativePrefixRule+' С- — русская приставка на согласную: играть → сыграть.']
]},
{title:'Чередующиеся гласные',subtitle:'Восстанови гласные в корнях. Определи, от чего зависит выбор в каждой паре корней.',items:[
 ['прик·снуться','о','В корнях -кас-/-кос- пишется А, если после корня есть суффикс -а-. Здесь его нет: прикоснуться.'],
 ['прик·саться','а','В корнях -кас-/-кос- перед суффиксом -а- пишется А: прикасаться.'],
 ['заг·рать','о','В корнях -гар-/-гор- без ударения пишется О: загорать.'],
 ['заг·р','а','В корне -гар- под ударением пишется А: загар.'],
 ['выг·реть','о','В корнях -гар-/-гор- без ударения пишется О: выгореть.'],
 ['к·сательная','а','В корнях -кас-/-кос- перед суффиксом -а- пишется А: касательная.']
]},
{title:'Значения приставок ПРЕ- и ПРИ-',subtitle:'Прочитай слова целиком и восстанови пропущенные гласные.',items:[
 ['пр·ехать','и','ПРИ- обозначает приближение: приехать.'],
 ['пр·сесть','и','ПРИ- обозначает неполноту действия: присесть.'],
 ['пр·клеить','и','ПРИ- обозначает присоединение: приклеить.'],
 ['пр·увеличить','е','ПРЕ- указывает на чрезмерность: преувеличить — представить что-либо большим, чем оно есть.'],
 ['пр·одолеть','е','В слове «преодолеть» пишется ПРЕ-. Если значение приставки неочевидно, проверь написание по орфографическому словарю.'],
 ['пр·школьный','и','ПРИ- обозначает близость: пришкольный — расположенный около школы.']
]},
{title:'Суффиксы существительных',subtitle:'Восстанови слова. Для каждого пропуска выбери подходящее правило.',items:[
 ['перевод·ик','ч','В названиях лиц по действию после Д, Т, З, С, Ж пишется -чик-. Здесь перед суффиксом Д: переводчик.'],
 ['камен·ик','щ','В названиях лиц по действию после других согласных пишется -щик-. Здесь перед суффиксом Н: каменщик.'],
 ['замоч·к','е','Если при изменении слова гласная суффикса выпадает, пишется -ек-: замочек — замочка.'],
 ['ключ·к','и','Если при изменении слова гласная суффикса сохраняется, пишется -ик-: ключик — ключика.'],
 ['мяч·к','и','Если при изменении слова гласная суффикса сохраняется, пишется -ик-: мячик — мячика.'],
 ['листоч·к','е','Если при изменении слова гласная суффикса выпадает, пишется -ек-: листочек — листочка.']
]},
{title:'Одна или две Н?',subtitle:'Вставь Н или НН. Вспомни правило и слова-исключения.',items:[
 ['деревя·ый','нн','В суффиксах -ан-/-ян- обычно пишется одна Н. Исключения: деревянный, стеклянный, оловянный — НН.'],
 ['глиня·ый','н','В суффиксе -ян- прилагательного «глиняный» пишется одна Н.'],
 ['оловя·ый','нн','В суффиксах -ан-/-ян- обычно пишется одна Н. Исключения: деревянный, стеклянный, оловянный — НН.'],
 ['серебря·ый','н','В суффиксе -ян- прилагательного «серебряный» пишется одна Н.'],
 ['стекля·ый','нн','В суффиксах -ан-/-ян- обычно пишется одна Н. Исключения: деревянный, стеклянный, оловянный — НН.'],
 ['кожа·ый','н','В суффиксе -ан- прилагательного «кожаный» пишется одна Н.']
]},
{title:'Смешанная практика',subtitle:'Здесь встречаются разные орфограммы. Заполни каждый пропуск буквой или мягким знаком.',items:[
 ['пят·десят','ь','В числительных от 50 до 80 мягкий знак пишется в середине слова: пятьдесят.'],
 ['отреж·','ь','В повелительном наклонении после шипящих пишется Ь: отрежь.'],
 ['мяч·к','и','При изменении слова И сохраняется: мячик — мячика. Пишется суффикс -ик-.'],
 ['девят·сот','ь','В числительных от 500 до 900 мягкий знак пишется в середине слова: девятьсот.'],
 ['крюч·к','о',stressedNounSuffixRule+' Крючок — существительное.'],
 ['реж·те','ь','В повелительном наклонении после шипящих пишется Ь; перед -те он сохраняется: режь — режьте.']
]},
{title:'Большая смешанная охота',subtitle:'Восстанови написания. Определи правило для каждого пропуска.',items:[
 ['друж·к','о',stressedNounSuffixRule],
 ['ореш·к','е','В слове «орешек» безударный суффикс -ек-: пишется Е. При изменении формы Е выпадает: орешка.'],
 ['пыл·сос','е','В сложных словах после мягких согласных, шипящих и Ц обычно пишется соединительная Е. Здесь Л мягкий: пылесос.'],
 ['пар·воз','о','В сложных словах после твёрдых согласных, кроме шипящих и Ц, обычно пишется соединительная О. Здесь Р твёрдый: паровоз.'],
 ['пр·ехать','и','ПРИ- обозначает приближение: приехать.'],
 ['раз·грать','ы',nativePrefixRule+' Раз- — русская приставка на согласную: разыграть.']
]}
];
const editorRounds=[
{headline:'Подготовка выставки',story:'В музей пришёл переводщик старинных писем. На столе у него лежали ключек от шкафа и листочик с заметками.',errors:[
 ['переводщик','переводчик','В названиях лиц по действию после Д, Т, З, С, Ж пишется -чик-. В слове «переводчик» перед суффиксом Д.'],
 ['ключек','ключик','Ключик — ключика: И сохраняется, поэтому пишется -ик-.'],
 ['листочик','листочек','Листочек — листочка: Е выпадает, поэтому пишется -ек-.']
]},
{headline:'Репетиция театральной студии',story:'Юные артисты решили разиграть сценку. Во время репетиции режиссёр попросил не прикосаться к хрупкой декорации. На подготовку отвели пятдесят минут.',errors:[
 ['разиграть','разыграть',nativePrefixRule+' Раз- — русская приставка на согласную: разыграть.'],
 ['прикосаться','прикасаться','В корнях -кас-/-кос- перед суффиксом -а- пишется А: прикасаться.'],
 ['пятдесят','пятьдесят','В числительных от 50 до 80 мягкий знак пишется в середине слова: пятьдесят.']
]},
{headline:'Экспонаты краеведческого музея',story:'На выставке стояли стекляный сосуд, глинянный кувшин и серебрянный кубок.',errors:[
 ['стекляный','стеклянный','В суффиксах -ан-/-ян- обычно одна Н. Исключения: стеклянный, оловянный, деревянный — НН.'],
 ['глинянный','глиняный','В суффиксе -ян- прилагательного «глиняный» пишется одна Н.'],
 ['серебрянный','серебряный','В суффиксе -ян- прилагательного «серебряный» пишется одна Н.']
]},
{headline:'Подпись к рисунку',story:'На рисунке петушёк стоял на заборе. У калитки виднелся крючёк, а на сосновой ветке белел снежёк.',errors:[
 ['петушёк','петушок',stressedNounSuffixRule+' Верно: петушок.'],
 ['крючёк','крючок',stressedNounSuffixRule+' Верно: крючок.'],
 ['снежёк','снежок',stressedNounSuffixRule+' Верно: снежок.']
]},
{headline:'Рецензия на рассказ',story:'В отзыве написали: «Это была неправда, а вымысел. Спектакль был неинтересный, а скучный. Сама история — далеко непростая».',errors:[
 ['неправда','не правда','В этом предложении правду отрицают и противопоставляют вымыслу: «не правда, а вымысел». Поэтому НЕ пишется раздельно.'],
 ['неинтересный','не интересный','Признак «интересный» отрицают и противопоставляют ему признак «скучный»: «не интересный, а скучный». НЕ пишется раздельно.'],
 ['непростая','не простая','Сочетание «далеко не» усиливает отрицание: далеко не простая. НЕ с прилагательным пишется раздельно.']
]},
{headline:'Хроника школьного лагеря',story:'Ребята из прешкольного лагеря решили преклеить фотографии в альбом. Редактор попросил не приувеличивать значение отдельных событий в подписях.',errors:[
 ['прешкольного','пришкольного','ПРИ- обозначает близость: пришкольный лагерь организован при школе.'],
 ['преклеить','приклеить','ПРИ- обозначает присоединение: приклеить.'],
 ['приувеличивать','преувеличивать','ПРЕ- указывает на чрезмерность: преувеличивать — представлять что-либо большим, чем оно есть.']
]}
];
const buildRounds=[
 ['при','аться',['кос','кас'],'кас','прикасаться','Перед суффиксом -а- в чередующемся корне пишется А: -кас-.','Касаться чего-либо, например поверхности стола. Дострой слово.'],
 ['при','нуться',['кас','кос'],'кос','прикоснуться','После корня нет суффикса -а-, поэтому пишется -кос-.','Один раз дотронуться до поверхности. Дострой слово.'],
 ['раз','грать',['и','ы'],'ы','разыграть',nativePrefixRule+' Раз- — русская приставка на согласную: разыграть.','Исполнить сцену по ролям. Закончи слово.'],
 ['сверх','нтересный',['ы','и'],'и','сверхинтересный',nativePrefixRule+' После сверх- сохраняется И.','Необычайно интересный рассказ. Дострой слово.'],
 ['пр','клеить',['е','и'],'и','приклеить','ПРИ- обозначает присоединение: приклеить.','Соединить вырезку с альбомной страницей при помощи клея.'],
 ['пр','увеличить',['е','и'],'е','преувеличить','ПРЕ- указывает на чрезмерность: преувеличить — представить что-либо большим, чем оно есть.','Представить событие более значительным, чем оно было на самом деле.'],
 ['замоч','к',['и','е'],'е','замочек','Замочек — замочка: Е выпадает, поэтому пишется -ек-.','Небольшой замок на шкатулке. Закончи существительное.'],
 ['ключ','к',['е','и'],'и','ключик','Ключик — ключика: И сохраняется, поэтому пишется -ик-.','Небольшой ключ от шкатулки. Закончи существительное.'],
 ['деревя','ый',['н','нн'],'нн','деревянный','В суффиксах -ан-/-ян- обычно одна Н. Исключения: деревянный, стеклянный, оловянный — НН.','Какой предмет, если он сделан из дерева? Дострой прилагательное.'],
 ['друж','к',['ё','о'],'о','дружок',stressedNounSuffixRule,'Ласковое обращение к другу. Закончи слово.']
].map(([prefix,suffix,options,answer,word,why,clue])=>({prefix,suffix,options,answer,word,why,clue}));
const detectiveRounds=[
 ['Миша написал «косаться» и объяснил гласную проверочным словом «косы». Почему такой способ проверки не подходит?',
  ['В чередующемся корне выбор зависит от суффикса -а-, а не от проверочного слова.','Он выбрал не ту форму слова: достаточно поставить «косы» в единственное число.','Перед проверкой достаточно определить, где в слове стоит ударение.'],0,
  'В слове «касаться» чередующийся корень -кас-/-кос-. Перед суффиксом -а- пишется А. Слово «косы» не является однокоренным и не помогает проверить написание.'],
 ['Лена объяснила «приморский» словами «очень морской». Что нужно уточнить?',
  ['Обозначает ли приставка присоединение к другому предмету.','Обозначает ли приставка близость к морю.','Обозначает ли приставка неполное действие.'],1,
  'В слове «приморский» ПРИ- обозначает близость к морю. Значение «очень» здесь не подходит.'],
 ['Игорь выделил приставку в слове «разиграть», но допустил ошибку. Какой шаг ему нужен?',
  ['Проверить, зависит ли написание от значения приставки ПРИ-.','Проверить, выпадает ли гласная при изменении слова.','Учесть происхождение и конечную согласную приставки, затем проверить начальную гласную корня.'],2,
  nativePrefixRule+' Раз- — русская приставка на согласную: играть → разыграть.'],
 ['Катя написала «деревяный» и сослалась на суффикс -ян-. Что она не учла?',
  ['Написание суффикса -енн-.','Наличие исключений из правила о суффиксах -ан-/-ян-.','Случай, когда к Н корня прибавляется Н суффикса.'],1,
  'Деревянный, стеклянный, оловянный — исключения из правила о суффиксе -ян-. Во всех трёх словах пишется НН.'],
 ['Саша написал «замочик». Какой способ поможет ему проверить суффикс?',
  ['Подобрать слово, в котором суффикс находится под ударением.','Сравнить суффикс с суффиксом -чик- в названиях профессий.','Изменить слово по падежам и проверить, выпадает ли гласная суффикса.'],2,
  'Замочек — замочка: Е выпадает, поэтому пишется -ек-. Для сравнения: ключик — ключика, И сохраняется.'],
 ['Маша написала «сверхынтересный»: она решила, что после любой приставки на согласную нужна Ы. Что она упустила?',
  ['После сверх- и меж- сохраняется начальная И корня.','После любой приставки сохраняется И, если она безударная.','После приставки Ы пишется только под ударением.'],0,
  nativePrefixRule+' После сверх- сохраняется И: сверхинтересный.'],
 ['На афише написали «небольшой, а маленький». Какое условие не учёл редактор?',
  ['Возможность подобрать синоним без НЕ.','Противопоставление признаков с союзом «а».','Наличие прилагательного после существительного.'],1,
  'Здесь отрицается признак «большой» и утверждается противоположный: «не большой, а маленький». Поэтому НЕ пишется раздельно. Само по себе наличие союза «а» ещё не определяет написание: нужно учитывать смысл.']
].map(([question,options,correct,why])=>({question,options,correct,why}));
const catalog={
hunt:{title:'Орфоохота',tag:'ЗАМЕЧАЮ',desc:'7 уровней по 6 слов. Восстанови каждую пропущенную букву, ориентируясь на правило.',rounds:huntRounds},
editor:{title:'Редактор вырезок',tag:'ПРИМЕНЯЮ',desc:'6 газетных заметок: найди несколько ошибок, исправь и объясни их.',rounds:editorRounds},
build:{title:'Слово-конструктор',tag:'РАСПОЗНАЮ',desc:'10 слов: выбирай подходящий фрагмент, объясняй написание и открывай следующую страницу.',rounds:buildRounds},
detective:{title:'Орфо-детектив',tag:'ОБЪЯСНЯЮ',desc:'7 историй школьных ошибок: выясни, на каком этапе сбилось рассуждение.',rounds:detectiveRounds}
};
let run={mode:'',index:0,errors:0,firstTry:0,solved:false,attempts:0};
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const explain=(msg,type)=>{const f=document.querySelector('#advancedFeedback');f.className='game-note '+type;f.innerHTML=msg};
function renderAdvancedGames(){
 const mode=(location.hash.split('mode=')[1]||'').split('&')[0];
 if(!catalog[mode]){run={mode:'',index:0,errors:0,firstTry:0,solved:false,attempts:0};page('<p class="eyebrow">ИГРОВАЯ ЛАБОРАТОРИЯ / 5–6 КЛАССЫ</p><h1>Выбери своё расследование</h1><p class="section-intro">Здесь ошибки превращаются в подсказки для размышления. Каждая игра тренирует отдельное орфографическое действие.</p><div class="game-grid game-menu">'+Object.entries(catalog).map(([key,g],i)=>'<article class="game-card game-card-'+key+'"><div class="game-sticker">0'+(i+1)+' / '+g.tag+'</div><h3>'+g.title+'</h3><p>'+g.desc+'</p><button class="btn secondary small" data-game="'+key+'">Играть →</button></article>').join('')+'</div><div class="actions"><button class="btn secondary" data-route="student">В кабинет ученика</button></div>');return;}
 if(run.mode!==mode)run={mode,index:0,errors:0,firstTry:0,solved:false,attempts:0};
 const game=catalog[mode],total=game.rounds.length;
 if(run.index===total){
  page('<section class="newgame"><p class="eyebrow">ЭКСПЕДИЦИЯ ЗАВЕРШЕНА</p><h1>'+game.title+'</h1><div class="game-finished"><span class="game-finished-mark">✳</span><h2>'+run.firstTry+' из '+total+' заданий — с первой попытки</h2><p>Ошибочных ответов: '+run.errors+'. Важно не количество попыток, а то, что ты понимаешь причину написания. Попробуй повторить темы, в которых потребовалась подсказка.</p></div><div class="actions"><button class="btn blue" id="againGame">Начать заново</button><button class="btn secondary" data-route="games">Другие игры</button></div></section>');
  document.querySelector('#againGame').onclick=()=>{run={mode,index:0,errors:0,firstTry:0,solved:false,attempts:0};renderAdvancedGames()};return;
 }
 const round=game.rounds[run.index];
 const proofTokens=mode==='editor'
   ?round.story.split(/(\s+)/).map(token=>{
     if(!/[а-яё]/i.test(token))return E(token);
     const word=token.replace(/^[^а-яё]+|[^а-яё]+$/gi,'');
     return '<button type="button" class="proof-word" data-proof-word="'+E(word)+'" aria-label="Выбрать для проверки: '+E(word)+'">'+E(token)+'</button>';
   }).join(''):'';
 let stage='';
 if(mode==='hunt'){
  stage='<p class="game-instruction">'+E(round.subtitle)+'</p><div class="hunt-grid">'+round.items.map(([pattern,,why],i)=>{const p=pattern.split('·');return '<label class="hunt-item"><span class="hunt-number">СЛОВО '+(i+1)+'</span><span class="hunt-spelling">'+E(p[0])+'<input class="hunt-letter" data-index="'+i+'" aria-label="Пропущенная буква, слово '+(i+1)+'" maxlength="2" autocapitalize="off" autocomplete="off" spellcheck="false">'+E(p[1])+'</span><span class="hunt-feedback" id="huntResult'+i+'"></span></label>'}).join('')+'</div>';
 }
 if(mode==='editor'){
  const pressPages=[
   {rubric:'ШКОЛЬНЫЕ НОВОСТИ',lead:'Литературный вечер открылся разговором о том, как рождаются точные слова.',intro:'В школьной библиотеке готовят небольшую выставку и собирают материалы для стенгазеты.',after:'Редактор попросил проверить имена, подписи и трудные суффиксы, прежде чем выпуск попадёт на доску объявлений.',quote:'Каждая буква на своём месте.'},
   {rubric:'КУЛЬТУРА / ТЕАТР',lead:'Школьная студия готовит постановку, вдохновлённую историей родного города.',intro:'Участники репетируют диалоги, подбирают костюмы и вместе обсуждают смысл каждого эпизода.',after:'Корректору предстоит проверить заметку до начала репетиции: её прочтут зрители и актёры.',quote:'На сцене нет случайных слов.'},
   {rubric:'ИЗ МУЗЕЙНОГО ЗАЛА',lead:'Небольшая экспозиция объединила предметы из разных эпох.',intro:'Экскурсоводы подготовили подписи к витринам и рассказали, как по деталям можно узнать историю вещи.',after:'Перед открытием экспозиции сотрудники решили внимательно вычитать все подписи.',quote:'История начинается с детали.'},
   {rubric:'ПРИРОДА / НАБЛЮДЕНИЯ',lead:'Юные художники представили рисунки природы после первого снега.',intro:'Иллюстрации готовят к публикации рядом с короткими зарисовками о зиме.',after:'Подпись к каждому рисунку должна быть точной: читатели замечают даже маленькие ошибки.',quote:'Слово тоже умеет рисовать.'},
   {rubric:'КНИЖНАЯ ПОЛКА',lead:'Книжный клуб обсудил необычный рассказ и его противоречивых героев.',intro:'Рецензенты сравнили свои впечатления, предложили заголовки и выбрали цитату для стенгазеты.',after:'Теперь осталось вычитать текст: от смысла противопоставления зависит написание НЕ.',quote:'У каждого рассказа есть второй смысл.'},
   {rubric:'ХРОНИКА КРУЖКА',lead:'Участники школьного кружка собрали памятный альбом.',intro:'В альбоме разместили рисунки, фотографии и небольшие рассказы о самых интересных событиях года.',after:'Редактор напоминает: значение приставки помогает проверить написание слова.',quote:'Память складывается из маленьких историй.'}
  ];
  const press=pressPages[run.index%pressPages.length];
  stage='<p class="game-instruction">Это учебная корректура: в выделенном абзаце намеренно допущены три орфографические ошибки. Найди и исправь их. Буква Ё напечатана с точками, в том числе в ошибочных написаниях.</p><article class="editor-newspaper newspaper-authentic" aria-label="Учебная газетная вырезка с орфографическими ошибками">'+
    '<div class="news-folio"><span>УЧЕБНЫЙ МАКЕТ · № '+String(run.index+1).padStart(2,'0')+'</span><span>5–6 КЛАСС · РУССКИЙ ЯЗЫК</span></div>'+
    '<div class="news-nameplate"><span class="news-emblem" aria-hidden="true">✳</span><div class="news-name">Школьный <i>вестник</i></div><span class="news-name-caption">МАЛАЯ ГАЗЕТА<br>О БОЛЬШИХ СЛОВАХ</span></div>'+
    '<div class="news-dateline"><span>ВЫПУСК ДЛЯ КОРРЕКТУРЫ</span><span>РЕДАКЦИЯ «ОРФОЗОР»</span><span>ЦЕНА: ВНИМАНИЕ К СЛОВУ</span></div>'+
    '<div class="news-rubric">'+E(press.rubric)+' / СПЕЦВЫПУСК</div>'+
    '<h3 class="news-headline">'+E(round.headline)+'</h3>'+
    '<p class="news-deck">'+E(press.lead)+'</p>'+
    '<div class="news-byline">ТЕКСТ ПЕРЕД ПЕЧАТЬЮ · <span>КОРРЕКТОРСКИЙ ЭКЗЕМПЛЯР</span></div>'+
    '<div class="news-story-grid"><div class="news-story-main"><p class="news-opening">'+E(press.intro)+'</p>'+
    '<p class="news-copy-to-edit">'+proofTokens+'</p></div>'+
    '<div class="news-story-aside"><figure class="news-engraving" aria-label="Декоративная газетная гравюра"><span class="news-engraving-art" aria-hidden="true">✒</span><figcaption>ИЗ РЕДАКЦИОННОГО АРХИВА<br>ИЛЛЮСТРАЦИЯ № '+(run.index+1)+'</figcaption></figure>'+
    '<p class="news-after">'+E(press.after)+'</p><blockquote class="news-pullquote">«'+E(press.quote)+'»</blockquote></div></div>'+
    '<div class="news-bottomline"><span>ОРФОЗОР · ЛАБОРАТОРИЯ РУССКОГО СЛОВА</span><span>СТР. 0'+(run.index+1)+'</span></div>'+
    '</article>'+
    '<section class="correction-desk" aria-label="Бланк корректуры"><div class="correction-desk-head"><div><span class="correction-kicker">РАБОЧИЙ ЛИСТ КОРРЕКТОРА</span><h3>Помоги газете выйти без ошибок</h3></div><span class="correction-pencil" aria-hidden="true">✎</span></div>'+
    '<p class="game-instruction">В газетной заметке '+round.errors.length+' орфографические ошибки. Нажми на подозрительное слово в газете: оно попадёт в свободное поле редактора. Исправь <strong>все ошибки по порядку их появления в заметке</strong>. После проверки появятся объяснения.</p>'+
    '<div class="editor-fields">'+round.errors.map((e,i)=>'<label><span>Правка № '+String(i+1).padStart(2,'0')+'</span><input class="editor-correction text-input" data-index="'+i+'" placeholder="Исправленное слово" aria-label="Исправление '+(i+1)+'" autocomplete="off" spellcheck="false"><small class="editor-msg" id="editorResult'+i+'"></small></label>').join('')+'</div></section>';
 }
 if(mode==='build'){
  stage='<p class="game-instruction"><strong>Слово-загадка.</strong> '+E(round.clue)+' Выбери подходящую часть. После проверки разберём написание.</p><div class="constructor-view" id="constructorView"><span>'+E(round.prefix)+'</span><span class="constructor-slot" id="constructorSlot">?</span><span>'+E(round.suffix)+'</span></div><div class="constructor-tiles">'+round.options.map((x,i)=>'<button class="constructor-tile" aria-pressed="false" data-piece="'+E(x)+'">'+E(x)+'</button>').join('')+'</div><p class="constructor-status" id="constructorStatus">Поставь деталь на место.</p>';
 }
 if(mode==='detective'){
  stage='<div class="detective-case"><span class="case-stamp">ДЕЛО № '+(run.index+1)+'</span><p>'+E(round.question)+'</p></div><div class="game-choice-list">'+round.options.map((x,i)=>'<button class="detective-answer" aria-pressed="false" data-choice="'+i+'">'+E(x)+'</button>').join('')+'</div>';
 }
 page('<section class="newgame game-mode-'+mode+'"><div class="newgame-heading"><div><p class="eyebrow">'+game.tag+' / ИГРОВАЯ ЛАБОРАТОРИЯ</p><h1>'+game.title+'</h1><p>'+game.desc+'</p></div><div class="newgame-count"><strong>'+String(run.index+1).padStart(2,'0')+'</strong><span>из '+String(total).padStart(2,'0')+'</span></div></div><div class="newgame-progress"><div style="width:'+((run.index/total)*100)+'%"></div></div><article class="newgame-paper"><div class="newgame-top"><span>СТРАНИЦА / '+(run.index+1)+'</span><span>ЛАБОРАТОРИЯ РУССКОГО СЛОВА</span></div><h2>'+E(mode==='editor'?'Срочная корректура перед печатью':round.title||round.headline||('Задание '+(run.index+1)))+'</h2>'+stage+'<div id="advancedFeedback" class="game-note" aria-live="polite" role="status"></div><div class="game-controls"><button id="advancedHint" class="btn secondary">Нужна подсказка</button><button id="advancedCheck" class="btn blue">Проверить ответы →</button></div></article><div class="actions"><button class="btn secondary" data-route="games">К выбору игр</button><button class="btn secondary" data-route="student">Кабинет ученика</button></div></section>');
 let selection=null,localAttempts=0;
 document.querySelectorAll('.constructor-tile').forEach(b=>b.onclick=()=>{if(run.solved)return;selection=b.dataset.piece;document.querySelectorAll('.constructor-tile').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');const slot=document.querySelector('#constructorSlot');slot.textContent=selection;slot.classList.remove('tile-snap');void slot.offsetWidth;slot.classList.add('tile-snap');});
 document.querySelectorAll('.detective-answer').forEach(b=>b.onclick=()=>{if(run.solved)return;selection=+b.dataset.choice;document.querySelectorAll('.detective-answer').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true')});
 document.querySelectorAll('.proof-word').forEach(b=>b.onclick=()=>{
   if(run.solved)return;
   document.querySelectorAll('.proof-word').forEach(x=>x.classList.remove('proof-selected'));
   b.classList.add('proof-selected');
   const fields=Array.from(document.querySelectorAll('.editor-correction'));
   const target=fields.find(x=>!x.value.trim())||fields.find(x=>x!==document.activeElement)||fields[0];
   if(target){target.value=b.dataset.proofWord||'';target.focus();target.select();}
 });
 document.querySelector('#advancedHint').onclick=()=>{
  const hints={hunt:'Определи орфограмму. В словах с приставкой учитывай и приставку, и корень; в сложных словах — согласный перед соединительной гласной; в суффиксах — ударение или изменение формы.',editor:'Ошибок ровно столько, сколько полей. Читай предложение по частям: проверь значение слова, условия правила и написание НЕ.',build:'Прочитай слово целиком и определи орфограмму. Вспомни условие выбора: значение приставки, её происхождение, наличие суффикса -а-, изменение формы слова или ударение.',detective:'Отдели три шага: заметить место, выбрать правило, применить условие.'};
  explain('<strong>Подсказка.</strong> '+hints[mode], 'hint');
 };
 document.querySelector('#advancedCheck').onclick=()=>{
  if(run.solved){run.index++;run.solved=false;run.attempts=0;renderAdvancedGames();return;}
  localAttempts++;
  const missing=mode==='hunt'?Array.from(document.querySelectorAll('.hunt-letter')).some(x=>!x.value.trim()):mode==='editor'?Array.from(document.querySelectorAll('.editor-correction')).some(x=>!x.value.trim()):selection===null;
  if(missing){localAttempts--;showToast('Заполни все пропуски или выбери ответ.');return;}
  let wrong=0;
  if(mode==='hunt'){
   round.items.forEach(([pattern,answer,why],i)=>{const input=document.querySelector('.hunt-letter[data-index="'+i+'"]'),ok=norm(input.value)===norm(answer),msg=document.querySelector('#huntResult'+i);input.classList.toggle('wrong',!ok);input.classList.toggle('right',ok);msg.className='hunt-feedback '+(ok?'right':'wrong');msg.textContent=ok?'✓ '+why:'✎ '+why+' Правильное слово: '+pattern.replace('·',answer)+'.';if(!ok)wrong++;});
  }
  if(mode==='editor'){
   round.errors.forEach(([bad,good,why],i)=>{const input=document.querySelector('.editor-correction[data-index="'+i+'"]'),ok=norm(input.value)===norm(good),msg=document.querySelector('#editorResult'+i);input.classList.toggle('wrong',!ok);input.classList.toggle('right',ok);msg.className='editor-msg '+(ok?'right':'wrong');msg.textContent=ok?'✓ '+why:'✎ В заметке «'+bad+'». Верно: «'+good+'». '+why;if(!ok)wrong++;});
  }
  if(mode==='build'){if(selection!==round.answer)wrong=1;}
  if(mode==='detective'){if(selection!==round.correct)wrong=1;}
  if(wrong){
   run.errors+=wrong;
   if(mode==='detective')explain('<strong>Продолжим расследование.</strong> '+E(round.why)+' Попробуй найти ответ, который описывает ошибку точнее.', 'retry');
   else if(mode==='build')explain('<strong>Проверь деталь.</strong> '+E(round.why)+' Найди правильный фрагмент и собери слово ещё раз.', 'retry');
   else explain('<strong>Найдено неточностей: '+wrong+'.</strong> Под каждым неверным ответом есть правило и правильный образец. Исправь свои записи, затем проверь снова.', 'retry');
  }else{
   run.solved=true;if(localAttempts===1)run.firstTry++;
   const message=mode==='build'?'Получилось слово «'+round.word+'». '+round.why:mode==='detective'?round.why:mode==='hunt'?'Все шесть пропусков восстановлены. Ты проверил условия написания для каждого слова.':'Газетная заметка исправлена. Объяснения к каждому слову — рядом с ответами.';
   explain('<strong>✓ Отличная редакторская работа.</strong> '+E(message),'success');
   if(mode==='build')document.querySelector('#constructorView').classList.add('game-solved');
   const btn=document.querySelector('#advancedCheck');btn.textContent=run.index===total-1?'Посмотреть результат →':'Следующая страница →';
   document.querySelector('#advancedHint').disabled=true;
   document.querySelectorAll('.hunt-letter,.editor-correction,.constructor-tile,.detective-answer').forEach(x=>x.disabled=true);
  }
 };
}
routeMap.games=renderAdvancedGames;
route();
})();

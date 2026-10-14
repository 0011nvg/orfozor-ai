(function installGames(){
const huntRounds=[
{title:'Ы или И после приставки?',subtitle:'Определи написание после приставки. Обрати внимание на сверх- и меж-.',items:[['раз·грать','ы','Приставка раз- оканчивается на согласную: играть → разыграть.'],['сверх·нтересный','и','После сверх- сохраняется И.'],['без·дейный','ы','После без- на согласную пишется Ы вместо начального И.'],['пред·стория','ы','После пред- на согласную пишется Ы.'],['меж·нститутский','и','После меж- сохраняется И.'],['с·грать','ы','После с- на согласную пишется Ы.']]},
{title:'Чередующиеся гласные',subtitle:'Вспомни, есть ли после корня суффикс -а- и падает ли ударение на гласную.',items:[['прик·снуться','о','Суффикса -а- после корня нет: -кос-.'],['прик·саться','а','После корня есть суффикс -а-: -кас-.'],['заг·рать','о','В безударном корне -гор- пишется О.'],['заг·р','а','В корне -гар- под ударением пишется А.'],['выг·реть','о','В безударном корне -гор- пишется О.'],['кас·тельная','а','После -кас- стоит суффикс -а-.']]},
{title:'Смысл приставки',subtitle:'Реши, что означает слово: приближение, присоединение, близость или высокая степень.',items:[['пр·ехать','и','ПРИ- обозначает приближение.'],['пр·сесть','и','ПРИ- обозначает неполноту действия.'],['пр·клеить','и','ПРИ- — присоединение.'],['пр·увеличить','е','ПРЕ- близко по значению к ПЕРЕ-.'],['пр·одолеть','е','ПРЕ- близко по значению к ПЕРЕ-.'],['пр·школьный','и','ПРИ- — нахождение рядом со школой.']]},
{title:'Суффиксы существительных',subtitle:'Выбери букву, которая зависит от предыдущего согласного или изменения формы.',items:[['перевод·ик','ч','После Д в обозначении профессии пишется -чик-.'],['камен·ик','щ','После Н в названии профессии пишется -щик-.'],['замоч·к','е','Замочка: гласная Е выпадает.'],['ключ·к','и','Ключика: гласная И сохраняется.'],['мяч·к','и','Мячика: И сохраняется.'],['листоч·к','е','Листочка: гласная Е выпадает.']]},
{title:'Одна или две Н?',subtitle:'Проверь суффикс прилагательного и вспомни исключения.',items:[['деревя·ый','нн','Деревянный — исключение: НН.'],['глиня·ый','н','В суффиксе -ян- одна Н.'],['оловя·ый','нн','Оловянный — исключение: НН.'],['серебря·ый','н','В суффиксе -ян- одна Н.'],['стекля·ый','нн','Стеклянный — исключение: НН.'],['кожа·ый','н','В суффиксе -ан- одна Н.']]},
{title:'Мягкий знак или гласная?',subtitle:'Чередуем числительные, повелительное наклонение и суффиксы.',items:[['пят·десят','ь','В числительных 50–80 мягкий знак стоит в середине.'],['отреж·','ь','В повелительном наклонении после Ж пишем Ь.'],['мяч·к','и','Мячика: И сохраняется.'],['девят·сот','ь','В числительных 500–900 мягкий знак в середине.'],['крюч·к','о','В суффиксе после Ч под ударением пишем О.'],['реж·те','ь','В повелительном наклонении Ь сохраняется перед -те.']]},
{title:'Большая смешанная охота',subtitle:'Теперь темы перемешаны: сначала распознай правило, а затем впиши букву.',items:[['друж·к','о','После Ж под ударением в суффиксе пишется О.'],['ореш·к','е','В слове «орешек» пишется Е в суффиксе; ср. «орешка».'],['пыл·сос','е','После мягкого Л первой основы соединительная Е.'],['пар·воз','о','После твёрдого Р первой основы соединительная О.'],['пр·ехать','и','ПРИ- означает приближение.'],['раз·грать','ы','После приставки раз- на согласную начальное И меняется на Ы.']]}
];
const editorRounds=[
{headline:'Объявление в школьной газете',story:'В редакцию пришёл переводщик. Он принёс ключек и листочик с запиской.',errors:[['переводщик','переводчик','После Д пишется суффикс -чик-.'],['ключек','ключик','Ключика: И не выпадает, поэтому -ик-.'],['листочик','листочек','Листочка: Е выпадает, поэтому -ек-.']]},
{headline:'Репетиция театральной студии',story:'Команда решила разиграть сценку и прикосаться к истории города. Репетицию назначили на пятдесят минут.',errors:[['разиграть','разыграть','После приставки раз- пишется Ы.'],['прикосаться','прикасаться','Есть суффикс -а- после корня: -кас-.'],['пятдесят','пятьдесят','В числительных от 50 до 80 Ь стоит в середине.']]},
{headline:'Экспонаты краеведческого музея',story:'На выставке стояли стекляный сосуд, глинянный кувшин и серебрянный кубок.',errors:[['стекляный','стеклянный','Стеклянный — исключение с НН.'],['глинянный','глиняный','В суффиксе -ян- обычно одна Н.'],['серебрянный','серебряный','В суффиксе -ян- одна Н.']]},
{headline:'Подпись к рисунку',story:'На рисунке был петушек, рядом висел крючек, а на подоконнике лежал снежек.',errors:[['петушек','петушок','После Ш под ударением в суффиксе пишем О.'],['крючек','крючок','После Ч под ударением в суффиксе пишем О.'],['снежек','снежок','После Ж под ударением в суффиксе пишем О.']]},
{headline:'Рецензия на рассказ',story:'В рецензии было сказано: «Это неправда, а вымысел. Дом небольшой, а маленький, а задача далеко непростая».',errors:[['неправда','не правда','При противопоставлении с союзом А пишем НЕ раздельно.'],['небольшой','не большой','В сочетании «не большой, а маленький» явное противопоставление.'],['непростая','не простая','После «далеко не» прилагательное пишется раздельно.']]},
{headline:'Хроника школьного кружка',story:'Ребята прешкольного кружка решили преклеить заметки в альбом, но редактор попросил не приувеличить события.',errors:[['прешкольного','пришкольного','ПРИ- — близость к школе.'],['преклеить','приклеить','ПРИ- — присоединение.'],['приувеличить','преувеличить','ПРЕ- близко по значению к ПЕРЕ-.']]}
];
const buildRounds=[
['при','аться',['кос','каз','кас'],'кас','прикасаться','Есть суффикс -а- после корня, поэтому -кас-.'],
['при','нуться',['кас','кос','каз'],'кос','прикоснуться','Суффикса -а- после корня нет: -кос-.'],
['раз','грать',['и','ы','й'],'ы','разыграть','После приставки раз- на согласную пишется Ы.'],
['сверх','нтересный',['ы','е','и'],'и','сверхинтересный','После сверх- сохраняется И.'],
['пр','клеить',['е','и','ы'],'и','приклеить','Значение присоединения: ПРИ-.'],
['пр','увеличить',['ы','е','и'],'е','преувеличить','ПРЕ- близко по смыслу к ПЕРЕ-.'],
['замоч','к',['и','а','е'],'е','замочек','Замочка: Е выпадает, пишем -ек-.'],
['ключ','к',['е','и','а'],'и','ключик','Ключика: И остаётся, пишем -ик-.'],
['деревя','ый',['н','нь','нн'],'нн','деревянный','Деревянный — исключение с НН.'],
['друж','к',['е','а','о'],'о','дружок','В суффиксе после Ж под ударением пишется О.']
].map(([prefix,suffix,options,answer,word,why])=>({prefix,suffix,options,answer,word,why}));
const detectiveRounds=[
['Миша написал «косаться», потому что подобрал проверочное слово «косы». Какой этап нарушен?',['Не заметил опасное место','Выбрал неподходящий способ проверки','Перепутал число существительного'],1,'Для КОС-/КАС- не подбирают проверочное слово. Надо найти суффикс -а- после корня. Правильно: касаться.'],
['Лена объяснила «приморский» словами «очень морской». В чём затруднение?',['Неверно определила значение ПРИ-','Забыла выделить окончание','Перепутала существительное с глаголом'],0,'ПРИ- в слове «приморский» означает близость к морю, а не высокую степень признака.'],
['Игорь выделил приставку раз-, но написал «разиграть». В чём ошибка?',['Не заметил приставку','Не определил часть речи','Не применил условие Ы после приставки'],2,'После русской приставки раз- на согласную начальное И изменяется на Ы: разыграть.'],
['Катя написала «деревяный», хотя помнила про -ян-. Чего не учла?',['Исключения из правила о Н/НН','Правило о соединительных гласных','Ударение в приставке'],0,'Деревянный — исключение, как стеклянный и оловянный. Здесь НН.'],
['Саша написал «замочик», потому что не изменил слово по падежам. Что надо сделать?',['Заменить слово синонимом','Изменить форму: замочка','Выделить приставку'],1,'Замочек — замочка. Гласная Е выпадает, значит пишется суффикс -ек-.'],
['Маша написала «сверхынтересный»: она решила, что после любой приставки на согласную нужна Ы. Что упущено?',['Исключение для приставки сверх-','Суффикс -а- после корня','Соединительная гласная'],0,'После сверх- и меж- сохраняется И: сверхинтересный, межинститутский.'],
['На афише написали «небольшой, а маленький». Почему редактор исправил написание?',['Прилагательное всегда пишется с НЕ раздельно','Есть противопоставление с союзом А','Слово «маленький» неизменяемое'],1,'При противопоставлении «не большой, а маленький» НЕ с прилагательным пишется раздельно.']
].map(([question,options,correct,why])=>({question,options,correct,why}));

/* Editorial audit: coherent Russian texts and clues that do not give away the answer. */
editorRounds[1].story='Ребята решили разиграть сценку. Режиссёр попросил не прикосаться к декорациям без разрешения. На подготовку отвели пятдесят минут.';
editorRounds[3].story='На рисунке петушек стоял на заборе. У калитки виднелся крючек, а на сосновой ветке белел снежек.';
editorRounds[4].story='В отзыве написали: «Это была неправда, а вымысел. Спектакль был неинтересный, а скучный. Сама история — далеко непростая».';
editorRounds[4].errors[1]=['неинтересный','не интересный','При противопоставлении «не интересный, а скучный» НЕ с прилагательным пишется раздельно.'];
editorRounds[4].errors[2]=['непростая','не простая','При наличии «далеко не» частица НЕ с прилагательным пишется раздельно.'];
editorRounds[5].story='Ребята прешкольного лагеря решили преклеить заметки в альбом, но редактор попросил не приувеличить события.';
const builderClues=[
 'Дотронуться до поверхности; после корня есть суффикс -а-.',
 'Один раз дотронуться до поверхности; суффикса -а- после корня нет.',
 'Исполнить сцену по ролям; перед корнем русская приставка на согласную.',
 'Очень интересный; приставка сверх- сохраняет начальную гласную корня.',
 'Присоединить вырезку к альбому, используя клей.',
 'Чрезмерно увеличить значение события.',
 'Маленький замок; при изменении: замочка.',
 'Уменьшительное название ключа. Проверь, сохраняется ли гласная суффикса при изменении слова.',
 'Сделанный из дерева; это одно из трёх слов-исключений.',
 'Ласковое обращение к другу; суффикс после Ж под ударением.'
];
buildRounds.forEach((r,i)=>{r.clue=builderClues[i];});

/* Methodological revision, October 2026:
   challenge first, norm/algorithm only after an attempt. */
const independentBuilderClues=[
 'Дотронуться до чего-либо несколько раз. Дострой слово.',
 'Один раз дотронуться до поверхности. Дострой слово.',
 'Исполнить сцену по ролям. Закончи слово.',
 'Необычайно интересный рассказ. Дострой слово.',
 'Соединить вырезку с альбомной страницей при помощи клея.',
 'Слишком сильно увеличить значение события или факта.',
 'Небольшой замок на шкатулке. Закончи существительное.',
 'Небольшой ключ от шкатулки. Закончи существительное.',
 'Предмет, сделанный из дерева. Дострой слово.',
 'Ласковое обращение к другу. Закончи слово.'
];
buildRounds.forEach((r,i)=>r.clue=independentBuilderClues[i]);
huntRounds[0].subtitle='Восстанови пропущенные буквы в шести словах. Сначала подумай над каждым написанием.';
huntRounds[1].subtitle='Восстанови пропущенные гласные. Одно и то же место может требовать разных правил.';
huntRounds[2].subtitle='Прочитай слова целиком и выбери пропущенные гласные.';
huntRounds[3].subtitle='Шесть слов, разные суффиксы. Заполни пропуски без подсказок.';
huntRounds[4].subtitle='Вставь Н или НН. Сравни значения и строение слов.';
huntRounds[5].subtitle='Разные орфограммы в одной подборке. Заполни пропуски самостоятельно.';
huntRounds[6].subtitle='Финальная смешанная подборка: восстанови написания без предварительного названия правила.';

const singleNExplanation='В прилагательных с суффиксом -ян- пишется одна Н.';
editorRounds[2].errors[0][2]='«Стеклянный» — исключение из правила о суффиксе -ян-: пишется НН.';
editorRounds[2].errors[1][2]=singleNExplanation;
editorRounds[2].errors[2][2]=singleNExplanation;
const contrastExplanation='При противопоставлении с союзом «а» НЕ пишется раздельно.';
editorRounds[4].errors[0][2]=contrastExplanation;
editorRounds[4].errors[1][2]=contrastExplanation;
editorRounds[4].errors[2][2]='После сочетания «далеко не» НЕ с прилагательным пишется раздельно.';
editorRounds[4].story='В отзыве написали: «Это была неправда, а вымысел. Спектакль был неинтересный, а скучный. Сама история — далеко непростая».';
editorRounds[1].story='Юные артисты решили разиграть сценку. Во время репетиции режиссёр попросил не прикосаться к хрупкой декорации. На подготовку отвели пятдесят минут.';
editorRounds[0].story='В музей пришёл переводщик старинных писем. На столе у него лежали ключек от шкафа и листочик с заметками.';

const independentDetective=[
 {q:'Миша написал «косаться» и объяснил гласную проверочным словом «косы». Почему такой способ проверки не подходит?',
  opts:['Для чередующегося корня нужно выяснить условие выбора буквы.','В любом корне всегда надо искать ударную проверочную гласную.','Правило здесь зависит от падежа существительного.'],correct:0,
  why:'«Касаться» содержит чередующийся корень -кас-/-кос-. После корня есть суффикс -а-, поэтому пишется А. Проверочное слово здесь не подходит.'},
 {q:'Лена назвала «приморский» словом со значением «очень морской». Как лучше проверить её объяснение?',
  opts:['Посчитать количество гласных.','Уточнить значение приставки: речь о расположении рядом с морем.','Выделить окончание и изменить число.'],correct:1,
  why:'В слове «приморский» ПРИ- обозначает близость к морю. Значение «очень» для этой приставки не подходит.'},
 {q:'Игорь заметил приставку в слове «разиграть», но допустил ошибку. Какой шаг ему нужен?',
  opts:['Определить род слова.','Заменить приставку суффиксом.','Проверить написание гласной после приставки.'],correct:2,
  why:'После русской приставки раз- на согласную начальная И меняется на Ы: разыграть.'},
 {q:'Катя написала «деревяный» и сослалась на суффикс -ян-. Что она не учла?',
  opts:['Изменение слова по падежам.','Наличие исключений из правила.','Выбор проверочного слова по ударению.'],correct:1,
  why:'«Деревянный» входит в список исключений: деревянный, стеклянный, оловянный. Во всех трёх словах пишется НН.'},
 {q:'Саша написал «замочик». Какой способ поможет ему проверить суффикс?',
  opts:['Подобрать глагол того же корня.','Поставить слово во множественное число и искать ударение.','Изменить существительное по падежам и посмотреть, исчезнет ли гласная суффикса.'],correct:2,
  why:'Замочек — замочка: гласная Е выпадает, поэтому нужен суффикс -ек-. У слова «ключик» — «ключика» — И сохраняется.'},
 {q:'Маша написала «сверхынтересный», применив правило про Ы после любой приставки на согласную. Где ошибка в её рассуждении?',
  opts:['Она не проверила особенности приставки сверх-.','Она неправильно определила число существительного.','Она не нашла ударное окончание.'],correct:0,
  why:'После приставок сверх- и меж- сохраняется начальная И корня: сверхинтересный.'},
 {q:'На афише написали «небольшой, а маленький». Какое условие не учёл редактор?',
  opts:['Краткую форму прилагательного.','Противопоставление с союзом «а».','Проверочное слово с ударной гласной.'],correct:1,
  why:'При противопоставлении «не большой, а маленький» НЕ с прилагательным пишется раздельно.'}
];
detectiveRounds.forEach((r,i)=>{
 r.question=independentDetective[i].q;
 r.options=independentDetective[i].opts;
 r.correct=independentDetective[i].correct;
 r.why=independentDetective[i].why;
});
const catalog={
hunt:{title:'Орфоохота',tag:'ЗАМЕЧАЮ',desc:'7 уровней по 6 слов. Восстанови каждую пропущенную букву, ориентируясь на правило.',rounds:huntRounds},
editor:{title:'Редактор вырезок',tag:'ПРИМЕНЯЮ',desc:'6 газетных заметок: найди несколько ошибок, исправь и объясни их.',rounds:editorRounds},
build:{title:'Слово-конструктор',tag:'РАСПОЗНАЮ',desc:'10 слов: собирай морфемы, находи условие выбора и открывай следующую страницу.',rounds:buildRounds},
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
  stage='<article class="editor-newspaper newspaper-authentic" aria-label="Учебная газетная вырезка с орфографическими ошибками">'+
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
  const hints={hunt:'Определи морфему и условие выбора для каждого слова: приставка, корень, суффикс или ударение.',editor:'Ошибок ровно столько, сколько полей. Читай предложение по частям и проверяй каждую трудную морфему.',build:'Обрати внимание на смысл слова и на морфему после пропуска.',detective:'Отдели три шага: заметить место, выбрать правило, применить условие.'};
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
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
const catalog={
hunt:{title:'Орфоохота',tag:'ЗАМЕЧАЮ',desc:'7 уровней по 6 слов. Восстанови каждую пропущенную букву, ориентируясь на правило.',rounds:huntRounds},
editor:{title:'Редактор вырезок',tag:'ПРИМЕНЯЮ',desc:'6 газетных заметок: найди несколько ошибок, исправь и объясни их.',rounds:editorRounds},
build:{title:'Слово-конструктор',tag:'РАСПОЗНАЮ',desc:'10 слов: собирай морфемы, находи условие выбора и открывай следующую страницу.',rounds:buildRounds},
detective:{title:'Орфо-детектив',tag:'ОБЪЯСНЯЮ',desc:'7 историй школьных ошибок: выясни, на каком этапе сбилось рассуждение.',rounds:detectiveRounds}
};
let run={mode:'',index:0,errors:0,firstTry:0,solved:false,attempts:0};
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').trim().toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ');
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
 let stage='';
 if(mode==='hunt'){
  stage='<p class="game-instruction">'+E(round.subtitle)+'</p><div class="hunt-grid">'+round.items.map(([pattern,,why],i)=>{const p=pattern.split('·');return '<label class="hunt-item"><span class="hunt-number">СЛОВО '+(i+1)+'</span><span class="hunt-spelling">'+E(p[0])+'<input class="hunt-letter" data-index="'+i+'" aria-label="Пропущенная буква, слово '+(i+1)+'" maxlength="2" autocapitalize="off" autocomplete="off" spellcheck="false">'+E(p[1])+'</span><span class="hunt-feedback" id="huntResult'+i+'"></span></label>'}).join('')+'</div>';
 }
 if(mode==='editor'){
  stage='<div class="editor-newspaper"><span class="newspaper-masthead">ШКОЛЬНЫЙ ВЕСТНИК / КОРРЕКТУРА</span><h3>'+E(round.headline)+'</h3><p>'+E(round.story)+'</p></div><p class="game-instruction">В тексте '+round.errors.length+' ошибки. Найди их и впиши исправленные фрагменты <strong>по порядку появления</strong>.</p><div class="editor-fields">'+round.errors.map((e,i)=>'<label>Исправление '+(i+1)+'<input class="editor-correction text-input" data-index="'+i+'" placeholder="Напиши верно" autocomplete="off" spellcheck="false"><small class="editor-msg" id="editorResult'+i+'"></small></label>').join('')+'</div>';
 }
 if(mode==='build'){
  stage='<p class="game-instruction">Собери слово по смыслу: '+E(round.word)+'. Выбери правильный фрагмент и объясни правило.</p><div class="constructor-view" id="constructorView"><span>'+E(round.prefix)+'</span><span class="constructor-slot" id="constructorSlot">?</span><span>'+E(round.suffix)+'</span></div><div class="constructor-tiles">'+round.options.map((x,i)=>'<button class="constructor-tile" aria-pressed="false" data-piece="'+E(x)+'">'+E(x)+'</button>').join('')+'</div><p class="constructor-status" id="constructorStatus">Поставь деталь на место.</p>';
 }
 if(mode==='detective'){
  stage='<div class="detective-case"><span class="case-stamp">ДЕЛО № '+(run.index+1)+'</span><p>'+E(round.question)+'</p></div><div class="game-choice-list">'+round.options.map((x,i)=>'<button class="detective-answer" aria-pressed="false" data-choice="'+i+'">'+E(x)+'</button>').join('')+'</div>';
 }
 page('<section class="newgame game-mode-'+mode+'"><div class="newgame-heading"><div><p class="eyebrow">'+game.tag+' / ИГРОВАЯ ЛАБОРАТОРИЯ</p><h1>'+game.title+'</h1><p>'+game.desc+'</p></div><div class="newgame-count"><strong>'+String(run.index+1).padStart(2,'0')+'</strong><span>из '+String(total).padStart(2,'0')+'</span></div></div><div class="newgame-progress"><div style="width:'+((run.index/total)*100)+'%"></div></div><article class="newgame-paper"><div class="newgame-top"><span>СТРАНИЦА / '+(run.index+1)+'</span><span>ЛАБОРАТОРИЯ РУССКОГО СЛОВА</span></div><h2>'+E(round.title||round.headline||('Задание '+(run.index+1)))+'</h2>'+stage+'<div id="advancedFeedback" class="game-note" aria-live="polite" role="status"></div><div class="game-controls"><button id="advancedHint" class="btn secondary">Нужна подсказка</button><button id="advancedCheck" class="btn blue">Проверить ответы →</button></div></article><div class="actions"><button class="btn secondary" data-route="games">К выбору игр</button><button class="btn secondary" data-route="student">Кабинет ученика</button></div></section>');
 let selection=null,localAttempts=0;
 document.querySelectorAll('.constructor-tile').forEach(b=>b.onclick=()=>{if(run.solved)return;selection=b.dataset.piece;document.querySelectorAll('.constructor-tile').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');const slot=document.querySelector('#constructorSlot');slot.textContent=selection;slot.classList.remove('tile-snap');void slot.offsetWidth;slot.classList.add('tile-snap');});
 document.querySelectorAll('.detective-answer').forEach(b=>b.onclick=()=>{if(run.solved)return;selection=+b.dataset.choice;document.querySelectorAll('.detective-answer').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true')});
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
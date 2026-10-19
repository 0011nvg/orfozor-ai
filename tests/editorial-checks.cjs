// Content and route smoke checks. This is not a browser layout test.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const nodes = new Map();
class Element {
  constructor() { this.innerHTML = ''; this.textContent = ''; this.value = ''; this.dataset = {}; this.disabled = false; this.events = {}; this.firstElementChild = this; this.style = {}; this.classList = {add(){},remove(){},toggle(){return true},contains(){return false}}; }
  querySelector(s) { return get(s); }
  querySelectorAll() { return []; }
  addEventListener(name, cb) { this.events[name] = cb; }
  setAttribute() {}
  insertAdjacentHTML(_, html) { this.innerHTML += html; }
  before() {}
  remove() {}
}
function get(s) { if(!nodes.has(s)) nodes.set(s, new Element()); return nodes.get(s); }
const storage = {getItem(k){return Object.hasOwn(this,k)?this[k]:null},setItem(k,v){this[k]=String(v)},removeItem(k){delete this[k]}};
const location = {hash:'#home',reload(){this.reloaded=true}};
const context = vm.createContext({console, document:{querySelector:get,querySelectorAll:()=>[],createElement:()=>new Element(),addEventListener(){}},window:{addEventListener(){},scrollTo(){}},location,localStorage:storage,setTimeout,clearTimeout,URLSearchParams,Blob,URL,confirm:()=>true});
for(const file of ['app.js','curriculum-plus.js','games-plus.js']) {
  let code = fs.readFileSync(path.join(root,file),'utf8');
  if(file==='games-plus.js') code=code.replace('routeMap.games=renderAdvancedGames;', 'globalThis.gameData={huntRounds,editorRounds,buildRounds,detectiveRounds};routeMap.games=renderAdvancedGames;');
  vm.runInContext(code, context, {filename:file});
}
const data=vm.runInContext('({orthograms,diagnosticTasks,trainerBank,routeMap,worksheetTask})',context);
const tasks=[...data.diagnosticTasks,...data.trainerBank];
assert.equal(data.orthograms.length,15);
assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length,'duplicate task IDs');
for(const t of tasks){
  assert.ok(data.orthograms.some(o=>o.id===t.topic),t.id+' unknown topic');
  assert.ok(t.prompt?.trim() && t.explanation?.trim(),t.id+' empty editorial field');
  if(t.type==='choice'){
    assert.ok(Number.isInteger(t.correct)&&t.correct>=0&&t.correct<t.options.length,t.id+' invalid key');
    assert.equal(new Set(t.options).size,t.options.length,t.id+' duplicate choices');
  }else if(t.type==='spot'){
    for(const i of t.correct)assert.ok(Number.isInteger(i)&&i>=0&&i<[...t.word].length,t.id+' invalid letter index');
  }else if(t.type==='editor') assert.notEqual(t.text.toLowerCase(),t.expected.toLowerCase(),t.id+' no error to correct');
  const sheet=data.worksheetTask(t,0);
  assert.ok(sheet.question&&sheet.answer,t.id+' empty worksheet');
}
for(const o of data.orthograms)assert.ok(data.trainerBank.some(t=>t.topic===o.id),o.id+' no practice');
for(const t of data.trainerBank.filter(t=>t.id.startsWith('more-')&&t.id.endsWith('-c'))){
  const editor=data.trainerBank.find(x=>x.id===t.id.slice(0,-1)+'e');
  assert.equal(t.options[t.correct],editor.expected,t.id+' inconsistent paired key');
}
const games=context.gameData;
for(const r of games.buildRounds){assert.equal(r.prefix+r.answer+r.suffix,r.word);assert.equal(r.options.filter(x=>x===r.answer).length,1);assert.equal(r.options.length,2);}
for(const r of games.editorRounds){let last=-1;for(const [wrong,right,why] of r.errors){const i=r.story.indexOf(wrong);assert.ok(i>last,'missing/out-of-order error '+wrong);last=i;assert.ok(right&&why);assert.notEqual(wrong,right);}}
for(const r of games.huntRounds)for(const [pattern,answer,why] of r.items){assert.equal(pattern.split('·').length,2,pattern);assert.ok(answer&&why);}
for(const r of games.detectiveRounds)assert.ok(r.correct>=0&&r.correct<r.options.length);
// Regressions reported by the Russian-language teacher.
for(const id of ['new-neNoun-choose','new-neAdj-choose']){
  const t=tasks.find(t=>t.id===id);assert.ok(!t.stem.includes('противопоставления нет')&&!t.stem.includes('Он сказал'));
}
assert.ok(tasks.some(t=>t.options?.includes('паравоз')));
assert.ok(!tasks.some(t=>t.options?.includes('паревоз')));
const suffixErrors=games.editorRounds.flatMap(r=>r.errors).filter(([w])=>['петушёк','крючёк','снежёк'].includes(w));
assert.equal(suffixErrors.length,3);
assert.equal(JSON.stringify(suffixErrors.map(x=>x[1]).sort()),JSON.stringify(['крючок','петушок','снежок']));
vm.runInContext('renderDiagnosis()',context);
assert.ok(get('#main').innerHTML.indexOf('class="callout"')<get('#main').innerHTML.indexOf('class="task-top"'),'diagnostic introduction interrupts question');
const checkedRoutes=[];
for(const [route,render] of Object.entries(data.routeMap)){
  location.hash='#'+route;render();checkedRoutes.push(route);
}
for(const mode of ['hunt','editor','build','detective']){location.hash='#games?mode='+mode;data.routeMap.games();}
// Exercise the real check handler for all base/expanded task types.
for(const t of tasks){
  vm.runInContext('state.currentHint=0',context);
  context.currentTask=t;
  vm.runInContext("renderTask(currentTask,'testTask','training')",context);
  if(t.type==='editor')get('#editorInput').value=t.expected.toUpperCase();
  // Choice/spot selection needs a browser DOM and is checked structurally above.
  if(t.type==='editor') {get('#checkBtn').events.click();assert.ok(get('#taskFeedback').innerHTML.includes('Верно.'),t.id+' check handler rejected key');}
}
for(const topic of ['oe','yi']){
  const t=tasks.find(t=>t.topic===topic);context.currentTask=t;
  vm.runInContext("state.currentHint=0;useHint(currentTask,document.querySelector('#testTask'))",context);
  assert.ok(!get('#hintArea').innerHTML.includes('морфему, в которой'));
}
storage.setItem('orfozor-state','test');storage.setItem('orfozor-games','test');storage.setItem('other-project','keep');
vm.runInContext('resetDemo()',context);
assert.equal(storage.getItem('orfozor-state'),null);assert.equal(storage.getItem('orfozor-games'),null);assert.equal(storage.getItem('other-project'),'keep');assert.ok(location.reloaded);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of index.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^https?:/.test(m[1]))continue;assert.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]+' missing asset');}
const report={tasks:tasks.length,topics:data.orthograms.length,routes:checkedRoutes.length,gameRounds:Object.values(games).reduce((n,a)=>n+a.length,0),editorKeys:tasks.filter(t=>t.type==='editor').length,checks:'PASS',browserLayoutTest:false};
console.log(JSON.stringify(report,null,2));

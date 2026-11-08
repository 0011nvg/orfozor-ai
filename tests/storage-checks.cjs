// Execute the real application with corrupt/blocked browser storage.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
function boot(raw,blocked=false,hash='#home'){
 const nodes=new Map();
 const get=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},querySelector:get,querySelectorAll:()=>[],addEventListener(){},setAttribute(){},insertAdjacentHTML(){},before(){}});return nodes.get(s)};
 const values={'orfozor-state':raw,'other-project':'keep'};
 const storage={getItem(k){if(blocked)throw Error('SecurityError');return values[k]??null},setItem(k,v){if(blocked)throw Error('QuotaExceededError');values[k]=v},removeItem(k){if(blocked)throw Error('SecurityError');delete values[k]}};
 const context=vm.createContext({console,document:{querySelector:get,querySelectorAll:()=>[],createElement:()=>get('created'),addEventListener(){}},window:{addEventListener(){},scrollTo(){}},location:{hash,reload(){}},localStorage:storage,setTimeout:()=>0,clearTimeout(){},URLSearchParams,Blob,URL,confirm:()=>true});
 for(const file of ['app.js','curriculum-plus.js','games-plus.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 return {context,nodes,values};
}
for(const raw of ['{broken','null','[]','true','42','"text"',JSON.stringify({diagnosticIndex:999,diagnosticDone:true,trainingResults:{},trainingQueue:[],currentHint:-5})]){
 const {context}=boot(raw);
 assert.equal(vm.runInContext('state.diagnosticIndex',context),0);
 assert.equal(vm.runInContext('state.diagnosticDone',context),false);
 assert.ok(vm.runInContext('Array.isArray(state.trainingResults)&&state.trainingQueue.length>0',context));
 for(const route of ['diagnosis','student','passport','result'])vm.runInContext(`routeMap.${route}()`,context);
}
const denied=boot(null,true);
assert.equal(vm.runInContext('save()',denied.context),false);
assert.match(denied.nodes.get('#toast').textContent,/не разрешил/);
assert.doesNotThrow(()=>vm.runInContext('resetDemo()',denied.context));
const good=boot(null);
vm.runInContext('state.hintsUsed=2;save()',good.context);
assert.equal(JSON.parse(good.values['orfozor-state']).hintsUsed,2);
const restored=boot(good.values['orfozor-state']);
assert.equal(vm.runInContext('state.hintsUsed',restored.context),2);
const active={taskId:'t1',mode:'training',attempts:2,startedAt:Date.now(),completed:false};
const ongoing=boot(JSON.stringify({activeTask:active}));
assert.equal(vm.runInContext('state.activeTask.attempts',ongoing.context),2);
const expanded=boot(JSON.stringify({directTopic:true,trainingQueue:['more-kos-0-e'],trainingIndex:0,currentHint:1,activeTask:{...active,taskId:'more-kos-0-e'}}),false,'#trainer');
assert.equal(vm.runInContext('state.activeTask.taskId',expanded.context),'more-kos-0-e');
assert.equal(vm.runInContext('state.activeTask.attempts',expanded.context),2,'startup must wait for the expanded bank before restoring a task');
assert.equal(vm.runInContext('state.currentHint',expanded.context),1);
console.log('PASS: corrupt state, invalid schema, blocked storage, save/restore, active attempt, reset');

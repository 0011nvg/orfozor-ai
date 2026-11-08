const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const nodes=new Map(),groups=new Map();
function node(s){if(!nodes.has(s))nodes.set(s,{value:'',checked:false,disabled:false,innerHTML:'',textContent:'',dataset:{},events:{},addEventListener(n,cb){this.events[n]=cb;}});return nodes.get(s);}
const topics=['gor','kos','verbs'].map(value=>({...node('topic-'+value),value,checked:true}));
groups.set('.sheetTopic',topics);groups.set('.sheetTopic:checked',topics);
const question={...node('question'),dataset:{i:'0'}},answer={...node('answer'),dataset:{i:'0'}};
groups.set('.sheet-question',[question]);groups.set('.sheet-answer',[answer]);
let popupCount=0,printed='';
const c=vm.createContext({console,Set,window:{open(){popupCount++;return {document:{open(){},write(html){printed=html},close(){}}}}},page(){},showToast(){},labelTopic:x=>x,orthograms:[],trainerBank:[{id:'gor-a',topic:'gor',type:'editor',stage:4,text:'загареть',expected:'загореть',explanation:'Без ударения О.'},{id:'kos-a',topic:'kos',type:'editor',stage:4,text:'косаться',expected:'касаться',explanation:'Суффикс -а-.'}],$:node,$$:s=>groups.get(s)||[]});
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');vm.runInContext(source.slice(source.indexOf('let sheetVariants=')),c);
function run(s){return vm.runInContext(s,c)}
node('#sheetGrade').value='5';node('#sheetStage').value='all';node('#sheetMethod').value='all';node('#sheetTaskCount').value='4';node('#sheetVariantCount').value='2';node('#sheetLayout').value='both';node('#sheetSpace').value='spacious';
run('syncSheetGrade()');assert.equal(topics[0].disabled,false);assert.equal(topics[1].disabled,true);assert.equal(topics[1].checked,false);
// Even a stale checked list cannot bypass the grade filter.
run('buildSheets()');assert.equal(run('sheetVariants.length'),2);assert.equal(run('sheetVariants.flat().every(t=>t.id.startsWith("gor-a"))'),true);
assert.ok(node('#sheetPreview').innerHTML.includes('Вариант для проверки'));
run('printSheets()');assert.equal(popupCount,0,'unapproved work printed');
node('#sheetApproved').onchange({target:{checked:true}});assert.equal(node('#printSheets').disabled,true,'only first variant approved');
node('#sheetVariant').onchange({target:{value:'1'}});assert.ok(node('#sheetPreview').innerHTML.includes('Вариант 2 · предварительный просмотр'));
question.value='<новая формулировка>';question.events.input();assert.equal(run('sheetVariants[1][0].question'),question.value);assert.notEqual(run('sheetVariants[0][0].question'),question.value);
node('#sheetApproved').onchange({target:{checked:true}});assert.equal(node('#printSheets').disabled,false);
answer.value='Проверенный ключ';answer.events.input();assert.equal(node('#printSheets').disabled,true);assert.equal(run('sheetApprovedVariants.has(1)'),false);assert.equal(run('sheetApprovedVariants.has(0)'),true);
node('#sheetApproved').onchange({target:{checked:true}});run('printSheets()');assert.equal(popupCount,1);assert.ok(printed.includes('&lt;новая формулировка&gt;'));assert.ok(printed.includes('Проверенный ключ'));
run('invalidateSheets();printSheets()');assert.equal(run('sheetVariants.length'),0);assert.equal(popupCount,1,'stale work printed');
console.log(JSON.stringify({worksheetChecks:'PASS',allVariantsEditable:true,perVariantApproval:true,gradeFilter:true,settingsInvalidation:true,htmlEscaping:true,browserLayoutTest:false},null,2));

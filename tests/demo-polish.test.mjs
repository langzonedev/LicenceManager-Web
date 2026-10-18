// Independent event/function regressions. DOM stubs do not establish browser layout QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as model from '../model.js';
import * as data from '../demo-data.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');

function harness(){
  const events={};let focused;
  const element=()=>({innerHTML:'',textContent:'',dataset:{},children:[],isConnected:true,classList:{add(){},remove(){},toggle(){}},listeners:{},
    addEventListener(name,fn){this.listeners[name]=fn;},focus(){focused=this;},querySelectorAll(){return[];},querySelector(){return null;},setAttribute(){},
    prepend(child){this.children.unshift(child);},open:false,close(){this.open=false;},showModal(){this.open=true;}});
  const app=element(),modal=element(),confirmation=element(),toast=element(),cancel=element(),summary=element(),form=element(),key={value:'DEMO-UNSAVED',type:'text'};
  const fields=Object.fromEntries(Object.entries({poolId:'p',poolQuantity:'10',quantity:'4',metric:'seat',customUnit:'',licenceStatus:'active'}).map(([k,value])=>[k,{value}]));
  form.elements={namedItem:name=>fields[name]};
  modal.querySelector=selector=>selector==='#pool-capacity'?summary:['form','#licence-form'].includes(selector)?form:selector==='[data-offline-editor]'?form.children.find(n=>'offlineEditor'in n.dataset):null;
  modal.querySelectorAll=selector=>selector==='[data-secret-input]'?[key]:[];
  confirmation.querySelector=()=>cancel;
  const document={activeElement:element(),querySelector:selector=>({'#app':app,'#modal':modal,'#confirmation':confirmation,'#toast':toast}[selector]||null),querySelectorAll:()=>[],createElement:element,addEventListener(name,fn){events[`document:${name}`]=fn;}};
  let hash='#overview';
  const location={get hash(){return hash;},set hash(value){hash=value.startsWith('#')?value:`#${value}`;},protocol:'https:'};
  const context=vm.createContext({...model,...data,e:model.escapeHtml,document,location,navigator:{onLine:true},window:{addEventListener(name,fn){events[name]=fn;},scrollTo(){}},history:{replaceState(_s,_t,hash){location.hash=hash;},pushState(_s,_t,hash){location.hash=hash;}},setTimeout(){return 1;},clearTimeout(){},crypto:webcrypto,Intl,console});
  vm.runInContext(source,context);
  const run=code=>vm.runInContext(code,context);
  run('user=USERS[0]');
  return{run,events,app,modal,confirmation,cancel,summary,form,fields,key,document,get focused(){return focused;}};
}

test('dirty form cancellation and Escape preserve the editor; acceptance runs once and clears its key',()=>{
  const h=harness();h.modal.open=true;h.run('modalDirty=true;closeModal()');
  assert.equal(h.confirmation.open,true);assert.equal(h.focused,h.cancel);assert.equal(h.modal.open,true);
  h.run('finishConfirmation()');assert.equal(h.modal.open,true);assert.equal(h.run('modalDirty'),true);assert.equal(h.key.value,'DEMO-UNSAVED');
  h.run('closeModal()');let prevented=false;h.confirmation.listeners.cancel({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.equal(h.modal.open,true);assert.equal(h.run('modalDirty'),true);
  h.run('closeModal();finishConfirmation(true);finishConfirmation(true)');
  assert.equal(h.modal.open,false);assert.equal(h.key.value,'');assert.equal(h.run('modalDirty'),false);
});

test('pending confirmation rejects repeated requests and accepts its original callback once',()=>{
  const h=harness();h.run("globalThis.accepted=0;requestConfirmation('First','Message','Accept',()=>accepted++);requestConfirmation('Second','Message','Accept',()=>accepted+=100);finishConfirmation(true);finishConfirmation(true)");
  assert.equal(h.run('accepted'),1);
});

test('app update keeps edits on cancellation and activates once only after acceptance',async()=>{
  const h=harness();
  // Add a worker after app startup so this test exercises only the update action.
  h.run("globalThis.sent=[];globalThis.controllerListeners=0;navigator.serviceWorker={addEventListener(){controllerListeners++}};waitingWorker={postMessage(message){sent.push(message)}};mutationCount=2;modalDirty=true;");
  await h.run("action('update',{dataset:{}})");
  assert.equal(h.confirmation.open,true);assert.match(h.confirmation.innerHTML,/Keep working/);assert.match(h.confirmation.innerHTML,/Update and reset demo/);
  h.run('finishConfirmation()');assert.equal(h.run('sent.length'),0);assert.equal(h.run('mutationCount'),2);assert.equal(h.run('modalDirty'),true);
  await h.run("action('update',{dataset:{}})");h.run('finishConfirmation(true);finishConfirmation(true)');
  assert.equal(h.run('sent.length'),1);assert.equal(h.run('sent[0].type'),'ACTIVATE_UPDATE');assert.equal(h.run('controllerListeners'),1);
  assert.equal(h.run('mutationCount'),0);assert.equal(h.run('modalDirty'),false);
});

test('reset restores fictional records and clears search, sorting, filters and transient state',async()=>{
  const h=harness();h.modal.open=true;
  h.run("db.licences[0].title='Changed demo record';query='stale search';filter='expired';sort='attention';renewalFilter='snoozed';mutationCount=5;modalDirty=true;shown.add('lm-001');location.hash='#renewals'");
  await h.run("action('confirm-reset',{dataset:{}})");
  assert.equal(h.run('db.licences[0].title'),data.createFixtures().licences[0].title);
  assert.equal(h.run('query'),'');assert.equal(h.run('filter'),'all');assert.equal(h.run('sort'),'name');assert.equal(h.run('renewalFilter'),'all');
  assert.equal(h.run('mutationCount'),0);assert.equal(h.run('modalDirty'),false);assert.equal(h.run('shown.size'),0);assert.equal(h.modal.open,false);assert.equal(h.run('location.hash'),'#overview');
});

test('hash navigation keeps dirty form on cancellation and discards only after explicit acceptance',()=>{
  const h=harness();h.modal.open=true;h.run("modalDirty=true;location.hash='#systems'");h.events.hashchange();
  assert.equal(h.run('location.hash'),'#overview');h.run('finishConfirmation()');assert.equal(h.modal.open,true);
  h.run("location.hash='#systems'");h.events.hashchange();h.run('finishConfirmation(true)');
  assert.equal(h.modal.open,false);assert.equal(h.run('location.hash'),'#systems');
  h.events.hashchange();assert.match(h.app.innerHTML,/Systems/);
});

test('offline and forced signout dismiss pending confirmation without executing deferred discard',()=>{
  for(const force of ['offline','signout']){
    const h=harness();h.modal.open=true;h.run("modalDirty=true;globalThis.accepted=0;requestConfirmation('Discard','Message','Discard',()=>accepted++)");
    if(force==='offline'){h.run('navigator.onLine=false');h.events.offline();assert.equal(h.modal.open,true);assert.equal(h.run('modalDirty'),true);}
    else{h.run('signOut()');assert.equal(h.modal.open,false);assert.equal(h.run('user'),null);}
    assert.equal(h.confirmation.open,false);h.run('finishConfirmation(true)');assert.equal(h.run('accepted'),0);assert.equal(h.key.value,'');
  }
});

test('pool preview conserves purchased capacity, excludes edited entry and ignores archived holdings',()=>{
  const h=harness();h.form.dataset.id='edit';h.run("db.pools=[{id:'p',quantity:10,metric:'seat'}];db.licences=[{id:'edit',poolId:'p',quantity:4,lifecycle:'active'},{id:'other',poolId:'p',quantity:3,lifecycle:'active'},{id:'old',poolId:'p',quantity:99,lifecycle:'archived'}];updatePoolCapacity()");
  assert.match(h.summary.innerHTML,/Held by other entries<strong>3/);assert.match(h.summary.innerHTML,/Available for this entry<strong>7/);assert.match(h.summary.innerHTML,/Remaining after this entry<strong>3/);
  h.fields.quantity.value='8';h.run('updatePoolCapacity()');assert.equal(h.summary.dataset.tone,'warning');assert.match(h.summary.innerHTML,/exceeds the purchase by 1 seat/);
  h.fields.quantity.value='';h.run('updatePoolCapacity()');assert.match(h.summary.innerHTML,/positive whole-number/);assert.doesNotMatch(h.summary.innerHTML,/Remaining after this entry<strong>10/);
});

test('new shared purchase preview accounts for standalone source before adding the new subset',()=>{
  const h=harness();h.form.dataset.source='source';h.fields.poolId.value='new';h.fields.poolQuantity.value='5';h.fields.quantity.value='1';
  h.run("db.licences=[{id:'source',poolId:'',quantity:5,lifecycle:'active'}];updatePoolCapacity()");
  assert.match(h.summary.innerHTML,/Held by other entries<strong>5/);assert.match(h.summary.innerHTML,/Available for this entry<strong>0/);assert.match(h.summary.innerHTML,/exceeds the purchase by 1 seat/);
});

test('retirement preview explains draft reservations while archived entries release capacity',()=>{
  const h=harness();h.form.dataset.id='edit';h.fields.licenceStatus.value='retired';
  h.run("db.pools=[{id:'p',quantity:10,metric:'seat'}];db.licences=[{id:'edit',poolId:'p',quantity:4,lifecycle:'active'},{id:'other',poolId:'p',quantity:3,lifecycle:'active'}];updatePoolCapacity()");
  assert.match(h.summary.innerHTML,/Remaining if saved as draft<strong>3/);assert.match(h.summary.innerHTML,/Saving a draft holds these units/);assert.match(h.summary.innerHTML,/Retired status to release/);
  h.run("db.licences[0].lifecycle='archived';updatePoolCapacity()");
  assert.match(h.summary.innerHTML,/Remaining after this entry<strong>7/);assert.match(h.summary.innerHTML,/Archived entries do not hold/);
});

test('invalid shared entry saves target the editable cause and leave the purchase and records unchanged',()=>{
  const scenarios=[
    {quantity:'9',poolQuantity:'40',metric:'seat',key:'quantity',message:/41 seat units, exceeding the 40 purchased/},
    {quantity:'8',poolQuantity:'31',metric:'seat',key:'poolQuantity',message:/40 seat units, exceeding the 31 purchased/},
    {quantity:'8',poolQuantity:'0',metric:'seat',key:'poolQuantity',message:/positive whole number/},
    {quantity:'8',poolQuantity:'40',metric:'core',key:'metric',message:/same unit of measure/},
  ];
  for(const scenario of scenarios){
    const h=harness();
    h.run("db.pools=[{id:'p',name:'Shared demo purchase',quantity:40,metric:'seat'}];db.licences=[{id:'other',poolId:'p',quantity:32,metric:'seat',lifecycle:'active'}];globalThis.beforeSave=JSON.stringify(db);globalThis.capturedErrors=null;formErrors=(_form,errors)=>{capturedErrors=errors};globalThis.FormData=class{constructor(){return Object.entries(globalThis.formValues)}};");
    h.run(`globalThis.formValues=${JSON.stringify({title:'Demo subset',vendor:'Demo vendor',product:'Demo product',owner:'Demo custodian',licenceType:'perpetual',licenceEndState:'not_applicable',holding:'spare',licenceStatus:'active',poolId:'p',poolName:'Shared demo purchase',quantity:scenario.quantity,poolQuantity:scenario.poolQuantity,metric:scenario.metric})}`);
    h.run("saveLicence({dataset:{}},'draft')");
    assert.deepEqual(h.run('Object.keys(capturedErrors)').join(','),scenario.key);
    assert.match(h.run(`capturedErrors[${JSON.stringify(scenario.key)}]`),scenario.message);
    assert.equal(h.run('JSON.stringify(db)'),h.run('beforeSave'));assert.equal(h.run('mutationCount'),0);
  }
});

test('each dashboard card clears previous search and opens its precise filter',async()=>{
  const h=harness();
  for(const filter of ['current','due_soon','expired','review']){
    h.run("query='does not exist';location.hash='#overview'");h.run(`globalThis.target={dataset:{filter:${JSON.stringify(filter)}}}`);
    await h.run("action('stat',target)");
    assert.equal(h.run('filter'),filter);assert.equal(h.run('query'),'');
    assert.match(h.app.innerHTML,new RegExp(`data-filter="${filter}" aria-pressed="true"`));
    const count=h.run(`findLicences(db,'',${JSON.stringify(filter)},DEMO_DATE).length`);
    assert.match(h.app.innerHTML,new RegExp(`<span>${count} ${count===1?'licence':'licences'}</span>`));
  }
});

test('renewals distinguish total date actions from distinct licence count, including search',()=>{
  const h=harness();h.run("location.hash='#renewals';render()");
  const [actions,licences]=h.run('[dueEvents(db,DEMO_DATE,true).length,new Set(dueEvents(db,DEMO_DATE).map(x=>x.licence.id)).size]');
  assert.ok(actions>licences);assert.match(h.app.innerHTML,new RegExp(`${actions} date actions across ${licences} licences`));
  assert.match(h.app.innerHTML,new RegExp(`aria-label="${licences} licences with due actions"`));
  h.run("query='vCenter';render()");const count=h.run("dueEvents(db,DEMO_DATE,true).filter(x=>x.licence.title.includes('vCenter')).length");
  assert.match(h.app.innerHTML,new RegExp(`${count} date actions across 1 licence matching`));
});

function dualRelationshipEditor(){
  const h=harness();
  h.run(`globalThis.edited=licence('lm-001');edited.quantity=4;
    globalThis.deployment=db.associations.find(a=>a.licenceId===edited.id&&a.purpose==='activation_target');
    const allocation={id:'qa-same-system-allocation',licenceId:edited.id,systemId:deployment.systemId,purpose:'allocation',units:2};
    validateAssociation(db,edited,allocation);db.associations.push(allocation);
    globalThis.formValues=Object.fromEntries(Object.entries(edited).filter(([,v])=>typeof v==='string'));
    Object.assign(formValues,{title:edited.title+' · reviewed',quantity:String(edited.quantity),primarySystemId:deployment.systemId,poolId:edited.poolId||'',key:''});
    for(const k of [...Object.keys(DATE_FIELDS),'licenceStart','supportStart','purchaseDate']){
      formValues[k+'State']=edited[k]?.state||'unknown';formValues[k]=edited[k]?.date||'';
    }
    globalThis.FormData=class{constructor(){return Object.entries(globalThis.formValues)}};
    globalThis.capturedErrors=null;formErrors=(_form,errors)=>{capturedErrors=errors};
    globalThis.editForm={dataset:{id:edited.id,revision:String(edited.revision)}};`);
  return h;
}

test('metadata edits preserve same-system activation and allocation links, including their identities',()=>{
  const h=dualRelationshipEditor();
  const original=h.run('JSON.stringify(db.associations)');
  h.run("saveLicence(editForm,'active')");
  assert.equal(h.run('capturedErrors'),null);
  assert.equal(h.run('edited.title'),'vCenter Server · reviewed');
  assert.equal(h.run('allocated(db,edited.id)'),2);
  assert.equal(h.run('JSON.stringify(db.associations)'),original);
  assert.equal(h.run('mutationCount'),1);
});

test('reducing entry capacity below its same-system allocation rejects the whole edit without mutation',()=>{
  const h=dualRelationshipEditor();
  const original=h.run('JSON.stringify(db)');
  h.run("formValues.quantity='1';saveLicence(editForm,'active')");
  assert.match(h.run('capturedErrors.quantity'),/below the existing system allocation/);
  assert.equal(h.run('JSON.stringify(db)'),original);
  assert.equal(h.run('mutationCount'),0);
});

test('a system card counts distinct licences when one licence has activation and allocation links',()=>{
  const h=dualRelationshipEditor();
  h.run('db.systems=db.systems.filter(s=>s.id===deployment.systemId);db.associations=db.associations.filter(a=>a.systemId===deployment.systemId);location.hash="#systems";render()');
  const count=h.run('new Set(db.associations.map(a=>a.licenceId)).size');
  assert.match(h.app.innerHTML,new RegExp(`<dt>Licences</dt><dd>${count} associated</dd>`));
  h.run('location.hash="#systems/"+deployment.systemId;render()');
  assert.match(h.app.innerHTML,new RegExp(`Associated licences<span class="count-label">${count}</span>`));
});

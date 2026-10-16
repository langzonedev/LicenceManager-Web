// DOM-stub smoke coverage: executes the actual app render functions in Node.
// This catches JS/render failures; it does not claim real-browser layout QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import * as model from '../model.js';
import * as data from '../demo-data.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
function harness(){
  const node={innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},dataset:{},open:false,close(){this.open=false;},showModal(){this.open=true;}};
  const app={...node},modal={...node},toast={...node};
  const listeners={};
  const document={querySelector(selector){return selector==='#app'?app:selector==='#modal'?modal:selector==='#toast'?toast:selector==='#demo-user'?{value:'alex'}:null;},querySelectorAll(){return[];},addEventListener(name,fn){listeners[name]=fn;},activeElement:null,title:''};
  const context=vm.createContext({...model,...data,e:model.escapeHtml,document,navigator:{onLine:true},location:{hash:'',protocol:'https:'},window:{addEventListener(){},scrollTo(){}},setTimeout(){return 1;},clearTimeout(){},crypto:webcrypto,Intl,console,confirm(){return true;}});
  vm.runInContext(source,context);return{context,app,modal,document};
}
test('all main routes and detail tabs render for each demo role without exposing hidden key values',()=>{
  const {context,app}=harness();assert.match(app.innerHTML,/Your workspace awaits/);
  const routes=['overview','licences','systems','systems/sys-001','renewals','activity','team','licences/lm-001/overview','licences/lm-001/licensing','licences/lm-011','licences/lm-012','licences/lm-001/systems','licences/lm-001/documents','licences/lm-001/history','licences/lm-006','licences/lm-008','missing'];
  for(let i=0;i<3;i++)for(const route of routes){
    vm.runInContext(`user=USERS[${i}];location.hash=${JSON.stringify('#'+route)};render();`,context);
    assert.match(app.innerHTML,/<main/);assert.doesNotMatch(app.innerHTML,/DEMO-NOT-VALID-LM/);
  }
});
test('viewer preview has no retrieval/edit controls and offline rendering clears records',()=>{
  const{context,app}=harness();vm.runInContext("user=USERS[2];location.hash='#licences/lm-001';render();",context);
  assert.doesNotMatch(app.innerHTML,/data-action="(?:copy|reveal|edit-licence)"/);
  assert.match(app.innerHTML,/Keys are restricted/);
  vm.runInContext('navigator.onLine=false;render();',context);assert.doesNotMatch(app.innerHTML,/vCenter Server/);assert.match(app.innerHTML,/You.re offline/);
});
test('recorded and synthetic markup is escaped rather than interpreted as HTML',()=>{
  const{context,app}=harness();vm.runInContext("user=USERS[0];db.licences[0].title='<img src=x onerror=alert(1)>';location.hash='#licences';render();",context);
  assert.doesNotMatch(app.innerHTML,/<img src=x/);assert.match(app.innerHTML,/&lt;img/);
});
test('copy works while the value remains visually hidden and respects role access',async()=>{
  const{context,app}=harness();context.copied=[];vm.runInContext("user=USERS[0];location.hash='#licences/lm-001';navigator.clipboard={writeText:async value=>copied.push(value)};render();",context);
  await vm.runInContext("retrieveKey('lm-001',undefined,true)",context);
  assert.equal(context.copied[0],'DEMO-NOT-VALID-LM-001');assert.doesNotMatch(app.innerHTML,/DEMO-NOT-VALID-LM-001/);
  vm.runInContext('user=USERS[2]',context);
  await assert.rejects(vm.runInContext("retrieveKey('lm-001',undefined,true)",context),/cannot perform/);
  assert.equal(context.copied.length,1);
});
test('role changes can preserve in-memory data while simulated logout removes the workspace view',()=>{
  const{context,app}=harness();vm.runInContext("user=USERS[0];db.licences[0].title='Changed fictional title';user=USERS[1];location.hash='#licences';render();",context);
  assert.match(app.innerHTML,/Changed fictional title/);
  vm.runInContext('signOut()',context);assert.match(app.innerHTML,/Your workspace awaits/);assert.doesNotMatch(app.innerHTML,/Changed fictional title/);
});

test('expanded editors expose distinct ownership, SUM and purchase evidence controls',()=>{
 const {context,modal}=harness();
 vm.runInContext("user=USERS[0];licenceEditor('lm-001');",context);
 for(const field of ['softwareVersion','category','licenceModel','activation','duration','paymentModel','legalOwner','procuredBy','rights','transferable','sumRenewalState','supportStartState','project','primarySystemId','poolQuantity'])assert.match(modal.innerHTML,new RegExp('name=\"'+field+'\"'));
 assert.match(modal.innerHTML,/editor-section/);
 vm.runInContext("documentEditor('lm-001');",context);
 assert.match(modal.innerHTML,/name=\"evidenceFile\"/);assert.match(modal.innerHTML,/name=\"sourceUrl\"/);assert.match(modal.innerHTML,/later versions never replace/);
});

test('past start dates say Started rather than reporting an expired licence',()=>{
 const {context,app}=harness();vm.runInContext("user=USERS[0];location.hash='#licences/lm-001';render();",context);assert.match(app.innerHTML,/Started/);assert.doesNotMatch(app.innerHTML,/Licence expired/);
});

test('metadata export keeps an accessible name when its visible label is hidden on phones',()=>{
 const {context,app}=harness();vm.runInContext("user=USERS[0];location.hash='#licences';render();",context);
 assert.match(app.innerHTML,/<button[^>]*data-action="export"[^>]*aria-label="Export metadata"/);
});

// Regression evidence for operator-visible state transitions. This DOM stub is
// deliberately separate from browser usability evidence in the private handoff.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import * as model from '../model.js';
import * as data from '../demo-data.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
function harness(){
  const events={};const key={value:'DEMO-UNSAVED',type:'text'};const metadata={value:'Unsaved fictional title'};const form={prepend(n){this.notice=n;}};
  const node={innerHTML:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},dataset:{},open:false,close(){this.open=false;},showModal(){this.open=true;}};
  const app={...node},toast={...node},modal={...node,querySelector(selector){if(selector==='form')return form;return null;},querySelectorAll(selector){return selector==='[data-secret-input]'?[key]:[];}};
  const document={querySelector(selector){return {'#app':app,'#modal':modal,'#toast':toast}[selector]||null;},querySelectorAll(selector){return selector==='input[data-secret-input]'?[key]:[];},addEventListener(){},createElement(){return {dataset:{},setAttribute(){},textContent:''};},activeElement:null,title:''};
  const context=vm.createContext({...model,...data,e:model.escapeHtml,document,navigator:{onLine:true},location:{hash:'',protocol:'https:'},window:{addEventListener(name,fn){events[name]=fn;},scrollTo(){}},setTimeout(){return 1;},clearTimeout(){},crypto:webcrypto,Intl,console,confirm(){return true;}});
  vm.runInContext(source,context);return {context,app,modal,events,key,metadata,form};
}
test('disconnect retains an open metadata editor and clears its unsaved key',()=>{
  const h=harness();h.modal.open=true;vm.runInContext('user=USERS[0];navigator.onLine=false;',h.context);h.events.offline();
  assert.equal(h.modal.open,true);assert.equal(h.metadata.value,'Unsaved fictional title');assert.equal(h.key.value,'');assert.equal(h.key.type,'password');assert.match(h.form.notice.textContent,/unsaved metadata is retained/i);assert.match(h.form.notice.textContent,/key was cleared/i);
  assert.throws(()=>vm.runInContext("requirePermission('write')",h.context),/Reconnect/);
});
test('overview 30-day count excludes 60 and 90-day renewal attention',()=>{
  const h=harness();vm.runInContext(`user=USERS[0];location.hash='#overview';db.licences=db.licences.slice(0,3);db.licences.forEach((l,i)=>{l.lifecycle='active';l.licenceType='subscription';for(const k of Object.keys(DATE_FIELDS))l[k]={state:'not_applicable'};l.licenceEnd={state:'known',date:['2026-11-15','2026-12-15','2027-01-14'][i]};});render();`,h.context);
  assert.match(h.app.innerHTML,/Due soon[\s\S]*?<strong>1<\/strong><small>Next action within 30 days/);
});
test('overview review count includes active records with unknown licence dates',()=>{
  const h=harness();vm.runInContext(`user=USERS[0];location.hash='#overview';db.licences=db.licences.slice(0,1);const l=db.licences[0];l.lifecycle='active';l.licenceType='subscription';for(const k of Object.keys(DATE_FIELDS))l[k]={state:'unknown'};render();`,h.context);
  assert.match(h.app.innerHTML,/Needs review[\s\S]*?<strong>1<\/strong><small>Confirm missing entitlement details/);
});

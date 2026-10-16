// Reviewer-authored event-handler regressions. This lightweight DOM model
// executes app code; it is not browser rendering/accessibility evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as model from '../model.js';
import * as data from '../demo-data.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');

function harness(){
  const events={},timers=new Map();let focused,timerId=0;
  class Form {constructor(query){this.id='global-search';this.query=query;}}
  const location={hash:'',protocol:'https:'};
  const element=tag=>({tag,children:[],dataset:{},attributes:{},classList:{add(){},remove(){},toggle(){}},textContent:'',
    append(child){this.children.push(child);child.parent=this;},prepend(child){this.children.unshift(child);child.parent=this;},
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);},
    setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},
    addEventListener(name,callback){this.listeners??={};this.listeners[name]=callback;},focus(){focused=this;},querySelectorAll(){return[];}});
  const details={open:false},field=element('div'),title=Object.assign(element('input'),{id:'f-title',name:'title',value:'Unsaved fictional title',labels:[{textContent:'Software name *'}],closest:selector=>selector==='details'?details:field});
  const key=Object.assign(element('input'),{value:'DEMO-UNSAVED',type:'text'});
  const form=element('form');form.elements={namedItem:name=>name==='title'?title:null};
  form.querySelector=selector=>selector==='.form-error'?form.children.find(child=>child.className==='form-error'):null;
  form.querySelectorAll=selector=>selector==='[aria-invalid]'&&title.attributes['aria-invalid']?[title]:selector==='.field-error'?field.children.filter(child=>child.className==='field-error'):[];
  const app=Object.assign(element('div'),{innerHTML:''}),toast=element('div'),modal=Object.assign(element('dialog'),{open:true,close(){this.open=false;},showModal(){this.open=true;},querySelector(selector){return selector==='form'?form:selector==='[data-offline-editor]'?form.children.find(child=>'offlineEditor'in child.dataset):null;},querySelectorAll:selector=>selector==='[data-secret-input]'?[key]:[]});
  const document={querySelector:selector=>({'#app':app,'#modal':modal,'#toast':toast}[selector]||null),querySelectorAll:selector=>selector==='input[data-secret-input]'?[key]:[],addEventListener(name,callback){events[`document:${name}`]=callback;},createElement:element,activeElement:null};
  const context=vm.createContext({...model,...data,e:model.escapeHtml,document,navigator:{onLine:true},location,HTMLFormElement:Form,FormData:class{constructor(form){this.form=form;}get(){return this.form.query;}},history:{pushState(_state,_title,hash){location.hash=hash;}},requestAnimationFrame(callback){callback();},window:{addEventListener(name,callback){events[name]=callback;},scrollTo(){}},setTimeout(callback,delay){const id=++timerId;timers.set(id,{callback,delay});return id;},clearTimeout(id){timers.delete(id);},crypto:webcrypto,Intl,console,confirm(){return true;}});
  vm.runInContext(source,context);
  return{context,events,app,modal,form,title,key,details,field,timers,Form,get focused(){return focused;}};
}

test('offline/reconnect handler round trip retains actual editor fields, clears keys and removes its notice',()=>{
  const h=harness();vm.runInContext('user=USERS[0];navigator.onLine=false;modalDirty=true;',h.context);
  h.events.offline();h.events.offline();
  assert.equal(h.modal.open,true);assert.equal(h.title.value,'Unsaved fictional title');assert.equal(h.key.value,'');assert.equal(h.key.type,'password');
  assert.equal(h.form.children.filter(child=>'offlineEditor'in child.dataset).length,1);
  assert.match(h.app.innerHTML,/offline/i);assert.doesNotMatch(h.app.innerHTML,/vCenter Server/);
  assert.equal(vm.runInContext('modalDirty',h.context),true);
  assert.throws(()=>vm.runInContext("requirePermission('write')",h.context),/Reconnect/);
  vm.runInContext('navigator.onLine=true;',h.context);h.events.online();
  assert.equal(h.form.children.length,0);assert.equal(h.title.value,'Unsaved fictional title');assert.equal(h.key.value,'');
  assert.doesNotThrow(()=>vm.runInContext("requirePermission('write')",h.context));
});

test('field-error links reveal collapsed fields, focus the control and replace stale summaries',()=>{
  const h=harness();h.context.testForm=h.form;
  vm.runInContext("formErrors(testForm,{title:'Enter a software name.'});",h.context);
  const summary=h.form.children[0],link=summary.children[1].children[0].children[0];
  assert.equal(summary.attributes.role,'alert');assert.equal(h.focused,summary);assert.equal(link.textContent,'Software name: Enter a software name.');
  assert.equal(h.title.attributes['aria-invalid'],'true');assert.equal(h.title.attributes['aria-describedby'],'error-title');
  h.details.open=false;let prevented=false;link.listeners.click({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.equal(h.details.open,true);assert.equal(h.focused,h.title);
  vm.runInContext("formErrors(testForm,{title:'Review the replacement value.'});",h.context);
  assert.equal(h.form.children.length,1);assert.equal(h.field.children.length,1);
  assert.equal(h.field.children[0].textContent,'Review the replacement value.');
});

test('date-state validation links focus the enabled state selector when its date input is disabled',()=>{
  const h=harness();h.title.disabled=true;
  const state={...h.title,attributes:{},id:'f-licenceEnd-state',disabled:false,labels:[{textContent:'Licence end'}]};
  h.form.elements.namedItem=name=>name==='licenceEnd'?h.title:name==='licenceEndState'?state:null;
  h.context.testForm=h.form;
  vm.runInContext("formErrors(testForm,{licenceEnd:'Choose a known expiry or explicitly mark it Unknown.'});",h.context);
  const link=h.form.children[0].children[1].children[0].children[0];
  assert.equal(link.href,'#f-licenceEnd-state');assert.match(link.textContent,/^Licence end:/);
  link.listeners.click({preventDefault(){}});
  assert.equal(h.focused,state);assert.equal(state.attributes['aria-invalid'],'true');assert.equal(h.title.attributes['aria-invalid'],undefined);
});

test('submitting search cancels its debounce before a subsequent navigation',async()=>{
  const h=harness();h.modal.open=false;vm.runInContext("user=USERS[0];location.hash='#overview';",h.context);
  h.events['document:input']({target:{id:'search',value:'DEMO-TAG-001',selectionStart:12,closest(){return null;}}});
  assert.equal([...h.timers.values()].filter(timer=>timer.delay===160).length,1);
  await h.events['document:submit']({target:new h.Form('DEMO-TAG-001'),preventDefault(){}});
  assert.equal([...h.timers.values()].filter(timer=>timer.delay===160).length,0);
  vm.runInContext("location.hash='#systems';",h.context);h.events.hashchange();
  assert.equal(vm.runInContext('location.hash',h.context),'#systems');
});

test('navigating without submitting also cancels a pending search debounce',()=>{
  const h=harness();h.modal.open=false;vm.runInContext("user=USERS[0];location.hash='#overview';",h.context);
  h.events['document:input']({target:{id:'search',value:'old query',selectionStart:9,closest(){return null;}}});
  assert.equal([...h.timers.values()].filter(timer=>timer.delay===160).length,1);
  vm.runInContext("location.hash='#systems';",h.context);h.events.hashchange();
  assert.equal([...h.timers.values()].filter(timer=>timer.delay===160).length,0);
  assert.equal(vm.runInContext('query',h.context),'');
  assert.equal(vm.runInContext('location.hash',h.context),'#systems');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('service worker handles only its shell and never intercepts API, document or other-site requests',async()=>{
  const listeners={};const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  const self={location:{href:'https://example.invalid/LicenceManager-Web/sw.js'},addEventListener:(name,fn)=>listeners[name]=fn};
  vm.runInNewContext(source,{self,URL,caches:{open:async()=>({match:async()=>new Response('shell')})},fetch:async()=>new Response('network'),Response});
  const handled=url=>{let responded=false;listeners.fetch({request:{url,method:'GET',mode:'cors'},respondWith(){responded=true;}});return responded;};
  assert.equal(handled('https://example.invalid/LicenceManager-Web/app.js'),true);
  assert.equal(handled('https://example.invalid/LicenceManager-Web/api/v1/licences'),false);
  assert.equal(handled('https://example.invalid/LicenceManager-Web/documents/private.pdf'),false);
  assert.equal(handled('https://other.invalid/LicenceManager-Web/app.js'),false);
  assert.equal(handled('https://example.invalid/OtherApp/app.js'),false);
  assert.equal(handled('https://example.invalid/LicenceManager-Web/arbitrary.json'),false);
});

test('install reloads shell assets instead of copying stale HTTP cache into a new version',async()=>{
  const listeners={};let requests;let installing;
  const self={location:{href:'https://example.invalid/LicenceManager-Web/sw.js'},addEventListener:(name,fn)=>listeners[name]=fn};
  const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  vm.runInNewContext(source,{self,URL,Request,caches:{open:async()=>({addAll:async items=>{requests=items;}})}});
  listeners.install({waitUntil:promise=>installing=promise});await installing;
  assert.equal(requests.length,9);assert.ok(requests.every(request=>request.cache==='reload'));
  assert.ok(requests.every(request=>request.url.startsWith('https://example.invalid/LicenceManager-Web/')));
});

test('installed navigation uses matching cached HTML until the operator applies an update',async()=>{
  const listeners={};let response,networkCalls=0;
  const self={location:{href:'https://example.invalid/LicenceManager-Web/sw.js'},addEventListener:(name,fn)=>listeners[name]=fn};
  const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  vm.runInNewContext(source,{self,URL,caches:{open:async()=>({match:async()=>new Response('installed release HTML')})},fetch:async()=>{networkCalls++;return new Response('new release HTML');},Response});
  for(const url of ['https://example.invalid/LicenceManager-Web/','https://example.invalid/LicenceManager-Web/index.html?launch=pwa']){
    listeners.fetch({request:{url,method:'GET',mode:'navigate'},respondWith:value=>response=value});
    assert.equal(await(await response).text(),'installed release HTML');
  }
  assert.equal(networkCalls,0);
});

test('activation only removes older caches belonging to this app scope and update is explicit',async()=>{
  const listeners={},deleted=[];let activation,skipped=0,claimed=0;
  const self={location:{href:'https://example.invalid/LicenceManager-Web/sw.js'},addEventListener:(name,fn)=>listeners[name]=fn,clients:{claim:async()=>{claimed++;}},skipWaiting:()=>{skipped++;}};
  const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  vm.runInNewContext(source,{self,URL,caches:{keys:async()=>['licencemanager-shell:/LicenceManager-Web/:v0','licencemanager-shell:/LicenceManager-Web/:v7','licencemanager-shell:/OtherApp/:v0','unrelated-cache'],delete:async key=>deleted.push(key)}});
  listeners.activate({waitUntil:value=>activation=value});await activation;
  assert.deepEqual(deleted,['licencemanager-shell:/LicenceManager-Web/:v0']);assert.equal(claimed,1);assert.equal(skipped,0);
  listeners.message({data:{type:'unrelated'}});assert.equal(skipped,0);
  listeners.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(skipped,1);
});

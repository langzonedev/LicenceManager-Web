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

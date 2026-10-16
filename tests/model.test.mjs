import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtures, USERS, DEMO_DATE } from '../demo-data.js';
import { can, dateStatus, attention, dayNumber, findLicences, allocated, dueEvents, validateLicence, validateAssociation, metadataCsv, summary, escapeHtml } from '../model.js';

test('a physical service tag finds its management entitlement without searching keys',()=>{
  const db=createFixtures();
  assert.deepEqual(findLicences(db,'DEMO-TAG-001','all',DEMO_DATE).map(x=>x.id),['lm-001','lm-002']);
  assert.equal(findLicences(db,'DEMO-NOT-VALID','all',DEMO_DATE).length,0);
  assert.equal(allocated(db,'lm-001'),0);
  assert.equal(allocated(db,'lm-002'),16);
  assert.equal(allocated(db,'lm-010'),16);
});
test('perpetual rights remain distinct from expired support and unknowns never imply current',()=>{
  const db=createFixtures();
  assert.equal(db.licences[2].licenceEnd.state,'not_applicable');
  assert.equal(attention(db.licences[2],DEMO_DATE).label,'Support expired');
  assert.equal(attention(db.licences[7],DEMO_DATE).label,'Draft');
  assert.equal(dateStatus({state:'known',date:DEMO_DATE},DEMO_DATE).label,'Due today');
  assert.equal(dateStatus({state:'unknown'},DEMO_DATE).label,'Unknown');
  assert.equal(dateStatus({state:'known',date:'2026-10-15'},DEMO_DATE).label,'Expired');
});
test('date arithmetic is calendar-based across leap dates and DST and rejects impossible dates',()=>{
  assert.equal(dayNumber('2024-03-01')-dayNumber('2024-02-28'),2);
  assert.equal(dayNumber('2026-10-05')-dayNumber('2026-10-03'),2);
  assert.throws(()=>dayNumber('2026-02-30'));
  assert.throws(()=>dayNumber('16/10/2026'));
  for(const n of [7,30,60,90])assert.equal(dateStatus({state:'known',date:'2027-01-01'},new Date(Date.parse('2027-01-01T00:00:00Z')-n*86400000).toISOString().slice(0,10)).days,n);
});
test('role capabilities distinguish reading, retrieval and writing',()=>{
  assert.equal(can(USERS[0],'write'),true);
  assert.equal(can(USERS[1],'secret'),true);
  assert.equal(can(USERS[1],'write'),false);
  assert.equal(can(USERS[2],'read'),true);
  assert.equal(can(USERS[2],'secret'),false);
  assert.equal(can(null,'read'),false);
});
test('allocations enforce capacity, distinct relationship meaning and duplicate links',()=>{
  const db=createFixtures(),l=db.licences[0];
  assert.doesNotThrow(()=>validateAssociation(db,l,{systemId:'sys-005',purpose:'reference',units:null}));
  assert.throws(()=>validateAssociation(db,l,{systemId:'sys-001',purpose:'activation_target',units:null}),/already/);
  assert.throws(()=>validateAssociation(db,l,{systemId:'sys-005',purpose:'allocation',units:2}),/own licence entry/);
  assert.throws(()=>validateAssociation(db,l,{systemId:'sys-001',purpose:'allocation',units:2}),/remain/);
  assert.throws(()=>validateAssociation(db,l,{systemId:'sys-001',purpose:'allocation',units:0}),/positive/);
  assert.throws(()=>validateAssociation(db,l,{systemId:'missing',purpose:'reference'}),/existing/);
  l.lifecycle='archived';assert.throws(()=>validateAssociation(db,l,{systemId:'sys-005',purpose:'reference'}),/Restore/);
});
test('snooze changes attention only, not rights or source dates',()=>{
  const db=createFixtures();const ev=dueEvents(db,DEMO_DATE).find(x=>x.licence.id==='lm-001');
  const before=structuredClone(ev.licence.licenceEnd);
  db.actions[ev.id]={snoozeUntil:'2026-10-23',status:'In progress'};
  assert.equal(dueEvents(db,DEMO_DATE).some(x=>x.id===ev.id),false);
  assert.equal(dueEvents(db,DEMO_DATE,true).some(x=>x.id===ev.id),true);
  assert.deepEqual(ev.licence.licenceEnd,before);
  assert.equal(dueEvents(db,'2026-10-23').some(x=>x.id===ev.id),true);
});
test('active records require useful facts but draft uncertainty stays explicit',()=>{
  const db=createFixtures();
  assert.deepEqual(validateLicence(db.licences[0]),{});
  assert.deepEqual(validateLicence(db.licences[7]),{});
  const invalid={...db.licences[7],lifecycle:'active'};
  assert.ok(validateLicence(invalid).quantity);
  assert.ok(validateLicence(invalid).licenceType);
  const invalidPerpetual={...db.licences[1],licenceEnd:{state:'known',date:DEMO_DATE}};
  assert.ok(validateLicence(invalidPerpetual).licenceEnd);
});
test('metadata export and summary exclude secrets/documents and neutralise CSV formulas',()=>{
  const db=createFixtures();db.licences[0].title='=WEBSERVICE("fictional")';
  const csv=metadataCsv(db);
  assert.match(csv,/'=WEBSERVICE/);
  assert.doesNotMatch(csv,/DEMO-NOT-VALID|FICTIONAL DEMONSTRATION DOCUMENT/);
  const dto=summary(db,db.licences[0]);assert.equal(dto.secretCount,1);
  assert.equal('secrets'in dto,false);assert.equal('documents'in dto,false);assert.equal('notes'in dto,false);
  assert.equal(escapeHtml('<script>"test"&'), '&lt;script&gt;&quot;test&quot;&amp;');
});
test('fresh demo sessions do not share mutable records',()=>{
  const a=createFixtures(),b=createFixtures();a.licences[0].title='Changed';a.actions.demo={status:'Open'};
  assert.equal(b.licences[0].title,'vCenter Server');assert.deepEqual(b.actions,{});
});

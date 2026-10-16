import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtures,DEMO_DATE} from '../demo-data.js';
import {poolBalance,validatePoolEntry,appendEvidenceVersion,pinPurchaseVersion,validateLicence,findLicences,safeUrl,metadataCsv,dueEvents} from '../model.js';

test('shared purchases have independent system entries, dates, project ownership and conserved quantities',()=>{
  const db=createFixtures(),a=db.licences.find(l=>l.id==='lm-002'),b=db.licences.find(l=>l.id==='lm-010');
  assert.equal(a.poolId,b.poolId);assert.notEqual(a.owner,b.owner);assert.notEqual(a.supportEnd.date,b.supportEnd.date);
  assert.equal(poolBalance(db,a.poolId).assigned,32);assert.equal(poolBalance(db,a.poolId).unassigned,8);
  const original=a.supportEnd.date;b.supportEnd.date='2028-01-01';assert.equal(a.supportEnd.date,original);
  assert.deepEqual(findLicences(db,'DEMO-TAG-002','all',DEMO_DATE).map(l=>l.id),['lm-001','lm-010']);
});
test('explicit spare stock and unassigned capacity are separate and over-allocation is rejected',()=>{
  const db=createFixtures(),balance=poolBalance(db,'pool-gpu');
  assert.equal(balance.assigned,6);assert.equal(balance.spare,2);assert.equal(balance.unassigned,2);
  const added={...db.licences.find(l=>l.id==='lm-011'),id:'new',quantity:2};
  assert.equal(validatePoolEntry(db,added,balance.pool),'');
  assert.match(validatePoolEntry(db,{...added,quantity:3},balance.pool),/exceeding/);
  assert.match(validatePoolEntry(db,{...added,metric:'core'},balance.pool),/same unit/);
});
test('later EULA revisions never replace the at-purchase version or alter another system entry',()=>{
  const db=createFixtures(),doc=db.licences.find(l=>l.id==='lm-002').documents[0],other=db.licences.find(l=>l.id==='lm-010').documents[0];
  const pinned=doc.purchaseVersionId,count=other.versions.length;
  appendEvidenceVersion(doc,{id:'later-3',version:'3.0',date:DEMO_DATE,body:'Fictional later terms'});
  assert.equal(doc.purchaseVersionId,pinned);assert.equal(other.versions.length,count);assert.equal(other.purchaseVersionId,pinned);
  assert.throws(()=>appendEvidenceVersion(doc,{id:'different',version:'3.0'}),/already/);
  assert.throws(()=>pinPurchaseVersion(doc,'missing'),/not found/);
  pinPurchaseVersion(doc,'later-3');assert.equal(doc.purchaseVersionId,'later-3');assert.equal(other.purchaseVersionId,pinned);
});
test('open-source unrestricted rights need no invented seat count or activation key',()=>{
  const l=createFixtures().licences.find(l=>l.id==='lm-013');
  assert.equal(l.activation,'not_applicable');assert.equal(l.quantity,null);assert.equal(l.secrets.length,0);assert.deepEqual(validateLicence(l),{});
});
test('duration, deployment, start/end and SUM renewal are independent validated facts',()=>{
  const db=createFixtures(),l=db.licences.find(l=>l.id==='lm-011');
  assert.equal(l.licenceType,'perpetual');assert.equal(l.licenceModel,'floating');assert.equal(l.licenceEnd.state,'not_applicable');
  assert.ok(dueEvents(db,DEMO_DATE).some(d=>d.licence.id===l.id&&d.field==='sumRenewal'));
  assert.equal(dueEvents(db,DEMO_DATE).some(d=>d.licence.id===l.id&&d.field==='licenceEnd'),false);
  assert.ok(validateLicence({...l,metric:'other',customUnit:''}).customUnit);
  assert.ok(validateLicence({...l,supportStart:{state:'known',date:'2027-01-01'}}).supportEnd);
});
test('portal/document links reject active schemes and embedded credentials; metadata retains expanded facts',()=>{
  assert.equal(safeUrl('javascript:alert(1)'), '');assert.equal(safeUrl('https://user:password@example.com'), '');
  assert.equal(safeUrl('https://example.com/terms'),'https://example.com/terms');
  const csv=metadataCsv(createFixtures());assert.match(csv,/Legal owner/);assert.match(csv,/SUM renewal/);assert.match(csv,/concurrent_user/);assert.doesNotMatch(csv,/DEMO-NOT-VALID/);
});

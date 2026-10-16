import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtures, DEMO_DATE} from '../demo-data.js';
import {attention, dateStatus, dueEvents, findLicences, matchLabel, validateLicence, validatePoolEntry} from '../model.js';

test('all renewal thresholds agree with attention and overdue actions do not say due soon',()=>{
  const db=createFixtures();
  const licence={...db.licences[0],licenceEnd:{state:'unknown'},supportEnd:{state:'unknown'},renewalDate:{state:'unknown'},sumRenewal:{state:'unknown'},renewalNotice:{state:'unknown'}};
  db.licences=[licence];
  for(const days of [-1,0,7,30,60,90,91]){
    const date=new Date(Date.parse(`${DEMO_DATE}T00:00:00Z`)+days*86400000).toISOString().slice(0,10);
    licence.renewalNotice={state:'known',date};
    assert.equal(dueEvents(db,DEMO_DATE).length,days<=90?1:0);
    assert.equal(dateStatus(licence.renewalNotice,DEMO_DATE).tone,days<0?'danger':days<=90?'warning':'success');
    assert.equal(attention(licence,DEMO_DATE).label,days<0?'Action overdue':days===0?'Action due today':days<=90?'Due soon':'Needs review');
  }
  delete licence.licenceEnd;
  licence.renewalNotice={state:'unknown'};
  assert.equal(attention(licence,DEMO_DATE).label,'Needs review');
});

test('pool conservation cannot use negative, fractional, unknown or unsafe entry quantities',()=>{
  const db=createFixtures(),entry=db.licences.find(l=>l.id==='lm-002'),pool=db.pools.find(p=>p.id===entry.poolId);
  for(const quantity of [null,undefined,-1,0,1.5,NaN,Number.MAX_SAFE_INTEGER+1]){
    assert.match(validatePoolEntry(db,{...entry,quantity},pool),/positive whole-number/);
  }
  const other=db.licences.find(l=>l.id==='lm-010');
  other.quantity=null;
  assert.match(validatePoolEntry(db,entry,pool),/existing pool entries/);
});

test('active records cannot omit a metric or rely on imprecise quantities',()=>{
  const entry=createFixtures().licences[0];
  assert.ok(validateLicence({...entry,metric:undefined}).metric);
  assert.ok(validateLicence({...entry,quantity:Number.MAX_SAFE_INTEGER+1}).quantity);
});

test('expanded metadata and system-location searches identify the field actually matched',()=>{
  const db=createFixtures(),entry=db.licences[0];
  entry.project='Unique fictional project';
  assert.ok(findLicences(db,'Unique fictional project','all',DEMO_DATE).includes(entry));
  assert.equal(matchLabel(db,entry,'Unique fictional project'),'Project: Unique fictional project');
  const association=db.associations.find(a=>a.licenceId===entry.id);
  db.systems.find(s=>s.id===association.systemId).location='Unique fictional rack';
  assert.ok(findLicences(db,'Unique fictional rack','all',DEMO_DATE).includes(entry));
  assert.equal(matchLabel(db,entry,'Unique fictional rack'),'Location: Unique fictional rack');
});

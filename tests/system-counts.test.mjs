import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtures} from '../demo-data.js';
import {allocated, linkedSystems, uniqueLinkedSystems, summary} from '../model.js';

test('system counts deduplicate identity while preserving relationships and allocations',()=>{
  const db=createFixtures(),record=db.licences[0],first=db.systems[0];
  const second={...first,id:'different-system-same-name'};
  db.systems.push(second);
  db.associations=[
    {id:'activation',licenceId:record.id,systemId:first.id,purpose:'activation_target'},
    {id:'allocation',licenceId:record.id,systemId:first.id,purpose:'allocation',units:2},
    {id:'reference',licenceId:record.id,systemId:second.id,purpose:'reference'},
  ];
  assert.equal(linkedSystems(db,record.id).length,3);
  assert.deepEqual(uniqueLinkedSystems(db,record.id).map(s=>s.id),[first.id,second.id]);
  assert.equal(allocated(db,record.id),2);
  assert.deepEqual(summary(db,record).systemLabels,[first.hostname,second.hostname]);
});

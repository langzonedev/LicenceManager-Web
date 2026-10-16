import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtures, DEMO_DATE } from '../demo-data.js';
import { dashboardMatches, findLicences } from '../model.js';

test('dashboard destinations contain the exact records counted by each card', () => {
  const db = createFixtures();
  const expected = {
    current: ['lm-001','lm-002','lm-003','lm-004','lm-005','lm-006','lm-007','lm-008','lm-010','lm-011','lm-012','lm-013'],
    due_soon: ['lm-001','lm-005','lm-006'],
    expired: ['lm-003','lm-007'],
    review: ['lm-008'],
  };
  for (const [filter, ids] of Object.entries(expected)) {
    assert.deepEqual(db.licences.filter(l => dashboardMatches(l, filter, DEMO_DATE)).map(l => l.id), ids, `${filter} card`);
    assert.deepEqual(findLicences(db, '', filter, DEMO_DATE).map(l => l.id), ids, `${filter} destination`);
  }
  assert.deepEqual(findLicences(db, 'vCenter', 'due_soon', DEMO_DATE).map(l => l.id), ['lm-001']);
  assert.deepEqual(findLicences(db, 'vCenter', 'expired', DEMO_DATE), []);
});

test('due-soon dates include today and day 30, with expired dates kept distinct', () => {
  const base = { lifecycle:'active', licenceType:'subscription', licenceEnd:{state:'known',date:'2026-11-15'} };
  assert.equal(dashboardMatches(base, 'due_soon', DEMO_DATE), true);
  assert.equal(dashboardMatches({...base,licenceEnd:{state:'known',date:DEMO_DATE}}, 'due_soon', DEMO_DATE), true);
  assert.equal(dashboardMatches({...base,licenceEnd:{state:'known',date:'2026-11-16'}}, 'due_soon', DEMO_DATE), false);
  const expired = {...base,licenceEnd:{state:'known',date:'2026-10-15'}};
  assert.equal(dashboardMatches(expired, 'expired', DEMO_DATE), true);
  assert.equal(dashboardMatches(expired, 'due_soon', DEMO_DATE), false);
  const supportExpired = {...base,licenceType:'perpetual',licenceEnd:{state:'not_applicable'},supportEnd:{state:'known',date:'2026-10-15'}};
  assert.equal(dashboardMatches(supportExpired, 'expired', DEMO_DATE), true);
  assert.equal(dashboardMatches({...base,licenceStatus:'expired'}, 'expired', DEMO_DATE), true);
});

test('retired and archived records never enter dashboard destinations', () => {
  const db = createFixtures();
  for (const lifecycle of ['retired','archived']) {
    db.licences = [{...db.licences[0],lifecycle,licenceType:'unknown',licenceStatus:'expired'}];
    for (const filter of ['current','due_soon','expired','review']) {
      assert.equal(dashboardMatches(db.licences[0], filter, DEMO_DATE), false);
      assert.deepEqual(findLicences(db, '', filter, DEMO_DATE), []);
    }
  }
});

test('incomplete active records stay discoverable in review and broad attention', () => {
  const db = createFixtures();
  const base = {...db.licences[0],supportEnd:{state:'not_applicable'},renewalNotice:{state:'not_applicable'},renewalDate:{state:'not_applicable'},sumRenewal:{state:'not_applicable'}};
  for (const changes of [{licenceType:'unknown'},{licenceEnd:{state:'unknown'}},{lifecycle:'draft'}]) {
    db.licences = [{...base,...changes}];
    assert.deepEqual(findLicences(db, '', 'review', DEMO_DATE).map(l=>l.id), [base.id]);
    assert.deepEqual(findLicences(db, '', 'attention', DEMO_DATE).map(l=>l.id), [base.id]);
  }
});

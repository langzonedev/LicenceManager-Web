export const DATE_FIELDS = { licenceEnd: 'Licence expiry', supportEnd: 'Support expiry', renewalNotice: 'Renewal notice' };
export const PERMISSIONS = {
  Viewer: new Set(['read']),
  Operator: new Set(['read', 'secret']),
  Custodian: new Set(['read', 'secret', 'write', 'export']),
};
export const can = (user, permission) => Boolean(user && PERMISSIONS[user.role]?.has(permission));
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid calendar date.');
  const n = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== value) throw new Error('Enter a valid calendar date.');
  return n / 86400000;
}
export function dateStatus(fact, today) {
  if (fact?.state === 'not_applicable') return { tone: 'neutral', label: 'Not applicable', days: null };
  if (!fact || fact.state !== 'known') return { tone: 'neutral', label: 'Unknown', days: null };
  const days = dayNumber(fact.date) - dayNumber(today);
  return { days, tone: days < 0 ? 'danger' : days <= 30 ? 'warning' : 'success', label: days < 0 ? 'Expired' : days === 0 ? 'Due today' : days <= 90 ? 'Upcoming' : 'Current' };
}
export function attention(licence, today) {
  if (licence.lifecycle === 'archived' || licence.lifecycle === 'retired') return { tone: 'neutral', label: licence.lifecycle === 'archived' ? 'Archived' : 'Retired', sort: 99999 };
  if (licence.lifecycle === 'draft') return { tone: 'neutral', label: 'Draft', sort: 99998 };
  const rights = dateStatus(licence.licenceEnd, today);
  if (rights.days !== null && rights.days < 0) return { tone: 'danger', label: 'Licence expired', sort: rights.days };
  const support = dateStatus(licence.supportEnd, today);
  if (support.days !== null && support.days < 0) return { tone: 'warning', label: 'Support expired', sort: support.days };
  const dates = Object.keys(DATE_FIELDS).map(k => ({ key: k, ...dateStatus(licence[k], today) })).filter(s => s.days !== null).sort((a, b) => a.days - b.days);
  if (dates[0]?.days <= 30) return { tone: 'warning', label: dates[0].days === 0 ? 'Action due today' : 'Due soon', sort: dates[0].days };
  if (licence.licenceType === 'unknown' || licence.licenceEnd?.state === 'unknown') return { tone: 'neutral', label: 'Needs review', sort: 99997 };
  return { tone: 'success', label: 'Current', sort: dates[0]?.days ?? 99996 };
}
export function allocated(state, id) { return state.associations.filter(a => a.licenceId === id && a.purpose === 'allocation').reduce((sum, a) => sum + a.units, 0); }
export function linkedSystems(state, id) { return state.associations.filter(a => a.licenceId === id).map(a => ({ ...state.systems.find(s => s.id === a.systemId), association: a })); }
export function findLicences(state, query = '', filter = 'all', today) {
  const q = query.trim().toLowerCase();
  return state.licences.filter(l => {
    if (filter === 'archived' ? l.lifecycle !== 'archived' : l.lifecycle === 'archived') return false;
    if (filter === 'subscription' && l.licenceType !== 'subscription') return false;
    if (filter === 'perpetual' && l.licenceType !== 'perpetual') return false;
    if (filter === 'attention' && !['danger', 'warning'].includes(attention(l, today).tone) && l.lifecycle !== 'draft') return false;
    const fields = [l.title, l.product, l.vendor, l.reference, l.edition, l.owner, ...linkedSystems(state, l.id).flatMap(s => [s.name, s.hostname, s.environment, s.serviceTag])];
    return !q || fields.some(x => x?.toLowerCase().includes(q));
  });
}
export function matchLabel(state, licence, query) {
  const q = query.trim().toLowerCase();
  if (!q) return '';
  for (const s of linkedSystems(state, licence.id)) {
    if (s.serviceTag?.toLowerCase().includes(q)) return `Service tag: ${s.serviceTag}`;
    if (s.hostname?.toLowerCase().includes(q)) return `System: ${s.hostname}`;
    if (s.environment?.toLowerCase().includes(q)) return `Environment: ${s.environment}`;
  }
  return `Matched ${[licence.vendor, licence.product, licence.reference, licence.owner].find(v => v?.toLowerCase().includes(q)) || licence.title}`;
}
export function dueEvents(state, today, includeSnoozed = false) {
  return state.licences.filter(l => l.lifecycle === 'active').flatMap(l => Object.entries(DATE_FIELDS).flatMap(([field, label]) => {
    const fact = l[field];
    if (fact?.state !== 'known') return [];
    const days = dayNumber(fact.date) - dayNumber(today);
    if (days > 90) return [];
    const id = `${l.id}:${field}:${fact.date}`;
    const action = state.actions[id] || {};
    if (!includeSnoozed && action.snoozeUntil && dayNumber(action.snoozeUntil) > dayNumber(today)) return [];
    return [{ id, licence: l, field, label, date: fact.date, days, ...action }];
  })).sort((a, b) => a.days - b.days || a.licence.title.localeCompare(b.licence.title));
}
export function validateLicence(record) {
  const errors = {};
  for (const field of ['title', 'vendor', 'product']) if (!record[field]?.trim()) errors[field] = 'This field is required.';
  if (!['perpetual', 'subscription', 'evaluation', 'unknown'].includes(record.licenceType)) errors.licenceType = 'Select a licence type.';
  if (record.lifecycle === 'active') {
    if (!record.owner?.trim()) errors.owner = 'Choose a custodian.';
    if (record.licenceType === 'unknown') errors.licenceType = 'Confirm the licence type or save a draft.';
    if (record.metric === 'unknown') errors.metric = 'Confirm the metric or save a draft.';
    if (!Number.isInteger(record.quantity) || record.quantity < 1) errors.quantity = 'Enter a positive whole number.';
  } else if (record.quantity !== null && (!Number.isInteger(record.quantity) || record.quantity < 1)) errors.quantity = 'Enter a positive whole number or leave blank.';
  for (const field of Object.keys(DATE_FIELDS)) {
    const fact = record[field];
    if (!fact || !['known', 'unknown', 'not_applicable'].includes(fact.state)) errors[field] = 'Choose how this date applies.';
    else if (fact.state === 'known') { try { dayNumber(fact.date); } catch { errors[field] = 'Enter a valid date or choose Unknown.'; } }
  }
  if (record.licenceType === 'perpetual' && record.licenceEnd.state !== 'not_applicable') errors.licenceEnd = 'Perpetual rights have no licence expiry. Choose Not applicable.';
  if (['subscription', 'evaluation'].includes(record.licenceType) && record.licenceEnd.state === 'not_applicable') errors.licenceEnd = 'Choose a known expiry or explicitly mark it Unknown.';
  return errors;
}
export function validateAssociation(state, licence, association, ignoreId) {
  if (!state.systems.some(s => s.id === association.systemId)) throw new Error('Choose an existing system.');
  if (!['allocation', 'reference', 'activation_target'].includes(association.purpose)) throw new Error('Choose a relationship.');
  if (['archived', 'retired'].includes(licence.lifecycle)) throw new Error('Restore this licence before linking systems.');
  if (state.associations.some(a => a.id !== ignoreId && a.licenceId === licence.id && a.systemId === association.systemId && a.purpose === association.purpose)) throw new Error('This system already has that relationship.');
  if (association.purpose === 'allocation') {
    if (!Number.isInteger(association.units) || association.units < 1) throw new Error('Allocation units must be a positive whole number.');
    const others = state.associations.filter(a => a.id !== ignoreId && a.licenceId === licence.id && a.purpose === 'allocation').reduce((sum, a) => sum + a.units, 0);
    if (licence.quantity !== null && licence.metric !== 'unknown' && others + association.units > licence.quantity) throw new Error(`Only ${licence.quantity - others} ${licence.metric} units remain available.`);
  }
}
export function csvCell(value) { const s = String(value ?? ''); return `"${(/^[\s]*[=+@\-\t\r]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"`; }
export function metadataCsv(state) {
  const columns = ['Title', 'Vendor', 'Product', 'Reference', 'Type', 'Lifecycle', 'Metric', 'Quantity', 'Allocated', 'Custodian', 'Licence expiry', 'Support expiry', 'Renewal notice'];
  const values = state.licences.map(l => [l.title, l.vendor, l.product, l.reference, l.licenceType, l.lifecycle, l.metric, l.quantity, allocated(state, l.id), l.owner, ...Object.keys(DATE_FIELDS).map(k => l[k].state === 'known' ? l[k].date : l[k].state)]);
  return [columns, ...values].map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function summary(state, l) {
  return Object.fromEntries(Object.entries({ ...l, allocated: l.quantity === null ? null : allocated(state, l.id), systemLabels: linkedSystems(state, l.id).map(s => s.hostname), secretCount: l.secrets.length }).filter(([key]) => ['id','revision','title','vendor','product','reference','licenceType','lifecycle','licenceEnd','supportEnd','renewalNotice','metric','quantity','allocated','systemLabels','secretCount'].includes(key)));
}

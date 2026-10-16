export const DATE_FIELDS = { licenceEnd: 'Licence expiry', supportEnd: 'SUM coverage end', renewalDate: 'Licence renewal', sumRenewal: 'SUM renewal', renewalNotice: 'Renewal notice' };
export const LICENCE_TYPES = ['subscription','perpetual','trial','evaluation','open_source','freeware','other','unknown'];
export const METRICS = ['seat','user','concurrent_user','device','core','socket','instance','site','processor','GPU','other','unrestricted','unknown'];
export const LICENCE_MODELS = ['node_locked','floating','site','named_user','unrestricted','other','unknown'];
export const CATEGORIES = ['Operating System','Application','Development','Security','Other'];
export const modelName = value => ({node_locked:'Node-locked',floating:'Floating / concurrent',site:'Site licence',named_user:'Named user',unrestricted:'Unrestricted',other:'Other',unknown:'Unknown'}[value]||value);
export function safeUrl(value) {
  if (!value) return '';
  try { const u=new URL(value); return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password ? u.href : ''; } catch { return ''; }
}
export function poolBalance(state, poolId, excludeId) {
  const pool=state.pools?.find(p=>p.id===poolId);
  if(!pool)return null;
  const entries=state.licences.filter(l=>l.poolId===poolId&&l.id!==excludeId&&!['retired','archived'].includes(l.lifecycle));
  const sum=kind=>entries.filter(l=>(l.holding||'allocated')===kind).reduce((n,l)=>n+(l.quantity||0),0);
  const assigned=sum('allocated'), reserved=sum('reserved'), spare=sum('spare');
  return {pool,assigned,reserved,spare,unassigned:pool.quantity-assigned-reserved-spare,entries};
}
export function validatePoolEntry(state,record,pool,excludeId=record.id) {
  if(!pool)return '';
  if(!Number.isSafeInteger(pool.quantity)||pool.quantity<1)return 'Enter the purchased pool quantity as a positive whole number.';
  if(pool.metric!==record.metric)return 'All entries in a shared entitlement must use the same unit of measure.';
  if(!Number.isSafeInteger(record.quantity)||record.quantity<1)return 'A shared entitlement entry needs a positive whole-number quantity.';
  const others=state.licences.filter(l=>l.poolId===pool.id&&l.id!==excludeId&&!['retired','archived'].includes(l.lifecycle));
  if(others.some(l=>l.metric!==pool.metric))return 'Existing pool entries use a different unit. Keep the pool unit consistent.';
  if(others.some(l=>!Number.isSafeInteger(l.quantity)||l.quantity<1))return 'Review the unknown or invalid quantities in existing pool entries before changing this purchase.';
  const held=others.reduce((n,l)=>n+(l.quantity||0),0)+( ['retired','archived'].includes(record.lifecycle)?0:record.quantity );
  if(held>pool.quantity)return `Entries would hold ${held} ${pool.metric} units, exceeding the ${pool.quantity} purchased. Reduce a spare/subset entry or correct the purchased pool quantity.`;
  return '';
}
export function appendEvidenceVersion(document,version) {
  if(document.versions.some(v=>v.id===version.id||v.version===version.version))throw new Error('This evidence version already exists.');
  document.versions=[...document.versions,version];
  if(!document.purchaseVersionId)document.purchaseVersionId=version.id;
}
export function pinPurchaseVersion(document,id) {
  if(!document.versions.some(v=>v.id===id))throw new Error('Evidence version not found.');
  document.purchaseVersionId=id;
}
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
  return { days, tone: days < 0 ? 'danger' : days <= 90 ? 'warning' : 'success', label: days < 0 ? 'Expired' : days === 0 ? 'Due today' : days <= 90 ? 'Upcoming' : 'Current' };
}
export function attention(licence, today) {
  if (licence.lifecycle === 'archived' || licence.lifecycle === 'retired') return { tone: 'neutral', label: licence.lifecycle === 'archived' ? 'Archived' : 'Retired', sort: 99999 };
  if (licence.lifecycle === 'draft') return { tone: 'neutral', label: 'Draft', sort: 99998 };
  if (licence.licenceStatus === 'expired') return {tone:'danger',label:'Licence expired',sort:-1};
  const rights = dateStatus(licence.licenceEnd, today);
  if (rights.days !== null && rights.days < 0) return { tone: 'danger', label: 'Licence expired', sort: rights.days };
  const support = dateStatus(licence.supportEnd, today);
  if (support.days !== null && support.days < 0) return { tone: 'warning', label: 'Support expired', sort: support.days };
  const dates = Object.keys(DATE_FIELDS).map(k => ({ key: k, ...dateStatus(licence[k], today) })).filter(s => s.days !== null).sort((a, b) => a.days - b.days);
  if (dates[0]?.days <= 90) return { tone: 'warning', label: dates[0].days < 0 ? 'Action overdue' : dates[0].days === 0 ? 'Action due today' : 'Due soon', sort: dates[0].days };
  if (licence.licenceType === 'unknown' || !licence.licenceEnd || licence.licenceEnd.state === 'unknown') return { tone: 'neutral', label: 'Needs review', sort: 99997 };
  return { tone: 'success', label: licence.licenceStatus === 'evaluation' || ['trial','evaluation'].includes(licence.licenceType) ? 'Evaluation' : 'Current', sort: dates[0]?.days ?? 99996 };
}
export function allocated(state, id) { return state.associations.filter(a => a.licenceId === id && a.purpose === 'allocation').reduce((sum, a) => sum + a.units, 0); }
export function linkedSystems(state, id) { return state.associations.filter(a => a.licenceId === id).map(a => ({ ...state.systems.find(s => s.id === a.systemId), association: a })); }
export function dashboardMatches(licence, filter, today) {
  if (['retired', 'archived'].includes(licence.lifecycle)) return false;
  if (filter === 'current') return true;
  const status = attention(licence, today);
  if (filter === 'due_soon') return status.tone === 'warning' && status.sort >= 0 && status.sort <= 30;
  if (filter === 'expired') return status.label.includes('expired');
  if (filter === 'review') return licence.lifecycle === 'draft' || licence.licenceType === 'unknown' || status.label === 'Needs review';
  return false;
}
export function findLicences(state, query = '', filter = 'all', today) {
  const q = query.trim().toLowerCase();
  return state.licences.filter(l => {
    if (filter === 'archived' ? l.lifecycle !== 'archived' : l.lifecycle === 'archived') return false;
    if (filter === 'subscription' && l.licenceType !== 'subscription') return false;
    if (filter === 'perpetual' && l.licenceType !== 'perpetual') return false;
    if (filter === 'spare' && !['spare','reserved'].includes(l.holding)) return false;
    if (['current', 'due_soon', 'expired', 'review'].includes(filter) && !dashboardMatches(l, filter, today)) return false;
    if (filter === 'attention' && !['danger', 'warning'].includes(attention(l, today).tone) && !dashboardMatches(l, 'review', today)) return false;
    const fields = [l.title, l.product, l.vendor, l.reference, l.edition, l.softwareVersion, l.category, l.project, l.legalOwner, l.procuredBy, l.owner, l.subsetLabel, ...linkedSystems(state, l.id).flatMap(s => [s.name, s.hostname, s.environment, s.serviceTag,s.location])];
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
    if (s.name?.toLowerCase().includes(q)) return `System name: ${s.name}`;
    if (s.location?.toLowerCase().includes(q)) return `Location: ${s.location}`;
  }
  for (const [key,label] of Object.entries({title:'Software name',vendor:'Vendor',product:'Product',reference:'Reference',edition:'Edition',softwareVersion:'Version',category:'Category',project:'Project',legalOwner:'Legal owner',procuredBy:'Procured by',owner:'Custodian',subsetLabel:'Subset'})) {
    if (licence[key]?.toLowerCase().includes(q)) return `${label}: ${licence[key]}`;
  }
  return '';
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
  if (!LICENCE_TYPES.includes(record.licenceType)) errors.licenceType = 'Select a licence type.';
  if (record.lifecycle === 'active') {
    if (!record.owner?.trim()) errors.owner = 'Choose a custodian.';
    if (record.licenceType === 'unknown') errors.licenceType = 'Confirm the licence type or save a draft.';
    if (!METRICS.includes(record.metric) || record.metric === 'unknown') errors.metric = 'Confirm the metric or save a draft.';
    if (record.metric !== 'unrestricted' && (!Number.isSafeInteger(record.quantity) || record.quantity < 1)) errors.quantity = 'Enter a positive whole number.';
  } else if (record.quantity !== null && (!Number.isSafeInteger(record.quantity) || record.quantity < 1)) errors.quantity = 'Enter a positive whole number or leave blank.';
  for (const field of Object.keys(DATE_FIELDS)) {
    const fact = record[field];
    if (!fact && ['renewalDate','sumRenewal'].includes(field)) continue;
    if (!fact || !['known', 'unknown', 'not_applicable'].includes(fact.state)) errors[field] = 'Choose how this date applies.';
    else if (fact.state === 'known') { try { dayNumber(fact.date); } catch { errors[field] = 'Enter a valid date or choose Unknown.'; } }
  }
  if (record.licenceType === 'perpetual' && record.licenceEnd?.state !== 'not_applicable') errors.licenceEnd = 'Perpetual rights have no licence expiry. Choose Not applicable.';
  if (['subscription','trial','evaluation'].includes(record.licenceType) && record.licenceEnd?.state === 'not_applicable') errors.licenceEnd = 'Choose a known expiry or explicitly mark it Unknown.';
  if(record.metric&&!METRICS.includes(record.metric))errors.metric='Choose a supported unit of measure.';
  if(record.category&&!CATEGORIES.includes(record.category))errors.category='Choose a software category.';
  if(record.licenceModel&&!LICENCE_MODELS.includes(record.licenceModel))errors.licenceModel='Choose a licence model.';
  if(record.metric==='other'&&!record.customUnit?.trim())errors.customUnit='Describe the custom unit of measure.';
  for(const field of ['licenceStart','supportStart','purchaseDate']){
    const fact=record[field];if(fact?.state==='known'){try{dayNumber(fact.date);}catch{errors[field]='Enter a valid date.';}}
  }
  for(const [start,end] of [['licenceStart','licenceEnd'],['supportStart','supportEnd']])if(record[start]?.state==='known'&&record[end]?.state==='known'&&record[start].date>record[end].date)errors[end]='The end date cannot precede the start date.';
  if(record.portalUrl&&!safeUrl(record.portalUrl))errors.portalUrl='Use an HTTP/HTTPS link without embedded credentials.';
  return errors;
}
export function validateAssociation(state, licence, association, ignoreId) {
  if (!state.systems.some(s => s.id === association.systemId)) throw new Error('Choose an existing system.');
  if (!['allocation', 'reference', 'activation_target'].includes(association.purpose)) throw new Error('Choose a relationship.');
  if (['archived', 'retired'].includes(licence.lifecycle)) throw new Error('Restore this licence before linking systems.');
  if (association.purpose!=='reference') {
    if(licence.holding&&licence.holding!=='allocated')throw new Error('A spare/reserved entry cannot run on a system. Change its holding status first.');
    if(state.associations.some(a=>a.id!==ignoreId&&a.licenceId===licence.id&&a.purpose!=='reference'&&a.systemId!==association.systemId))throw new Error('Each deployment system needs its own licence entry. Use Add system entry to keep its quantity, owner and dates independent.');
  }
  if (state.associations.some(a => a.id !== ignoreId && a.licenceId === licence.id && a.systemId === association.systemId && a.purpose === association.purpose)) throw new Error('This system already has that relationship.');
  if (association.purpose === 'allocation') {
    if (!Number.isSafeInteger(association.units) || association.units < 1) throw new Error('Allocation units must be a positive whole number.');
    const others = state.associations.filter(a => a.id !== ignoreId && a.licenceId === licence.id && a.purpose === 'allocation').reduce((sum, a) => sum + a.units, 0);
    if (licence.quantity !== null && licence.metric !== 'unknown' && others + association.units > licence.quantity) throw new Error(`Only ${licence.quantity - others} ${licence.metric} units remain available.`);
  }
}
export function csvCell(value) { const s = String(value ?? ''); return `"${(/^[\s]*[=+@\-\t\r]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"`; }
export function metadataCsv(state) {
  const columns = ['Software name','Version','Edition','Category','Vendor','Reference','Licence type','Duration','Payment model','Deployment model','Activation','Status','Lifecycle','Project','Legal owner','Procured by','Custodian','Rights','Transferable','Metric','Custom unit','Quantity','Allocated','Holding','Subset','Shared entitlement','Systems','Locations','Licence start','Purchase date',...Object.values(DATE_FIELDS),'SUM period','Notes'];
  const df=f=>f?.state==='known'?f.date:f?.state||'unknown';
  const values = state.licences.map(l => [l.title,l.softwareVersion,l.edition,l.category,l.vendor,l.reference,l.licenceType,l.duration,l.paymentModel,l.licenceModel,l.activation,l.licenceStatus,l.lifecycle,l.project,l.legalOwner,l.procuredBy,l.owner,l.rights,l.transferable,l.metric,l.customUnit,l.quantity,allocated(state,l.id),l.holding,l.subsetLabel,state.pools?.find(p=>p.id===l.poolId)?.name,linkedSystems(state,l.id).map(s=>s.hostname).join('; '),linkedSystems(state,l.id).map(s=>s.location||'').join('; '),df(l.licenceStart),df(l.purchaseDate),...Object.keys(DATE_FIELDS).map(k=>df(l[k])),l.sumPeriod,l.notes]);
  return [columns, ...values].map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function summary(state, l) {
  return Object.fromEntries(Object.entries({ ...l, allocated: l.quantity === null ? null : allocated(state, l.id), systemLabels: linkedSystems(state, l.id).map(s => s.hostname), secretCount: l.secrets.length }).filter(([key]) => ['id','revision','title','vendor','product','reference','licenceType','lifecycle','licenceEnd','supportEnd','renewalNotice','metric','quantity','allocated','systemLabels','secretCount','softwareVersion','edition','category','duration','paymentModel','project','legalOwner','procuredBy','owner','rights','transferConditions','subsetLabel','poolId','customUnit','portalUrl','sumPeriod','sumReference','licenceStart','supportStart','purchaseDate','renewalDate','sumRenewal','licenceModel','activation','licenceStatus','transferable','holding'].includes(key)));
}

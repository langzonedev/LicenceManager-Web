import { createFixtures, USERS, DEMO_DATE } from './demo-data.js';
import { can, escapeHtml as e, attention, allocated, linkedSystems, uniqueLinkedSystems, findLicences, matchLabel, dueEvents, dateStatus, DATE_FIELDS, validateLicence, validateAssociation, metadataCsv, dayNumber, LICENCE_TYPES, LICENCE_MODELS, METRICS, CATEGORIES, modelName, safeUrl, poolBalance, validatePoolEntry, appendEvidenceVersion, pinPurchaseVersion, dashboardMatches } from './model.js';

// P1 transport boundary. These records and role previews are fictional, in-memory
// simulations. Real authentication/authority belongs to the private on-prem API.
let db = createFixtures();
let user = null;
let query = '', filter = 'all', sort = 'name', renewalFilter = 'all';
let shown = new Set(), revealTimer, toastTimer, idleTimer;
let lastFocus = null, modalDirty = false, mutationCount = 0, installPrompt = null, waitingWorker = null;
const root = document.querySelector('#app');
const modal = document.querySelector('#modal');
const confirmation = document.querySelector('#confirmation');
let pendingConfirmation = null;
const toast = document.querySelector('#toast');
const paths = {
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 8 8m-4-4 3-3m-6 0 3-3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  licence: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18m-13 5h2m4 0h2M8 6.5h.01m3 0h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="m3 3 18 18M10 5.2c.6-.1 1.3-.2 2-.2 6.5 0 10 7 10 7s-1.2 2.4-3.5 4.4M6.1 6.1C3.4 8.3 2 12 2 12s3.5 7 10 7c1.6 0 3.1-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z"/><path d="m8 11 3 3 5-5"/>',
  activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  edit: '<path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  logout: '<path d="M9 4H4v16h5m0-8h12m-4-4 4 4-4 4"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 5a5 5 0 0 1 2 4v2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5m10-4a8 8 0 0 0-14-2m0 10a8 8 0 0 0 14 2"/>',
  file: '<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h5"/>',
  alert: '<path d="m12 3 10 18H2L12 3Zm0 6v4m0 4h.01"/>',
  monitor: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  link: '<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01"/>',
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.licence}</svg>`;
const btn = (label, action, cls = '', attrs = '') => `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const badge = (label, tone = 'neutral') => `<span class="badge ${tone}">${e(label)}</span>`;
const purpose = p => ({ activation_target: 'Activates on', allocation: 'Allocated to', reference: 'Related system' }[p] || p);
const typeName = t => ({ perpetual: 'Perpetual', subscription: 'Subscription', evaluation: 'Evaluation', unknown: 'Unknown', open_source:'Open source', trial:'Trial', freeware:'Freeware', other:'Other', active:'Active', retired:'Retired', expired:'Expired', draft:'Draft', archived:'Archived' }[t] || t);
const colours = ['purple', 'blue', 'green', 'rose', 'blue', 'orange', 'green'];
const productIcon = (l, big = false) => `<span class="product-icon ${colours[Number(l.id.slice(-1)) % colours.length] || 'purple'} ${big ? 'big' : ''}">${e(l.title.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join(''))}</span>`;
const avatar = (u, small = false) => `<span class="avatar ${small ? 'small-avatar' : ''}">${e(u.initials)}</span>`;
const formatDate = date => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const factText = f => f?.state === 'known' ? formatDate(f.date) : f?.state === 'not_applicable' ? 'Not applicable' : 'Unknown';
const route = () => location.hash.slice(1).split('/').filter(Boolean);
const licence = id => db.licences.find(l => l.id === id);
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;
function notify(text) { clearTimeout(toastTimer); toast.textContent = text; toast.classList.add('visible'); toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200); }
function requirePermission(permission) { if (!user || !can(user, permission)) throw new Error('This demo role cannot perform that action. Switch to a permitted demo user.'); if (!navigator.onLine) throw new Error('Reconnect to continue.'); }
function log(action, l = null, label = '') { db.activity.unshift({ id: uid('event'), time: new Date().toISOString(), actor: user?.name || 'Demo', action, entity: l?.id || '', label: l?.title || label }); }
function changed(action, l, label) { mutationCount++; log(action, l, label); }
function resetIdle() { clearTimeout(idleTimer); if (user) idleTimer = setTimeout(() => { signOut(); notify('Demo session locked after inactivity.'); }, 15 * 60 * 1000); }
function maskSecrets() {
  shown.clear(); clearTimeout(revealTimer);
  document.querySelectorAll('[data-secret-value]').forEach(n => { n.value = '•••• •••• •••• ••••'; n.classList.add('masked'); n.setAttribute('aria-label',(n.getAttribute('aria-label')||'Licence key').replace(/ revealed$/,' hidden')); });
  document.querySelectorAll('[data-action="reveal"]').forEach(n => { n.innerHTML = `${icon('eye')}<span>Show</span>`; n.setAttribute('aria-pressed', 'false'); });
  document.querySelectorAll('input[data-secret-input]').forEach(n => n.type = 'password');
}
function openModal(title, body, foot = '', kind = '') {
  if (modal.open) modal.close();
  lastFocus = document.activeElement; modalDirty = false;
  modal.dataset.kind = kind;
  modal.innerHTML = `<div class="modal-head"><h2 id="modal-title">${e(title)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>${body}${foot}`;
  modal.showModal();
}
function requestConfirmation(title, message, acceptLabel, onAccept, cancelLabel = 'Keep editing') {
  if (pendingConfirmation) return;
  pendingConfirmation = { onAccept, focus: document.activeElement };
  confirmation.innerHTML = `<div class="modal-head"><h2 id="confirmation-title">${e(title)}</h2></div><div class="modal-body"><p id="confirmation-message">${e(message)}</p></div><div class="modal-foot">${btn(cancelLabel,'cancel-confirmation')}${btn(acceptLabel,'accept-confirmation','primary')}</div>`;
  confirmation.showModal();
  confirmation.querySelector('[data-action="cancel-confirmation"]').focus();
}
function finishConfirmation(accepted = false) {
  const pending = pendingConfirmation;
  pendingConfirmation = null;
  if (confirmation?.open) confirmation.close();
  if (accepted) pending?.onAccept();
  else if (pending?.focus?.isConnected) pending.focus.focus();
}
function closeModal(force = false) {
  if (!force && modalDirty) {
    requestConfirmation('Discard unsaved changes?', 'Your changes have not been saved. Keep editing to preserve them, or discard them to close this form.', 'Discard changes', () => closeModal(true));
    return;
  }
  finishConfirmation();
  modalDirty = false;
  modal.querySelectorAll('[data-secret-input]').forEach(input => input.value = '');
  modal.close();
  if (lastFocus?.isConnected) lastFocus.focus();
}
function applyAppUpdate() {
  if (!waitingWorker) return;
  mutationCount = 0; modalDirty = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
  waitingWorker.postMessage({ type: 'ACTIVATE_UPDATE' });
}
function navigate(hash) { maskSecrets(); if (location.hash === `#${hash}`) render(); else location.hash = hash; }

function login() {
  return `<div class="login-page"><section class="login-story"><div class="brand"><img class="product-mark" src="./assets/licence-manager-mark-dark.svg" width="44" height="32" alt="">Licence Register</div><div class="login-copy"><div class="eyebrow">A clearer view of your software</div><h1>Every licence.<br>Every system.<br><span>One place.</span></h1><p>Find the key you need. Know what's covered. Stay ahead of the next renewal.</p><div class="story-checks"><span>${icon('check')}Simple to find</span><span>${icon('check')}Easy to copy</span><span>${icon('check')}Built for ICT</span></div></div><div class="story-foot"><a class="company-site" href="https://langsystems.com.au/" target="_blank" rel="noopener noreferrer" aria-label="Lang Systems website (opens in a new tab)">Lang Systems</a> · Idea to production ready software.</div></section><main class="login-form-region" id="main"><div class="login-card"><span class="login-badge">${icon('licence')}Portfolio demo</span><h2>Your workspace awaits.</h2><p class="muted">A Lang Systems portfolio demonstration of software licensing workflows.</p><div class="login-person">${avatar(USERS[0])}<div><strong>Example ICT Services</strong><div class="small muted">Fictional portfolio workspace</div></div></div><label for="demo-user" class="small muted">Choose a demo account</label><select id="demo-user" aria-describedby="demo-auth-note">${USERS.map(u => `<option value="${u.id}">${e(u.name)} · ${e(u.role)}</option>`).join('')}</select>${btn(`Open demo workspace ${icon('arrow')}`, 'login', 'primary wide')}<p class="login-note" id="demo-auth-note"><strong>No password needed.</strong> These accounts preview different roles; they are not real authentication. All records are fictional. Changes stay in this tab and reset on refresh. Please do not enter real keys or customer information.</p></div></main></div>`;
}
function shell(body) {
  const [page = 'overview'] = route();
  const count = new Set(dueEvents(db, DEMO_DATE).map(event => event.licence.id)).size;
  const nav = [['overview', 'grid', 'Overview'], ['licences', 'licence', 'Licences'], ['systems', 'server', 'Systems'], ['renewals', 'calendar', 'Renewals'], ['activity', 'activity', 'Activity']];
  return `<div class="shell"><button class="mobile-nav-overlay" data-action="close-nav" aria-label="Close navigation"></button><aside class="sidebar" id="navigation"><a class="brand" href="#overview"><img class="product-mark" src="./assets/licence-manager-mark-dark.svg" width="44" height="32" alt="">Licence Register</a><div class="workspace-name">WORKSPACE</div><nav class="nav-list" aria-label="Main navigation">${nav.map(([id, i, label]) => `<a class="nav-item ${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''} href="#${id}">${icon(i)}${label}${id === 'renewals' && count ? `<span class="nav-count" aria-label="${count} licences with due actions" title="${count} licences with due actions">${count}</span>` : ''}</a>`).join('')}</nav><div class="sidebar-bottom"><a href="#team" class="nav-item ${page === 'team' ? 'active' : ''}">${icon('people')}People & access</a><div class="sidebar-card"><strong>${icon('shield')} Software licensing concept</strong><p>A software licensing concept by Lang Systems. Explore with fictional data only.</p></div><div class="sidebar-footer company-brand"><img class="company-mark" src="./assets/lang-systems-mark-outline.png" width="30" height="30" alt=""><span><a class="company-site" href="https://langsystems.com.au/" target="_blank" rel="noopener noreferrer" aria-label="Lang Systems website (opens in a new tab)">Lang Systems</a><br>Idea to production ready software.</span></div></div></aside><header class="topbar"><button class="icon-btn mobile-toggle" data-action="toggle-nav" aria-label="Open navigation" aria-controls="navigation" aria-expanded="false">${icon('menu')}</button><span class="topbar-label">Example ICT Services</span><form class="global-search" id="global-search" role="search">${icon('search')}<input id="search" type="search" name="query" placeholder="Search licences, systems or service tags…" aria-label="Search licences, systems or service tags" value="${e(query)}" autocomplete="off"><kbd>/</kbd></form><span class="spacer"></span><button class="account-button" data-action="account" aria-label="Account: ${e(user.name)}, ${user.role}">${avatar(user)}<span class="account-text"><strong>${e(user.name)}</strong><small>${e(user.role)}</small></span>${icon('down')}</button></header><div class="demo-strip">${icon('licence')}<span>Fictional demo<span class="demo-extra"> · changes reset on refresh · sample date ${formatDate(DEMO_DATE)}</span>. Do not enter real licence data.</span><button class="text-link" data-action="reset">Reset demo</button></div><main class="content" id="main" tabindex="-1">${body}</main></div>`;
}
function empty(title, message, action = '') { return `<div class="empty-state">${icon('search')}<h2>${e(title)}</h2><p>${e(message)}</p>${action}</div>`; }
function heading(title, subtitle, actions = '', extra = '') { return `<div class="page-heading ${extra}"><div><h1>${e(title)}</h1><p>${e(subtitle)}</p></div><div class="heading-actions">${actions}</div></div>`; }
function addLicenceButton() { return can(user, 'write') ? btn(`${icon('plus')}Add licence`, 'add-licence', 'primary') : ''; }
function dateHint(l) {
  const activeDates = Object.entries(DATE_FIELDS).filter(([k]) => l[k]?.state === 'known').sort(([a], [b]) => l[a].date.localeCompare(l[b].date));
  if (!activeDates.length) return l.licenceType === 'perpetual' ? 'No licence expiry' : 'Dates to confirm';
  return `${activeDates[0][1]} · ${formatDate(l[activeDates[0][0]].date)}`;
}
function licenceTable(items, compact = false) {
  if (!items.length) return empty('No licences found', 'Try another product, hostname or service tag.', btn('Clear search & filters', 'clear-search'));
  return `<div class="table-scroll"><table class="data-table responsive-table"><thead><tr><th>Software</th>${compact ? '' : '<th class="vendor-column">Licence type</th>'}<th>Status</th><th class="optional-column">Custodian</th><th><span class="small">Actions</span></th></tr></thead><tbody>${items.map(l => {
    const status = attention(l, DEMO_DATE);
    const systems = uniqueLinkedSystems(db, l.id);
    return `<tr><td class="title-cell"><div class="product-title">${productIcon(l)}<div><a class="row-title" href="#licences/${l.id}"><strong>${e(l.title)}</strong></a><small>${e([l.softwareVersion,l.edition||l.vendor].filter(Boolean).join(' · '))}</small>${query ? `<div class="match-label">${e(matchLabel(db, l, query))}</div>` : ''}</div></div></td>${compact ? '' : `<td class="vendor-column hide-mobile">${e(typeName(l.licenceType))}<small>${l.quantity ?? '—'} ${e(l.metric)}</small></td>`}<td class="status-cell">${badge(status.label, status.tone)}<div class="coverage-mini"><small>Licence · ${l.licenceType==='perpetual'?'Perpetual':factText(l.licenceEnd)}</small><small>SUM · ${factText(l.supportEnd)}</small></div></td><td class="optional-column hide-mobile">${e(l.owner)}<small>${systems.length} linked ${systems.length === 1 ? 'system' : 'systems'}</small></td><td class="actions-cell"><div class="row-actions">${can(user, 'secret') && l.secrets[0] ? `<button class="icon-btn" data-action="quick-copy" data-id="${l.id}" aria-label="${l.secrets[0].kind === 'file' ? 'Download activation file for' : 'Copy key for'} ${e(l.title)}">${icon(l.secrets[0].kind === 'file' ? 'download' : 'copy')}</button>` : ''}<a class="icon-btn" href="#licences/${l.id}" aria-label="Open ${e(l.title)}">${icon('chevron')}</a></div></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function activityRows(items) {
  return `<ul class="activity-list">${items.map(a => `<li class="activity-item"><span class="activity-dot">${icon(a.action.includes('key') ? 'key' : 'edit')}</span><div><p><strong>${e(a.actor)}</strong> ${e(a.action.toLowerCase())}${a.entity && licence(a.entity) ? ` · <a href="#licences/${e(a.entity)}">${e(a.label)}</a>` : a.label ? ` · ${e(a.label)}` : ''}</p><small>${e(new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(a.time)))}</small></div></li>`).join('')}</ul>`;
}
function dueRows(events) {
  return `<ul class="due-list">${events.map(d => `<li class="due-row">${productIcon(d.licence)}<div class="info"><a href="#licences/${d.licence.id}">${e(d.licence.title)}</a><small>${e(d.label)} · ${e(d.licence.owner)}</small></div><div class="due-right">${badge(d.days < 0 ? `${Math.abs(d.days)}d overdue` : d.days === 0 ? 'Today' : `In ${d.days} days`, d.days < 0 ? 'danger' : d.days <= 30 ? 'warning' : 'neutral')}<small>${formatDate(d.date)}</small></div></li>`).join('')}</ul>`;
}
function overview() {
  const active = db.licences.filter(l => dashboardMatches(l, 'current', DEMO_DATE));
  const due = active.filter(l => dashboardMatches(l, 'due_soon', DEMO_DATE));
  const expired = active.filter(l => dashboardMatches(l, 'expired', DEMO_DATE));
  const review = active.filter(l => dashboardMatches(l, 'review', DEMO_DATE));
  const events = dueEvents(db, DEMO_DATE);
  const uniqueDue = events.filter((d, i, all) => all.findIndex(x => x.licence.id === d.licence.id) === i);
  return `${heading('Overview', 'Your software estate, at a glance.', addLicenceButton())}<div class="stats-grid"><button class="stat" data-action="stat" data-filter="current"><span class="stat-label">Total licences<span class="stat-icon">${icon('licence')}</span></span><strong>${active.length}</strong><small>Across ${new Set(active.map(l => l.vendor)).size} software vendors</small></button><button class="stat warning-stat" data-action="stat" data-filter="due_soon"><span class="stat-label">Due soon<span class="stat-icon">${icon('calendar')}</span></span><strong>${due.length}</strong><small>Next action within 30 days</small></button><button class="stat danger-stat" data-action="stat" data-filter="expired"><span class="stat-label">Expired dates<span class="stat-icon">${icon('alert')}</span></span><strong>${expired.length}</strong><small>Licence or support needs attention</small></button><button class="stat" data-action="stat" data-filter="review"><span class="stat-label">Needs review<span class="stat-icon">${icon('edit')}</span></span><strong>${review.length}</strong><small>Confirm missing entitlement details</small></button></div><div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Your licences<span class="count-label">${active.length}</span></h2><p>Quick access to your software and keys.</p></div><a class="text-link" href="#licences">View all ${icon('arrow')}</a></div>${licenceTable(active.slice(0, 5), true)}<div class="panel-foot"><span>Keys stay hidden until you choose to reveal them.</span>${icon('shield')}</div></section><div class="dashboard-side"><section class="panel"><div class="panel-head"><h2>Upcoming & overdue</h2><a class="text-link" href="#renewals">View all</a></div>${uniqueDue.length ? dueRows(uniqueDue.slice(0, 4)) : empty('All caught up', 'No date actions are due in the next 90 days.')}</section><section class="panel"><div class="panel-head"><h2>Recent activity</h2><a class="text-link" href="#activity">View all</a></div>${activityRows(db.activity.slice(0, 3))}</section></div></div>`;
}
function licencesView() {
  const items = findLicences(db, query, filter, DEMO_DATE).sort((a, b) => sort === 'attention' ? attention(a, DEMO_DATE).sort - attention(b, DEMO_DATE).sort : a.title.localeCompare(b.title));
  return `${heading('Licences', ({current:'Current records, including drafts. Retired and archived records are excluded.',due_soon:'Licences whose next action is due within 30 days.',expired:'Licences with expired rights or support coverage.',review:'Drafts and licences with entitlement details to confirm.'}[filter] || 'Everything you need, without the spreadsheet.'), `${can(user, 'export') ? btn(`${icon('download')}<span class="export-label">Export</span>`, 'export', '', 'aria-label="Export metadata"') : ''}${addLicenceButton()}`)}<section class="panel"><div class="filters"><div class="filter-tabs" role="group" aria-label="Filter licences">${[['all','All licences'],['current','Current records'],['due_soon','Due within 30 days'],['expired','Expired dates'],['review','Needs review'],['subscription','Subscriptions'],['perpetual','Perpetual'],['attention','Needs attention'],['spare','Spares'],['archived','Archived']].map(([v, label]) => `<button class="filter-button ${filter === v ? 'active' : ''}" data-action="filter" data-filter="${v}" aria-pressed="${filter === v}">${label}</button>`).join('')}</div><select id="licence-sort" class="select-clean" aria-label="Sort licences"><option value="name" ${sort === 'name' ? 'selected' : ''}>Name A–Z</option><option value="attention" ${sort === 'attention' ? 'selected' : ''}>Attention first</option></select></div>${licenceTable(items)}<div class="panel-foot"><span>${items.length} ${items.length === 1 ? 'licence' : 'licences'}${query ? ` matching “${e(query)}”` : ''}</span><span>Sample date ${formatDate(DEMO_DATE)}</span></div></section>`;
}
function keysPanel(l) {
  if (!can(user, 'secret')) return `<div class="notice">${icon('shield')} Keys are restricted in the Viewer role. Metadata and fictional EULAs remain available.</div>`;
  if (!l.secrets.length) return `<div class="notice">No key has been recorded.${can(user, 'write') ? ' Edit this licence to add a fictional key.' : ''}</div>`;
  return `<section class="key-panel" aria-label="Licence keys"><div class="key-heading"><h2>${icon('key')}Licence ${l.secrets.length > 1 ? 'keys' : 'key'}</h2><span class="small muted">${shown.size ? 'Auto-hide after 30 seconds' : 'Hidden by default'}</span></div>${l.secrets.map(s => `<div class="key-item"><label class="key-label" for="key-${s.id}">${e(s.label)}</label><div class="key-control"><textarea id="key-${s.id}" class="key-value ${shown.has(s.id) ? '' : 'masked'}" data-secret-value="${s.id}" readonly spellcheck="false" autocomplete="off" aria-label="${e(s.label)} ${shown.has(s.id) ? 'revealed' : 'hidden'}">${shown.has(s.id) ? e(s.value) : '•••• •••• •••• ••••'}</textarea><button class="btn small-btn" data-action="reveal" data-id="${l.id}" data-secret="${s.id}" aria-pressed="${shown.has(s.id)}">${icon(shown.has(s.id) ? 'eyeOff' : 'eye')}<span>${shown.has(s.id) ? 'Hide' : 'Show'}</span></button><button class="btn primary small-btn" data-action="copy" data-id="${l.id}" data-secret="${s.id}">${icon(s.kind === 'file' ? 'download' : 'copy')}${s.kind === 'file' ? 'Download' : 'Copy key'}</button></div></div>`).join('')}<p class="key-note">Fictional keys only. Revealed values auto-hide on tab change or after 30 seconds. Copying does not clear your device's clipboard.</p></section>`;
}
function activationLabel(value) {return {activated:'Yes · activated',not_applied:'No · not applied yet',not_applicable:'Not applicable',unknown:'Unknown'}[value]||'Unknown';}
function factsGrid(items){return `<dl class="facts">${items.map(([key,value])=>`<div class="fact"><dt>${e(key)}</dt><dd>${e(value||'Not recorded')}</dd></div>`).join('')}</dl>`;}
function licensingView(l){
  const portal=safeUrl(l.portalUrl);
  return `<div class="panel-body">${factsGrid([['Licence type',typeName(l.licenceType)],['Licence model / deployment',modelName(l.licenceModel)],['Duration / term',l.duration],['Payment model',l.paymentModel],['Entry quantity',l.metric==='unrestricted'?'Unrestricted':`${l.quantity??'Unknown'} ${l.metric==='other'?l.customUnit:l.metric}`],['Activation',activationLabel(l.activation)],['Recorded status',typeName(l.licenceStatus)],['Project / allocation owner',l.project],['Legal licence owner',l.legalOwner],['Procured by',l.procuredBy],['Licence custodian',l.owner],['Purchase date',factText(l.purchaseDate)],['Transferable',typeName(l.transferable)],['Transfer conditions',l.transferConditions],['Holding / subset',`${typeName(l.holding)}${l.subsetLabel?` · ${l.subsetLabel}`:''}`],['SUM/SUMS reference',l.sumReference]])}<div class="subsection"><h3>Usage rights</h3><p>${e(l.rights||'No usage rights recorded. Check the purchase-specific terms.')}</p></div>${portal?`<div class="subsection"><a class="text-link" href="${e(portal)}" target="_blank" rel="noopener noreferrer">Open vendor portal ${icon('arrow')}</a><p>Recorded link only. No portal connection or synchronisation is enabled.</p></div>`:''}</div>`;
}
function datesSummary(l){
  const row=(key,label)=>{const f=l[key],ds=dateStatus(f,DEMO_DATE),isStart=['licenceStart','supportStart'].includes(key);return `<div class="date-row"><span>${label}</span><strong>${key==='licenceEnd'&&l.licenceType==='perpetual'?'No licence expiry':factText(f)}</strong>${ds.days!==null?`<small class="${ds.days<0&&!isStart?'warning-text':'muted'}">${isStart?(ds.days<=0?'Started':`Starts in ${ds.days} days`):ds.days<0?['sumRenewal','renewalDate','renewalNotice'].includes(key)?'Action overdue':key==='supportEnd'?'SUM coverage expired':'Licence expired':ds.days===0?'Due today':`In ${ds.days} days`}</small>`:''}</div>`;};
  return `<h3 class="coverage-label">Licence</h3>${row('licenceStart','Start date')}${row('licenceEnd','End date')}${row('renewalDate','Renewal date')}${row('renewalNotice','Notice / action date')}<h3 class="coverage-label">SUM / SUMS</h3><p class="hint coverage-note">Support, updates & maintenance</p>${row('supportStart','Coverage starts')}${row('supportEnd','Coverage ends')}${row('sumRenewal','SUM renewal')}<p class="hint">${e(l.sumPeriod||'Period not recorded')}</p>`;
}
function poolPanel(l){
  const balance=poolBalance(db,l.poolId);if(!balance)return '';
  return `<section class="panel pool-panel"><div class="panel-head"><div><h2>${e(balance.pool.name)}</h2><p>Shared entitlement · each system keeps its own entry</p></div>${badge(l.holding==='spare'?'Spare subset':l.holding==='reserved'?'Reserved subset':'Allocated subset','purple')}</div><div class="panel-body"><div class="pool-counts"><span><strong>${balance.pool.quantity}</strong> purchased ${e(balance.pool.metric)}</span><span><strong>${balance.assigned}</strong> allocated</span><span><strong>${balance.spare}</strong> spare</span><span><strong>${balance.reserved}</strong> reserved</span><span><strong>${balance.unassigned}</strong> unassigned</span></div><div class="entry-links">${balance.entries.map(row=>`<a href="#licences/${row.id}" class="entry-link ${row.id===l.id?'selected':''}"><strong>${e(row.title)}</strong><small>${row.quantity} ${e(row.metric)} · ${e(row.project||'Unassigned project')} · ${e(row.owner)}</small><small>SUM renewal · ${factText(row.sumRenewal)}</small></a>`).join('')}</div><p class="hint">Spare/reserved subsets count once against the purchased total. Unassigned units have not been placed in an entry.</p></div></section>`;
}
function detailView(l, tab = 'overview') {
  const currentTab = ['overview','licensing', 'systems', 'documents', 'history'].includes(tab) ? tab : 'overview';
  const status = attention(l, DEMO_DATE);
  const total = allocated(db, l.id);
  const slots = l.quantity ? Math.min(20, l.quantity) : 0;
  const filled = l.quantity ? Math.ceil(total / l.quantity * slots) : 0;
  const facts = [['Software version',l.softwareVersion||'Not recorded'],['Category',l.category||'Not recorded'],['Project / allocation owner',l.project||'Unassigned'],['Activation',activationLabel(l.activation)],['Vendor', l.vendor], ['Product / edition', `${l.product}${l.edition ? ` · ${l.edition}` : ''}`], ['Entitlement reference', l.reference || 'Not recorded'], ['Licence custodian', l.owner || 'Unassigned'], ['Licence type', typeName(l.licenceType)], ['Lifecycle', typeName(l.lifecycle)]];
  let body = `<div class="panel-body"><dl class="facts">${facts.map(([key, value]) => `<div class="fact"><dt>${e(key)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl><div class="subsection"><h3>Notes</h3><p>${e(l.notes || 'No notes recorded.')}</p></div>${l.predecessor ? `<div class="subsection"><h3>Previous entitlement</h3><a class="text-link" href="#licences/${l.predecessor}">${e(licence(l.predecessor)?.title || 'Previous licence')} ${icon('arrow')}</a></div>` : ''}${l.successor ? `<div class="subsection"><h3>Renewed entitlement</h3><a class="text-link" href="#licences/${l.successor}">${e(licence(l.successor)?.title || 'Successor')} ${icon('arrow')}</a></div>` : ''}</div>`;
  if (currentTab === 'licensing') body = licensingView(l);
  if (currentTab === 'systems') body = associationsView(l);
  if (currentTab === 'documents') body = documentsView(l);
  if (currentTab === 'history') body = db.activity.some(a => a.entity === l.id) ? activityRows(db.activity.filter(a => a.entity === l.id)) : empty('No changes recorded', 'Actions on this licence will appear here during your demo session.');
  return `<div class="breadcrumb"><a href="#licences">Licences</a>${icon('chevron')}<span>${e(l.title)}</span></div><div class="page-heading detail-page-heading"><div class="detail-heading">${productIcon(l, true)}<div><h1>${e(l.title)}</h1><p>${e(l.vendor)} · ${e(l.reference)}</p><div class="detail-badges">${badge(status.label, status.tone)}${badge(typeName(l.licenceType), 'neutral')}</div></div></div><div class="heading-actions">${can(user, 'write') ? btn(`${icon('edit')}Edit licence`, 'edit-licence', '', `data-id="${l.id}"`) : ''}</div></div><div class="detail-grid"><div class="detail-main">${keysPanel(l)}${poolPanel(l)}<section class="panel"><nav class="detail-tabs" aria-label="Licence details">${[['overview','Overview'],['licensing','Licensing & ownership'],['systems',`Systems (${uniqueLinkedSystems(db,l.id).length})`],['documents',`Documents (${l.documents.length})`],['history','History']].map(([t,label]) => `<a class="tab ${currentTab === t ? 'active' : ''}" href="#licences/${l.id}/${t}" ${currentTab === t ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>${body}</section>${can(user, 'write') ? `<div class="cluster section-gap">${!l.successor && !['archived','retired'].includes(l.lifecycle) ? btn(`${icon('refresh')}Record renewal`, 'renew', '', `data-id="${l.id}"`) : ''}${!['archived','retired'].includes(l.lifecycle)?btn(`${icon('plus')}Add system entry`,'add-entry','',`data-id="${l.id}"`):''}${btn(l.lifecycle === 'archived' ? 'Restore as draft' : 'Archive licence', 'archive', 'quiet', `data-id="${l.id}"`)}</div>` : ''}</div><aside class="detail-sidebar"><section class="panel"><div class="panel-body"><h3 class="side-title">Dates & renewal</h3>${datesSummary(l)}</div></section><section class="panel"><div class="panel-body"><h3 class="side-title">Allocation</h3><div class="allocation-number"><strong>${l.metric==='unrestricted'?'∞':l.quantity === null ? '—' : total}</strong><span>/ ${l.metric==='unrestricted'?'unrestricted':l.quantity ?? 'unknown'} ${l.metric==='unrestricted'?'':e(l.metric==='other'?l.customUnit:l.metric)}</span></div>${slots ? `<div class="meter" aria-hidden="true">${Array.from({length:slots},(_,i) => `<span class="${i < filled ? '' : 'unused'}"></span>`).join('')}</div>` : ''}<p class="hint">${l.metric==='unrestricted'?'No numerical quantity limit recorded. Check usage rights and the purchase-specific terms.':l.quantity === null ? 'Capacity is unknown. Confirm entitlement details.' : `${l.quantity - total} units available. Only allocated links consume units.`}</p><a class="text-link" href="#licences/${l.id}/systems">View linked systems ${icon('arrow')}</a></div></section></aside></div>`;
}
function associationsView(l) {
  const systems = linkedSystems(db, l.id);
  return `<div class="panel-body"><div class="cluster"><p class="hint">Activation and reference links do not consume units.</p><span class="spacer"></span>${can(user,'write') && !['archived','retired'].includes(l.lifecycle) ? btn(`${icon('link')}Link system`, 'link-system','small-btn',`data-id="${l.id}"`) : ''}</div></div>${systems.length ? `<div class="table-scroll"><table class="data-table responsive-table"><thead><tr><th>System</th><th>Relationship</th><th>Units</th>${can(user,'write') ? '<th>Action</th>' : ''}</tr></thead><tbody>${systems.map(s=>`<tr><td class="title-cell"><a class="row-title" href="#systems/${s.id}"><strong>${e(s.name)}</strong></a><small>${e(s.hostname)}${s.serviceTag ? ` · ${e(s.serviceTag)}` : ''}</small></td><td class="status-cell">${badge(purpose(s.association.purpose),'neutral')}</td><td class="extra-cell">${s.association.purpose === 'allocation' ? `${s.association.units} ${e(l.metric)}` : 'No units consumed'}</td>${can(user,'write') ? `<td class="actions-cell">${btn('Unlink','unlink','small-btn quiet',`data-id="${l.id}" data-association="${s.association.id}"`)}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : empty('No systems linked', 'Link a system to record where this entitlement is used.')}`;
}
function documentsView(l) {
  return `<div class="panel-body"><div class="notice">Purchase-specific evidence: the pinned version stays associated with this licence. Adding newer terms does not change what was recorded at purchase. Only fictional PDF/text files or example links belong in this public demo.</div>${can(user,'write')?btn(`${icon('plus')}Add entitlement evidence`,'add-document','small-btn',`data-id="${l.id}"`):''}${l.documents.length?l.documents.map(d=>`<article class="document-card"><div class="document-header"><span class="activity-dot">${icon('file')}</span><div class="info"><strong>${e(d.title)}</strong><small>${e(d.kind)} · purchase reference ${e(d.purchaseReference||l.reference||'Not recorded')}</small></div>${can(user,'write')?btn('Add version','document-version','small-btn',`data-id="${l.id}" data-document="${d.id}"`):''}</div>${[...d.versions].reverse().map(v=>`<div class="version-row"><span>Version ${e(v.version)}</span>${v.id===d.purchaseVersionId?badge('At purchase','purple'):badge('Later version','neutral')}<span>${formatDate(v.date)}</span>${v.hash?`<span class="small" title="SHA-256 of original file bytes">Integrity hash recorded</span>`:''}<span class="spacer"></span>${safeUrl(v.sourceUrl)?`<a class="text-link" href="${e(safeUrl(v.sourceUrl))}" target="_blank" rel="noopener noreferrer">Source link</a>`:''}<button class="text-link" data-action="view-document" data-id="${l.id}" data-document="${d.id}" data-version="${v.id}">View</button><button class="icon-btn" data-action="download-document" data-id="${l.id}" data-document="${d.id}" data-version="${v.id}" aria-label="Download ${e(d.title)} version ${e(v.version)}">${icon('download')}</button>${can(user,'write')&&v.id!==d.purchaseVersionId?`<button class="text-link" data-action="pin-document" data-id="${l.id}" data-document="${d.id}" data-version="${v.id}">Correct purchase link</button>`:''}</div>`).join('')}</article>`).join(''):empty('No purchase evidence recorded','Add an EULA, purchase order or contract snapshot for this specific licence.')}</div>`;
}
function systemsView(id) {
  if (id) {
    const s = db.systems.find(x => x.id === id);
    if (!s) return empty('System not found', 'This demo system is no longer available.', '<a class="btn" href="#systems">Back to systems</a>');
    const items = db.licences.filter(l => db.associations.some(a => a.licenceId === l.id && a.systemId === s.id));
    return `<div class="breadcrumb"><a href="#systems">Systems</a>${icon('chevron')}<span>${e(s.name)}</span></div>${heading(s.name,`${s.hostname} · ${s.environment}`,can(user,'write') ? btn(`${icon('edit')}Edit system`,'edit-system','',`data-system="${s.id}"`) : '')}<section class="panel"><div class="panel-body"><dl class="facts">${[['Type',s.type],['Service tag',s.serviceTag || 'Not applicable / not recorded'],['Hostname',s.hostname],['Physical location',s.location||'Not recorded'],['Owner',s.owner]].map(([k,v])=>`<div class="fact"><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl>${s.notes ? `<div class="subsection"><h3>Notes</h3><p>${e(s.notes)}</p></div>` : ''}</div></section><section class="panel"><div class="panel-head"><h2>Associated licences<span class="count-label">${items.length}</span></h2></div>${items.length ? licenceTable(items) : empty('No licences linked', 'Open a licence and link this system from its Systems tab.')}</section>`;
  }
  const q = query.trim().toLowerCase();
  const systems = db.systems.filter(s => [s.name,s.hostname,s.type,s.environment,s.serviceTag,s.location||''].some(v=>v.toLowerCase().includes(q)));
  return `${heading('Systems','Know where your software is used.',can(user,'write') ? btn(`${icon('plus')}Add system`,'add-system','primary') : '')}<div class="system-cards">${systems.map(s=>`<a class="system-card" href="#systems/${s.id}"><div class="system-card-top"><span class="product-icon blue">${icon(s.type === 'Workstation' ? 'monitor' : 'server')}</span>${badge(s.environment,s.environment === 'Test' ? 'neutral' : 'purple')}</div><h2>${e(s.name)}</h2><p class="mono">${e(s.hostname)}</p><p class="small">${e(s.location||'Location not recorded')}</p><dl><div><dt>Service tag</dt><dd>${e(s.serviceTag || 'Not recorded')}</dd></div><div><dt>Licences</dt><dd>${new Set(db.associations.filter(a=>a.systemId === s.id).map(a=>a.licenceId)).size} associated</dd></div></dl></a>`).join('')}</div>${!systems.length ? `<section class="panel">${empty('No systems found','Try a hostname, environment or service tag.',btn('Clear search','clear-search'))}</section>` : ''}`;
}
function renewalsView() {
  const events = dueEvents(db, DEMO_DATE, true).filter(d => renewalFilter === 'snoozed' ? d.snoozeUntil && dayNumber(d.snoozeUntil) > dayNumber(DEMO_DATE) : renewalFilter === 'progress' ? d.status === 'In progress' && !(d.snoozeUntil && dayNumber(d.snoozeUntil)>dayNumber(DEMO_DATE)) : !(d.snoozeUntil && dayNumber(d.snoozeUntil)>dayNumber(DEMO_DATE))).filter(d=>!query || [d.licence.title,d.licence.owner,d.label].some(v=>v.toLowerCase().includes(query.toLowerCase())));
  return `${heading('Renewals','The right action, before the next deadline.')}<section class="panel"><div class="filters"><div class="filter-tabs">${[['all','All due dates'],['progress','In progress'],['snoozed','Snoozed']].map(([v,t])=>`<button class="filter-button ${renewalFilter === v ? 'active' : ''}" aria-pressed="${renewalFilter === v}" data-action="renewal-filter" data-filter="${v}">${t}</button>`).join('')}</div><span class="small muted">Next 90 days & overdue</span></div><p class="renewal-summary" role="status">${events.length} ${events.length === 1 ? 'date action' : 'date actions'} across ${new Set(events.map(event=>event.licence.id)).size} ${new Set(events.map(event=>event.licence.id)).size === 1 ? 'licence' : 'licences'}${query ? ` matching “${e(query)}”` : ''}. Each date is a separate action; a licence can appear more than once.</p>${events.length ? `<div class="table-scroll"><table class="data-table responsive-table"><thead><tr><th>Software</th><th>Event / date</th><th>Status</th><th>Action</th></tr></thead><tbody>${events.map(d=>`<tr><td class="title-cell"><div class="product-title">${productIcon(d.licence)}<div><a href="#licences/${d.licence.id}"><strong>${e(d.licence.title)}</strong></a><small>${e(d.licence.owner)}</small></div></div></td><td class="extra-cell">${e(d.label)}<small>${formatDate(d.date)}</small></td><td class="status-cell">${badge(d.snoozeUntil && renewalFilter === 'snoozed' ? `Until ${formatDate(d.snoozeUntil)}` : d.status || (d.days < 0 ? 'Overdue' : d.days === 0 ? 'Due today' : `In ${d.days} days`),d.status === 'In progress' ? 'purple' : d.days < 0 ? 'danger' : 'warning')}</td><td class="actions-cell">${can(user,'write') ? `<div class="cluster">${btn(d.status === 'In progress' ? 'Reopen' : 'Start action','due-progress','small-btn',`data-event="${d.id}"`)}${btn(renewalFilter === 'snoozed' ? 'Unsnooze' : 'Snooze','due-snooze','small-btn quiet',`data-event="${d.id}"`)}</div>` : '<span class="muted small">Read only</span>'}</td></tr>`).join('')}</tbody></table></div>` : empty('All caught up', 'No matching date actions in this view.')}<div class="panel-foot"><span>Rights, support and notice dates are tracked separately.</span></div></section>`;
}
function teamView() {
  return `${heading('People & access','A workspace for the whole ICT team.')}<div class="notice">Demo account previews, not real user administration. Shared accounts, server-enforced permissions and identity integration belong to the on-prem backend stage.</div><section class="panel team-table"><div class="panel-head"><h2>Demo users<span class="count-label">${USERS.length}</span></h2>${btn('Switch demo user','account','small-btn')}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>Person</th><th>Role</th><th>Access preview</th></tr></thead><tbody>${USERS.map(u=>`<tr><td><div class="product-title">${avatar(u)}<div><strong>${e(u.name)}${user.id === u.id ? ' (you)' : ''}</strong><small>${e(u.title)}</small></div></div></td><td>${badge(u.role,'purple')}</td><td>${u.role === 'Custodian' ? 'Manage records, keys and allocations' : u.role === 'Operator' ? 'Read records and retrieve keys' : 'Read metadata and ordinary documents'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-body"><h3>Built for shared use</h3><p class="hint">The next stage will connect this interface to the private on-prem service for individual sign-in, shared storage, revocation and audit. This demo intentionally keeps edits in the current tab; it does not synchronise data between users or devices.</p></div></section>`;
}
function render() {
  if (!user) { root.innerHTML = login(); document.title = 'Licence Register · Demo'; return; }
  const [page = 'overview', id, tab] = route();
  let body;
  if (!navigator.onLine) body = `<div class="offline">${icon('wifi')}<h1>You're offline.</h1><p>The app shell is available. Reconnect to open the fictional workspace. Licence records and keys are not available in this view.</p>${btn(`${icon('refresh')}Try again`,'reconnect','primary')}</div>`;
  else if (page === 'overview') body = overview();
  else if (page === 'licences') body = id ? licence(id) ? detailView(licence(id),tab) : empty('Licence not found','This record is no longer available.','<a class="btn" href="#licences">Back to licences</a>') : licencesView();
  else if (page === 'systems') body = systemsView(id);
  else if (page === 'renewals') body = renewalsView();
  else if (page === 'activity') {
    const entries = db.activity.filter(a=>!query || [a.actor,a.action,a.label].some(v=>v.toLowerCase().includes(query.toLowerCase())));
    body = `${heading('Activity','A clear trail of changes and access.')}<div class="notice">Simulated events for this tab only. Production audit will be recorded and protected by the on-prem service.</div><section class="panel">${entries.length ? activityRows(entries) : empty('No matching activity','Try a different search.')}</section>`;
  } else if (page === 'team') body = teamView();
  else body = empty('Page not found','Return to your workspace.','<a class="btn primary" href="#overview">Go to overview</a>');
  root.innerHTML = shell(body);
  document.title = `${id && page === 'licences' && licence(id) ? licence(id).title : {overview:'Overview',licences:'Licences',systems:'Systems',renewals:'Renewals',activity:'Activity',team:'People & access'}[page] || 'Workspace'} · Licence Register`;
}

function field(label, name, value = '', opts = {}) {
  const { type = 'text', placeholder = '', full = false, required = false } = opts;
  return `<div class="field ${full ? 'full-span' : ''}"><label for="f-${name}">${e(label)}${required ? ' *' : ''}</label><input id="f-${name}" name="${name}" type="${type}" value="${e(value)}" placeholder="${e(placeholder)}" ${required ? 'required' : ''} ${type === 'number' ? 'min="1" step="1"' : ''} maxlength="${type === 'number' ? '10' : '300'}"></div>`;
}
function selectField(label,name,values,value,full=false) { return `<div class="field ${full ? 'full-span' : ''}"><label for="f-${name}">${e(label)}</label><select id="f-${name}" name="${name}">${values.map(v=>{ const [id,text]=Array.isArray(v)?v:[v,v]; return `<option value="${e(id)}" ${value===id?'selected':''}>${e(text)}</option>`; }).join('')}</select></div>`; }
function dateField(label, name, fact = {state:'unknown'}) {
  return `<div class="field full-span"><label for="f-${name}-state">${e(label)}</label><div class="date-input-row"><select id="f-${name}-state" name="${name}State" data-date-state="${name}"><option value="known" ${fact.state==='known'?'selected':''}>Known date</option><option value="unknown" ${fact.state==='unknown'?'selected':''}>Unknown</option><option value="not_applicable" ${fact.state==='not_applicable'?'selected':''}>Not applicable</option></select><input id="f-${name}" name="${name}" type="date" aria-label="${e(label)} date" value="${fact.date||''}" ${fact.state!=='known'?'disabled':''}></div></div>`;
}
function formErrors(form, errors) {
  form.querySelector('.form-error')?.remove();
  form.querySelectorAll('.field-error').forEach(n=>n.remove());
  form.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});
  if (!Object.keys(errors).length) return;
  const errorInput=key=>{const input=form.elements.namedItem(key);return input?.disabled&&form.elements.namedItem(`${key}State`)||input;};
  const block=document.createElement('div'); block.className='form-error';block.setAttribute('role','alert');block.tabIndex=-1;
  const heading=document.createElement('strong');heading.textContent='Please review the following fields:';block.append(heading);
  const list=document.createElement('ul');
  Object.entries(errors).forEach(([key,msg])=>{const input=errorInput(key);const label=(input?.labels?.[0]?.textContent||input?.getAttribute?.('aria-label'))?.replace(/\s*\*\s*$/,'').trim()||key;const item=document.createElement('li');if(input?.id){const link=document.createElement('a');link.href=`#${input.id}`;link.textContent=`${label}: ${msg}`;link.addEventListener('click',event=>{event.preventDefault();const group=input.closest('details');if(group)group.open=true;input.focus();});item.append(link);}else item.textContent=`${label}: ${msg}`;list.append(item);});block.append(list);form.prepend(block);
  Object.entries(errors).forEach(([key,msg])=>{ const input=errorInput(key);if(input && input.setAttribute){input.setAttribute('aria-invalid','true');const group=input.closest('details');if(group)group.open=true;const note=document.createElement('small');note.className='field-error';note.id=`error-${key}`;note.textContent=msg;input.setAttribute('aria-describedby',note.id);input.closest('.field')?.append(note);} });
  block.focus();
}
function updatePoolCapacity() {
  const summary = modal.querySelector('#pool-capacity');
  const form = modal.querySelector('#licence-form');
  if (!summary || !form) return;
  const value = name => form.elements.namedItem(name)?.value || '';
  const poolId = value('poolId');
  summary.hidden = !poolId;
  if (!poolId) return;
  const pool = db.pools.find(item => item.id === poolId);
  const source = licence(form.dataset.source);
  const others = db.licences.filter(item => item.poolId === poolId && item.id !== form.dataset.id && !['retired','archived'].includes(item.lifecycle));
  if (poolId === 'new' && source && !source.poolId && !['retired','archived'].includes(source.lifecycle)) others.push(source);
  const held = others.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const purchased = value('poolQuantity') ? Number(value('poolQuantity')) : null;
  const quantity = value('quantity') ? Number(value('quantity')) : null;
  const unit = value('metric') === 'other' ? value('customUnit') || 'custom units' : value('metric').replaceAll('_', ' ');
  const archived = licence(form.dataset.id)?.lifecycle === 'archived';
  const retiring = value('licenceStatus') === 'retired';
  const valid = Number.isSafeInteger(purchased) && purchased > 0 && Number.isSafeInteger(quantity) && quantity > 0 && others.every(item => Number.isSafeInteger(item.quantity) && item.quantity > 0);
  const available = valid ? purchased - held : null;
  const remaining = valid ? available - (archived ? 0 : quantity) : null;
  const mismatch = pool && pool.metric !== value('metric');
  summary.dataset.tone = !valid || mismatch || remaining < 0 ? 'warning' : 'neutral';
  const number = value => value === null ? '—' : value;
  summary.innerHTML = `<strong>Shared purchase capacity · ${e(unit)}</strong><div class="capacity-counts"><span>Purchased<strong>${number(purchased)}</strong></span><span>Held by other entries<strong>${held}</strong></span><span>Available for this entry<strong>${number(available)}</strong></span><span>${retiring && !archived ? 'Remaining if saved as draft' : 'Remaining after this entry'}<strong>${number(remaining)}</strong></span></div><p>${!valid ? 'Enter positive whole-number quantities to calculate the remaining capacity.' : mismatch ? 'Use the same unit as this shared purchase before saving.' : remaining < 0 ? `This ${retiring ? 'draft reservation' : 'entry'} exceeds the purchase by ${Math.abs(remaining)} ${e(unit)}. Reduce its quantity or review the recorded purchase.` : archived ? 'Archived entries do not hold current purchase capacity.' : retiring ? 'Saving a draft holds these units. Save licence with Retired status to release this entry from the purchase.' : 'Spare and reserved entries also hold purchased units. The purchased total does not increase when you add an entry.'}</p>`;
}
function syncPoolEditor(changed=false){
  const select=modal.querySelector('[name="poolId"]');if(!select)return;
  for(const name of ['poolName','poolQuantity']){const input=modal.querySelector(`[name="${name}"]`);if(input)input.closest('.field').hidden=!select.value;}
  if(changed){const pool=db.pools.find(p=>p.id===select.value);if(pool){modal.querySelector('[name="poolName"]').value=pool.name;modal.querySelector('[name="poolQuantity"]').value=pool.quantity;modal.querySelector('[name="metric"]').value=pool.metric;}}
  const metric=modal.querySelector('[name="metric"]');const custom=modal.querySelector('[name="customUnit"]');if(custom)custom.closest('.field').hidden=metric.value!=='other';
  updatePoolCapacity();
}
function licenceEditor(id, sourceId) {
  requirePermission('write'); maskSecrets();
  const source=sourceId?licence(sourceId):null;
  const defaults={title:'',vendor:'',product:'',edition:'',reference:'',softwareVersion:'',category:'Application',licenceType:'subscription',licenceModel:'unknown',metric:'instance',quantity:1,owner:user.name,lifecycle:'draft',licenceStatus:'active',activation:'not_applied',duration:'',paymentModel:'Unknown',project:'',legalOwner:'',procuredBy:'',rights:'',transferable:'unknown',transferConditions:'',holding:'allocated',subsetLabel:'',poolId:'',customUnit:'',portalUrl:'',sumPeriod:'',sumReference:'',licenceStart:{state:'unknown'},purchaseDate:{state:'unknown'},supportStart:{state:'unknown'},licenceEnd:{state:'unknown'},supportEnd:{state:'unknown'},renewalDate:{state:'unknown'},sumRenewal:{state:'unknown'},renewalNotice:{state:'unknown'},notes:''};
  const l=id?{...defaults,...licence(id)}:source?{...defaults,...structuredClone(source),title:`${source.title} · new system`,quantity:1,holding:'allocated',subsetLabel:'',activation:'not_applied'}:defaults;
  const pool=db.pools.find(p=>p.id===l.poolId);
  const section=(title,body,open=false)=>`<details class="editor-section" ${open?'open':''}><summary>${title}</summary><div class="form-grid">${body}</div></details>`;
  const poolOptions=[['','Standalone entitlement'],...db.pools.map(p=>[p.id,p.name]),['new','Create shared entitlement']];
  const basic=`${field('Software name','title',l.title,{required:true,full:true})}${field('Software version','softwareVersion',l.softwareVersion)}${field('Edition','edition',l.edition)}${field('Vendor','vendor',l.vendor,{required:true})}${field('Product family','product',l.product,{required:true})}${selectField('Specific category','category',CATEGORIES,l.category)}${field('Entitlement / purchase reference','reference',l.reference)}`;
  const licensing=`${selectField('Licence type / duration basis','licenceType',LICENCE_TYPES.map(t=>[t,typeName(t)]),l.licenceType)}${selectField('Licence model / deployment method','licenceModel',LICENCE_MODELS.map(t=>[t,modelName(t)]),l.licenceModel)}${field('Duration / term','duration',l.duration,{placeholder:'e.g. 12 months or perpetual rights'})}${selectField('Payment model','paymentModel',['Once-off','Monthly','Annual','Multi-year','Consumption','Free','Once-off + annual SUMS','Other','Unknown'],l.paymentModel)}${selectField('Quantity unit of measure','metric',METRICS,l.metric)}${field('Entry quantity (users, cores, instances…)','quantity',l.quantity??'',{type:'number'})}<div id="pool-capacity" class="pool-capacity full-span" role="status" aria-live="polite" aria-atomic="true" hidden></div>${field('Custom unit label (if Other)','customUnit',l.customUnit)}${selectField('Licence status','licenceStatus',[['active','Active'],['retired','Retired'],['expired','Expired'],['evaluation','Evaluation']],l.licenceStatus)}${selectField('Activation status','activation',[['activated','Yes · activated'],['not_applied','No · not applied yet'],['not_applicable','Not applicable'],['unknown','Unknown']],l.activation)}${selectField('Holding / allocation','holding',[['allocated','Allocated / in use'],['spare','Spare stock'],['reserved','Reserved']],l.holding)}${selectField('Shared purchased entitlement','poolId',poolOptions,source&&!source.poolId?'new':l.poolId,true)}${field('Shared entitlement name','poolName',pool?.name||(source?`${source.product} · shared purchase`:''),{full:true})}${field('Purchased pool quantity','poolQuantity',pool?.quantity??source?.quantity??'',{type:'number'})}${field('Subset / allocation label','subsetLabel',l.subsetLabel)}<div class="full-span hint">Shared entries use the same purchased pool and unit. Entry quantities, including explicit spare/reserved subsets, must fit the purchased total. Each system keeps its own record, ownership and dates.</div>`;
  const ownership=`${field('Project / allocation owner','project',l.project)}${field('Legal licence owner','legalOwner',l.legalOwner)}${field('Procured by','procuredBy',l.procuredBy)}${selectField('Licence custodian','owner',USERS.map(u=>u.name),l.owner)}<div class="field full-span"><label for="f-rights">Usage rights / permitted users</label><textarea id="f-rights" name="rights" maxlength="3000">${e(l.rights)}</textarea></div>${selectField('Transferable / reassignable','transferable',[['yes','Yes'],['no','No'],['conditional','Conditional'],['unknown','Unknown']],l.transferable)}${field('Transfer conditions','transferConditions',l.transferConditions,{full:true})}${field('Vendor portal link','portalUrl',l.portalUrl,{full:true,placeholder:'https://… (no credentials or keys)'})}`;
  const dates=`${dateField('Purchase date','purchaseDate',l.purchaseDate)}${dateField('Licence start','licenceStart',l.licenceStart)}${dateField('Licence end','licenceEnd',l.licenceEnd)}${dateField('Licence renewal date','renewalDate',l.renewalDate)}${dateField('Renewal notice / action date','renewalNotice',l.renewalNotice)}`;
  const sum=`${field('SUM/SUMS period','sumPeriod',l.sumPeriod,{full:true,placeholder:'Support, updates & maintenance · e.g. 12 months'})}${field('SUM/SUMS contract reference','sumReference',l.sumReference,{full:true})}${dateField('SUM coverage start','supportStart',l.supportStart)}${dateField('SUM coverage end','supportEnd',l.supportEnd)}${dateField('SUM renewal date (also for perpetual licences)','sumRenewal',l.sumRenewal)}`;
  const system=selectField('System / device for this entry','primarySystemId',[['','Not assigned / spare stock'],...db.systems.map(x=>[x.id,`${x.name} · ${x.location||x.hostname}`])],source?'':linkedSystems(db,l.id).find(x=>x.association.purpose!=='reference')?.id||'',true);
  const key=`<div class="field full-span"><label for="f-key">${id?'Optional replacement dummy key':'Optional dummy key'}</label><div class="input-action"><input id="f-key" data-secret-input name="key" type="password" placeholder="DEMO-NOT-VALID-…" autocomplete="new-password" spellcheck="false" maxlength="4096"><button type="button" class="icon-btn" data-action="toggle-input" aria-label="Show or hide key input" aria-pressed="false">${icon('eye')}</button><button type="button" class="btn small-btn" data-action="paste">Paste</button></div><small>Use a fictional value beginning DEMO-. Keys already held are never prefilled.</small></div>`;
  const body=`<form id="licence-form" autocomplete="off" class="modal-body" data-id="${id||''}" data-source="${sourceId||''}" data-revision="${id?l.revision:0}" novalidate><div class="notice">Fictional demo only. Changes reset on refresh.${source?' This creates a separate system entry. Review its quantity, owner and dates; the shared purchased total is not increased automatically.':''}</div>${section('Software',basic,true)}${section('Licence, quantity & allocation',licensing,Boolean(source))}${section('System & activation key',system+key)}${section('Ownership & usage rights',ownership)}${section('Purchase, duration & renewal dates',dates)}${section('Support, updates & maintenance (SUM/SUMS)',sum)}${section('General notes',`<div class="field full-span"><label for="f-notes">Notes</label><textarea id="f-notes" name="notes" maxlength="3000">${e(l.notes)}</textarea></div>`)}</form>`;
  const foot=`<div class="modal-foot">${btn('Cancel','close-modal','quiet','type="button"')}<button class="btn" type="submit" form="licence-form" name="saveMode" value="draft">Save draft</button><button class="btn primary" type="submit" form="licence-form" name="saveMode" value="active">Save licence</button></div>`;
  openModal(id?'Edit licence':source?'Add system entry':'Add licence',body,foot,'licence');
  syncPoolEditor();
}
function saveLicence(form,mode) {
  requirePermission('write');const data=Object.fromEntries(new FormData(form));const old=form.dataset.id?licence(form.dataset.id):null;const source=form.dataset.source?licence(form.dataset.source):null;
  if(old&&old.revision!==Number(form.dataset.revision)){formErrors(form,{title:'This record changed. Reopen it to review the current version.'});return;}
  const record={...(old||{}),quantity:data.quantity===''?null:Number(data.quantity)};
  for(const k of ['title','vendor','product','edition','reference','softwareVersion','category','owner','licenceType','licenceModel','metric','licenceStatus','activation','duration','paymentModel','project','legalOwner','procuredBy','rights','transferable','transferConditions','holding','subsetLabel','customUnit','portalUrl','sumPeriod','sumReference','notes'])record[k]=(data[k]||'').trim();
  record.lifecycle=old?.lifecycle==='archived'?'archived':mode==='draft'?'draft':record.licenceStatus==='retired'?'retired':'active';
  if(record.metric==='unrestricted')record.quantity=null;
  for(const k of [...Object.keys(DATE_FIELDS),'licenceStart','supportStart','purchaseDate'])record[k]=data[`${k}State`]==='known'?{state:'known',date:data[k]||''}:{state:data[`${k}State`]||'unknown'};
  const errors=validateLicence(record);
  if(data.key&&!data.key.startsWith('DEMO-'))errors.key='Only fictional keys beginning DEMO- are allowed.';
  if(source&&record.holding==='allocated'&&!data.primarySystemId)errors.primarySystemId='Choose the system for this separate entry.';
  if(data.primarySystemId&&record.holding!=='allocated')errors.primarySystemId='Spare/reserved entries cannot be assigned to a running system.';
  let pool=data.poolId==='new'?{id:uid('pool'),name:data.poolName.trim(),quantity:Number(data.poolQuantity),metric:record.metric}:data.poolId?{...db.pools.find(p=>p.id===data.poolId),name:data.poolName.trim(),quantity:Number(data.poolQuantity)}:null;
  record.poolId=pool?.id||'';
  if(pool){if(!pool.name)errors.poolName='Enter a shared entitlement name.';const poolState=source&&!source.poolId&&data.poolId==='new'?{...db,licences:db.licences.map(l=>l.id===source.id?{...l,poolId:pool.id}:l)}:db;const poolError=validatePoolEntry(poolState,record,pool,old?.id);if(poolError){const changedPurchase=data.poolId!=='new'&&db.pools.find(p=>p.id===data.poolId)?.quantity!==pool.quantity;errors[pool.metric!==record.metric?'metric':changedPurchase||!Number.isSafeInteger(pool.quantity)||pool.quantity<1?'poolQuantity':'quantity']=poolError;}}
  if(old&&data.primarySystemId===linkedSystems(db,old.id).find(x=>x.association.purpose!=='reference')?.id&&record.quantity!==null&&record.quantity<allocated(db,old.id))errors.quantity='Quantity cannot be below the existing system allocation.';
  if(Object.keys(errors).length){formErrors(form,errors);return;}
  if(pool){const idx=db.pools.findIndex(p=>p.id===pool.id);if(idx>=0)db.pools[idx]=pool;else db.pools.push(pool);if(source&&!source.poolId){source.poolId=pool.id;source.revision++;}}
  if(old){Object.assign(old,record);old.revision++;if(data.key){old.secretHistory=[...(old.secretHistory||[]),...old.secrets];old.secrets=[{id:uid('key'),label:'Licence key',kind:'text',value:data.key}];}}
  else{record.id=uid('lm');record.revision=1;record.secrets=data.key?[{id:uid('key'),label:'Licence key',kind:'text',value:data.key}]:source?structuredClone(source.secrets):[];record.documents=source?structuredClone(source.documents):[];record.predecessor=null;record.successor=null;db.licences.unshift(record);}
  const saved=old||record;
  const prior=db.associations.find(a=>a.licenceId===saved.id&&a.purpose!=='reference');
  if((data.primarySystemId||'')!==(prior?.systemId||'')){
    db.associations=db.associations.filter(a=>a.licenceId!==saved.id||a.purpose==='reference');
    if(data.primarySystemId)db.associations.push({id:prior?.id||uid('a'),licenceId:saved.id,systemId:data.primarySystemId,purpose:'activation_target',units:null});
  }
  changed(old?'Updated entitlement':source?'Added separate system entry':'Created entitlement',saved);closeModal(true);navigate(`licences/${saved.id}`);notify('Licence entry saved in this demo tab.');
}
function systemEditor(id) {
  requirePermission('write');const s=id?db.systems.find(x=>x.id===id):{name:'',hostname:'',serviceTag:'',location:'',type:'Virtual machine',environment:'Production',owner:user.name,notes:''};
  if(!s)throw new Error('System not found.');
  openModal(id?'Edit system':'Add system',`<form id="system-form" class="modal-body" data-id="${id||''}" novalidate><div class="form-grid">${field('System name','name',s.name,{required:true,full:true})}${field('Hostname','hostname',s.hostname,{required:true})}${selectField('System type','type',['Physical server','Virtual machine','Workstation','Appliance','Cluster','Service'],s.type)}${field('Service tag / serial','serviceTag',s.serviceTag,{placeholder:'Optional for VMs and services'})}${selectField('Environment','environment',['Production','Test','Development','Disaster recovery'],s.environment)}${field('Physical location','location',s.location||'',{full:true,placeholder:'Site, building, room or rack'})}${selectField('Owner','owner',USERS.map(u=>u.name),s.owner,true)}<div class="field full-span"><label for="f-notes">Notes</label><textarea id="f-notes" name="notes" maxlength="3000">${e(s.notes)}</textarea></div></div><p class="hint section-gap">Use fictional names and tags only. Adding a system does not discover or scan hardware.</p></form>`,`<div class="modal-foot">${btn('Cancel','close-modal','quiet')}<button class="btn primary" type="submit" form="system-form">Save system</button></div>`,'system');
}
function saveSystem(form) {
  requirePermission('write');const d=Object.fromEntries(new FormData(form));const errors={};
  if(!d.name.trim())errors.name='Enter a system name.';if(!d.hostname.trim())errors.hostname='Enter a hostname or service identifier.';
  const normal=v=>v.replace(/\s/g,'').toLowerCase();
  if(d.serviceTag&&db.systems.some(s=>s.id!==form.dataset.id&&normal(s.serviceTag)===normal(d.serviceTag)))errors.serviceTag='This tag is already associated with another system. Review that system first.';
  if(Object.keys(errors).length){formErrors(form,errors);return;}
  const s=form.dataset.id?db.systems.find(x=>x.id===form.dataset.id):{id:uid('sys')};
  Object.assign(s,{name:d.name.trim(),hostname:d.hostname.trim(),serviceTag:d.serviceTag.trim(),location:d.location.trim(),type:d.type,environment:d.environment,owner:d.owner,notes:d.notes});if(!form.dataset.id)db.systems.unshift(s);
  changed(form.dataset.id?'Updated system':'Created system',null,s.name);closeModal(true);navigate(`systems/${s.id}`);notify('System saved in this demo tab.');
}
function associationEditor(id) {
  requirePermission('write');const l=licence(id);if(!l)throw new Error('Licence not found.');
  openModal('Link a system',`<form id="association-form" class="modal-body" data-id="${l.id}" novalidate><div class="notice">Choose how the system relates to this licence. Only allocation links consume entitlement units.</div><div class="form-grid">${selectField('System','systemId',db.systems.map(s=>[s.id,`${s.name} · ${s.serviceTag||s.hostname}`]),db.systems[0]?.id,true)}${selectField('Relationship','purpose',[['reference','Related system'],['activation_target','Activates on'],['allocation','Allocated to']],'reference')}${field('Allocation units','units',1,{type:'number'})}</div><p class="hint section-gap">${l.quantity===null?'Capacity is unknown.':`${l.quantity-allocated(db,l.id)} ${e(l.metric)} units available.`} Vendor-specific licensing calculations are not inferred.</p></form>`,`<div class="modal-foot">${btn('Cancel','close-modal','quiet')}<button class="btn primary" form="association-form" type="submit">Link system</button></div>`,'association');
  modal.querySelector('[name="units"]').disabled=true;
}
function saveAssociation(form) {
  requirePermission('write');const l=licence(form.dataset.id);const d=Object.fromEntries(new FormData(form));const a={id:uid('a'),licenceId:l.id,systemId:d.systemId,purpose:d.purpose,units:d.purpose==='allocation'?Number(d.units):null};
  try{validateAssociation(db,l,a);}catch(error){formErrors(form,{systemId:error.message});return;}
  db.associations.push(a);l.revision++;changed('Linked system',l);closeModal(true);render();notify('System linked.');
}
function documentEditor(id,documentId) {
  requirePermission('write');const l=licence(id);const d=l.documents.find(x=>x.id===documentId);
  openModal(d?'Add evidence version':'Add entitlement evidence',`<form id="document-form" class="modal-body" data-id="${id}" data-document="${documentId||''}" data-revision="${l.revision}" novalidate><div class="notice">Fictional evidence only. Files remain in this tab's memory and are never uploaded to a server. The first version is pinned to this licence's purchase; later versions never replace that link automatically.</div><div class="form-grid">${field('Document title','title',d?.title||'Fictional licence terms',{full:true,required:true})}${selectField('Document type','kind',['EULA','Purchase order','Contract','Purchase evidence','Support terms','Entitlement certificate'],d?.kind||'EULA')}${field('Version label','version',d?`${d.versions.length+1}.0`:'1.0',{required:true})}${field('Document / effective date','date',DEMO_DATE,{type:'date'})}${field('Purchase reference','purchaseReference',d?.purchaseReference||l.reference)}${field('Source / legal document link (optional)','sourceUrl','',{full:true,placeholder:'https://example.com/fictional-terms'})}<div class="field full-span"><label for="f-evidence-file">Optional fictional file snapshot</label><input id="f-evidence-file" name="evidenceFile" type="file" accept=".pdf,.txt,application/pdf,text/plain"><small>PDF or plain text, up to 20 MiB. Do not select real legal or customer documents. Without a file, a fictional text snapshot is generated. Source links are not fetched or treated as immutable evidence.</small></div></div></form>`,`<div class="modal-foot">${btn('Cancel','close-modal','quiet')}<button class="btn primary" form="document-form" type="submit">Save evidence version</button></div>`,'document');
}
async function saveDocument(form) {
  requirePermission('write');const l=licence(form.dataset.id);const fd=new FormData(form),values=Object.fromEntries(fd);const errors={};
  if(!values.title.trim())errors.title='Enter a title.';if(!values.version.trim())errors.version='Enter a version label.';try{dayNumber(values.date);}catch{errors.date='Enter a valid calendar date.';}
  if(values.sourceUrl&&!safeUrl(values.sourceUrl))errors.sourceUrl='Use an HTTP/HTTPS link without embedded credentials.';
  let doc=l.documents.find(x=>x.id===form.dataset.document);if(doc&&doc.versions.some(v=>v.version===values.version))errors.version='This version label already exists.';
  const file=fd.get('evidenceFile');let bytes=null,type='text/plain',hash='',name=`Fictional document ${values.version}.txt`;
  if(file?.size){
    if(file.size>20*1024*1024)errors.evidenceFile='Maximum file size is 20 MiB.';
    else if(!/\.(pdf|txt)$/i.test(file.name))errors.evidenceFile='Only fictional PDF and plain-text files are allowed.';
    else{
      bytes=new Uint8Array(await file.arrayBuffer());const pdf=/\.pdf$/i.test(file.name);type=pdf?'application/pdf':'text/plain';
      if(pdf&&new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')errors.evidenceFile='The PDF signature is invalid.';
      if(!pdf&&bytes.includes(0))errors.evidenceFile='This file is not plain text.';
      if(!errors.evidenceFile){hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');name=file.name.replace(/[^a-zA-Z0-9._ -]/g,'_');}
    }
  }
  if(l.revision!==Number(form.dataset.revision))errors.version='This licence changed. Reopen evidence before saving.';
  if(Object.keys(errors).length){formErrors(form,errors);return;}
  requirePermission('write');if(!form.isConnected)return;
  if(!doc){doc={id:uid('doc'),title:values.title.trim(),kind:values.kind,versions:[],purchaseReference:values.purchaseReference.trim()};l.documents.push(doc);}
  const v={id:uid('version'),version:values.version.trim(),date:values.date,name,bytes,type,hash,sourceUrl:values.sourceUrl.trim(),body:bytes?type==='text/plain'?new TextDecoder().decode(bytes):'This PDF is kept as original bytes and offered as a download. Inline rendering is intentionally disabled.':`FICTIONAL DEMONSTRATION DOCUMENT\n${values.title}\nVersion ${values.version}\nDate ${values.date}\nNo licence rights are granted by this example. Purchase reference: ${values.purchaseReference}`};
  appendEvidenceVersion(doc,v);l.revision++;changed('Added immutable evidence version',l);closeModal(true);render();notify('Evidence version saved. The purchase association is preserved.');
}
function renewalEditor(id) {
  requirePermission('write');const l=licence(id);if(!l||l.successor||['archived','retired'].includes(l.lifecycle))throw new Error('This licence cannot be renewed from its current state.');
  const links=linkedSystems(db,id);const next='2027-11-15';
  openModal('Record a renewal',`<form id="renewal-form" class="modal-body" data-id="${id}" data-revision="${l.revision}" novalidate><div class="notice">Create a successor entitlement. The current record, dates, key and evidence remain available. The renewed purchase starts without a key or evidence. Its shared entitlement pool must be assigned explicitly.</div><div class="form-grid">${field('New entitlement reference','reference',`${l.reference}-RENEWED`,{full:true,required:true})}${field(l.licenceType==='perpetual'?'New support expiry':'New licence & support expiry','end',next,{type:'date',full:true})}${field('Renewal notice date','notice','2027-10-15',{type:'date',full:true})}</div>${links.length?`<section class="form-section"><h3>Transfer selected system links</h3><p class="hint">Selected links move to the new entitlement. Unselected links stay with the current record.</p><div class="check-box">${links.map(s=>`<label class="check-label"><input type="checkbox" name="transfer" value="${s.association.id}"><span>${e(s.name)}<br><small class="muted">${e(purpose(s.association.purpose))}${s.association.units?` · ${s.association.units} ${e(l.metric)}`:''}</small></span></label>`).join('')}</div></section>`:''}</form>`,`<div class="modal-foot">${btn('Cancel','close-modal','quiet')}<button class="btn primary" type="submit" form="renewal-form">Create renewed entitlement</button></div>`,'renewal');
}
function saveRenewal(form) {
  requirePermission('write');const old=licence(form.dataset.id);const fd=new FormData(form);const d=Object.fromEntries(fd);const errors={};
  if(old.successor||old.revision!==Number(form.dataset.revision))errors.reference='This licence changed. Reopen the renewal to review it.';
  if(!d.reference.trim())errors.reference='Enter the new entitlement reference.';
  try{if(dayNumber(d.end)<=dayNumber(DEMO_DATE))throw Error();}catch{errors.end='Choose a future expiry date.';}
  try{if(dayNumber(d.notice)>dayNumber(d.end))throw Error();}catch{errors.notice='Choose a notice date on or before expiry.';}
  if(Object.keys(errors).length){formErrors(form,errors);return;}
  const transfers=fd.getAll('transfer');const id=uid('lm');
  const next={...structuredClone(old),id,revision:1,reference:d.reference.trim(),lifecycle:'active',title:`${old.title} · renewed`,licenceType:old.licenceType==='unknown'?'subscription':old.licenceType,licenceEnd:old.licenceType==='perpetual'?{state:'not_applicable'}:{state:'known',date:d.end},supportEnd:{state:'known',date:d.end},renewalNotice:{state:'known',date:d.notice},secrets:[],documents:[],poolId:'',licenceStatus:'active',purchaseDate:{state:'known',date:DEMO_DATE},licenceStart:{state:'known',date:DEMO_DATE},supportStart:{state:'known',date:DEMO_DATE},sumRenewal:{state:'known',date:d.end},renewalDate:old.licenceType==='perpetual'?{state:'not_applicable'}:{state:'known',date:d.end},predecessor:old.id,successor:null};
  const validation=validateLicence(next);if(Object.keys(validation).length){formErrors(form,{reference:'Confirm the original entitlement type, metric and quantity before renewing.'});return;}
  old.successor=id;old.revision++;db.licences.unshift(next);
  for(const a of db.associations)if(a.licenceId===old.id&&transfers.includes(a.id))a.licenceId=id;
  changed('Recorded renewal successor',old);log('Created renewed entitlement',next);closeModal(true);navigate(`licences/${id}`);notify('Renewal recorded. Add the new key when available.');
}
function accountDialog() {
  maskSecrets();openModal('Demo account',`<div class="modal-body"><p class="hint">Choose a role to preview its interface. These are fictional users, not real authentication. Your in-memory demo records remain in this tab.</p>${USERS.map(u=>`<button class="profile-choice ${user?.id===u.id?'selected':''}" data-action="switch-user" data-user="${u.id}">${avatar(u)}<span><strong>${e(u.name)}</strong><small>${e(u.title)} · ${u.role}</small></span><span class="spacer"></span>${user?.id===u.id?icon('check'):icon('chevron')}</button>`).join('')}${installPrompt?btn(`${icon('download')}Install app`,'install','wide'):''}${waitingWorker?btn(`${icon('refresh')}Apply app update`,'update','wide'):''}</div>`,`<div class="modal-foot">${btn(`${icon('logout')}Sign out`,'logout','quiet')}${btn('Done','close-modal')}</div>`,'account');
}
async function retrieveKey(id,sid,copy=false) {
  requirePermission('secret');const l=licence(id);const s=l?.secrets.find(x=>x.id===sid)||l?.secrets[0];if(!s)throw new Error('No key is recorded.');
  if(copy||!shown.has(s.id))log(copy?'Retrieved key for copy':'Revealed key',l);
  if(copy&&s.kind==='file'){download(s.value,'Fictional-activation-file.txt','text/plain');notify('Fictional activation file downloaded.');return;}
  if(copy){
    // The Clipboard API is invoked in the user event, before asynchronous waits.
    try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(s.value);log('Browser confirmed copy',l);notify('Key copied.');}
    catch{
      shown.add(s.id);render();revealTimer=setTimeout(maskSecrets,30000);
      const input=document.querySelector(`[data-secret-value="${s.id}"]`);if(input){input.focus();input.select();notify('Copy was blocked. Select the revealed dummy key and use your device’s Copy action.');}else{navigate(`licences/${l.id}`);notify('Copy was blocked. Open Show to select and copy the dummy key manually.');}
    }
    return;
  }
  if(shown.has(s.id)){shown.delete(s.id);}else{shown.add(s.id);}
  clearTimeout(revealTimer);revealTimer=setTimeout(maskSecrets,30000);render();
  document.querySelector(`[data-action="reveal"][data-secret="${s.id}"]`)?.focus();
}
function download(text,name,type='text/plain') { const link=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type}));link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
function signOut(){maskSecrets();closeModal(true);user=null;clearTimeout(idleTimer);query='';render();}

async function action(name,el) {
  const id=el.dataset.id;
  if(name==='accept-confirmation'){finishConfirmation(true);return;}
  if(name==='cancel-confirmation'){finishConfirmation();return;}
  if(name==='login'){user=USERS.find(u=>u.id===document.querySelector('#demo-user').value)||USERS[0];if(!location.hash)location.hash='overview';render();resetIdle();return;}
  if(name==='toggle-nav'){document.querySelector('.sidebar')?.classList.toggle('open');document.querySelector('.mobile-nav-overlay')?.classList.toggle('open');el.setAttribute('aria-expanded',document.querySelector('.sidebar')?.classList.contains('open')?'true':'false');return;}
  if(name==='close-nav'){document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.mobile-nav-overlay')?.classList.remove('open');document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded','false');document.querySelector('.mobile-toggle')?.focus();return;}
  if(name==='close-modal'){closeModal();return;}
  if(name==='account'){accountDialog();return;}
  if(name==='switch-user'){user=USERS.find(u=>u.id===el.dataset.user)||USERS[0];maskSecrets();closeModal(true);render();resetIdle();notify(`Now previewing ${user.name} · ${user.role}.`);return;}
  if(name==='logout'){signOut();notify('Signed out of the demo.');return;}
  if(name==='reconnect'){render();if(!navigator.onLine)notify('Your device is still offline. Reconnect and try again.');return;}
  if(name==='reset'){openModal('Reset this demo?',`<div class="modal-body"><p class="hint">This restores the fictional sample records and clears changes and activity made in this tab.</p></div>`,`<div class="modal-foot">${btn('Keep changes','close-modal')}${btn('Reset demo','confirm-reset','primary')}</div>`);return;}
  if(name==='confirm-reset'){clearTimeout(searchTimer);db=createFixtures();mutationCount=0;query='';filter='all';sort='name';renewalFilter='all';shown.clear();closeModal(true);navigate('overview');render();notify('Demo reset to fictional sample data.');return;}
  if(name==='clear-search'){clearTimeout(searchTimer);query='';filter='all';render();return;}
  if(name==='filter'||name==='stat'){filter=el.dataset.filter;if(name==='stat'){clearTimeout(searchTimer);query='';}navigate('licences');render();return;}
  if(name==='renewal-filter'){renewalFilter=el.dataset.filter;render();return;}
  if(name==='quick-copy'||name==='copy'){await retrieveKey(id,el.dataset.secret,true);return;}
  if(name==='reveal'){await retrieveKey(id,el.dataset.secret);return;}
  if(name==='add-licence'){licenceEditor();return;}
  if(name==='edit-licence'){licenceEditor(id);return;}
  if(name==='add-entry'){licenceEditor(null,id);return;}
  if(name==='add-system'||name==='edit-system'){systemEditor(el.dataset.system);return;}
  if(name==='link-system'){associationEditor(id);return;}
  if(name==='unlink'){requirePermission('write');const l=licence(id);const a=db.associations.find(a=>a.id===el.dataset.association);openModal('Unlink this system?',`<div class="modal-body"><p class="hint">This removes the relationship from ${e(l.title)}. The system record and entitlement remain available.</p></div>`,`<div class="modal-foot">${btn('Cancel','close-modal')}${btn('Unlink system','confirm-unlink','primary',`data-id="${id}" data-association="${e(a.id)}"`)}</div>`);return;}
  if(name==='confirm-unlink'){requirePermission('write');const l=licence(id);db.associations=db.associations.filter(a=>a.id!==el.dataset.association);l.revision++;changed('Unlinked system',l);closeModal(true);render();notify('System unlinked.');return;}
  if(name==='add-document'||name==='document-version'){documentEditor(id,el.dataset.document);return;}
  if(name==='pin-document'){requirePermission('write');openModal('Correct purchase-version association?',`<div class="modal-body"><p class="hint">Only correct this link if the selected version is the actual evidence for this purchase. All versions remain available; this action is recorded in History.</p></div>`,`<div class="modal-foot">${btn('Cancel','close-modal')}${btn('Confirm purchase version','confirm-pin','primary',`data-id="${id}" data-document="${el.dataset.document}" data-version="${el.dataset.version}"`)}</div>`);return;}
  if(name==='confirm-pin'){requirePermission('write');const l=licence(id),d=l.documents.find(d=>d.id===el.dataset.document);if(!d?.versions.some(v=>v.id===el.dataset.version))throw Error('Evidence version not found.');pinPurchaseVersion(d,el.dataset.version);l.revision++;changed('Corrected purchase evidence association',l);closeModal(true);render();notify('Purchase version association corrected.');return;}
  if(name==='view-document'||name==='download-document'){
    requirePermission('read');const l=licence(id);const doc=l.documents.find(d=>d.id===el.dataset.document);const v=doc?.versions.find(v=>v.id===el.dataset.version);if(!v)throw new Error('Document not found.');log('Viewed document version',l);
    if(name==='download-document'){download(v.bytes||v.body,v.name,v.type||'text/plain');notify('Evidence snapshot downloaded.');}else openModal(doc.title,`<div class="modal-body"><p class="small muted">Version ${e(v.version)} · ${formatDate(v.date)} · fictional example</p><pre class="doc-preview">${e(v.body)}</pre></div>`,`<div class="modal-foot">${btn('Close','close-modal')}${btn('Acknowledge viewed','ack-document','primary',`data-id="${id}" data-version="${v.id}"`)}</div>`);return;
  }
  if(name==='ack-document'){requirePermission('read');changed('Acknowledged document viewed',licence(id));closeModal(true);notify('View acknowledged. This does not accept vendor legal terms.');return;}
  if(name==='renew'){renewalEditor(id);return;}
  if(name==='archive'){
    requirePermission('write');const l=licence(id);
    if(l.lifecycle==='archived'){l.lifecycle='draft';l.revision++;changed('Restored licence as draft',l);render();notify('Licence restored as draft.');return;}
    if(db.associations.some(a=>a.licenceId===id&&a.purpose==='allocation')){notify('Unlink or transfer allocated systems before archiving this licence.');return;}
    openModal('Archive licence?',`<div class="modal-body"><p class="hint">${e(l.title)} and its history remain available in the Archived filter. It will stop creating renewal actions.</p></div>`,`<div class="modal-foot">${btn('Cancel','close-modal')}${btn('Archive licence','confirm-archive','primary',`data-id="${id}"`)}</div>`);return;
  }
  if(name==='confirm-archive'){requirePermission('write');const l=licence(id);l.lifecycle='archived';l.revision++;changed('Archived licence',l);closeModal(true);render();notify('Licence archived.');return;}
  if(name==='due-progress'){requirePermission('write');const event=dueEvents(db,DEMO_DATE,true).find(d=>d.id===el.dataset.event);if(!event)throw new Error('This date action changed. Refresh the view.');db.actions[event.id]={...db.actions[event.id],status:event.status==='In progress'?'Open':'In progress'};changed('Updated renewal action',event.licence);render();notify('Renewal action updated.');return;}
  if(name==='due-snooze'){
    requirePermission('write');const event=dueEvents(db,DEMO_DATE,true).find(d=>d.id===el.dataset.event);if(!event)throw new Error('This date action changed.');
    if(event.snoozeUntil&&dayNumber(event.snoozeUntil)>dayNumber(DEMO_DATE)){delete db.actions[event.id].snoozeUntil;changed('Unsnoozed renewal action',event.licence);render();notify('Renewal action reopened.');return;}
    openModal('Snooze renewal action',`<form id="snooze-form" class="modal-body" data-event="${event.id}" novalidate><div class="notice">Snoozing changes the attention list, not licence validity.</div><div class="form-grid">${field('Remind me on','until','2026-10-23',{type:'date',full:true})}${field('Reason','reason','Waiting for renewal confirmation',{full:true,required:true})}</div></form>`,`<div class="modal-foot">${btn('Cancel','close-modal')}<button class="btn primary" type="submit" form="snooze-form">Snooze action</button></div>`);return;
  }
  if(name==='export'){requirePermission('export');download(metadataCsv(db),'LicenceManager-demo-metadata.csv','text/csv;charset=utf-8');log('Exported metadata');notify('Metadata exported. Keys and document contents are excluded.');return;}
  if(name==='toggle-input'){const input=modal.querySelector('[data-secret-input]');input.type=input.type==='password'?'text':'password';el.setAttribute('aria-pressed',String(input.type==='text'));el.innerHTML=icon(input.type==='text'?'eyeOff':'eye');return;}
  if(name==='paste'){const input=modal.querySelector('[data-secret-input]');try{if(!navigator.clipboard?.readText)throw Error();input.value=await navigator.clipboard.readText();modalDirty=true;input.focus();notify('Pasted into the fictional key field.');}catch{input.focus();notify('Paste using Ctrl+V, Command+V or your device’s Paste action.');}return;}
  if(name==='install'&&installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;closeModal(true);return;}
  if(name==='update'&&waitingWorker){if(mutationCount||modalDirty)requestConfirmation('Apply app update?', 'Applying the update reloads this tab and resets your fictional demo changes. Keep working to review them first.', 'Update and reset demo', applyAppUpdate, 'Keep working');else applyAppUpdate();return;}
}

document.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button||button.disabled)return;event.preventDefault();resetIdle();Promise.resolve(action(button.dataset.action,button)).catch(error=>notify(error.message||'This action could not be completed.'));});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement))return;event.preventDefault();
  try{
    if(form.id==='global-search'){clearTimeout(searchTimer);query=new FormData(form).get('query').trim();if(!['systems','renewals','activity'].includes(route()[0]))navigate('licences');else render();return;}
    if(form.id==='licence-form')saveLicence(form,event.submitter?.value||'draft');
    if(form.id==='system-form')saveSystem(form);
    if(form.id==='association-form')saveAssociation(form);
    if(form.id==='document-form'){const button=event.submitter;if(button){button.disabled=true;button.textContent='Saving…';}try{await saveDocument(form);}finally{if(button?.isConnected){button.disabled=false;button.textContent='Save evidence version';}}}
    if(form.id==='renewal-form')saveRenewal(form);
    if(form.id==='snooze-form'){
      requirePermission('write');const data=Object.fromEntries(new FormData(form));const errors={};try{if(dayNumber(data.until)<=dayNumber(DEMO_DATE))throw Error();}catch{errors.until='Choose a date after the sample date.';}if(!data.reason.trim())errors.reason='Enter a reason.';if(Object.keys(errors).length){formErrors(form,errors);return;}
      const ev=dueEvents(db,DEMO_DATE,true).find(x=>x.id===form.dataset.event);if(!ev)throw Error('This date action changed.');db.actions[ev.id]={...db.actions[ev.id],snoozeUntil:data.until,reason:data.reason.trim()};changed('Snoozed renewal action',ev.licence);closeModal(true);render();notify('Renewal action snoozed.');
    }
  }catch(error){formErrors(form,{form:error.message});}
});
let searchTimer;
document.addEventListener('input',event=>{
  if(event.target.closest('#modal'))modalDirty=true;
  if(['quantity','poolQuantity','customUnit'].includes(event.target.name))updatePoolCapacity();
  if(event.target.id==='search'){
    clearTimeout(searchTimer);const value=event.target.value;const pos=event.target.selectionStart;
    searchTimer=setTimeout(()=>{query=value;const p=route()[0];if(!['licences','systems','renewals','activity'].includes(p)||route()[1]){history.pushState(null,'','#licences');previousHash=location.hash;maskSecrets();}render();requestAnimationFrame(()=>{const input=document.querySelector('#search');if(input){input.focus();try{input.setSelectionRange(pos,pos);}catch{}}});},160);
  }
});
document.addEventListener('change',event=>{
  const input=event.target;if(['poolId','metric','holding','licenceStatus'].includes(input.name))syncPoolEditor(input.name==='poolId');if(input.id==='licence-sort'){sort=input.value;render();}
  if(input.dataset.dateState){const date=modal.querySelector(`[name="${input.dataset.dateState}"]`);date.disabled=input.value!=='known';if(date.disabled)date.value='';}
  if(input.name==='licenceType'&&modal.querySelector('#licence-form')){const select=modal.querySelector('[name="licenceEndState"]');if(input.value==='perpetual'){select.value='not_applicable';}else if(select.value==='not_applicable')select.value='unknown';select.dispatchEvent(new Event('change',{bubbles:true}));}
  if(input.name==='purpose'&&modal.querySelector('#association-form')){const units=modal.querySelector('[name="units"]');units.disabled=input.value!=='allocation';}
});
modal.addEventListener('cancel',event=>{event.preventDefault();closeModal();});
modal.addEventListener('close',()=>{if(!modal.open){modal.querySelectorAll('[data-secret-input]').forEach(n=>n.value='');modalDirty=false;}});
confirmation?.addEventListener('cancel',event=>{event.preventDefault();finishConfirmation();});
document.addEventListener('keydown',event=>{
  resetIdle();if(event.key==='/'&&!modal.open&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)&&user){event.preventDefault();document.querySelector('#search')?.focus();}
  if(event.key==='Escape'&&!modal.open&&!confirmation?.open){action('close-nav',document.createElement('button'));maskSecrets();}
});
document.addEventListener('pointerdown',resetIdle,{passive:true});
let previousHash=location.hash;
window.addEventListener('hashchange',()=>{
  clearTimeout(searchTimer);
  if(modal.open&&modalDirty){const destination=location.hash;history.pushState(null,'',previousHash||'#overview');requestConfirmation('Leave without saving?', 'Keep editing to preserve your changes, or discard them and leave this form.', 'Discard and leave', ()=>{closeModal(true);navigate(destination.slice(1));});return;}
  if(modal.open)closeModal(true);maskSecrets();previousHash=location.hash;render();window.scrollTo(0,0);
});
window.addEventListener('blur',maskSecrets);
document.addEventListener('visibilitychange',()=>{if(document.hidden)maskSecrets();});
window.addEventListener('offline',()=>{
  finishConfirmation();maskSecrets();modal.querySelectorAll('[data-secret-input]').forEach(input=>input.value='');
  if(modal.open&&modal.querySelector('form')){
    let notice=modal.querySelector('[data-offline-editor]');if(!notice){notice=document.createElement('div');notice.className='notice';notice.dataset.offlineEditor='';notice.setAttribute('role','status');modal.querySelector('form').prepend(notice);}
    notice.textContent='Server unavailable. Your unsaved metadata is retained in this tab. Reconnect before saving. The unsaved dummy key was cleared; enter it again after reconnecting.';
  }else closeModal(true);
  render();notify('Server unavailable. Unsaved metadata is retained; reconnect to continue.');
});
window.addEventListener('online',()=>{modal.querySelector('[data-offline-editor]')?.remove();render();notify('Connection restored. You can review and save your retained changes.');});
window.addEventListener('beforeunload',event=>{if(mutationCount||modalDirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;notify('App installed.');});

render();
if('serviceWorker'in navigator&&location.protocol!=='file:'){
  navigator.serviceWorker.register('./sw.js').then(registration=>{
    if(registration.waiting)waitingWorker=registration.waiting;
    registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=worker;notify('App update ready. Open your account menu to apply it when finished.');}});});
  }).catch(()=>{/* Browser access still works when installation is unavailable. */});
}

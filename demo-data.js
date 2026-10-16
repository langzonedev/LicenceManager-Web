// Public, fictional fixtures only. No vendor licensing rules or valid keys.
export const DEMO_DATE = '2026-10-16';
export const USERS = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', role: 'Custodian', title: 'Licence administrator' },
  { id: 'sam', name: 'Sam Taylor', initials: 'ST', role: 'Operator', title: 'ICT operator' },
  { id: 'jordan', name: 'Jordan Lee', initials: 'JL', role: 'Viewer', title: 'Read-only reviewer' },
];
const date = value => value ? { state: 'known', date: value } : { state: 'not_applicable' };
const unknown = () => ({ state: 'unknown' });
const secret = (id, label = 'Licence key', kind = 'text') => ({ id, label, kind, value: kind === 'file' ? `FICTIONAL ACTIVATION FILE\nDEMO-NOT-VALID-${id}\nThis file cannot activate software.\n` : `DEMO-NOT-VALID-${id.toUpperCase()}` });
const docs = id => [{ id: `${id}-terms`, title: 'Software licence terms', kind: 'EULA', versions: [
  { id: `${id}-v1`, version: '1.0', date: '2025-10-01', name: 'Fictional terms v1.0.txt', body: 'FICTIONAL DEMONSTRATION DOCUMENT\nVersion 1.0\nNo licence rights are granted. This is a locally authored sample, not vendor terms.' },
  { id: `${id}-v2`, version: '2.0', date: '2026-10-01', name: 'Fictional terms v2.0.txt', body: 'FICTIONAL DEMONSTRATION DOCUMENT\nVersion 2.0\nNo licence rights are granted. Use this example to explore document history. Do not upload real EULAs to the public demo.' },
] }];
const base = (id, title, vendor, product, type, metric, quantity, end, support, notice, extras = {}) => ({
  id, revision: 1, title, vendor, product, edition: '', reference: `DEMO-ORDER-${id.slice(-3)}`, licenceType: type,
  lifecycle: 'active', metric, quantity, owner: 'Alex Morgan', licenceEnd: date(end), supportEnd: date(support), renewalNotice: date(notice),
  notes: 'Fictional example. No real licensing rights or vendor rules are represented.', secrets: [secret(id)], documents: docs(id), predecessor: null, successor: null, ...extras,
});
export function createFixtures() {
  return {
    licences: [
      base('lm-001', 'vCenter Server', 'Example Infrastructure', 'vCenter', 'subscription', 'instance', 1, '2026-11-15', '2026-11-15', '2026-10-31', { edition: 'Management · Production' }),
      base('lm-002', 'Windows Server', 'Example Systems', 'Windows Server', 'perpetual', 'core', 32, null, '2027-06-30', '2027-05-31', { edition: 'Server edition' }),
      base('lm-003', 'Backup & Replication', 'Example Backup', 'Backup & Replication', 'perpetual', 'instance', 10, null, '2026-10-10', '2026-09-10', { edition: 'Enterprise' }),
      base('lm-004', 'Creative Suite', 'Example Creative', 'Creative Suite', 'subscription', 'seat', 20, '2027-02-28', '2027-02-28', '2027-01-31', { edition: 'Team plan', owner: 'Sam Taylor' }),
      base('lm-005', 'Database Server', 'Example Data', 'Database Server', 'perpetual', 'core', 16, null, '2026-12-15', '2026-11-15', { edition: 'Standard', secrets: [secret('lm-005-production', 'Production key'), secret('lm-005-recovery', 'Recovery key')] }),
      base('lm-006', 'Gateway Security', 'Example Networks', 'Gateway Security', 'subscription', 'device', 1, '2026-11-30', '2026-11-30', '2026-10-16', { edition: 'Offline activation', secrets: [secret('lm-006', 'Activation file', 'file')] }),
      base('lm-007', 'Network Monitor', 'Example Monitoring', 'Network Monitor', 'evaluation', 'instance', 1, '2026-10-15', null, null, { edition: 'Evaluation', owner: 'Sam Taylor' }),
      base('lm-008', 'Engineering Toolkit', 'Example Engineering', 'Engineering Toolkit', 'unknown', 'unknown', null, null, null, null, { lifecycle: 'draft', licenceEnd: unknown(), supportEnd: unknown(), renewalNotice: unknown(), secrets: [], edition: 'Details to confirm' }),
      base('lm-009', 'Legacy Backup', 'Example Backup', 'Legacy Backup', 'perpetual', 'instance', 1, null, '2025-09-30', null, { lifecycle: 'archived', secrets: [] }),
    ],
    systems: [
      { id: 'sys-001', name: 'Management server', hostname: 'demo-mgmt-01', type: 'Virtual machine', environment: 'Production', serviceTag: '', owner: 'Alex Morgan', notes: 'Central management VM. Related physical hosts are linked separately.' },
      { id: 'sys-002', name: 'Virtualisation host 01', hostname: 'demo-host-01', type: 'Physical server', environment: 'Production', serviceTag: 'DEMO-TAG-001', owner: 'Alex Morgan', notes: '' },
      { id: 'sys-003', name: 'Virtualisation host 02', hostname: 'demo-host-02', type: 'Physical server', environment: 'Production', serviceTag: 'DEMO-TAG-002', owner: 'Alex Morgan', notes: '' },
      { id: 'sys-004', name: 'Backup server', hostname: 'demo-backup-01', type: 'Virtual machine', environment: 'Production', serviceTag: '', owner: 'Alex Morgan', notes: '' },
      { id: 'sys-005', name: 'Design workstation', hostname: 'demo-design-01', type: 'Workstation', environment: 'Production', serviceTag: 'DEMO-TAG-005', owner: 'Sam Taylor', notes: '' },
      { id: 'sys-006', name: 'Database server', hostname: 'demo-db-01', type: 'Virtual machine', environment: 'Production', serviceTag: '', owner: 'Alex Morgan', notes: '' },
      { id: 'sys-007', name: 'Network gateway', hostname: 'demo-gateway-01', type: 'Appliance', environment: 'Production', serviceTag: 'DEMO-TAG-007', owner: 'Alex Morgan', notes: '' },
      { id: 'sys-008', name: 'Monitoring lab', hostname: 'demo-monitor-01', type: 'Virtual machine', environment: 'Test', serviceTag: '', owner: 'Sam Taylor', notes: '' },
    ],
    associations: [
      { id: 'a-1', licenceId: 'lm-001', systemId: 'sys-001', purpose: 'activation_target', units: null },
      { id: 'a-2', licenceId: 'lm-001', systemId: 'sys-002', purpose: 'reference', units: null },
      { id: 'a-3', licenceId: 'lm-001', systemId: 'sys-003', purpose: 'reference', units: null },
      { id: 'a-4', licenceId: 'lm-002', systemId: 'sys-002', purpose: 'allocation', units: 16 },
      { id: 'a-5', licenceId: 'lm-002', systemId: 'sys-003', purpose: 'allocation', units: 16 },
      { id: 'a-6', licenceId: 'lm-003', systemId: 'sys-004', purpose: 'allocation', units: 2 },
      { id: 'a-7', licenceId: 'lm-004', systemId: 'sys-005', purpose: 'allocation', units: 1 },
      { id: 'a-8', licenceId: 'lm-005', systemId: 'sys-006', purpose: 'allocation', units: 8 },
      { id: 'a-9', licenceId: 'lm-006', systemId: 'sys-007', purpose: 'allocation', units: 1 },
      { id: 'a-10', licenceId: 'lm-007', systemId: 'sys-008', purpose: 'activation_target', units: null },
    ],
    actions: {},
    activity: [
      { id: 'event-1', time: '2026-10-16T08:50:00+10:30', actor: 'Alex Morgan', action: 'Updated entitlement', entity: 'lm-001', label: 'vCenter Server' },
      { id: 'event-2', time: '2026-10-16T08:35:00+10:30', actor: 'Sam Taylor', action: 'Retrieved key for copy', entity: 'lm-004', label: 'Creative Suite' },
      { id: 'event-3', time: '2026-10-15T14:20:00+10:30', actor: 'Alex Morgan', action: 'Added document version', entity: 'lm-005', label: 'Database Server' },
    ],
  };
}

# Requirements and observable acceptance

Baseline v0.1. Every item below is planned. P = synthetic prototype; M = integrated MVP before real customer data.

| ID | Requirement | Acceptance scenario | Gate |
|---|---|---|---|
| LM-01 | Fast metadata search | Search by product, vendor, hostname, environment, entitlement reference or service tag; results identify the matched field and exclude keys | P/M |
| LM-02 | Low-friction entitlement entry | Product, title and licence type are sufficient to save a draft; explicit unknown values remain unknown; published/active records require a custodian, metric and quantity where applicable | P/M |
| LM-03 | Exact key retrieval | Copy works without first revealing; exact stored characters and line breaks reach the clipboard; success appears only after resolution; denial offers authorised manual selection | P/M |
| LM-04 | Controlled secrets | Lists/search/export contain no key plaintext; Viewer never receives it even through direct endpoint requests; permission loss invalidates further access | M |
| LM-05 | EULA and evidence history | Attach an allowed document, label its type/version, and retrieve the exact revision; replacing terms creates a new version and retains prior evidence | P/M |
| LM-06 | Correct date semantics | Perpetual licence with past support date shows “No licence expiry” and “Support expired”; unknown date shows “Unknown”, never “Healthy” | P/M |
| LM-07 | Renewal attention | Dashboard and Renewals list agree for 90/60/30/7-day thresholds, today, overdue and unknown dates using the installation timezone | P/M |
| LM-08 | System association | Find a licence through a physical host service tag or a VM hostname; service tag is optional and identifies a hardware system, not a software product | P/M |
| LM-09 | Allocation context | Distinguish activation target, covered system and reference-only link; units consume entitlement only for allocation links | P/M |
| LM-10 | Recoverable editing | Invalid input and server failure retain unsaved data in memory; stale edit produces a comparison/reload choice without overwriting the newer record | P/M |
| LM-11 | Attributable changes | Save, allocation, document, reveal, secret retrieval and denied access create non-secret audit events; record a retrieval separately from browser-confirmed copy | M |
| LM-12 | Browser and accessibility | Keyboard-only completion, visible focus, labelled controls, status text, 200% text zoom and 320px reflow; phone detail view preserves copy action | P/M |
| LM-13 | Clear offline boundary | Disconnect shows “Server unavailable”; no queued writes, key access or stale cached records; app shell remains available when installed | P/M |
| LM-14 | On-prem deployment | Two clients see the same committed record through a customer HTTPS endpoint; no mandatory external runtime dependency or outbound telemetry | M |
| LM-15 | Recovery | Restore database, attachments and required encryption keys into an isolated installation; verify document hashes and key retrieval; measure recovery time | M |
| LM-16 | Extensible data | A physical server, VM and service can each be linked; adding a future external identifier does not change entitlement identity | P/M |
| LM-17 | Safe exit | Metadata export excludes keys and document contents; imported/exported CSV neutralises spreadsheet formulas; backup is a separate protected admin operation | M |
| LM-18 | Date/history preservation | Renewal links a successor to the previous entitlement; allocations are transferred explicitly and prior dates/evidence remain inspectable | P/M |

## Required examples

Use clearly fictional vCenter subscription; perpetual licence with expired support; entitlement with unknown dates; offline activation file; seat pool with partial allocation; a system without a service tag; an expired evaluation; an archived entitlement. No fixture asserts current vendor licensing rules.

For the first prototype, file handling, permissions and audit are visibly simulated. For M, test the real API, storage and browser together. Prototype usability success cannot satisfy encryption, access, backup or audit gates.

## Non-functional targets to validate

Provisional sizing: 10 concurrent ICT users, 10,000 entitlements, 20,000 system references and 5 GB of documents. Proposed on-LAN targets: search p95 under one second and metadata save p95 under two seconds, excluding file transfer. Measure on recorded hardware/dataset before stating capacity. Default attachment limit proposal: 20 MiB per file. Browser target: current organisation-supported Edge/Chrome and Firefox; verify clipboard/install behaviour separately on Android Chrome and iOS Safari. PWA installation support varies; browser access remains required.

Target WCAG 2.2 AA interaction outcomes; no certification or accessibility conformance claim is made by this design.

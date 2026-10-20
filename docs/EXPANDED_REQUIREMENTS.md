# Licence records v0.2

16 October 2026. This extends the original P1 specification; these field meanings take precedence where the initial design was narrower. This remains a public fictional demo with tab-local memory, not a production licence vault.

**20 October portfolio update:** public name **Lang Systems Licence Register**, compact **Licence Register**. The original commission has stopped and development is parked pending a new request. The existing repository/Pages address and approved LM geometry remain; the monogram represents **Licence Management**. This portfolio demo offers no production, support, availability or security assurance. See [status and restart notes](PORTFOLIO_STATUS.md).

**Current portfolio palette, 20 October:** Lang Systems ink `#13072f`, secondary `#2c2352`, violet `#6c19ff`, dark `#250861`, cyan `#0ea5b7`, paper `#f1f4fa` and panel `#f8f9fd`. Verify contrast in the actual button, link and focus states.

**Historical direction, superseded:** the 16 October customer prototype used navy `#171345` and cyan `#00b8ec`, then neutral grey `#eaeaeb` and charcoal `#30323d` following the operator’s Daronmont reference-site request. Those colours were sampled from rendered https://daronmont.com.au/ as inspiration only. The portfolio presentation now follows the Lang Systems company palette; the historical request is not the current visual authority.

## Requirement coverage

| Requested information | Where it lives |
|---|---|
| Software name, version, vendor and category | Software section; version is distinct from edition/product family; categories include Operating System, Application, Development and Security |
| Licence type, duration and payment model | Licence section: subscription, perpetual, trial/evaluation, open source, freeware, other and unknown; separate duration/term and payment model |
| Deployment/access model | Separate node-locked, floating/concurrent, site, named-user, unrestricted, other and unknown field |
| Activation | Activated / not yet applied / not applicable / unknown, independent of whether a key is recorded |
| Quantity and unit | Seats, named users, concurrent users, devices, cores, sockets, instances, sites, processors, GPUs, custom units or unrestricted; never infer a seat count for unrestricted rights |
| Start, end, renewal and notice | Explicit licence start/end, renewal date and separate notice/action date |
| SUM/SUMS | Separate support/updates/maintenance period, contract reference, coverage start/end and renewal, including perpetual licences |
| Status | Recorded Active / Retired / Expired / Evaluation plus draft/archive lifecycle; expired dates are also calculated for attention |
| Project/allocation ownership | Project or allocation-owner field on each entry |
| System, service tag and physical location | One deployment system per entry; system record stores hostname, type, tag and physical location; extra reference links do not imply additional deployments |
| Legal owner, procured by, custodian | Separate fields; the custodian is the person managing the record, not assumed to be the legal owner or purchaser |
| Rights and transferability | Usage-rights text, transferable yes/no/conditional/unknown, and transfer conditions |
| Entitlement evidence | Licence-specific EULA, PO, contract, support terms and certificate versions, source links and optional fictional PDF/text snapshots |
| Spares and subsets | Allocated/spare/reserved holding, subset label, optional shared purchased entitlement and purchased quantity |
| Notes | Separate general-notes section |

The detail page puts additional contractual facts in **Licensing & ownership**. Add/edit uses collapsible sections. The main list shows concise paired **Licence** and **SUM** information rather than every field.

## Shared licence, separate system entries

Use **Add system entry** to create a separate entry based on an existing entitlement. Review its own system, quantity, project, legal owner/custodian and dates. Each entry is independently editable. Shared entries reference a purchased pool with a common unit and explicit purchased total; keys/evidence are copied only within the fictional in-memory demo.

Pool quantities count each current entry once, including explicit spare/reserved subsets. Unassigned capacity is purchased total minus all current entry quantities. Spare entries have no running system. Reducing spare stock before assigning those units elsewhere avoids double-counting. The form rejects totals above the recorded purchase and mismatched units. It never increases the purchased amount automatically just because another system is added.

Example fixtures: two Windows Server host entries share a 40-core purchase, hold 16 cores each, have different projects/custodians/SUM dates, and leave eight cores unassigned. A floating GPU example has ten purchased concurrent-user units: six allocated, two in a spare entry and two unassigned. These are fictional quantities, not vendor licensing rules.

A renewal is a new purchase record: it starts without a key/evidence and without inheriting the prior purchased pool. Assign the renewed entitlement's purchase/pool explicitly; do not silently double-count the old pool. The predecessor remains available for history.

## Purchase-specific EULAs and documents

Each licence owns its evidence versions and a **purchase-version association**. New versions append; they do not replace the version marked **At purchase**. Shared system entries start with independent copies of the same purchase snapshot, so later edits do not mutate another system's history. Correcting a mistaken purchase association is an explicit confirmed action recorded in Activity.

Source links are provenance only: a live URL can change and is not an immutable copy. Optional **fictional test-file** snapshots accept PDF/plain text up to 20 MiB, stay only in browser memory, retain original bytes plus a SHA-256 hash and are downloaded as files. PDFs are not rendered inline. Real legal/customer files still do not belong in the public demo. Refresh loses all such demo additions. Any future production candidate requires separately verified encrypted storage, scanning, retention and access controls; the public demo makes no claim about those controls.

SUM/SUMS terminology and the distinction between perpetual rights and support renewal follow the requested vendor-portal pattern. No vendor API, commercial rule calculation or portal synchronisation is implemented.

## Verification scope

Dashboard cards open the precise record set behind their count: current records exclude retired/archived entries; due soon uses the next attention date within 30 days; expired dates identifies expired rights/support; needs review includes drafts and incomplete entitlements. The selected list filter and description remain visible. Renewals counts individual date actions separately from distinct licences; the navigation badge counts licences with unsnoozed due actions.

Shared-entry forms show purchased quantity, holdings in other current entries, capacity available to this entry and remaining capacity as the quantity changes. Explicit spare/reserved subsets count once; editing excludes the current entry before adding its revised quantity. The purchased total never grows automatically. Draft reservations and retirement are explained at the point of editing.

Discard and in-app update confirmations use application dialogs with a safe initial focus. Keep editing and Escape preserve the underlying form; discard is explicit. Browser-controlled tab close/refresh prompts remain browser-managed to protect tab-local edits. Reset restores fixture data, search, sorting and renewal filters. No in-app tour or guide is added; field labels, visible state and contextual feedback explain the interactions.

Automated tests cover independent grouped entries, conserved purchased quantities, spare/unassigned counts, incompatible units, single deployment systems, purchase-pinned evidence despite later revisions, open-source unrestricted quantities, date separation, safe URLs, exports and all existing role/copy/cache tests. Actual browser and deployment evidence belongs in the private product handoff. Field presence is not a production security/compliance claim.

# Licence Manager demonstration guide

Open [the fictional workspace](https://langzonedev.github.io/LicenceManager-Web/), select Alex Morgan (Custodian), then **Open demo workspace**. No password is needed. Use synthetic examples only; changes and added files remain in this tab and disappear on refresh. The sample date is 16 October 2026.

## Suggested walkthrough

1. Find an entitlement using software, vendor, purchase reference, hostname or service tag. Matching rows explain the field that matched. Clear the search before changing tasks.
2. Open vCenter Server. Copy the dummy key without revealing it, or use Show/Hide. If the browser blocks copying, follow the manual selection message. Revealed keys mask after 30 seconds or when the window loses focus.
3. Compare the licence and SUM dates. Backup & Replication demonstrates perpetual rights with expired support; Engineering Toolkit demonstrates incomplete information.
4. Add a licence, enter fictional software/vendor/product details, and save a draft. Open the other sections when ready to record quantities, ownership and dates. Validation links take you to fields needing correction. Cancel asks before discarding changes.
5. Open Windows Server. Its shared purchase has 40 cores, 32 held and 8 unassigned. Use **Add system entry**, select a system, and enter up to 8 more cores. The purchased quantity is not automatically increased. Spare/reserved entries also consume the purchased pool once.
6. Use Systems to create a fictional VM without a service tag. Reference links describe related systems without consuming units. A second deployment requires its own licence entry.
7. In Documents, add a fictional evidence version. The original remains marked **At purchase**. View/download the version; acknowledging that it was viewed does not accept legal terms. A source URL is provenance, not a preserved copy. Optional fictional PDF/plain-text files up to 20 MiB stay in browser memory and disappear on refresh; use sample files only. PDFs download rather than opening inline.
8. Record a renewal. Review dates and explicitly choose which system links to transfer. The successor starts without keys, documents or a shared pool; its predecessor remains available.
9. Review Renewals, mark an action in progress, or snooze it with a date/reason. Snoozing changes the task list, not entitlement validity.
10. Switch accounts to preview Operator and Viewer. Operator can retrieve dummy keys; Viewer has metadata access only. These previews are not secure authentication. Custodian can export metadata; keys and document bytes are excluded.

Use **Reset demo** to restore the starting fixtures. This requires confirmation. Closing or refreshing the tab also loses changes. If an app update is offered, finish the demonstration before applying it: applying an update reloads the tab.

## Connectivity and support

The optional PWA caches the application shell, not a customer vault. Disconnecting blocks workspace operations. An open metadata editor retains its fields in memory; its unsaved dummy key is cleared. Reconnect, review the fields, re-enter a dummy key if needed, and save. Browser installation support varies.

For feedback, record the screen, selected demo account, steps, expected/actual result and browser/viewport. Include only synthetic screenshots. Send feedback to the person conducting your demonstration; this prototype does not submit support requests or telemetry.

This public demo is a workflow demonstration. It has no real shared storage, server authentication/permissions, encrypted customer records or production recovery. The separate on-premises product has its own engineering and release acceptance; this demo does not connect to it or establish its production readiness. The separate `LicenceManager` repository is the private engineering record; its similarly named GitHub Pages address is not an application entry point.

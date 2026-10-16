# Prototype plan

Current state: P1 fictional UI implemented on 16 October 2026. See [prototype release notes](PROTOTYPE_RELEASE.md) for actual source coverage, limits and verification. P2/P3 below remain planned.

## P1 — fictional browser/PWA prototype

Build a responsive UI with deterministic fictional records and a mock transport implementing the safe client contract. Prove search → detail → copy dummy key → system association → EULA revision → due-date review. Include Viewer, Operator and Custodian role previews clearly labelled as simulations, not authentication. Reset returns fixtures; simulated edits live in memory and reset on reload, which the banner explains.

Bundle assets locally, provide optional install metadata, and cache only versioned static shell resources. The demo rejects uploads and warns against real data entry. Dummy key examples are unmistakably invalid. A direct file open should show actionable “Start the local server” guidance if module routing cannot run; document and test the actual launcher.

## P2 — private integrated slice

Replace mock transport with one same-origin API and real database, local authentication, protected secrets and audit. Validate one entitlement from save through second-client lookup, authorised copy, denied retrieval and server restart. All records remain synthetic. The integrated slice must not rely on GitHub Pages for customer runtime assets or authentication.

## P3 — usable licensing MVP

Add document handling, quantity allocation, complete date semantics, renewal workflow, metadata export, deployment packaging and verified backup/restore. Run the private acceptance suite. Only admit real customer data after security, runtime and operational gates and explicit production authorisation.

## Review before normal user testing

Self-review primary task comprehension, useful information density, immediate feedback, phone reflow, keyboard navigation, permissions, failure recovery and date meaning. Fix obvious issues before presenting the prototype. Record usability evidence separately from storage/security evidence. Do not describe the demo as a secure working licence vault.

## First task packet

Goal: demonstrate fast licence lookup and exact dummy key copy. Owned public paths: UI, fixture transport, static assets and tests. Dependencies: this design baseline and public DTO v0.1. Exclusions: real upload, real authentication, customer data, backend deployment, integrations, hardware inventory and production release. Acceptance: LM-01/03/06/08/12/13 using fictional records. Handoff: product owner reviews workflow; backend engineer receives the same public field/state meanings. Return design conflicts to the relevant specification before inventing new behaviour.

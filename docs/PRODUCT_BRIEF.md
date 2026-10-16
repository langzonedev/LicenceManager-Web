# Product brief

Design baseline v0.1 — 16 October 2026. Proposed behaviour, not implemented capability.

## North star

An ICT operator can find the right software entitlement, copy its key and understand its usage and renewal position without searching spreadsheets, file shares and vendor emails.

The user supplied the need and requested a PWA prototype first, an on-premises backend, secure storage, simple copying, expiry tracking, system tracking, service tag association and future integration options. No customer interviews or market validation have been performed for this pack.

## Users and jobs

| User | Primary job | Success signal to validate |
|---|---|---|
| ICT operator | Find an entitlement by software, system or service tag; retrieve an authorised key | Finds the intended record and copies the exact value with clear confirmation |
| Licence custodian | Record purchases, evidence, allocation and renewals | Can explain what is held, where it is assigned and which date needs action |
| Viewer / auditor | Inspect metadata, EULAs and history | Can inspect evidence without receiving secret keys |
| Installation administrator | Manage access, backup and updates | Can revoke access and restore a coherent installation |

## Scope

| Now: licensing MVP | Next: after workflow validation | Later: separate product decisions |
|---|---|---|
| Product/vendor catalogue and entitlements | Reviewed CSV import with preview and reconciliation | Hardware lifecycle and procurement |
| Masked keys with explicit copy/reveal | Customer identity provider integration | CMDB relationships and dependency maps |
| EULAs and purchase evidence | Configurable SMTP reminders | Discovery agents and inventory scanning |
| Separate licence, support and renewal dates | Read-only integration API and connector spike | Vendor activation and usage collection |
| Lightweight system references and allocations | OIDC SSO, MFA policy and integration tokens | Multi-organisation hosting and SaaS |
| Service tag / serial association | More licensing metric types, guided reports | Contract interpretation or compliance calculation |
| Search, due-date list and audit history | Bulk operations with reviewed previews | Financial accounting, depreciation, ticketing |
| On-prem data ownership and recovery design | Asset extension only if a real need appears | Mobile native clients |

This scope describes the intended MVP. The first synthetic prototype proves only the interaction; a subsequent backend slice proves persistence and trust boundaries before real data is admitted.

## First useful journey

Create a fictional vCenter entitlement → associate it with a management system and related service tag → attach fictional terms → find it again by service tag → copy the dummy key → inspect upcoming support renewal.

The key may activate a management server while covering other hosts. The design must distinguish an activation target from a related host instead of treating every linked system as a licence consumer.

## Why software first

A full asset manager introduces discovery, ownership, location, hardware lifecycle and procurement workflows before the licence journey is proven. A small system reference plus explicit allocations meets the immediate tracking need. Stable identifiers allow a future asset module or external CMDB to enrich those references without redesigning entitlements.

## Experience requirements before technology

Normal desktop browser use comes first, with phone/tablet access for lookup. Required capabilities are HTTPS browser access, search, keyboard navigation, clipboard write with a manual fallback, authenticated file upload/download and optional installability. Camera, NFC, native background processing and offline secret access are unnecessary for this release.

## Evaluation targets

These are proposed usability targets, not observed results: a new user locates and copies a fixture key within 30 seconds; a trained user creates a basic entitlement within two minutes; a user can explain “perpetual licence, support expired” without assistance. Measure task success and time during supervised testing; do not add telemetry by default. Safety criteria are absolute: no real data in the public demo, no unauthorised secret response, no silent loss or overwrite.

Open questions for later: expected record/user counts; licensing metric diversity; customer identity provider; retention obligations; hosting OS; recovery targets; restrictions on exporting documents and secrets. These do not block a fictional UI prototype.

# LicenceManager-Web contributor instructions

## Authority and scope

Follow the current operator request, then these project instructions and the linked product requirements. This repository is public. On 16 October 2026 the operator extended the documentation task to implement and publish the fictional responsive PWA prototype through GitHub Pages, retaining direct-to-main delivery. That authorises the public demo, not a real-data production vault or backend deployment.

## Public boundary

- Commit only presentation code, intentionally public contracts and synthetic fixtures.
- Never include customer inventories, real keys, EULAs, credentials, private backend source, deployment secrets or internal research.
- A browser can inspect everything it receives. Hiding a control is not authorisation.
- The future public demo remains synthetic and disconnected from real customer services.
- Do not persist real data or sessions in localStorage, IndexedDB, a service worker cache or client error telemetry.
- Use the approved Lang Systems custom outline mark when assets are introduced. The old filled/stock LS mark is retired. Do not invent replacement logo artwork.

## Product discipline

Software licensing is the MVP. Systems are lightweight references. The operator's v0.2 expanded records, navy/cyan palette, per-system entries/shared purchased pools and purchase-pinned evidence are specified in `docs/EXPANDED_REQUIREMENTS.md`; this supersedes the initial corporate-violet product palette and narrower field model. Procurement metadata is in scope; procurement workflow/finance is not. Do not introduce discovery agents, CMDB, depreciation, vendor activation or compliance certification.

Read [requirements](docs/REQUIREMENTS.md), [UX](docs/UX_DESIGN.md), [workflows](docs/WORKFLOWS.md) and [contract](contracts/README.md) before implementation. Maintain the same field and state meanings across demo and on-prem clients. Show loading, failed, denied and disconnected states honestly; claim clipboard success only after the browser confirms it.

## Verification and handoff

Document changes: check internal links, contract/fixture consistency and public exposure. App changes later: test clean launch, the complete primary journey, keyboard/phone layouts, refresh, offline shell and service worker update behaviour. Report design, source, build, runtime and release states separately. Keep internal review evidence in the private repository.

18 October 2026 operator approval: the LM Signature product logo is approved for prototype use and application integration. Reuse the masters in assets/; the restriction on inventing replacement company artwork still applies to Lang Systems.

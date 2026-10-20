# Lang Systems Licence Register

Software licence information, ready when ICT needs it.

**[Open the Licence Register portfolio demo →](https://langzonedev.github.io/LicenceManager-Web/)**

Licence Register is a Lang Systems portfolio demonstration of finding software entitlements, retrieving fictional licence keys, checking renewal dates and seeing which systems use each licence. The compact interface name is **Licence Register**; the existing `LicenceManager-Web` repository and Pages address remain for continuity.

**Status, 20 October 2026: parked portfolio demo, fictional data only.** The original commission has stopped. Further development is on request; this is not a production offering or a promise of support, availability or security assurance. The interface follows the Lang Systems ink/violet/cyan palette. The expanded record model, shared entitlement subsets and purchase-specific evidence are described in [v0.2 requirements](docs/EXPANDED_REQUIREMENTS.md). This public demo does not implement real authentication, shared storage or production security controls. See [portfolio status and restart notes](docs/PORTFOLIO_STATUS.md).

The [optional demonstration notes](docs/DEMO_GUIDE.md) describe sample workflows. The app has no in-app tour; labels and contextual feedback explain its interactions.

## Open the prototype

The prototype is live on [GitHub Pages](https://langzonedev.github.io/LicenceManager-Web/). Pages is configured to publish through **GitHub Actions**. See [deployment runs](https://github.com/langzonedev/LicenceManager-Web/actions) for the latest version's deployment status.

Select **Alex Morgan · Custodian**, then **Open demo workspace**. No password is needed. The account menu also previews Sam Taylor (Operator) and Jordan Lee (Viewer).

Implemented: responsive overview, searchable/filterable licences, exact dummy-key copying without reveal, individual show/hide controls, automatic masking, expanded add/edit sections, lightweight systems/locations, per-system licence entries, shared purchases/spares/subsets, EULA/PO/contract versions pinned at purchase, fictional evidence snapshots/links, separate licence/SUM renewal dates, metadata export and simulated activity. See [v0.2 requirements](docs/EXPANDED_REQUIREMENTS.md) and [initial prototype notes](docs/PROTOTYPE_RELEASE.md).

**Fictional data only. Changes live in the current tab and reset on refresh. Demo users are role previews, not secure sign-in. Separate devices do not share edits.**

## Run or verify locally

No npm dependencies are required. Use Node 24 or a compatible supported runtime, plus Python 3 for the local server.

```sh
npm run check
npm run dev
```

Open `http://localhost:8000/`. If the system uses `python` instead of `python3`, run `python -m http.server 8000`. Opening `index.html` directly is not supported for ES modules; its startup message explains recovery. `npm run build` copies only allowlisted app files to `dist/`. GitHub Actions checks/tests that same source and publishes `dist/`.

The demonstration focuses on software licensing. Lightweight system records provide hostnames, environments and service tag associations. No further feature delivery is scheduled.

## Start here

- [Product brief and scope](docs/PRODUCT_BRIEF.md)
- [Requirements and acceptance criteria](docs/REQUIREMENTS.md)
- [UX, navigation and screen layouts](docs/UX_DESIGN.md)
- [Workflow diagrams](docs/WORKFLOWS.md)
- [Public client contract](contracts/README.md)
- [Prototype plan](docs/PROTOTYPE_PLAN.md)

## Two distinct environments

| Environment | Intended purpose | Data |
|---|---|---|
| Public browser/PWA portfolio demo | Explore fictional licensing workflows | Clearly fictional fixtures only |
| Separate private engineering work, outside this demo | Preserved for a possible future restart; subject to its own acceptance and release decisions | No customer data admitted by this portfolio publication |

The public demo must never request real keys, EULAs or customer inventories. It does not connect to a customer installation. PWA installation is optional; normal browser access is the primary experience. Offline support covers the application shell and a reconnect message, not a local licence vault.

## Repository purpose

This repository is the public presentation surface: safe UI source, publishable specifications and fictional examples. Backend authority, internal engineering, encryption implementation and deployment tooling belong in the separate private product repository. No licence keys, credentials, customer documents or customer configuration belong in either repository.

Lang Systems — Idea to production ready software.

Public source visibility does not grant an open-source licence. Redistribution terms remain to be established by the owner. The retained LM artwork represents **Licence Management** within this demonstration; commercial name/logo clearance remains outstanding.

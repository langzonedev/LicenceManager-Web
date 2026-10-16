# Licence Manager

Software licence information, ready when ICT needs it.

Licence Manager is a proposed on-premises, browser-based tool for finding software entitlements, retrieving licence keys, checking renewal dates and seeing which systems use each licence.

**Status: P1 fictional browser/PWA prototype implemented, 16 October 2026.** Public demo publication uses the included GitHub Pages workflow. Real authentication, shared storage and production security controls are not implemented.

## Open the prototype

Intended Pages address: **https://langzonedev.github.io/LicenceManager-Web/**. The repository's Pages source must be set to **GitHub Actions** before the deployment workflow can publish. Check the [Actions run](https://github.com/langzonedev/LicenceManager-Web/actions) for actual deployment status; the intended address alone does not establish that hosting is enabled.

Select **Alex Morgan · Custodian**, then **Open demo workspace**. No password is needed. The account menu also previews Sam Taylor (Operator) and Jordan Lee (Viewer).

Implemented: responsive overview, searchable/filterable licences, exact dummy-key copying without reveal, individual show/hide controls, automatic masking, add/edit licence, lightweight systems, allocation/reference links, fictional document/version viewing and download, renewal successors, due-action snooze/progress, metadata export and simulated activity. See [prototype notes](docs/PROTOTYPE_RELEASE.md).

**Fictional data only. Changes live in the current tab and reset on refresh. Demo users are role previews, not secure sign-in. Separate devices do not share edits.**

## Run or verify locally

No npm dependencies are required. Use Node 24 or a compatible supported runtime, plus Python 3 for the local server.

```sh
npm run check
npm run dev
```

Open `http://localhost:8000/`. If the system uses `python` instead of `python3`, run `python -m http.server 8000`. Opening `index.html` directly is not supported for ES modules; its startup message explains recovery. `npm run build` copies only allowlisted app files to `dist/`. GitHub Actions checks/tests that same source and publishes `dist/`.

The first release is focused on software licensing. Lightweight system records provide hostnames, environments and service tag associations; full hardware asset management is a possible later extension.

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
| Public browser/PWA demo | Evaluate the proposed workflows | Clearly fictional fixtures only |
| Customer on-premises installation, built later | Authenticated team use through a customer-hosted HTTPS origin | Customer database and document storage within the customer's environment |

The public demo must never request real keys, EULAs or customer inventories. It does not connect to a customer installation. PWA installation is optional; normal browser access is the primary experience. Offline support covers the application shell and a reconnect message, not a local licence vault.

## Repository purpose

This repository is the public presentation surface: safe UI source, publishable specifications and fictional examples. Backend authority, internal engineering, encryption implementation and deployment tooling belong in the separate private product repository. No licence keys, credentials, customer documents or customer configuration belong in either repository.

Lang Systems — Idea to production ready software.

Public source visibility does not grant an open-source licence. Redistribution terms remain to be established by the owner.

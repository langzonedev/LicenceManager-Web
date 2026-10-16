# Licence Manager

Software licence information, ready when ICT needs it.

Licence Manager is a proposed on-premises, browser-based tool for finding software entitlements, retrieving licence keys, checking renewal dates and seeing which systems use each licence.

**Status: initial design pack, 16 October 2026. No application, hosted demo or production security controls have been implemented yet.**

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
| Public browser/PWA demo, built later | Evaluate the proposed workflows | Clearly fictional fixtures only |
| Customer on-premises installation, built later | Authenticated team use through a customer-hosted HTTPS origin | Customer database and document storage within the customer's environment |

The public demo must never request real keys, EULAs or customer inventories. It will not connect to a customer installation. PWA installation is optional; normal browser access is the primary experience. Offline support will cover the application shell and a reconnect message, not a local licence vault.

## Repository purpose

This repository is the public presentation surface: safe UI source, publishable specifications and fictional examples. Backend authority, internal engineering, encryption implementation and deployment tooling belong in the separate private product repository. No licence keys, credentials, customer documents or customer configuration belong in either repository.

Lang Systems — Idea to production ready software.

Public source visibility does not grant an open-source licence. Redistribution terms remain to be established by the owner.

# Prototype 0.1.0

Historical first-release notes. The [v0.2 record and palette update](EXPANDED_REQUIREMENTS.md) supersedes the narrower fields, corporate-violet palette and no-test-file-upload limitation below. The application remains a fictional tab-local demo.

16 October 2026. Fictional interactive prototype; no real-data production capability.

## Using the demo

Open the published Pages URL after its deployment succeeds. Select Alex Morgan (Custodian), Sam Taylor (Operator) or Jordan Lee (Viewer); no password is required. Use the account menu to switch roles or sign out. The People & access screen explains the role differences. These role previews are UI simulations and provide no security against someone inspecting public source.

1. Search `DEMO-TAG-001` to find the host's software and its related management entitlement.
2. Open vCenter Server. Copy its dummy key while hidden, or use Show/Hide. Revealed values mask on window/tab blur, navigation or after 30 seconds.
3. Open Systems to inspect activation/reference relationships. Open Documents to view/download fictional terms and previous versions.
4. As Custodian, add/edit fictional licences and systems, link allocations, add a sample document revision or record a renewal with selected link transfers.
5. Review the perpetual backup licence with expired support, and the unknown draft, to see the separate date semantics. Renewals uses the frozen sample date **16 October 2026** for repeatable examples.
6. Export metadata, preview the Viewer role, or Reset demo to restore the sample records.

## Included behaviour

| Area | Prototype behaviour |
|---|---|
| Layout | Responsive navigation, dense desktop tables, phone cards, full-page details, native accessible dialogs |
| Key handling | Copy without reveal; per-item show/hide; manual-copy fallback; exact pasted characters preserved; activation-file download |
| Editing | Draft/active validation; quantity checks; explicit known/unknown/not-applicable dates; optional dummy key replacement |
| Systems | Physical/VM/service reference types, optional tags, collision check, activation/allocation/reference relationships |
| Evidence | Locally authored sample terms, revision history, download and viewed acknowledgement |
| Renewal | Independent licence/support/notice dates, start/reopen/snooze, successor creation and explicitly selected system link transfers |
| People | Three demo users with different UI capabilities; simulated account switch, sign-out and inactivity lock |
| Export/history | Metadata-only CSV with formula neutralisation; non-secret simulated activity |
| PWA | Local assets, install metadata/icons, static shell-only cache, offline message, deliberate update action |

## Deliberate limits

All state is in memory. Refreshing/closing resets data and sign-in; edits are not shared between devices or accounts in different tabs. A leave warning reduces accidental loss but is subject to browser behaviour. No network database, real authentication, encryption, production audit, cross-user conflict handling, server-enforced authorisation, real uploads, identity provider, SMTP, vendor activation, API integrations or asset discovery is implemented. Historical key retrieval is deferred; replaced dummy values are retained in memory but have no retrieval UI.

The demo accepts fictional keys beginning `DEMO-` and supplies fictional text documents instead of upload controls. Do not enter real keys/customer information. Copies may remain in device clipboard history; the app does not claim to clear the OS clipboard. Clipboard and installation support varies by browser and policy; standard manual selection/paste remains available.

## Source and verification

P1 uses buildless semantic HTML/CSS and native JavaScript modules rather than the initially recommended React/Vite stack. This removes external assets/dependency installation while preserving the domain/DTO and future backend boundary. The backend architecture is unchanged; connecting a real service requires P2 security and persistence work.

`npm run check` passes syntax checks, 15 automated tests and the static packaging step. Tests cover domain/date/permission semantics, scoped search, allocation bounds, CSV exclusion/injection, source rendering for every route under each role, copy-while-hidden with a stub clipboard, escaped markup, offline clearing and cache request boundaries. Render tests execute actual app functions against a DOM stub; they are not a browser accessibility or visual audit.

Real-browser/device visual testing, actual OS clipboard, installation/offline update behaviour and live Pages entry-point verification require runtime evidence and are not established by these source tests. The supported browser target remains the requirements baseline, not a claim every device has been verified.

## Publishing

The workflow builds an allowlisted `dist/`, uploads the Pages artifact, then deploys using GitHub Pages. First-time setup requires repository **Settings → Pages → Build and deployment → Source → GitHub Actions**. The GitHub connector used for source editing cannot change that administration setting. After enabling it, rerun the workflow. No credential should be committed to automate setup.

Only claim the demo is live after the deployment returns success and its actual URL is observed. Before each future app release, increment the shell cache version when cached source changes, run checks and document runtime evidence/limits.

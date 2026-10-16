# UX and GUI specification

Design v0.1. Wireframe-level specification; screens have not been built.

## Information architecture

Desktop navigation: **Overview · Licences · Systems · Renewals · Activity**. Administration is a separate, permission-gated destination. Documents live within each licence rather than requiring users to manage a second filing system. Global search stays in the header. The primary action is **Add licence**. User menu exposes lock/sign out; demo includes a persistent “Fictional demo — do not enter real licence information” banner and Reset demo.

## Screen formation

| Screen | Header and main region | Context and actions |
|---|---|---|
| Overview | Search, Add licence; compact counts for due, overdue and unknown | Renewal rows with owner/date/action; recent licences; no decorative giant cards |
| Licences | Search/filter bar, then a dense readable list | Product, reference, system, licence status, next date, owner; selecting opens detail |
| Licence detail | Product/title, licence status and next required action | Key summary and Copy key; tabs Overview, Systems, Documents, History |
| Add/edit licence | Single form with Product, Entitlement, Dates, Key, Evidence sections | Essential fields expanded; optional fields collapsed; Save draft and Save active clearly distinct |
| Systems | Searchable system list with type/environment/service tag | Detail shows linked licences, link purpose and allocation units |
| Renewals | Chronological due list grouped by event type | Licence expiry, support expiry, renewal notice; owner and action status |
| Activity | Time-ordered, filterable events | Actor, action, record, outcome; never a secret payload |

### Desktop wireframe, expressed as regions

| Region | Licences list | Licence detail |
|---|---|---|
| Top bar | Product name / global search / account | Breadcrumb / title / Edit |
| Left rail | Overview, Licences, Systems, Renewals, Activity | Same navigation |
| Primary workspace | Filters above compact table; result count; pagination | Summary: entitlement reference, product/version and owner |
| First actionable row | Search results and nearest date | Masked key / **Copy key** / Reveal; separate support and licence badges |
| Secondary workspace | Selection detail on wide displays where useful | Overview / Systems / Documents / History |
| Feedback region | Loading, zero results or retry | Saved/conflict/error states near the affected action |

Use a readable full-width workspace with 16–24px gutters; do not strand useful information in a narrow centred card. A detail side panel is optional at wide widths and becomes a routed full page on small screens. Preserve back-navigation, filter state and scroll position.

### Phone and tablet

At 320–767px: search first, licence cards with title, system and next date, full-page detail, one bottom primary action when appropriate. Advanced filters open a labelled sheet with keyboard focus containment and a visible close action. Keep primary actions visible without horizontal scrolling. At 768–1199px: compact navigation and reflowed table. At 1200px+: full navigation and deliberate table density. These are starting breakpoints, subject to content testing.

## Main interactions

**Search → select → copy:** focus search with `/` outside form controls; type vendor/product/system/tag; show matched field; select a result; Copy key requests authorised plaintext only for that operation. Keep the key visually masked while copying. A toast announces “Key copied”; no key value appears in notifications or live regions. A record with several secrets shows meaningful labels (Production key, Recovery key, Activation file), not an ambiguous single Copy button.

**Key reveal:** a separate action, with permission checks. Auto-mask after 30 seconds, on blur, navigation, logout and session expiry. Do not announce the value to screen readers automatically; authorised users can deliberately focus/select it. Clipboard contents may remain after the app closes and may enter OS clipboard history; the interface must not promise automatic clearing.

**Clipboard fallback:** browser permissions vary. If copying fails after authorised retrieval, show “Copy blocked by your browser” with Reveal and select manually. Do not use a hidden textarea containing a secret before permission is established. Do not silently trim, uppercase, reformat or remove line breaks from stored keys. Any proposed whitespace cleanup shows a preview and requires a deliberate choice.

**Add licence:** choose or create vendor/product inline, enter entitlement name/reference/type, optional key, owner, metric and quantity. Dates explicitly support Known / Unknown / Not applicable. Active requires a known type and validated quantities; drafts may be incomplete. Adding an attachment or system is optional and never blocks draft creation. Secret values are masked by default and never prefilled into an edit form; replacement is a separate explicit field.

**Associate system:** search existing by hostname/service tag or create a lightweight reference. Choose purpose: Activates on / Allocated to / Related system. Only Allocated to consumes quantity. Confirm units and metric, show remaining quantity, and warn about references sharing a tag. Do not guess a licensing calculation from processor/core information.

**Documents:** type, title, version/date, local file. For the prototype use fictional text fixtures; real uploads are not enabled. For integrated MVP show uploading, validating, ready, rejected and retry states. Terms acknowledgement records the user/time and version viewed; no button claims to accept a vendor's EULA on behalf of a customer.

**Renewal:** inspect due event, mark In progress or Snoozed until a date with a reason. Renew records a successor entitlement; it must not silently replace old dates or invalidate a previous key. Archive preserves history and requires resolving active allocations first.

## State and recovery contract

| Situation | Visible state | Recovery / data handling |
|---|---|---|
| Loading | Skeleton or progress label; action disabled only where necessary | Preserve current filters and focus |
| Empty installation | “Add your first licence” with one CTA | In demo, fictional examples are already present |
| No search results | Show query and Clear filters | Keep query editable |
| Validation error | Summary plus field-level explanation | Focus first invalid field; retain form values |
| Save pending | “Saving…” until acknowledged | Disable duplicate submission; retain operation identity |
| Save failed | “Not saved” and Retry | Keep data in memory; warn before leaving |
| Conflict | “This record changed” with field comparison | Reload/merge explicitly; never automatic overwrite |
| Connection lost | “Server unavailable — reconnect to view licences” | Clear sensitive records and secrets; retain only non-secret unsaved form fields in current memory |
| Session expired | Lock view and request sign-in | Remove key/plaintext and secret form fields immediately; non-secret draft retained only in current tab memory |
| Permission denied | Explain unavailable action without disclosing hidden data | Offer allowed navigation; do not retry forbidden endpoints |
| Server key unavailable | “Licence keys temporarily unavailable” | Metadata remains usable if safe; never replace encryption keys automatically |

In-memory draft preservation never overrides secret clearing. A refresh or closed tab can lose an unsaved draft; disclose this on leave. Browser persistence contains preferences such as density only, never customer records.

## Visual system

Use the current Lang Systems approved custom outline mark when artwork is introduced. Text wordmark is sufficient for the first prototype. Tagline: “Idea to production ready software.” No older filled LS artwork.

| Semantic token | Proposed value / behaviour |
|---|---|
| Background / surface | `#f1f4fa` / `#f8f9fd` |
| Text / muted text | `#13072f` / `#635d78` |
| Action / pressed action | `#6c19ff` / `#250861` |
| Border | `#d7d8e5` |
| Danger / success | `#b42318` / `#087f5b` with text/icon |
| Warning text | Dark brown with a pale warning background; verify actual contrast |
| Focus | High-contrast violet/ink outline; never rely on a pale decorative accent |
| Spacing | 4, 8, 12, 16, 24, 32px |
| Radius | 6px controls, 10px panels; restrained elevation |
| Type | System sans stack; optional bundled licensed Inter; 16px body |
| Motion | Approximately 160ms feedback; honour reduced motion |

Use violet for primary action, neutral surfaces for data. Status is text plus icon/colour. Test contrast in each actual state. Aim for 44px touch controls, visible focus, accessible field help, error summaries, skip navigation, semantic tables and non-obscured focused content. Keyboard access must match pointer actions. Do not require hover to retrieve essential information.

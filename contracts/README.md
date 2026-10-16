# Public client contract v0.2

The v0.2 additive metadata fields follow [expanded record requirements](../docs/EXPANDED_REQUIREMENTS.md): version/category, duration/payment and deployment model, activation/status, separate project/legal-owner/purchaser/custodian, usage/transfer rights, holding/subset/shared-pool identity and licence/SUM dates. New licence types and metrics are explicit enum expansions; a supported external API will require compatibility negotiation before these are released to independent consumers. No external API is deployed in this prototype.

This is the intentionally public metadata DTO boundary, not an implemented API or a promise of external API availability. JSON Schema is [licence-summary.schema.json](licence-summary.schema.json). Its synthetic examples are [licence-summaries.json](../fixtures/licence-summaries.json). Authoritative private API details remain in the private engineering pack.

UI consumes metadata summaries separately from an explicit secret retrieval operation. Lists never return key values, document bytes, encryption material, sensitive internal notes or credential-bearing URLs. IDs are opaque. The server derives permissions from the session; a public client role preview has no authority.

| Field | Meaning |
|---|---|
| `id` / `revision` | Stable opaque record ID and optimistic concurrency revision |
| `title`, `vendor`, `product`, `reference` | Searchable metadata; reference is a purchase/entitlement label, never a licence key |
| `licenceType` | perpetual, subscription, evaluation or unknown |
| `lifecycle` | draft, active, retired or archived |
| `licenceEnd`, `supportEnd`, `renewalNotice` | Each has known/date, unknown, or not_applicable; these meanings are distinct |
| `metric`, `quantity`, `allocated` | Recorded units; null means unknown or inapplicable, never zero by inference |
| `systemLabels` | Synthetic/public summary labels in demo; actual on-prem metadata requires authentication |
| `secretCount` | Number of retrievable secret items; values fetched separately when authorised |

Dates are ISO calendar dates; audit timestamps are UTC instants. UI translates labels but preserves API enum values. Derived due status is computed against the installation timezone, not each workstation clock. Do not expose customer data by calling it “metadata”.

Compatibility: additive optional fields are allowed within v1; clients ignore unknown response fields. Removing/renaming fields or changing semantics requires a new major API version and a documented migration. The v0.1 DTO is a design baseline and must be reconciled before a supported v1 API is released.

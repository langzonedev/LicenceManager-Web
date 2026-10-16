# User workflows

Proposed workflows v0.1. Public demo simulates server responses using fictional fixtures; on-prem implementation must enforce authority on the server.

## Lookup and copy sequence

```mermaid
sequenceDiagram
    actor User as ICT operator
    participant UI as Browser
    participant API as On-prem API
    participant Store as Protected storage
    User->>UI: Search product or service tag
    UI->>API: Search metadata
    API-->>UI: Metadata without secrets
    User->>UI: Copy labelled key
    UI->>API: Retrieve secret for copy
    API->>API: Check session and permission
    API->>Store: Record retrieval and read encrypted key
    alt Allowed and audit durable
        Store-->>API: Encrypted key
        API-->>UI: Plaintext with no-store headers
        UI->>UI: Write clipboard on user action
        alt Clipboard succeeds
            UI-->>User: Key copied
        else Browser denies copy
            UI-->>User: Manual reveal/select option
        end
        UI->>UI: Discard plaintext reference
    else Denied or unavailable
        API-->>UI: Non-secret error
        UI-->>User: Access or recovery message
    end
```

The server can prove secret retrieval; it cannot prove that OS clipboard contents were retained or cleared. A client copy outcome is optional supplementary evidence, not an authoritative audit of the clipboard.

## Swim lanes: capture and review

```mermaid
flowchart TB
    subgraph Operator["Licence custodian"]
        A["Enter entitlement"]
        B["Correct highlighted fields"]
        C["Add terms and system links"]
        D["Review saved record"]
    end
    subgraph Client["Browser"]
        E["Validate input and submit"]
        F["Retain unsaved input"]
        G["Show durable save result"]
    end
    subgraph Server["On-prem service"]
        H["Authorise and validate"]
        I["Commit record and audit"]
        J["Validate attachments separately"]
    end
    A --> E --> H
    H -->|"Invalid"| F --> B --> E
    H -->|"Valid"| I --> G --> C
    C --> J --> D
```

Core entitlement save does not depend on later attachment success. A rejected attachment leaves the saved record intact and shows a retry path.

## Swim lanes: expiry and renewal

```mermaid
flowchart TB
    subgraph Service["Date service"]
        A["Evaluate relevant dates"]
        B["Upsert due events"]
        H["Recalculate successor status"]
    end
    subgraph Custodian["Licence custodian"]
        C["Review Renewals"]
        D["Assign action or snooze"]
        E["Record renewed entitlement"]
    end
    subgraph Authority["API and database"]
        F["Validate and commit successor"]
        G["Transfer selected allocations explicitly"]
    end
    A --> B --> C --> D --> E --> F --> G --> H
    D -->|"Snooze expires"| C
```

## Entitlement lifecycle state machine

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Active: Validate and activate
    Active --> Retired: Resolve allocations and retire
    Draft --> Archived: Archive draft
    Retired --> Archived: Archive
    Archived --> Draft: Restore for review
```

Expiry and support status are derived date indicators, not lifecycle transitions. An active record may show expired rights; a perpetual record may show expired support. Renewal creates a successor and preserves its predecessor.

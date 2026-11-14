# v0.1.5 Round2 — 技术追踪
2026-11-14 · root. Contracts/limits are in spec008; this file records closed traces without duplicating schemas.

### P-001 — hierarchy/navigation
User discloses native Details → Handler `DetailsElement` changes local open state → API none/backend none → UI branch visible with standard Tab navigation. Leaf/breadcrumb Button → existing SDK action handler → state captured epoch/revision/current context → API A1 → backend declared-Button/literal validation → 202 → UI Sent to Pi; Pi receives item ID intent, not file access.

### P-002 — search/select
User edits query/navigates results → Handler new `SearchablePickerElement` → local state query/active option; selection alone updates initialized array binding through controller setter → API none/backend none/UI filtered options + retained selection. Submit → A1 → backend `validateInput` recognizes SearchablePicker, options membership/exclusivity/types → 202 → UI sent. Compile/restore perform same structural checks; no query string sent.

### P-003 — concise summaries
Helper example summary-metrics → Handler existing compiler/Card/Text/StatusBadge → immutable source-labelled component state → API existing a2ui_render path/backend atomic validateSurface → existing snapshot/SSE → UI literal summary and reported provenance. No live evidence is manufactured; no new metric endpoint.

### P-004 — validation
Named form inputs + FormValidation + guarded Buttons → Handler new `validateInteractions` validates reference/coverage/rules on compile/restore → state accepted with potentially business-invalid initial drafts. Click guarded Button → SDK resolves current data → client shared `validateSubmission(components,sourceId,context)` → errors state per mounted epoch/revision → API none/backend none/UI summary + adjacent field errors/focus. Edits re-evaluate current rules locally. Valid submit → A1 → backend repeats typed checks and same constraint evaluator before event-ID reservation/dispatch → 202/UI Sent. Forged invalid POST403, no dispatch. Browser adapter uses pinned SDK public `context.componentModel.id`; no guessed generated tag/index. Hidden/unavailable fields focus visible summary, never a hidden native control.

### P-005 — feedback states
Model selects feedback-states example and actual known state → Handler standard Card/Text/Icon/StatusBadge → reported state (Skeleton label explicitly placeholder) → existing render API/backend validation → snapshot/UI appropriate loading/empty/not-run/error + declared next action. Native execution state stays TaskProgress/ActivityTimeline; static template cannot certify it. Action through A1.

### P-006 — native timeline
Pi agent/tool event → Handler existing extension→LiveTools start/end/finishRun with timestamp → bounded32 native entries +1024 seen/32active tracking and omission state → backend UiSession native update/validateInteractions/capacity reservation → API existing authenticated SSE data batch with epoch/revision/sequence → client applyData keeps topology/drafts and timeline element renders observed order/elapsed. Late rendering→refresh hydrates; reset/restore/pause terminalize rows; old Operation cannot publish. Backend finite headroom rejects layout before commitment if timeline reserve cannot fit.

### P-007 — evidence intent
User reads literal source label and clicks Inspect → Handler existing Button → state: fixed declared evidence ID/location context → API A1 → backend unchanged literal/type/epoch checks → Pi message → UI Sent. Pi may inspect using its own tools/permissions on a later turn; browser never translates source into href/file read/RPC. Evidence label remains reported until verified.

### P-008 — keyboard actions
Canvas button/Ctrl-Cmd-K → Handler new palette browser module → local query + candidate identity(state epoch/revision/source ID) from current visible declared Buttons → API none/backend none/UI native focus-trapped dialog. Enter → close dialog, re-resolve current valid native source control and call actual click → SDK uses latest bound draft → client validation then A1/backend same declared action authority → UI Sent. Epoch/revision/pause/pending invalidation closes dialog, obsolete source gives no POST. Hidden/local controls excluded; no shell command API.

### P-009 — companion helper/skill
Pi normal package registration → Handler host resource loader reads pi.skills and packaged SKILL.md → state local chosen reference/pattern → API none/backend helper same compiler. CLI patterns/pattern emits allowlisted metadata, example emits exact validated raw source, check emits a2ui_render args → model actual a2ui_render → existing render handler validates session+resources → snapshot and optional existing auto-open → UI. No model call from helper. Production package has prebuilt client/helper, no TS consumer build. Actual authorized GLM acceptance separately observes real browser typed submit and next reply after endpoint preflight.

### Shared API A1 and state catalog
`POST /api/actions`, same-origin cookie/origin/body/rate checks, JSON `{epoch,revision,eventId,message:{version:"1.0",action:{name,surfaceId,sourceComponentId,timestamp,context}}}`. Backend UiSession.acceptAction: enabled/valid shape/current identity/dedup/declaration/literal or typed context/new guarded constraints/capacity → reserve ID → dispatch Pi message →202. Existing400 malformed,401 connection,403 undeclared/invalid context,409 stale,413 budget,429 capacity,503 unavailable/bridge; duplicate exact event accepted without repeat dispatch. 15-second browser uncertainty deadline, no retry. New interaction fields introduce no endpoint/credential/authorization grant. State: structural render replaces that surface/revision; data-only native patches increment sequence and preserve input/local state; epoch reset discards all old draft/error/palette state. Full render64components/4surfaces/depth16/source32KiB/snapshot256KiB remains unchanged.

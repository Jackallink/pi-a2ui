# v0.1.5 Round1 — 用户故事与验收
2026-11-14 · root; independent review recorded separately. Canonical contracts: spec008. IN: R01–R08+S15. OUT: arbitrary execution/file browsing/new model/providers/automatic user upgrade/publication.

| ID / Path | User story | Priority |
| --- | --- | --- |
| US-001 / P-001 | As a Pi user I want a small navigable hierarchy and breadcrumbs so I can identify context and select an explicit item. | P1 |
| US-002 / P-002 | As a Pi user I want keyboard filtering of authorized options so I can select without scanning long lists. | P1 |
| US-003 / P-003 | As a Pi user I want compact source-labelled summaries so I can compare facts without reading a wall of text. | P1 |
| US-004 / P-004 | As a Pi user I want inline field errors and a summary so I can fix a form before another agent turn. | P1 |
| US-005 / P-005 | As a Pi user I want clear loading/empty/not-run/error states so I know what happened and the next available action. | P1 |
| US-006 / P-006 | As a Pi user I want actual tool order and elapsed time so I can locate the failure. | P1 |
| US-007 / P-007 | As a Pi user I want to refer Pi to a stable evidence ID/file location so it can inspect the source under normal permissions. | P1 |
| US-008 / P-008 | As a Pi user I want keyboard search of existing actions so I can act without searching the canvas. | P1 |
| US-009 / P-009 | As a Pi model/operator I want working discoverable templates and offline preflight so authoring does not require guessing DSL. | P1 |

| AC-ID | Given | When | Then | Test intent / Priority |
| --- | --- | --- | --- | --- |
| AC-001 | A nested tree-navigation template within existing depth/count budgets | I disclose a branch and click a leaf/breadcrumb | Hierarchy remains readable, disclosure is local and exactly one declared item intent reaches Pi; no filesystem request | interactions-browser tree; compiler overdepth/overcount; CLI tree example; P1 |
| AC-002 | SearchablePicker has200 authorized options/typed initial selection | I type a query, navigate/select/clear by keyboard | Filtering is local, hidden selection retained, only allowed string-array values submitted; no-match/empty states visible | picker Node/schema/action + browser keyboard/selection; P1 |
| AC-003 | Invalid option IDs/types or a forged selected value | I compile/restore/submit | Atomic rejection/no dispatch, old draft/snapshot unchanged; <=1 in single mode | picker Node counterexamples/session; P1 |
| AC-004 | summary-metrics template contains environment/metric source labels | I render it | Values and labels are literal, units/source visible, reported result not independently certified | example compiler + browser source/escaping; P1 |
| AC-005 | A rendered invalid draft and explicit guarded buttons/rules | I submit | Inline errors/summary/first visible focus, zero POST; editing fixes errors; valid typed submit exactly once | validation browser + evaluator/session forged POST; P1 |
| AC-006 | Missing rule input/context coverage, duplicate paths, incompatible constraint or stale envelope | I compile/restore/submit | Fail closed and atomically; unrelated navigation/cancel still works; no event capacity consumed by invalid submit | validation Node topology/coverage/types/epoch/revision/capacity; P1 |
| AC-007 | feedback-states template distinguishes loading/empty/not-run/error | I render and activate its declared next action | Placeholders explicitly labelled, no invented live state, local display requires no inference; declared action follows existing route | example compiler/browser4states; P1 |
| AC-008 | Native tools start/end/fail/interrupt before or after timeline render | LiveTools publishes | Ordered real rows and last-observed elapsed, <=32 retained, omitted explicit, duplicate IDs truthful, a2ui tools excluded | native mocked-clock/session/budget + browser; P1 |
| AC-009 | Running timeline restored/paused/reset/closed, or tool window saturates | Old events arrive/new run begins | Old running entries interrupted; bounded reservations hold across4 surfaces/logs; no late ownership publication; new run clears prior timeline | native Node lifecycle/capacity + browser draft/reconnect; P1 |
| AC-010 | evidence-location template with literal evidence ID/file/line | I click Inspect source | Same typed/literal context reaches Pi; file:// or remote/file fetch never occurs; stale/modified context rejected | example/compiler/session/browser network assertion; P1 |
| AC-011 | Several current visible declared Buttons and an unsent form draft | I open palette, query, keyboard-select one | Actual current button clicked, latest draft sent exactly once, Ctrl/Cmd+K/Escape/Tab/focus work; local controls/hidden actions absent | palette browser; P1 |
| AC-012 | Palette open while revision/epoch/paused/pending changes | I attempt its old target/repeated Enter | Dialog invalidated and no obsolete/duplicate dispatch; unrelated data patch preserves draft | palette browser stale/busy/lifecycle; P1 |
| AC-013 | Installed production package with no dev build tools | Model loads skill then CLI patterns/example/check | Exactly8 patterns and19 valid examples discoverable, catalog32 actual types, all links/files packaged; old commands/exit codes work | helper/package Node + fresh normal Pi registration; P1 |
| AC-014 | Only existing AgentPlan glm-5.3-flash authorized | Model adapts skill template, real browser submits typed context | Provider/endpoint preflight proves selected identity; actual tool/render/native timeline/agent reply observed; no fallback or fake fixture-pass claim | bounded real skill-forward acceptance receipt; P1 |
| AC-015 | v0.1.4 session and private new candidate installation | Normal restore and downgrade | Old session survives; new snapshot failure is explicit/compatible skip, no original data/config/credentials or old tags changed | fresh production old/new/rollback consumers; P1 |

Boundary paths: empty options/query/results; invalid schema/limits; cancellation via Escape/non-guarded Button; pause/disconnect; source permission remains Pi; media/artifact limits unchanged; untrusted values stay data. All paths and exact limits are closed in spec008; tests here are **planned**, not passed.

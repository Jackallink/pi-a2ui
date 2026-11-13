# Round 2: technical trace

Contracts/state catalog: [canonical spec](../specs/001-pi-a2ui-mvp.md). Proposed locations are source paths below.

| Path | User action -> handler/location -> state -> API -> backend -> response -> UI |
| --- | --- |
| P1 | Pi request -> extension.ts a2ui_render -> compiler.ts temporary SDK state -> session.render(surfaceId,source,signal) -> validate complete surface, commit revision -> tool success + SSE snapshot -> renderer mounts changed surface. |
| P2 | Invalid/cancelled render -> compiler/session checks -> no committed mutation -> tool error -> no SSE publication -> previous UI remains. |
| P3 | Form click -> client.ts MessageProcessor onAction -> browser pending event ID -> POST /api/actions -> session validates and calls Pi synchronous bridge with followUp -> 202 -> browser shows submitted; next Pi render updates UI. |
| P4 | Stale/forged/duplicate action -> server.ts route -> compare epoch/revision/event cache/declared action/context -> no dispatch on rejection -> 400/403/409/503; identical accepted duplicate 202 -> visible error or accepted state, no blind retry. |
| P5 | Refresh/reconnect -> authenticated EventSource -> GET /api/events -> complete current snapshot -> SSE -> replace changed revisions only, clear everything for different epoch. |
| P6 | Pi session_start/session_switch/session_tree -> extension branch restore -> validate newest successful snapshot; rotate epoch and new action cache -> session.reset/restore -> SSE snapshot -> old UI clears, restored UI appears; no action dispatch. |
| P7 | Pi session_shutdown -> extension.close -> server.close cancels timers and ends clients/sockets -> OS listener released -> next startup new port/token -> old client reports disconnected. |
| P8 | Browser bootstrap -> fragment token read/cleared -> POST /api/connect -> Host/Origin/token checks -> HttpOnly port-specific cookie -> EventSource can receive session data. Unauthenticated/foreign requests never reach session data or action dispatch. |
| P9 | pi install absolute package -> Pi package metadata discovers extension.ts -> command starts server and opens bundled dist -> browser renders official components -> tool/action cycle returns to same Pi session. |

No service availability or compile error is converted to a successful render. Model prompt uses SDK-generated signatures. Credential is not included in tool history. UI event context is data, never a command/template. Critical API uncertainty is verified by executable SDK characterization before implementation, with design amendment/re-review if the contract cannot be met.

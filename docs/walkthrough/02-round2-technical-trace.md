# Round 2: technical trace

Contracts/state catalog: [canonical spec](../specs/001-pi-a2ui-mvp.md). Proposed locations are source paths below.

## P-001

- User action: Pi requests UI.
- Handler/component: extension.ts a2ui_render.
- State: capture origin epoch before await startup; temporary SDK state; commit new revision only if epoch unchanged and not closed.
- API: session.render(surfaceId,source,signal).
- Backend: compiler validates complete surface and capacity.
- Response: tool success + SSE snapshot.
- UI: official renderer mounts changed surface.

## P-002

- User action: Invalid/cancelled generation.
- Handler/component: compiler/session handler.
- State: committed state unchanged.
- API: session.render.
- Backend: reject before commit, including stale originating epoch after deferred startup or shutdown.
- Response: tool error; no publication.
- UI: previous UI remains.

## P-003

- User action: Form click.
- Handler/component: client.ts MessageProcessor action handler.
- State: stable pending event ID.
- API: POST /api/actions.
- Backend: session validates then synchronously invokes Pi followUp bridge.
- Response: 202 locally accepted single dispatch attempt, not Pi admission/model success.
- UI: show Sent to Pi; next Pi render updates UI.

## P-004

- User action: Stale/forged/repeated action.
- Handler/component: server.ts action handler.
- State: epoch/revision/cache/declared action comparison.
- API: POST /api/actions.
- Backend: no dispatch for rejected or duplicate event.
- Response: 400/403/409/503; identical accepted duplicate 202.
- UI: visible error or accepted status; no blind retry.

## P-005

- User action: Refresh/reconnect.
- Handler/component: client.ts EventSource handler.
- State: complete snapshot replaces changed revisions; new epoch clears all.
- API: GET /api/events.
- Backend: authenticated current snapshot from session.
- Response: SSE snapshot.
- UI: restore committed UI; preserve unchanged local inputs.

## P-006

- User action: Session load/switch/tree navigation.
- Handler/component: extension.ts branch restore handler.
- State: rotate epoch/cache; newest valid current-branch snapshot.
- API: session.reset/restore.
- Backend: SDK validates saved successful details; no dispatch.
- Response: SSE snapshot.
- UI: old UI clears; restored UI appears.

## P-007

- User action: Pi exit/reload.
- Handler/component: extension.ts shutdown handler.
- State: service closed; clients/timers cleared.
- API: server.close.
- Backend: end all sockets and release listener.
- Response: close completion.
- UI: old UI reports disconnected; next instance can start.

## P-008

- User action: Open canvas.
- Handler/component: client.ts bootstrap handler.
- State: fragment cleared; port-specific HttpOnly cookie stored.
- API: POST /api/connect then GET /api/events.
- Backend: validate exact Host/Origin/token; protect data routes.
- Response: cookie or 401/403.
- UI: authenticated UI loads; foreign client receives no state.

## P-009

- User action: Install package and open canvas.
- Handler/component: Pi package discovery and command handler.
- State: extension registered; lazy service active.
- API: pi install path; /a2ui.
- Backend: load extension and serve bundled assets.
- Response: browser URL and tool registration.
- UI: official UI then same-session action cycle.

No service availability or compile error is converted to a successful render. Model prompt uses SDK-generated signatures. Credential is not included in tool history. UI event context is data, never a command/template. Critical API uncertainty is verified by executable SDK characterization before implementation, with design amendment/re-review if the contract cannot be met.

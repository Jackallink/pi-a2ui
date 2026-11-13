# Round 3: integration and errors

| E2E | Paths | Evidence required |
| --- | --- | --- |
| IT-001 | P-001/P-003/P-009 | Built archive loads in real Pi >=1.5, real model calls tool, browser official renderer displays form; submit causes next same-session turn. |
| IT-002 | P-002 | Real SDK rejects unsupported/malformed DSL; committed state and browser remain usable. |
| IT-003 | P-003/P-004 | Duplicate accepted event gives one local dispatch attempt; mismatched ID payload, wrong source/name/context, stale epoch/revision and disabled state give zero dispatch. |
| IT-004 | P-005/P-006 | Reconnect gets full snapshot; unchanged surface input survives another update; branch restoration never adopts invalid/failed history. |
| IT-005 | P-007/P-008 | Close with SSE clients releases listener; auth/Origin/Host/body/client/backpressure limits behave under native HTTP tests. |

| Condition | Response / user-visible behavior | Retry policy |
| --- | --- | --- |
| DSL/schema/tree/catalog invalid | Tool error; old UI remains | Model may correct source. |
| Cancelled before commit | Tool error; no publication | Explicit new tool call only. |
| Missing/incorrect credential | 401, canvas locked | Reopen /a2ui to bootstrap. |
| Foreign Host/Origin | 403, no data or side effect | No CORS bypass. |
| Malformed/undeclared action/context | 400/403, visible message | Correct form/action only. |
| Stale epoch/revision | 409, visible stale UI message | Wait for current snapshot; no old action replay. |
| Identical accepted duplicate | 202, locally accepted dispatch attempt | No second Pi dispatch. |
| ID reused for changed payload | 409 | New deliberate user action only. |
| Oversize body/source/snapshot/components | 413/tool error | Reduce payload. |
| Client/event capacity | 429 | Reopen/reset explicitly; no accepted ID eviction. |
| Backpressure | Disconnect slow client | SSE reconnect restores snapshot. |
| Disabled/unavailable/Pi dispatch throw | 503/tool error for synchronous bridge exception | Explicit user retry; rejected IDs are not accepted. |
| Network failure after POST | Visible uncertain-delivery state | No automatic POST retry. Pi async dispatch/admission failure is surfaced in Pi and is not implied successful by 202. |
| Invalid saved details | Ignore that record, previous valid or empty | No execution. |

Open items owned by implementer: characterize pinned SDK and local Pi loader; prove actual model/provider availability without reading/printing credentials. These are required checks, not assumed success. Independent reviewer owns GO/NO-GO; severe/major design findings block implementation. Any live environment blocker remains explicit and does not become a completion claim.

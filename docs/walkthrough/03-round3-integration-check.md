# Round 3: integration and errors

| E2E | Paths | Evidence required |
| --- | --- | --- |
| E1 | P1/P3/P9 | Built archive loads in real Pi >=1.5, real model calls tool, browser official renderer displays form; submit causes next same-session turn. |
| E2 | P2 | Real SDK rejects unsupported/malformed DSL; committed state and browser remain usable. |
| E3 | P3/P4 | Duplicate accepted event gives one dispatch; mismatched ID payload, wrong source/name/context, stale epoch/revision and disabled state give zero dispatch. |
| E4 | P5/P6 | Reconnect gets full snapshot; unchanged surface input survives another update; branch restoration never adopts invalid/failed history. |
| E5 | P7/P8 | Close with SSE clients releases listener; auth/Origin/Host/body/client/backpressure limits behave under native HTTP tests. |

| Condition | Response / user-visible behavior | Retry policy |
| --- | --- | --- |
| DSL/schema/tree/catalog invalid | Tool error; old UI remains | Model may correct source. |
| Cancelled before commit | Tool error; no publication | Explicit new tool call only. |
| Missing/incorrect credential | 401, canvas locked | Reopen /a2ui to bootstrap. |
| Foreign Host/Origin | 403, no data or side effect | No CORS bypass. |
| Malformed/undeclared action/context | 400/403, visible message | Correct form/action only. |
| Stale epoch/revision | 409, visible stale UI message | Wait for current snapshot; no old action replay. |
| Identical accepted duplicate | 202, accepted | No second Pi dispatch. |
| ID reused for changed payload | 409 | New deliberate user action only. |
| Oversize body/source/snapshot/components | 413/tool error | Reduce payload. |
| Client/event capacity | 429 | Reopen/reset explicitly; no accepted ID eviction. |
| Backpressure | Disconnect slow client | SSE reconnect restores snapshot. |
| Disabled/unavailable/Pi dispatch throw | 503/tool error | Explicit user retry; rejected IDs are not accepted. |
| Network failure after POST | Visible uncertain-delivery state | No automatic POST retry. |
| Invalid saved details | Ignore that record, previous valid or empty | No execution. |

Open items owned by implementer: characterize pinned SDK and local Pi loader; prove actual model/provider availability without reading/printing credentials. These are required checks, not assumed success. Independent reviewer owns GO/NO-GO; severe/major design findings block implementation. Any live environment blocker remains explicit and does not become a completion claim.

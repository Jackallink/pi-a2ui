# Round 1: user stories and acceptance

Scope: canonical [spec](../specs/001-pi-a2ui-mvp.md). All AC below are P1.

| Path | Story | User story |
| --- | --- | --- |
| P1 | US-01 | As a Pi user I want a card/form alongside coding conversation, without configuring another model. |
| P2 | US-02 | As a user I want invalid generation/cancellation to preserve my last usable UI. |
| P3 | US-03 | As a user I want submitted form values to continue this Pi conversation once. |
| P4 | US-04 | As a user I want stale or forged browser actions rejected. |
| P5 | US-05 | As a user I want refresh/reconnect and distinct Pi sessions to show the correct UI. |
| P6 | US-06 | As a user I want current-branch UI restored on session reload/navigation. |
| P7 | US-07 | As a user I want reload/exit to release all local service resources. |
| P8 | US-08 | As a user I want other websites and unauthenticated clients unable to read or control my UI. |
| P9 | US-09 | As a user I want to install the package and open a UI without running a build. |

| AC | Path | Given / When / Then |
| --- | --- | --- |
| AC-01 | P1 | Given an enabled Pi session, when the model submits valid DSL, then the official renderer displays the committed form, and a replacement updates only that surface. |
| AC-02 | P2 | Given an existing UI, when generation is invalid, cancelled, empty or over limits, then the tool reports an error and the previous snapshot/revision remains unchanged. |
| AC-03 | P3 | Given a current form, when I submit fields, then the same Pi session receives their structured context once; during generation it is queued as followUp, and duplicate accepted event IDs do not create another turn. |
| AC-04 | P4 | Given a committed UI, when the epoch/revision/source/name/context is invalid, an accepted ID is reused with different content, or UI is disabled, then submission is rejected without a Pi turn. |
| AC-05 | P5 | Given current UI and local input, when another surface updates then unchanged input remains; on refresh/reconnect full committed state returns; on epoch change no old UI/input/action is adopted. |
| AC-06 | P6 | Given saved tool details on a Pi branch, when that branch loads then only the latest compatible valid snapshot restores; malformed/failed/unbounded data is ignored without side effects. |
| AC-07 | P7 | Given connected browser clients, when Pi shuts down/reloads then clients/timers/listener close and a fresh instance can listen. |
| AC-08 | P8 | Given the service, when requests lack valid credentials, use foreign Origin/Host, exceed size/client/queue limits, then access is rejected or slow clients disconnected while valid clients remain usable. |
| AC-09 | P9 | Given a built npm archive, when installed locally into Pi, then extension discovery succeeds, /a2ui opens bundled assets, and valid model render + user action works without a user build. |

Boundary paths: disabled UI, no restored UI, unknown surface, invalid form context, interrupted generation, foreign website, reconnect, duplicate click, transient dispatch failure, session switch, malformed saved snapshots, process exit. Public publication and token streaming excluded.

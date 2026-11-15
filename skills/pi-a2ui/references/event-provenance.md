# Browser event identity and delayed delivery

After validating a browser action, Pi A2UI forwards its usual structured JSON as a follow-up user message. Packages with this change add top-level `epoch` and `revision`:

```json
{"epoch":"example-session-epoch","revision":1,"surfaceId":"review","event":"discuss","sourceComponentId":"discuss","context":{"resultId":"example-result"}}
```

These identify the session and surface revision **when the server accepted the action**. `context` is still the exact declared/validated submitted data. A nested user field named epoch/revision remains data and does not replace the top-level identity. Older packages may omit these fields; omission means provenance is unavailable, not revision zero.

A click accepted while Pi is busy may arrive after that surface was replaced or the session was reset. Its original metadata remains attached; it is not retagged as the newer UI or automatically discarded. The HTTP202 acknowledgement means accepted for the Pi bridge, not that a future model turn has executed the intent. An already-stale POST is still rejected409 with no dispatch.

Compare `(epoch, surfaceId, revision)` with a trustworthy **current** snapshot when available. Different epochs identify different session lifetimes; compare revisions only within the same epoch and surface. Epochs are opaque, not sortable timestamps. A historical tool result alone may be stale after branch restoration/reset, which creates a new epoch. If current identity is unavailable, state that uncertainty and verify the user's intent before acting on an ambiguous older interaction; do not claim a metadata field automatically proves currentness or permission to execute.

Normal literal-context/type/guard checks, event deduplication and follow-up delivery remain. This adds provenance only; it does not add a queue-cancellation mechanism, new action/tool endpoint, background polling or model call.


## Transport retries and intentional repeat clicks

The browser assigns a fresh `eventId` to each intentional click. Within the current session epoch and surface revision, retrying the same ID with an identical canonical envelope is accepted as a duplicate **without another dispatch**. Object key order does not change that identity. Reusing the ID with different content is rejected409. Stale epoch/revision checks still apply; a duplicate is not permission to replay against a replaced surface.

Two separate clicks have different IDs and may each dispatch even when their action/context is identical. This preserves intentional repeated operations such as increment or next. The forwarded JSON above omits `eventId`: `(epoch, surfaceId, revision)` identifies the accepted UI version, not a unique action or a business operation. Two valid messages can therefore look identical. There is no exactly-once business-effect guarantee.

Consumers must make side effects safe at the application boundary, using a trustworthy operation identity and current state when available. A declared literal application operation ID can identify one operation; repeated requests for that operation must not execute its effect twice. Do not blindly discard identical forwarded JSON: that would also suppress legitimate repeated clicks. When an irreversible/non-idempotent effect cannot be distinguished from a retry using the available context, verify the user's intent/current operation before executing it. A202 acknowledgement alone proves neither execution nor effect uniqueness.

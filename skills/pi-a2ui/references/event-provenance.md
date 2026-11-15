# Browser event identity and delayed delivery

After validating a browser action, Pi A2UI forwards its usual structured JSON as a follow-up user message. Packages with this change add top-level `epoch` and `revision`:

```json
{"epoch":"example-session-epoch","revision":1,"surfaceId":"review","event":"discuss","sourceComponentId":"discuss","context":{"resultId":"example-result"}}
```

These identify the session and surface revision **when the server accepted the action**. `context` is still the exact declared/validated submitted data. A nested user field named epoch/revision remains data and does not replace the top-level identity. Older packages may omit these fields; omission means provenance is unavailable, not revision zero.

A click accepted while Pi is busy may arrive after that surface was replaced or the session was reset. Its original metadata remains attached; it is not retagged as the newer UI or automatically discarded. The HTTP202 acknowledgement means accepted for the Pi bridge, not that a future model turn has executed the intent. An already-stale POST is still rejected409 with no dispatch.

Compare `(epoch, surfaceId, revision)` with a trustworthy **current** snapshot when available. Different epochs identify different session lifetimes; compare revisions only within the same epoch and surface. Epochs are opaque, not sortable timestamps. A historical tool result alone may be stale after branch restoration/reset, which creates a new epoch. If current identity is unavailable, state that uncertainty and verify the user's intent before acting on an ambiguous older interaction; do not claim a metadata field automatically proves currentness or permission to execute.

Normal literal-context/type/guard checks, event deduplication and follow-up delivery remain. This adds provenance only; it does not add a queue-cancellation mechanism, new action/tool endpoint, background polling or model call.

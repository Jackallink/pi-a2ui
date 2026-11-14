# Native timeline and evidence

Node24.x only. Check actual installed helper catalog and active tool. Native observed data and caller-reported references are distinct; rendering cannot certify evidence.

## ActivityTimeline — actual API

Requires interactions-v1 with **ActivityTimeline**. Use [activity-timeline](../examples/activity-timeline.express) and `ActivityTimeline(stream="tools")` only. Omit entries/state/omitted/duration counters: all non-default initial values are rejected, not trusted from the model. At most1 timeline/surface, never inside a Button or descendant. Use Details to fold its evidence and a separate TaskProgress for current tracked counts; no fabricated progress percentage.

Timeline shows real tracked Pi tool starts, completion/failure/interruption, observed start/time and elapsed duration. A running value is last observed, not a continuous timer; interrupted time is partial observation. Native a2ui_* tools are excluded. No args/output/credentials copied to a timeline. An empty timeline means no tracked events, not a successful execution. Static source/metric cards remain reported claims, not native events.

32 retained rows per run; old rows are dropped with an omission warning,32active/1024seen tracking caps retain explicit omission. Local tool-N row IDs are not original tool-call IDs; names truncated64UTF16, duplicate native IDs do not fabricate new rows. New run clears previous rows; late render refreshes already-observed events. Restore interrupts running entries without restarting work. Pause interrupts active entries; resume resets the timeline idle/empty; old ownership cannot update it. Native data patches/reconnect preserve form drafts and disclosure; a full structural replacement resets local state.

Source32KiB/tree16/components64/session4surfaces/256KiB snapshot remain. Each timeline reserves32KiB and192 visited JSON items for future32rows within global4096/depth limits, in addition to existing global64KiB log share and sequence headroom. Timeline envelope ID<=512UTF16; each complete component<=32KiB. Too-large initial layout fails atomically; reduce supplied tables/options/structure rather than dropping safety checks. The helper checks compilation, not a running session's aggregate capacity.

`example activity-timeline` → `check --surface-id activity FILE` → a2ui_render. Continue Pi's response rather than polling/re-rendering or asking the model for every tool-output chunk.

Persistence follows existing successful A2UI tool-result snapshot checkpoints. Live data-only events between those checkpoints are not separately saved; restarting Pi may restore an earlier/empty window. Reconnect to the running server has latest state. This is a current-run observer, not a complete durable execution audit log.

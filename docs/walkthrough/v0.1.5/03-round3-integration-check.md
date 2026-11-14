# v0.1.5 Round3 — 集成与错误
2026-11-14 · root. Design intent only. No test counts or runtime success implied.

| ID | Paths/ACs | End-to-end evidence required |
| --- | --- | --- |
| IT-001 | hierarchy/summary/feedback/evidence, AC-001/004/007/010 | Actual compiler examples + browser disclosure/literal labels + exactly declared intent + no filesystem/external request |
| IT-002 | selection, AC-002/003 | Keyboard query/select/clear,0/200 options/hidden selection; forged membership/type rejected by direct session call |
| IT-003 | validation, AC-005/006 | Business-invalid initial render, zero POST invalid UI, inline/error focus, corrected submit, direct forged POST403, unrelated cancel; shared paths/references fail compile |
| IT-004 | timeline, AC-008/009 | Native event clock/dedupe/overlap/failure/interrupt/caps;4surfaces with log/timeline reserve; restore/pause/newrun/late renders and no old-operation update; actual browser retained draft/Details/sequence reconnect |
| IT-005 | palette, AC-011/012 | Real keyboard+focus+latest draft; hidden/local/paused/pending/stale sources excluded;1 POST even repeated Enter; actual native button invocation |
| IT-006 | helper, AC-013 | Every example compiled by installed production helper;32 API types not extra pattern aliases; normal skill discovery/all refs packaged without dev build tools |
| IT-007 | consumer, AC-014/015 | Fresh normal registration, bounded actual GLM interactive/native test, provider identity, old restore/new rollback preserving original files; setup/fixture failure separately classified |

| Error / condition | User-visible / client behavior | Backend / safety |
| --- | --- | --- |
| Unknown component, bad rule target/button coverage, limits | render tool error; previous surface untouched | reject before commit; helper fails without stdout tool payload |
| No picker options/no query match | explicit No options/No matches, current selection remains inspectable | no request or model turn |
| Invalid field submit | escaped inline errors + summary; first visible input or visible summary focused | zero browser POST; direct bypass403; no event-ID consumption |
| Stale epoch/revision/current button absent | palette closes/refresh notice; old errors removed |409/no dispatch; exact duplicate remains idempotent |
| Busy/paused/other Modal | palette unavailable/closed; no hidden execution | existing availability restrictions remain |
| Native cap/headroom pressure | omitted indicator or render-capacity error; no false complete data | bounded32rows/active,1024seen,32KiB per timeline surface plus log reserve |
| Reset/restore/pause/close | running rows interrupted; paused container or empty idle on resume | no execution restart/old ownership/resource re-read |
| Connection loss/15sec timeout | reconnect/uncertainty notices; drafts retained when structure same | no automatic action retries |
| Old package/helper/unsupported catalog | explicit unsupported feature or latest-compatible restoration notice | no silent migration/destructive session rewrite |
| Model/provider unavailable | bounded acceptance blocked with exact source/environment receipt | no model fallback/billed provider change |

Consistency: one action API, same error/envelope/dedup/capacity policy, no model calls for local sorting/filtering/disclosure/palette/validation, no new execution or auth flows. Non-goals and rollback are in spec008. Open questions: none intentionally deferred for schema/authority/scope; independent review may identify blockers, which must be resolved before admitting implementation. Browser adapter and capacity tests are required evidence, not waived assumptions.


## Authorized release closure (2026-11-14)

User GO covers PR33 merge → immutable v0.1.5 tag → GitHub archive/checksums publication → downloaded asset identity → fresh normal Git@tag registration, skill/helper and no-model session restore → issue/milestone closure. Release preparation changes installation/readme status only; runtime/schema/skill/compiler and dependency identity remain unchanged. Existing166/45 regression plus fresh pre-merge checks, payload/source/dist identity and independent release review gate the merge. Missing tag/release is checked before creation; never replace a prior immutable asset. Post-release source/check receipt commits do not move the tag. If download/consumer verification fails, preserve the published evidence, keep issues open, diagnose within the same scope and do not report completion. Real-user installation/credentials/default Node are outside scope. Actual inference, if needed, retains exact Ark AgentPlan glm-5.3-flash preflight; existing bounded model evidence is not recast as a fresh publication-time model call.

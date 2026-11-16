# Trigger pilot independent design review R1

2026-11-16. Read-only design review; reviewer writes only this ignored report. No implementation, provider call, credential access, full test execution, user configuration/runtime change, source/index/HEAD mutation or remote operation.

Verdict: **NO-GO for design admission as written**, because F1 can mismeasure the central outcome. No P0. One P1 blocker and one P2 wording finding. This is not a rejection of the bounded pilot or its small sample. Budget remains a proposal, not approval; even a corrected design GO cannot authorize implementation or live execution.

## Identity and examined evidence

- Repository branch supplied: `codex/v0110-trigger-pilot-design`; observed HEAD `77715bfa097d706cae9a1c95b0589fb481d2b818`.
- Examined canonical untracked Spec022 and its three untracked walkthrough drafts, root AGENTS.md, Spec021, actual extension registration/skill instructions, BM4 worker and installed Pi agent-loop / extension event source. Tracked working diff was empty at review time.
- Frozen profile SHA256 observed `dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`; Check099 SHA256 observed `015de150cee7c5c53bff89a2dc8f36dbf4f6c99bd5426be10cacd29d3c895539`, matching draft.
- No JS/npm/Pi process run by this reviewer. Source reads only; Node24 requirement was not bypassed with another runtime.
- Installed `pi-agent-core` and `pi-coding-agent` metadata both report1.5.0. Lock SHA256 `06611b1dc150fc0d2faf1e2aa1241d5fd59b05eb089a745236475337eab918fe`.
- Reviewed draft SHA256: Spec022 `a0904bc1a441ffeb72111802b55525f9115cabea46b11aa7bbdb12ac4a874bf4`; Round1 `5f52982b617ce7935ecc8577d1a73b0b817964ee92d9520e6bd6961e8ec62309`; Round2 `59088973af38bf7b102f4910859c70511efb1d5a3cb6a4aa7a91dfc9afbea4ea`; Round3 `7b48965a33e4bdfac66d7dcd6f94474510874d27cc440f8a08850be356b051d8`.
- Release archive/hash/delta facts supplied by root were not independently recomputed here. They remain explicit offline admission assertions for the future harness.

## F1 — P1 — Schema-rejected render choices escape the proposed trigger metric

Locations: Spec022 line43; Round2 lines10/13; Round3 IT-003 line11.

The draft counts `render_attempted` only when the model's call enters the Pi extension `tool_call` event. In the actual installed SDK, `pi-agent-core/dist/agent-loop.js:498` validates arguments before invoking `beforeToolCall` at499. `pi-coding-agent/dist/core/agent-session.js:339-350` emits extension `tool_call` only inside that hook. Validation errors are converted to immediate error results (`agent-loop.js:539-544`) without that event.

Thus a complete model response explicitly selecting `a2ui_render` with missing `source`, invalid `surfaceId`, or wrong argument type can be mislabeled untriggered. This undercounts both positive attempts and negative false triggers and can reverse the A/B conclusion. It may also evade the first-render stop policy and permit a repair attempt because the extension observer never saw the attempted render. Existing IT-003 mentions compile rejection, which happens later and does not prove this case.

Required design correction: identify model selection from the actual completed assistant `toolCall` / suitable pre-validation agent event, keyed by toolCallId, before schema validation. Distinguish selection, schema admission, handler commit, semantic correctness and browser display. Preserve complete render selection even on schema rejection; distinguish incomplete/truncated transport rather than converting it to ordinary no-render. Guarantee no provider repair request after the first selected render's error result, including schema rejection. Add actual-SDK synthetic canaries for missing-source and invalid-surfaceId render calls, positive and negative reporting, and no post-error request. Keep raw tool arguments unchanged. No need to modify product handler/schema.

## F2 — P2 — “Usable” label exceeds its declared trigger-only threshold

Location: Spec022 line51.

The phrase `本组场景中可用` currently follows a threshold requiring only at least3/4 attempts, zero negative attempts and no regression versus A. Those conditions can hold when every attempted UI fails compilation or is semantically unusable. The adjacent sentence correctly separates UI correctness, but the headline label conflicts with it.

Suggested correction: call this `达到本轮触发门槛` (or equally explicit trigger-only wording), and reserve a UI usability label for independently checked committed, factually correct, appropriate UI. This does not require expanding scope or inventing a success threshold.

## Accepted bounded choices and limitations

- Six new prompts, four potentially useful UI cases plus two skips, fixed pair order and one observation per arm are suitable for an exploratory direction check. They do not support significance/generalization; the draft correctly disclaims these. No additional samples requested.
- A is explicitly current0.1.10 with only old trigger clause substituted in private host metadata; it is neither a whole old runtime nor frozen BM4 replay. Offline actual-SDK request identity comparison is necessary and appropriately blocks paid execution.
- Normal skill metadata discovery without forced full body, no slash skill command, no render hints/expected DSL, identical visible paths/time/tool definitions across arms and raw later divergence are appropriate controls.
- Three requests can legitimately end in read/reference/draft preparation rather than render. The draft already reports preparation and budget limitation separately, does not force success, and does not call that a universal no-trigger. Preserve that limited interpretation and show first-step/preparation traces; do not raise budget automatically.
-12 episodes ×3 requests =36 maximum sends;36 ×1536 =55,296 configured output-token ceiling.96KiB is honestly described as bytes rather than exact input tokens; there is no unsupported currency estimate. Zero retries/fallback, sequential sends, durable before-send accounting, timeouts/cleanup tests and batch stop on unknown costs are appropriate proposed controls, not yet implemented evidence.
- Snapshot/commit, content correctness, DOM display and deterministic native summaries remain distinct. Local controls can be inspected without sending button messages/model continuations.
- Frozen profile/history preservation, independent new evidence directory, no v1/v2 execute, actual-package use and no user installation change are explicit. No permission is inferred from historical budgets or release acceptance.

## Re-review scope

Update only the design and relevant walkthrough/test intent for F1, clarify F2, then request a fresh read-only design review. Subsequent budget approval, strict implementation/TDD, actual-SDK synthetic safety/measurement controls and harness review remain separate future gates. No live-ready or implementation-ready claim is made here.

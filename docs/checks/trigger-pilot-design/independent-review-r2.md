# Trigger pilot independent design review R2

2026-11-16. **GO for Gate1 design scope only** for the exact four draft identities below. R1's P1/P2 findings are closed in the design. No remaining P0/P1/P2 findings in this bounded re-review. R1 NO-GO report is preserved as history.

This does **not** approve36 provider calls, any other live budget, harness implementation, Gate2/TDD completion, actual-SDK controls as passing, or live readiness. User budget approval remains pending. The four documents remain drafts. No implementation or model execution is admitted by this review.

## Source and document identity

- Observed HEAD: `77715bfa097d706cae9a1c95b0589fb481d2b818`; source branch supplied as `codex/v0110-trigger-pilot-design`. Tracked working diff remains empty.
- Final document SHA256 values recorded after the R2 wording synchronization:
  - Spec022: `f9f0b7ac366882422c30609a0420adeeec5f969a90d2e276735dd27a812e6373`.
  - Round1: `32945d60aa2a1ff4d5020f9ce048fafda7d6211a7a95a0e618c1fe69565c048d`.
  - Round2: `0edcc74868be1ef65098ae401f6ae9beacd132bbb1a2ff943106a821cf49de3e`.
  - Round3: `6c3a74dc5467853c110b85b91b2cdfa1b2dda1d085cf9ea0b8253cd546bc1747`.
- Frozen profile and Check099 hashes re-read during R2 match `dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685` and `015de150cee7c5c53bff89a2dc8f36dbf4f6c99bd5426be10cacd29d3c895539` respectively. Neither baseline was executed or rescored.

## Finding closure

F1 P1 closed at design level: `render_requested` now observes actual complete assistant `toolCall.name=a2ui_render` before SDK schema validation. `render_attempted` separately means the extension `tool_call` was reached after validation; commit/snapshot is separate again. Positive selection and negative false triggers use requested. SDK rejection cannot erase an observed choice. Incomplete/truncated calls remain unknown. Missing-source and wrong-surfaceId-type actual-SDK synthetic canaries explicitly require requested=true, attempted=false, committed=false and no repair/provider continuation. This seam is source-compatible: installed Pi1.5 agent-loop emits complete assistant `message_end` before its subsequent tool execution/argument validation. These are required future tests, not tests run or proven here.

F2 P2 closed: the preregistered attempt-only “usable” wording is replaced by `本组场景中选择行为符合预期`, and UI correctness remains separate. This no longer turns tool selection into a usability claim.

Additional correction accepted: complete observed responses with known admitted requests but missing token usage are `usage_unknown`; this does not fabricate zero fees, refund request allowance, or invalidate observed model choices. Unknown request outcomes still stop the batch. Canonical, AC, technical trace and test intents now state that distinction consistently.

## Bounded methodology judgment

- Four positive/two negative new prompts, two arms, fixed balanced pair order, identical current0.1.10 package except host-only description clause and actual-SDK first-request equivalence checks are coherent for an exploratory direction check.
- Three-request windows can legitimately produce preparation-only episodes. The design preserves preparation/budget limitation rather than converting it to ordinary no-trigger, never automatically buys more calls, and avoids significance or population-quality claims.
-12×3=36 sends and36×1536=55,296 configured output-token ceiling are arithmetically consistent.96KiB is an input-byte limit, not a token/currency promise. Retry/fallback=0 and before-send journal accounting remain required future controls.
- Actual package/SDK/tool context, normal skill discovery, no forced skill/render instructions, frozen BM4 separation, Node24 for all future JS processes and local-only validation remain explicit.
- The next admissible step in the user interaction is presentation of the scenario/budget proposal. Implementation/TDD and paid execution remain behind their separately stated future gates.

## Review activity and limits

Fresh read of all four corrected files plus targeted installed SDK source checks. Shell/source inspection only; no JS/npm/Pi/model process, credential access, network/provider call or user installation/configuration change. Reviewer wrote only this ignored R2 report and preserved R1. No complete test suite or live harness exists or is claimed. Release archive/delta facts are root-supplied and remain subject to the future offline identity checks described in the design.

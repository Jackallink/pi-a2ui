# Spec023 exact live command / one-use grant binding R1 — GO

Reviewed source `05e1517fd266238d4f062aab5bb9cd152f6a50aa`, tree `51cc4016e09adf13ea8c3738161581a0b33c6205`, clean. This binding follows independent R3 final CODE/privacy/cost/authorization-boundary GO and records the existing explicit user authorization. It does not request or create another model budget.

## Decision

**GO to execute exactly the single command below, once, from the exact cwd, against the exact grant and prepared state.** Open binding blockers:0. This is authorization to attempt that one bounded command, not an execution result. Failure/unknown/setup refusal consumes this reviewed attempt; no retry, resume, replacement grant or new invocation is approved, even if no provider POST occurs.

Cwd:

`/Users/jakeliu/.codex/worktrees/pi-a2ui-bm4/pi-a2ui`

Exact command:

```sh
bash /Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-evidence/node24.sh node --import tsx scripts/trigger-smoke.mjs --execute --archive /Users/jakeliu/.codex/worktrees/pi-a2ui-bm4/pi-a2ui/.local/v0110-release-evidence/download/pi-a2ui-0.1.10.tgz --grant /Users/jakeliu/.codex/worktrees/pi-a2ui-bm4/pi-a2ui/.local/trigger-smoke/spec023-20261116-wdo9bd-grant.json > .local/trigger-smoke-implementation/live-once.log 2>&1
```

The output log is an existing **empty, ordinary0600 owned placeholder**, pre-created by the coordinator for private redirection permissions. Independently verified size0, nonsymlink and SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. The exact command may overwrite that empty placeholder once; it is not an existing execution receipt and must not be treated as prior live evidence. Do not delete the grant or create a replacement.

## Exact bound identities

| Artifact | Identity |
| --- | --- |
| Grant file | `/Users/jakeliu/.codex/worktrees/pi-a2ui-bm4/pi-a2ui/.local/trigger-smoke/spec023-20261116-wdo9bd-grant.json` |
| Grant SHA256 | `42569e6c3cc6b69647ae05ea2a31cbed3247156e262401279e39227b806319f4` |
| Grant ID | `spec023-20261116-wdo9bd` |
| Grant filesystem state | Ordinary nonsymlink file,0600; coordinator records exclusive wx creation |
| User authorization | schema smoke-user-grant-v1 / Spec023 / userMessage 授权 / invocations1 |
| Run | `/Users/jakeliu/.codex/worktrees/pi-a2ui-bm4/pi-a2ui/.local/trigger-smoke/run-wdo9bd` |
| Source / tree | `05e1517fd266238d4f062aab5bb9cd152f6a50aa` / `51cc4016e09adf13ea8c3738161581a0b33c6205` |
| R3 final code-review SHA256 | `628ac61b73ef7b9358f96126a819a36711d852392b30e6fce16f9a12c1f8d634` |
| Runtime profile SHA256 | `a2746ccc5af09c397737b0f9f5fea334627500b48fa4bf2daf2558b9d38200a0` |
| Preflight semantic SHA256 | `3c537bf94453f416679ba58e23212c84fa3464387483d4dce9557d2c57063fdd` |
| Preflight raw-file SHA256 | `000b624e6873422504219c7b710b6e7839039336dcca30f3e482a1caaff51dd8` |
| Archive SHA256 | `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55` |
| Node/Pi/locked browser | Node24.18.1 / Pi1.5.0 / Chromium158.0.8127.18 revision1254, as accepted in R3 |
| Node24 wrapper SHA256 | `4d243249bd195d44db901ff1ae164f05e6233c9fc3d2b0d947474916f962565c` |

Prepared capture files remain exactly:

| Capture | SHA256 |
| --- | --- |
| SM02-B.context.json | `24a466de882423e3f0d396efc2169f55678db538593f0270e0c8bb5311eefec9` |
| SM02-B.capture.json | `8d85082afbd5a9629936cb359ab3b5cdee2a3cc5eafce3ea953f1f3f13d964dd` |
| SM01-B.context.json | `b302d8867148d4f183e9f611bf18882c4e7628d158ac1e99e313c4de94c0770d` |
| SM01-B.capture.json | `d8b3b65a365ef37ec37db3d80c3ed5d0ef0718ad341b06d4936bdf5a468381c5` |

## Preconditions independently rechecked

Read-only Python/git/hash inspection verified grant contents and exact SHA, profile/source/tree/current clean state, final R3 report hash, owned ordinary run/marker, preflight semantic identity, all92guarded input hashes, all4capture-file hashes, contexts equality and released archive identity. The reviewed wrapper selects a Node24 PATH and execs the requested command; current accepted exact Node version is also enforced by grant/preflight checks in the reviewed implementation. The wrapper was read/hashed, not executed.

At binding time the specific grant lock, admission.json, terminal.json, live-requests.jsonl, both episode live-started markers and both live receipts are absent. Thus no live admission/claim is present in this prepared run. The coordinator reports this is the sole actual grant and the live command has not run. The reviewer executed no JS/SDK/Node/Pi/browser/model/config/auth/provider/network operation and performed no test rerun. The R3 code-review report was not modified; only this separately requested ignored binding report was written.

## Exact scope and stopping rules

The runtime admits only Ark AgentPlan `volcengine-ark/glm-5.3-flash` at `https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions`, with the approved released0.1.10description and two fixed new natural messages. SM02-B runs first at≤1request; only its exact normal 收到/no-tool pass permits SM01-B≤3. Whole batch≤4, invocations1, serial1. No quota borrowing/refund or additional inference. Per-request native enabled/low/max_completion_tokens1536, max total configured output6144, approved body/response/tool limits and30/42/102/180-second timing contracts remain in force.

Grant-lock acquisition persists and consumes the invocation even before first POST. Any failure, unknown, limit, drift or cleanup error stops the batch; preserve all original receipts/admission lower bounds and not_run rows. Do not rerun/resume/retry/fallback, probe health, use a paid judge, replace grant or rescore old/frozen cases to obtain success. Only owned new resources may be cleaned. No merge/push/release/global update is authorized. Actual success/failure/unknown, usage and expense remain to be observed from the one future run; usage absence must not be called zero cost.

Any source/input/profile/capture/archive/grant/command change invalidates this exact binding and must fail closed; it cannot be interpreted as fresh user budget. Final live-result acceptance is a separate later review.

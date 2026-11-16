# Spec026 independent code / privacy / boundary review R3

**GO — scoped source/code inspection.** R1 negative-execution/sentinel evidence gap and R2 observer child-handle-loss fault are closed. Open P0/P1/P2 blockers:0. Complete fixed-source zero-inference acceptance remains pending; this report is not final validation acceptance or authorization for any real request/grant.

Reviewed clean source `7ee904581982519ebec43c6df6edd671bedc261a`, tree `9dcb065a963076ac167eaa8ca5d12827f2a469f0`, correction base `40cc4d3fb99800d6a28bc16384e80dca1a55bed1`. Date:2026-11-16. HEAD/tree matched and working tree was clean on entry. Five files changed in the correction;166protected hashes still match. Prior R1/R2 NO-GO reports and all failure receipts must remain unchanged.

## Actual review boundary

Read the corrected observer/episode paths,all four new fault tests,Spec/Check trace and saved RED/GREEN evidence. Reviewer executed only a bounded Node24.18.1 in-memory fake-backend/fake-persistence control,no real child or file write. No Pi SDK,helper,browser,configuration,network,provider,live guard or model execution occurred. No source was changed;only this ignored report is written. Saved actual process/SDK evidence below is implementer execution,independently inspected rather than reviewer rerun.

## R2 closure and independent pure result

Before dispatch,the observer persists its attempt state. If that write fails,it records bounded safe code pre_spawn_persist and refuses before calling the backend. Once the backend returns a child,the entire PID/bookkeeping/persistence block is caught;post-spawn observation failure records post_spawn_persist and always returns the exact original child. Pi can therefore install its own timeout/error/tracking/cleanup rather than losing ownership to an audit exception.

Reviewer pure control observed:

```json
{"node":"v24.18.1","memoryOnly":true,"realChildren":0,"fileWrites":0,"rows":[{"phase":"pre","backend":0,"threw":true,"returnedOriginalChild":false,"auditErrors":["pre_spawn_persist"]},{"phase":"post","backend":1,"threw":false,"returnedOriginalChild":true,"auditErrors":["post_spawn_persist"]}]}
```

Audit errors use a deduplicated set of two fixed codes;raw filesystem exception strings are not added to witness metadata. Returning the child does not silently convert audit loss to success:worker tool_result checks auditErrors,sets harnessFailure and stops fatal process_witness_error;finally also retains the snapshot,restores the spawn export and makes any remaining audit error fatal. Actual provider diagnostics and helper execution/exit observation stay separate from this harness outcome. A helper may really have exited successfully while its overall control receipt fails due to missing audit evidence;the code records that distinction rather than inventing a provider error.

Saved targeted evidence is meaningful:

- Pure pre/post RED demonstrates the old forwarding/error-state gap without real children.
- Actual owned long-running fixture helper RED shows the old audit exception replaced the expected Pi timeout;its test finally kills only its owned group,so it is not a claim of a leaked review process.
- Final GREEN4covers fake pre/post identity/dispatch,actual Pi timeout with owned process-group ESRCH,and actual offline worker preload fault restricted to the run's third audit-file write. That worker stops after2synthetic admissions,records fatal/harnessFailure/process_witness_error,retains post_spawn_persist,has0model/0operator-config access,cleanup[] and no remaining helper group/workspace.

The intermediate TS7053 environment typing failure is correctly recorded as type/fixture setup,not behavioral RED. Explicit NodeJS.ProcessEnv typing restores typecheck without changing runtime permissions.

## Retained data/resource and isolation assessment

The observer still forwards normal spawn arguments and actual cwd unchanged,observes only the new helper-adapter owned project and is restored in cleanup. Initial/pre-dispatch file failures cannot start a child;post-dispatch audit failures preserve the child handle and fail the receipt. If initial observer creation fails,the episode's setup failure path runs without an installed observer/child. If backend spawn itself fails,the original exception remains a tool failure under existing SDK handling. The reviewed correction does not widen execution capability or replace Pi's child manager.

R1 evidence remains closed:run-absolute sentinels survive workspace cleanup;positive detector and normal direct/prefix helper runs prove the same actual spawn witness works;illegal whole commands have persisted0attempts/0PIDs;canonical plan command hashes match actual shell-command hashes. Raw assistant/provider history remains original,not the canonical execution string.

Finite lexer/full-string validation,trusted Node/helper/cwd/op/args,POSIX argument quoting,real Pi-bash execution semantics and old helperCall/safety branch remain unchanged. Only the permanent offline ID opts into parsing/instrumentation;paid CLI/grant/worker guards do not accept that ID. The four archive/capture helpers retain defaultPAIR and known-ID checks,with no relaxation of paid authority. Model native reasoning/signature projection remains excluded;new error metadata is fixed safe codes only.

The original6/session/12episode synthetic admissions,12tool intents,one check/render,30s request/150s active/180s total worker/420s batch and owned cleanup bounds remain. Normal captures/episode journals,actual helper execution,candidate grade,UI and harness audit validity must remain separately described in final evidence. Products/lock/two archives,old raw/consumed grant/locks and protected old runtime remain preserved;only the three already approved shared private files may change. No old21 reuse or frozen rescore is possible under this GO.

## Pending final acceptance

Supply this exact clean source's complete local Node/type/four-browser/strict-union checks,normal new offline CLI with actual C/G helper/DOM/process witness/source-history evidence,full identity/input/preservation hashes and early-live refusal/cleanup canaries. Earlier40cc602/602 is historical NO-GO evidence,not this candidate's acceptance. Targeted GREEN4also does not substitute for the full fixed-source package.

After final zero-inference/code/privacy/boundary acceptance,only a separately scoped new scenario/budget design may proceed under the user's stated workflow. The helper-invocation-offline-1 ID remains permanently offline;this GO does not authorize a live flag,real grant,model call,new paid profile,old21remainder,product change,merge,push,release or global installation.

## Saved targeted-log SHA-256

| Log (under .local/helper-adapter-implementation) | SHA-256 |
| --- | --- |
| `observer-fault-red.log` | `cfcf711de2d1e5aba356516ad80b58cb4a66c6a3d01d09428953c183609420e9` |
| `observer-cleanup-red.log` | `53e5c5709c4c89e0ff29cee7f2dbd4787a7d890a2dc72104944d7609f19cfe31` |
| `observer-fault-final-green.log` | `440948b243775505ad2134269706f5cbd76994f3a66bce861c8af163a39f74dd` |

## Corrected-file SHA-256

| File | SHA-256 |
| --- | --- |
| `docs/checks/126-helper-invocation-adapter-zero.md` | `69dad17fcf115fb015f034fe41bb45945344b7b32754eb6fd11cc50e1becfd11` |
| `docs/specs/026-helper-invocation-adapter.md` | `a1f5a09053da477f1a6884715219331a3aee7991bcf17f863dfea2956aad6c6c` |
| `tests/helper-adapter-faults.test.ts` | `c3248c215ac80fa016877e72bdf62ae0beff47b20684bd6280c886ddb6af637c` |
| `tests/helper-adapter/process-witness.ts` | `3af4a75d2cb2fec21862bca65789a11d842867179165be936f1b471a885772db` |
| `tests/trigger-pilot/episode.ts` | `a990e09c282592fad1cd8d76928df2057c9e1c3a1bff1e5179a9b8f139ab350f` |

# Independent A02 code review — R1

2026-11-14. Fixed source **`250508c623dc55296d426dd76fd9559102ecceab`**, design baseline25ab3c3. **NO-GO: 0 P0 / 4 P1 / 2 P2.** Scope: spec011 A02, Check053, six acceptance scripts and tests/acceptance.test.ts. Concurrent A03 README/skill/package/test edits are excluded from this source verdict. No016 real-GLM acceptance is claimed.

## P1-1 — coding scenario executes its actual test child in the operator cwd

Location: `scripts/component-acceptance.mjs:21-28`, especially26; the later runtime check at181 cannot see a child that never received the probe environment.

runComponent receives the owned cwd, but coding's spawnSync supplies only encoding. Node therefore inherits the orchestrator's original process.cwd and process environment rather than the admitted workspace/runtimeEnv. It is an actual Node24 child outside the NEW owned run, and its absence from child-runtime.jsonl lets the later summary still report allCwdWithinOwnedRun=true for only the observed processes. This violates spec011:29 and the R2 common child-cwd/probe contract.

Independent offline observation: instrumented only the newly generated private arithmetic fixture to write its actual cwd/version, executed the real child and then deliberately stopped the function before any Pi process/model could start. The child reported Node v24.18.1 with the operator/archive cwd, not the supplied separate owned fixture. The main worktree was not edited.

Minimum correction: execute the coding test through the common bounded Node runner with explicit owned cwd/runtimeEnv, record its real probe and include it in runtime verification. Add a test for this existing component coding path, not merely a synthetic generic runner cwd test.

## P1-2 — skill acceptance can certify an acknowledgement of constants instead of the exact submitted context

Locations: `scripts/skill-acceptance.mjs:119-125`, `133-158`.

The model-authored snapshot checks rules/guarded Button presence but does not require that Button's Event.context be exactly name/accept direct bindings to the identified inputs. The browser records POSTs as true rather than retaining/validating their structured context. The acknowledgement is checked only against hardcoded Ada/true, with no comparison to the actual action message.

A valid compiler/session counterexample has literal name:"Ada" and accept:true plus actualName/actualAccept bound to the two ruled inputs. It passes the current render-side control/rule checks and the real server accepts a four-key action context because the guard covers the two bound aliases. An assistant returning only the two constant fields then satisfies the current acknowledgement predicate although it is not the exact action.context. This is a false-green route for the central typed-roundtrip acceptance claim.

Independent offline observation: compiled that legal literal-plus-alias source and dispatched it through a private UiSession. It sent one four-key context [name,accept,actualName,actualAccept]; the current two-key acknowledgement predicate accepts {name:"Ada",accept:true}. No model/browser inference or forged product change was used.

Minimum correction: validate the committed Button's exact context keyset and direct paths against the selected TextField/CheckBox; validate the real POST and resulting RPC user-message envelope/context/source/event/identity and compare the assistant JSON to that observed context. Add literal/alias/extra-key/wrong-source counterexamples. Keep request counters, but do not use them as a substitute for context identity.

## P1-3 — a never-settling cleanup prevents all later cleanup attempts and final evidence

Locations: `scripts/acceptance-support.mjs:278-290`; callers `scripts/skill-acceptance.mjs:173-207` and `scripts/component-acceptance.mjs:174-190`.

cleanupOwned catches rejected tasks but awaits every task without a deadline. If browser.close never settles, it never reaches Pi termination, listener verification, private registration removal/runtime checks or final report persistence. The existing real-child/socket test covers a thrown browser error, not a hanging browser operation, so it does not prove the stated all-attempt cleanup/failure contract.

Independent offline observation: a controlled first cleanup returned a deliberately never-resolving Promise. After a200ms observation bound, the next Pi-cleanup marker had never run; the cleanup Promise had not completed. This is a deterministic missing-deadline counterexample, not a claim that an actual browser happened to hang in this review.

Minimum correction: bound each owned cleanup task, record timeout as failure, continue every remaining cleanup and preserve the first failure. Cover never-settling cleanup as well as rejection, and apply bounded ownership handling at resource preflight/close boundaries too. Do not claim success merely because remaining cleanup proceeded.

## P1-4 — an evidence parent inside package payload mutates the read-only target before rejection

Locations: `scripts/live-acceptance.mjs:14-18`; `scripts/acceptance-support.mjs:151-152` and135-147.

The entry fingerprints the package, then creates the run and its report under arbitrary --evidence-dir without checking overlap with the admitted target. Passing PACKAGE/src causes new files to be written into a declared package payload directory before helper identity validation notices the changed fingerprint. Reporting preservation=false afterwards does not undo or prevent this violation of the read-only target contract.

Independent offline observation used only a newly created private package fixture: its helper returned a fixed catalog and no Pi/model was started. With --evidence-dir PACKAGE/src the entry created a run/result.json inside src, then failed helper-identity with "Package changed during read-only helper validation" and observed.packagePayloadUnchanged=false. This demonstrates actual target mutation, not a hypothetical fingerprint mismatch. A first observer assertion encountered the macOS /var versus /private/var alias; canonicalization corrected that diagnostic oracle. That observer issue is not counted as behavioral RED.

Minimum correction: canonicalize the requested destination through the nearest existing ancestor before mkdir/mkdtemp, reject a parent inside the package/read-only resource tree or protected operator .pi/manifest/lock/sentinel paths, and cover missing subpaths/symlink aliases. An explicitly selected NEW owned receipt directory under an otherwise ordinary operator project can remain allowed: --evidence-dir already authorizes that new directory; existing protected files/registrations must remain unchanged. Clarify this precise read-only meaning rather than forbidding an entire operator tree unnecessarily.

## P2-1 — unexpected failure cause has no actual private diagnostic

Location: `scripts/acceptance-support.mjs:162-168`; skill failure handling at163-170 and197-207.

Ordinary Error/Playwright exceptions are replaced with "Acceptance stage failed; inspect private diagnostics", but StageReport writes no private original cause. Skill mode also does not persist that exception, only RPC streams and pageerror events, which need not contain a locator/metadata failure. Stage and failed status survive, so this is diagnostic loss rather than a false successful result, but the promised inspectable original failure does not exist.

Independent controlled Error experiment left only result.json in the private report directory; the original nonsecret cause marker was absent. Preserve a bounded, appropriately sanitized private cause/stack record while keeping stdout/stderr summary generic and bootstrap/auth values excluded. Test an ordinary Error, not only a known AcceptanceError whose fixed message is already safe.

## P2-2 — relative package paths are accepted despite ABS_PATH admission contract

Locations: `scripts/acceptance-support.mjs:36-49,109-113`.

parseOptions accepts --package . and admitPackage resolves it against process.cwd instead of requiring an absolute explicit path. The actual realpath/version is still recorded, so this does not recreate the implicit010 fallback, but it violates the frozen entry contract and permits cwd-dependent recipes. Reject relative package paths before fixture/Pi work and add the corresponding usage test. Independent pure parse under Node24 returned packagePath:".".

## Independently verified sound behavior

The entry has a real Node24-first guard before SDK/browser workers, explicit version/name/files, no implicit old010 target, model opt-in and exact resolved provider/id/baseUrl preflight. Legacy A2UI_ACCEPT_* values are rejected without printing their values. Startup uses a private dummy-agent profile, real project-local registration and normal command/skill source discovery, status only, no generation, owned removal and no model/browser success claim. Skill mode remains explicitly labeled and separate from normal registration. Five component scenarios are retained and labeled supplied DSL. RPC content normalization, successful exact preflight-before-render ordering, bounds, first known failed stage and rejection-based cleanup continuation are useful improvements. These strengths do not close the counterexamples above.

## Execution evidence and boundaries

- Verified original HEAD250508c before concurrent A03 work. Prepared a private git archive of **that exact commit**, with only a symlink to the already existing dependency tree; installed nothing. This avoids treating dirty016 metadata/docs as the fixed015 A02 package. Snapshot identity/path record: `.local/v016-evidence/a02-review-source.json`.
- Used the existing private Node24 wrapper via bash plus an actual-major assertion. Observed Node **v24.18.1**; no default/runtime switch to another major.
- Independently ran the frozen **13/13 offline tests**, including a real private no-model normal Pi startup, dummy metadata and registration cleanup. These pass and are not a complete behavior proof of the additional cases above.
- Ran only the private controlled diagnostics described above: real coding child before Pi startup, real compile/session literal-alias counterexample, never-settling cleanup, ordinary Error receipt, pure relative-path parse and fake-package evidence-location failure. No actual model request, credential/config copy, real-user/global registration change or remote write. Temporary fixtures remain private; main source/product/docs were not edited.
- One initial diagnostic import typo was a reviewer setup failure and was corrected; it is not behavioral RED. Check053's existing alias/harness failure history remains unchanged. No016 actual GLM/browser roundtrip or production-install acceptance is claimed. Root's separate A03 packaging attempts/regression and invalid development-tree production evidence are outside this source verdict.

Root has already acknowledged the principal findings and is correcting them in successor work. This R1 intentionally pins250508c; a new exact candidate with targeted RED→GREEN and fixed-source code review is required before A02 GO and before its separately admitted actual GLM integration run.

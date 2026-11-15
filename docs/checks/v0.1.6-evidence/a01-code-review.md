# v0.1.6 A01 independent code review R1

**NO-GO at the exact candidate. 0 P0,1 P1,0 P2.**

Candidate `bc224c6e83e71c6d16775fbdd953674b73388854`, admission base `77080b0`, worktree `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. Scope: A01/spec011 AC001–003, Check051; named component metadata/project notes, typed compiler/error guidance, unchanged runtime policies and prebuilt parity. A02 not implemented/accepted here.

## P1 F-01 — DateTimeInput required flags are falsely optional in authoring metadata

`src/authoring-policy.ts:10–12` derives required from property.isOptional() and overrides only the six input value parameters. The existing project validator also requires both DateTimeInput.enableDate and enableTime to be explicitly present booleans and at least one true (`src/inputs.ts:66–67`). The SDK marks these fields optional, so the returned authoring contract contradicts project requirements despite the notes' explicit-flags sentence.

Independent real helper query at this candidate returned `{name:"enableDate",required:false}` and `{name:"enableTime",required:false}`. Direct calls to the actual compiler rejected `root=DateTimeInput(value="")` and `root=DateTimeInput(value="2026-11-14",enableDate=true)` with “Date/time flags must be explicit and enable at least one input”. Adding enableTime=false to the date case passed. The metadata directs a model to omit arguments whose omission is guaranteed to fail, reproducing the SDK-optional-vs-project-required mismatch that this feature specifically fixes for TextField.value.

Minimal correction: set required=true for these two already-required DateTimeInput arguments in authoring metadata only, preserve the existing runtime validator/schema, and add real helper assertions plus missing-both/missing-one compiler counterexamples and the valid explicit pair. This is within AC-001's frozen metadata/project-overlay consistency requirement, not a new policy or feature gate.

## Other contract assessment

All32 top-level authoring parameter lists were inspected. Text.text/Icon.name are already correctly marked required and actual missing arguments reject; native LogView/TaskProgress/ActivityTimeline.stream is correctly optional and actual omitted-stream constructors pass using the default. No second same-class mandatory-presence gap found.

Project notes/reference/examples cover all32types, exclude raw SDK prose/positional signatures and native writable fields, and preserve literal Text/static layouts/Event authority/opaque artifacts/local dates/finite bounds/reported-vs-native semantics. References provide nested structures and detailed resource limits. Literal input initialization remains supported for existing types; SearchablePicker keeps its existing binding requirement. No extra binding-only/runtime validator was added.

Known typed SDK causes are found through a bounded8-level/cycle-safe public Error.cause chain; unknown property/missing required messages rebuild allowed authoring names and real locations instead of reusing raw checks advice. Unknown names/causes remain generic or actual-name hints, without regex-derived claims. No forbidden property membership/@path change appears; Icon constant extraction retains the exact12values and frozen schemas/actions/budgets.

Old success envelopes/raw source/exit semantics and source-file/stdin UTF8/BOM/CRLF/bounds handling remain preserved. Additive structured failures write stderr and no stdout. No model/render/browser/OS/installation path is introduced by the helper query.

## Independent validation

- Supplied Node24 wrapper: `tests/authoring-cli.test.ts tests/skill.test.ts tests/skill-patterns.test.ts` **16/16 passed**,0fail/skipped/cancelled (final7A01+9existing tests). These pass while omitting the flagged DateTimeInput metadata case.
- Additional direct actual32metadata audit and Text/Icon/native-stream/compiler/date counterexamples above; no product writes.
- Working-tree `tsc --noEmit`: exit0; root began R2 edits during final review, so candidate-pinned typecheck authority remains the independently hash-checked Check051 receipt rather than relabeling this potentially dirty check as exact-R1 evidence.
- Exact in-memory esbuild write:false using production options and33source/config files copied from git-show bc224c6 into an ignored parity tree matches both committed bundles: client SHA256 `828e361f691d58aec2a00576a6ff918aa8811f4c13a7e6e07a3f5184872f53b9`; helper `ee98c278f89aca74f0256ec928d8bfab29e1a2da106d5d958bd617afc3ebbe20`.
- All4 Check051 raw evidence hashes match. Read root full log173/173 pass; this is verified root execution evidence, not this reviewer's full-suite rerun. Earlier5RED/1compatibility pass remains historical root evidence, not an independently rerun RED here. This review independently reproduced the new untested metadata contradiction.

The initial working-tree helper parity observation raced the coordinator's R2 edits and was discarded. The33-file committed-source reconstruction above and git-show artifact bytes were used for the corrected exact-R1 parity claim; no R1/R2 bundles are conflated.

## Boundary

Fix F-01 on a new exact SHA and obtain fresh bounded review before A02 implementation progression. No claim of whole016/browser/normal production consumer/actual GLM/merge/release success. Reviewer wrote only this ignored report and the ignored committed-source parity copy; no product/installed-global015/credential/session/tag/remote mutation or model inference occurred. Source identity remains the fixed candidate; later root test preparation is excluded.

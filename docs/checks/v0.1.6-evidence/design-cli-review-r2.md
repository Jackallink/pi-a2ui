# v0.1.6 A01/A03 independent design review R2

**Design GO for this exact revision. 0 open P0,0 open P1,0 open P2. R1 F-01 closed1/1.**

R2 SHA `25ab3c3a8a825306fe8594d258051e79b8eb8db5`, prior R1 `8f7e975691cacd8a3af810bc490d9fd3a1b268ef`; branch `codex/v0.1.6-skill-cli`, worktree `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. Reviewed exact committed diff of spec011, plan011 and all three walkthroughs. R1 report preserved at `.local/v016-evidence/design-cli-review.md`.

## R1 closure

Spec011 lines17–23 replace the misleading checks-only generated prose with an explicitly named-only authoring contract: ordered {name,required} parameters derive from the real public ComponentApi/Zod shape, unsupported shapes fail closed, raw SDK prose/JSON schemas/positional signatures are not emitted, and existing runtime schemas remain unchanged. This avoids both the discovered semantic contradictions and positional index misrepresentation from omitted properties.

The project overlay now explicitly covers all32types with notes/reference/examples. Native ActivityTimeline/TaskProgress/LogView expose only stream for authoring, without inviting native-state/counter fabrication. Literal Text, static List/layout trees, Event-only action/context/binding rules, explicit local date/flags/bounds, registered opaque artifacts, bounded local Icon/Modal behavior and remaining constrained components are named. The query remains metadata plus executable examples and actual check/tool authority, not a second validator. AC-001/IT-001 and the technical trace now require semantic adversarial coverage rather than only absence of checks. This closes F-01's root cause.

Typed diagnostics resolve bounded/cycle-safe public Error.cause chains, including the observed A2uiCompilationValidationError→ExpressUnknownPropertyError wrapper, reconstruct effective project allowedProperties/error text and preserve real public location fields. They do not append original raw help that advertises forbidden keys. Existing error:string/status consumers, success envelopes/source bytes/exits and @path policy remain frozen. No additional public API or authorization change is introduced by the correction.

## Other design assessment

A03 retains known task→example→adapt→check→tool as the short path, with component lookup only for unknown parameters and progressive references for uncertainty/errors. All19templates/8patterns and the inline form/routes remain required; doctor/config scanning, automatic repair/retry and general cost/success-rate claims stay out of scope.

The added A02 all-mode owned cwd/env constraints are consistent with the prior scope: model/helper/generated-source/fixture writes remain in a new owned run; operator/package targets stay read-only, legacy env cannot override admitted identity/mode/tuple and actual child cwd/sentinel checks are specified. This review confirms design consistency only; the other A02 review and future implementation/consumer evidence remain distinct.

Implementation caution within the existing compatibility contract: six-input value required=true describes required argument presence and safe interactive authoring guidance. It must not become a new compiler rule rejecting previously valid literal initialization for older input types or expanding the Button-descendant rejection policy. SearchablePicker retains its existing absolute-binding requirement. R2 already freezes runtime behavior/no second validator; the future code/tests must honor that boundary.

## Evidence and GO boundary

This R2 work was read-only committed-document review. No product/schema/skill implementation, Node/browser/model acceptance, credential read, install, dependency change or remote write occurred; no new test success is claimed. The R1 public-SDK/existing-compiler counterexamples remain historical evidence motivating the corrected contract. Structural-validator results mentioned by the coordinator are not relabeled as this reviewer's execution.

GO admits the normal recorded design/TDD progression for this exact contract. It is not code/production consumer/actual GLM/merge/publication/release GO. Root remains the implementation owner; published/global015, old tags/assets, original sessions/config/credentials and real-user installation remain outside this work. Only this ignored report was written.

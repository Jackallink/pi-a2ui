# Pi A2UI skill and local authoring helper

Lifecycle: complete for companion implementation and validation (walkthrough/TDD and evidence Check033; merge/release/user install separate). Profile: strict. Scope: companion skill, references, executable examples and read-only preflight for the existing Pi package. User requests component explanations/examples after real model DSL failures. Node24.x only. No release/version bump or real-user installation.

Goal: a model can discover/explicitly load `/skill:pi-a2ui`, adapt a validated form and publish through existing a2ui_render without guessing syntax. Current released catalog has16 types; v0.1.4 candidate has29. References distinguish those capabilities; helper reports the catalog in its own installed package, not the identity of an arbitrary running Pi process.

Non-goals: another renderer/server/RPC/model/provider, automatic repair/retry loops, a general executable CLI, weakening compiler/action/resource checks, changing auto-open work, implementing v0.1.5 components or silently updating a user's installed plugin. User's auto-open branch and untracked data remain untouched.

## Stories and acceptance

| ID | Observable result | Required checks |
| --- | --- | --- |
| S1/P1 | Installing package discovers exactly pi-a2ui skill, entry+references/examples/helper survive pack and production install | actual Pi skill/resource discovery, packed member checks, installed helper with no dev dependencies |
| S2/P1 | User-information form uses Text(text), Card(child), initialized TextField(label,value), comma-separated children and declared Event; source is passed as a single JSON string | real compiler counterexamples and every applicable .express fixture; actual independent GLM skill-forward user story |
| S3/P1 | All16 baseline and13 additional v014 types have signatures, constraints and an executable linked example; no v014 component promised on v013 | catalog/schema probe, all baseline examples compile, optional candidate compatibility proof with actual v014 compiler |
| S4/P1 | Helper `catalog`, `examples`, `example NAME`, `check --surface-id ID FILE_OR_-` is deterministic/offline/read-only; successful check returns exact a2ui_render arguments | subprocess stdout/exit codes, stdin/file/unicode/quotes/sourcebyte bound, invalid DSL/id/component/argument rejection, installed production CLI |
| S5/P1 | Errors lead to specific syntax/feature diagnosis rather than repeated guesses; declaration order is not invented as cause | forward-reference compiler proof; missing-comma and wrong Card child examples; unknown Text label is not treated as proof Text unsupported |
| S6/P1 | Local-model instructions are short; references load by need; Pi keeps rendering/events/credentials | explicit skill command/discovery; real model->skill->tool->browser->context->reply; only existing AgentPlan glm-5.3-flash |

## Technical and error trace

package.json pi.skills + files -> Pi resource discovery -> SKILL.md (minimal form, route table) -> references and examples as needed. Skill script imports prebuilt dist/assistant-cli.mjs; contributor build bundles only local server TS, leaves declared runtime SDK packages external. Consumer needs Node24+normal production deps, no tsx/typescript/esbuild/global binary install or experimental TS flags. Helper invokes the exact same compile function used by a2ui_render; no second grammar/catalog clone. It reads only explicit input, caps32KiB before compiler work, emits JSON tool arguments on success; no publication or actions. `catalog` is local package identity and component list; active-tool description wins if Pi loads a different package. Unknown/missing command exits2; input/validation/unsupported example exits1; success0. No stdout tool payload on failure. Source and surface limits remain existing limits; session aggregate/record/epoch/revision/resource registration are checked later by actual tool, never falsely certified by preflight.

CLI templates are allowlisted manifest entries with required component names. v014 examples refuse on v013, not counted green on that runtime. No static fake resource URL implies a registered artifact: media example is compile-only syntax; actual workflow registers files and substitutes returned src. Subdocs distinguish static preview data from executed evidence. Main skill directs explicit command when automatic selection fails and handles bounded local repair; repeated identical failures stop for runtime/package identity evidence.

## Gate, drift and rollback

Gate1: explicit scope, closed user/technical/error walkthrough above. Gate2: S1-S6 test mapping; screenshot actual failure is behavioral baseline for authoring, package discovery must demonstrate missing skill before additions (not missing-module RED). Add narrow helper tests as executable behavior becomes available. Gate3: source/schema/example/reference parity; no copied SDK grammar. Gate4: scoped plus relevant regression, production package, real skill discovery and authorized GLM forward test; evidence Check033.

Risk: unsupported examples on older installs, template/source escaping, docs drifting from schema. Mitigation: actual compiler preflight, named props, capability gate, pack and consumer tests. Rollback: remove companion files/manifest entry/helper build output; existing extension/renderer and model/credentials unchanged. Existing component and whole-plugin release boundaries stay separate.

# Spec024 independent Gate1 design review R1 — GO

Reviewed clean source `af6d5593980a496140653c9e912d402b89e53228`, tree `2d9be40d834a96d0b8cfa37ca4c602afe0989784`, base `fc558daf252126ee91362f07bab7874d74684d69`. Scope: bounded design only, not implementation, SDK/model compliance or release acceptance.

## Decision

**Gate1 DESIGN GO. Open P0/P1/P2 findings:0.** No correction is required for this design scope. The design is sufficiently minimal, source-grounded and testable to seek the prescribed written user design confirmation and then Gate2/TDD kickoff. This GO does not substitute for those gates. No implementation, new model invocation, frozen rerun, publication or global installation is authorized here. Current real-model budget0; Spec023's unused2requests remain unavailable.

## Assessment

The problem statement correctly uses Check119 as one observed first-generation failure: the model chose render without reading skill/helper check and produced an unreachable FormValidation Button. It does not infer an absent compiler/CLI feature, a compiler defect or a general model failure rate. Existing skill/example/check flow and component metadata already exist; improving their placement and precision is the current concrete gap.

The selected approach is proportionate: an authoring block before the long existing catalog, a short metadata pointer preserving existing capability/skip guidance, narrowly improved FormValidation notes, and executable examples in existing skill references. No new command/template/manifest/component/receipt state, forced skill preload, runtime prerequisite, automatic source repair or permission change is needed. The proposed AUTHORING block is494UTF8bytes, within its≤1200byte cap; this is not a token or cost guarantee.

The authoring instruction applies after UI has value. Proactive triggering and pure-text/simple-confirmation skip remain. Skill already present in context need not be reread; known examples avoid a mandatory catalog/pattern tour. Final source is checked after adaptation, and helper output is passed unchanged. Missing read/helper capability leads to honest prose guidance without lowering sandbox permissions or inventing successful checks. These are model-side suggestions only: existing valid direct render/API use remains compatible and the execute handler does not acquire a receipt gate. Model adherence and input/preparation costs remain unknown.

## IDs, bindings, example and error contract

The design accurately separates display labels, input/Button component IDs, absolute value-binding paths and Event.context keys. FormValidation.buttons contains reachable Button **ID strings**, not a nested component slot. rules.fieldId names a reachable bound input **component ID**, not its$/data path. The validator, fields and button still belong to the root tree, and each guarded Event directly covers every ruled input path. This matches the current form-validation schema, compiler topology checks and guarded-path validation.

The canonical three-field source explicitly initializes three strings, declares named input/Button/validator components, includes them in root.children and directly binds application/environment/version into the information-collection event. Required empty drafts can compile/render while their invalid submit is blocked under existing semantics. The information-collection button neither deploys nor grants deployment authorization. A checkbox is not introduced as a mandatory form requirement.

The positive probe's stdout is valid JSON and its source matches the canonical fenced example byte-for-byte, SHA256 `e0a54c4322d7da6d218b934fb2c43a299dd741e584136714b1927e5c733021ab`. The supplied existing-helper receipt reports exit0 and only surfaceId/source. The negative probe reports exit1, empty stdout and valid stderr JSON code COMPILE for an orphan; this is existing rejection behavior, **not a new compiler-repair RED or model-improvement result**. Only the observed first diagnostic is explained, without promising the remaining source is valid after one repair. The review did not rerun either probe or inspect absent negative-source bytes beyond the supplied hash/error receipt.

## Testability and fixture maintenance

AC001–007 and the three walkthroughs close the user/technical/integration/error paths at design level. The test intents cover actual registered metadata placement and independent semantics; unchanged CLI shape/required flags/reference/examples; executable recipes and exact source bytes; different cwd/space paths and existing-file sentinels; separate negative/input/compiler errors; direct API compatibility; helper→real candidate tool→owned DOM synthetic integration; generated helper/package discovery; and fixed-source full local checks. New negative snippets must remain explicitly negative rather than being fed into a generic positive-doc compiler test. Expected outcomes come from these AC/contracts, not a full-string mirror of the proposed English block.

Gate2 must distinguish changed documentation/metadata-contract RED from existing compiler rejections and setup/import/type failures. Product-source notes require the existing build's generated dist/assistant-cli.mjs; successful TS/source edits alone do not prove installed-helper behavior. Normal candidate package/startup/skill discovery and actual helper output remain necessary alongside full Node/type/four browser groups/compatible golden union. Only synthetic provider transport is allowed; this design does not start a new model evaluation.

The identified SMG07 maintenance is necessary and implementable. Its current fake repository copies current candidate payload but the real execute CLI validates the immutable0.1.10archive against that fixture's payload. A future description/helper change would therefore make the intended valid race winner fail at archive comparison before its spawn witness. The proposed fix confines the change to the owned fake repository: validate/use the already checked0.1.10archive, populate its76payload bytes there, retain the current actual private guard/entry code, then create the synthetic git/source/input identities from those actual mixed fixture bytes. It must continue proving legitimate negative/positive witnesses and exactly one real-CLI race winner before trusting refusal variants. No real validateArchive weakening, old profile/capture/live-grant re-signing, hidden network fetch or product-acceptance claim may result. The candidate product's changed guidance/helper must be tested separately by AF03/05/07. Missing archive remains a setup failure.

## Evidence actually verified

- Exact HEAD/tree/base and clean status; the base-to-head delta is exactly7new docs files, no production/runtime/skill/dist modification.
- All6design document hashes match the probe receipt; supplied positive/stdout and negative/stderr parse as valid JSON; positive canonical source identity matches.
- Current manifest has19templates/8patterns; component metadata defines32notes entries. No new catalog/CLI platform is required.
- Independently rehashed all92previous protected runtime inputs,76production files,14latest live raw/evidence files and8old raw/frozen/export files. All original identities remain intact; no raw reasoning/config contents were read.
- Read relevant extension/CLI/compiler/form-validation/skill/reference/test sources to check the proposed boundary and fixture gap. Diff whitespace check passes.

This reviewer performed only read-only shell/Python/git/hash inspection. No JS/SDK/Node/Pi/helper/config/auth/provider/network/browser execution and no test rerun occurred. Existing Node24design probes are supplied evidence, not tests run by this reviewer. Prospective AF tests, implementation acceptance, model adherence/cost improvement and release remain uncompleted. Only this requested ignored review file was written.

## Scope of next permitted decision

The coordinator may record this Gate1 GO and ask for the design's required written user confirmation; after that, Gate2 must approve the bounded tests before implementation. There is no authority here to expand into forced preload, a new CLI/API platform, compiler changes, runtime authoring receipts, model traffic or a release. Any later model study requires a fresh explicit candidate/scenario/budget/stop-rule design and authorization. No additional evidence or policy change is needed merely to finish this design checkpoint.

## Reviewed fingerprints

| File | SHA256 |
| --- | --- |
| `docs/specs/024-authoring-first-use.md` | `142e89636d54285fc2048796b1b4b91829162ae0ebf020f431350f81a8395650` |
| `docs/plans/024-authoring-first-use.md` | `d9890aa951389614a5de2db39cb4c2b04e8e0a0664a3c1a63c3ae5bdfcc652c3` |
| `docs/walkthrough/authoring-first-use/01-round1-user-stories.md` | `d3162f1c6b052bd437ea0ab975634262534f19751a7fc421ad4a8d837df6b086` |
| `docs/walkthrough/authoring-first-use/02-round2-technical-trace.md` | `027353a9f28bc3ff6f4f694098395215bdbf5c433397cf36bdf333e2aaf31015` |
| `docs/walkthrough/authoring-first-use/03-round3-integration-check.md` | `5aed82b1ee630d14ae5597cc23d9c0ae2e5246128770ca2993277f2decc90419` |
| `docs/checks/120-authoring-first-use-design.md` | `34768b5e4560324a95c955e6b0d3d4efb67cf25cb73399bdcaaf5fec3c09ea9b` |
| `docs/checks/authoring-first-use-design/design-probes.json` | `6c5c9d4a11fabf57ffe1ece571795327b4fcb0f6dabdf601b0bd08c6017f8bd6` |
| `extension.ts` | `f7ae0f3ba512de286c616d548c755ad5dd59dac9a424c12005b263ac6a2274c2` |
| `src/compiler.ts` | `c6b6dd6c61443a09801599dd130e4fc813d0115ad7a57632c609a6f23efd1ec2` |
| `src/interactions.ts` | `2221b36bcf6595d62b978353a47d86f1c2bc52b9ed4acfd5f59b98972ba50e7c` |
| `src/assistant-guidance.ts` | `c85d75d9e6d5394cd5693ee254e772edc41ba0097791629634432b6120551f07` |
| `src/assistant-cli.ts` | `f18afd5314063f6af2cad2b679d54dd2edc454c5ec99c8cf1fa0d74eb54bd091` |
| `skills/pi-a2ui/SKILL.md` | `b611a96a8ebd74f19d5b85fec72e5a5c53fc32bc8282e92a0186ab0bd5616800` |
| `skills/pi-a2ui/examples/validated-form.express` | `c2ee3fc58ef9b5a720d82787c6d167ab917bb2bd78ba7b2c728952ec238ae4ed` |
| `skills/pi-a2ui/examples/manifest.json` | `01e11042217378f07fd4dc2dea903df9466dd2c8f37adebdb159af7bc872e251` |
| `skills/pi-a2ui/references/summaries-and-feedback.md` | `ec72b33adb720fc0ef09567172527948e4ebcbccb4a767805929923e75bb178b` |
| `skills/pi-a2ui/references/syntax-and-errors.md` | `c8f522d888425369f0cce8c8d3baa8c7affbc6ccedff40f36a50b15032938b79` |
| `skills/pi-a2ui/references/helper.md` | `7c382ef08efd130e9e9bd767fa32317a5752dfbcc8598cbf4fa1b3b578841777` |
| `tests/skill-docs.test.ts` | `eb2567fcafe9490cd3791f712acff228ea0043f9d401fe6231ed997f31253a96` |
| `tests/authoring-cli.test.ts` | `465b149e68ac9c601056c415e608127d3d99c44cfc275093a56a2f862dc617e8` |
| `tests/extension.test.ts` | `9ee54217b07ebc388f79e42e6b7d7619f64a8655db48662ec9768ab5fbeb3aec` |
| `tests/trigger-smoke-authority.test.ts` | `377a24ce2165eacb3d0eb3651bda959284dbbdd5c869548c19fd0abb5f11a10a` |

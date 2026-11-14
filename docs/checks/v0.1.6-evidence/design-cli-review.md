# v0.1.6 A01/A03 independent design review R1

**NO-GO at the exact draft. 0 P0,1 P1,0 P2.**

Fixed SHA `8f7e975691cacd8a3af810bc490d9fd3a1b268ef`, branch `codex/v0.1.6-skill-cli`, worktree `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. Reviewed spec011, plan011 and all three v0.1.6 walkthrough rounds, existing helper/compiler/catalog/skill behavior and pinned public SDK exports/generator/error source. Primary focus A01 component query/project diagnostics and A03 progressive authoring; A02 remains a separately reviewed implementation/evidence tier, not an extra gate invented here.

## P1 F-01 — checks-only SDK projection is not the actual project authoring contract

Spec011:17 sets display-catalog instructions='' and only omits top-level checks, then keeps generated component signatures/details. Lines19 and Round1 AC-001(line19) mainly require32queries with no accepted checks. This does not satisfy US-001's actual allowed arguments: important project restrictions are outside the SDK/Zod shape or contradict SDK descriptions. The existing catalog instructions/post-schema validation enforce them, but the proposed query discards those instructions. Generic restrictions about functions/checks/templates and “run check” do not remove mutually contradictory component advice.

Read-only Node24 probe used only public ExpressPromptGenerator and Catalog.derive, functions=[],instructions='', top-level schema.omit({checks:true}) where present. Observed output at the pinned SDK:

- ActivityTimeline advertises entries/state/omitted and completed/running/etc state choices. TaskProgress similarly exposes writable counters/state. Actual render initializers are native-controlled and forbid non-default values. A direct existing compiler probe `ActivityTimeline(state="completed")` rejected with the server-controlled error.
- List.children explicitly describes a template object as an alternative to fixed children; the project disallows dynamic templates. Omitting the function-signature section does not remove that property description.
- Text.text says simple Markdown is supported; this project's Text renders literal plain text, with MarkdownView separately constrained.
- Image.url is only described as a URL, omitting registered opaque artifact capability requirements; a direct compiler probe of https://example.invalid/x.png rejected. DateTimeInput displays optional flags/ISO8601 min/max without the project-required explicit enabled flags/static local format; the ordinary timezone example without explicit flags rejected.

The probe was in-memory only and used the existing compiler as the independent behavioral oracle; it is not an implementation of component NAME and not a passing new-feature test. No model/credential/install/production modification occurred.

### Minimal correction within A01's existing scope

Freeze an explicit project overlay for the returned component guidance, in addition to the SDK-generated shape. Reuse authoritative existing project constraints/reference routes; do not copy hand-maintained parameter signatures or alter runtime schemas. For known contradictions, either remove display-only non-authorable fields/descriptions or label the correct initializer/behavior restriction unambiguously next to them. At minimum cover native-only initial fields, literal Text/limited MarkdownView, static child trees, registered artifact URLs, explicit/static local date rules and current binding/action constraints. A typed field existing in a runtime schema must not be presented as freely authorable when only its default is admitted.

Expand the existing AC-001/IT-001 meaning from “checks absent” to “project-valid guidance”: representative positive examples plus existing negative counterexamples above, assert no contradictory Markdown/template/URL/native-state recommendations, and preserve original runtime-schema identities/rejection behavior. The actual check/tool remains authoritative. This adds no component, validator, doctor/config scanner, model provider or new process gate; it closes the intended correctness contract of the already-scoped query.

## Other design conclusions

- Read-only case-sensitive catalog allowlist, one-argument lookup, existing success envelopes/source bytes and exits0/1/2, no stdout on error and no file/module path interpolation are suitably scoped. Same compiler/manifest examples and helper-local identity remain explicit.
- Typed cause preservation is feasible using public SDK APIs. Actual SDK flow wraps ExpressUnknownPropertyError as A2uiCompilationValidationError with the typed original in cause; implementation must traverse that public cause chain rather than assume the immediate UiError.cause is already the property subtype. Public compName/propName/validProps and wrapper line/column allow project reconstruction without regex-authoritative guesses. Do not re-append raw SDK help advertising checks to the error string after filtering only allowedProperties. This is implementation/test guidance already within spec011 line21, not a second blocker or new feature.
- Sharing the currently forbidden property names while preserving @path/other-@ behavior is a reasonable policy refactor; new guidance must not weaken actual parsing/validation or expand permissions. Unknown causes should remain honest generic advice.
- A03 known template→example→adapt→check→tool fast path removes the current mandatory discovery tour while retaining inline form/routes/templates and optional capability/parameter/error references. Screenshot-specific history can be removed without inventing a parser diagnosis. No general success-rate/token-cost result is implied by a single bounded model case; doctor remains deferred.
- A02's default no-model startup, explicit target/version/mode consent, distinct normal-registration vs explicit model profile, exact resolved tuple, owned fixtures/cleanup and durable stage/error receipts are clearly separate evidence tiers. Existing supplied-DSL scenarios remain explicitly labelled component acceptance. No current design finding here broadens those tiers or certifies their future implementation.

## Boundary and decision

Resolve F-01 in the canonical spec/walkthrough at a new exact SHA before A01 implementation admission. Baseline166Node is historical baseline evidence, not016 behavior. This review ran only bounded public-SDK generator/existing compiler probes under the supplied Node24 wrapper with an explicit process-major assertion; no new feature/acceptance/model/production tests were claimed. Only this ignored report was written. Published/global015, credentials, original sessions, old tags/assets and user installation remain untouched. Design GO after correction would still not equal code/consumer/model/merge/release/publication GO.

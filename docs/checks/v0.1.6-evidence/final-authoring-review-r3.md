# v0.1.6 A03 semantic-adaptation correction — independent R3

- **GO for the limited documentation correction. 0 P0 / 0 P1 / 0 P2 findings.**
- Fixed candidate: `a4e8b6add3984065f1d6fae567f8008716e9cc15`; correction base: `c3c4a5d04be97bdd16765be9e9ba489bdae31486`; whole authoring base remains main `3b8947d`.
- Worktree: `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. Prior R1/R2 reports remain separate and source-bound.
- Scope: A03 entry reminder, progressive adaptation reference, executable documentation test, canonical spec clarification and Check057/058. No new model, production-install or browser acceptance was performed by this reviewer.

## Design-to-code closure

`skills/pi-a2ui/SKILL.md:24` now makes the missing distinction explicit at the adaptation step: display label, initialized value path and submitted Event.context key are independent; compare requested keys/types before render, because check cannot know requested semantic names. This addresses the demonstrated adaptation failure without changing the compiler or accepting the wrong key.

`skills/pi-a2ui/references/adapting-templates.md:3–10` explains the concrete Accept-label / `/ok`-path / `accept`-submission mapping. Lines17–22 read the actual original packaged template, adapt only the required source details, remove Cancel and check via stdin. Lines25–29 correctly bound the sed recipe to that packaged template, prohibit blind substitutions/aliases/literal copies and distinguish preflight from fulfilling a user request. The illustrative surface `custom-form` and Submit label are example-specific; the actual acceptance story keeps its existing fixed identifiers and exact requested controls.

`tests/skill-docs.test.ts` executes the documented pipeline and checks the actual compiled guarded form, original-key rejection and unchanged package/project files. Spec011 A03 preserves the strict AC and requires a new corrected-candidate same-story evaluation, rather than retrying the failed source. Check057 retains the original real-model run as FAILED at skill-render, with browser interaction/typed acknowledgement unobserved. Check058 explicitly separates static/document GREEN from model compliance. No false model success or release assertion found.

## Independent evidence

- Supplied Node24 wrapper; `node --import tsx --test tests/skill-docs.test.ts`: **3/3 pass**, no skipped/cancelled tests.
- Separate private probe executed the exact new reference shell block from a cwd containing spaces and through an absolute package alias containing spaces. Exit0, empty stderr, stdout exactly `{surfaceId,source}`, `surfaceId=custom-form`. No new source file was created; existing `form.express` sentinel and packaged original template bytes remained unchanged.
- Independent compilation/guardedForm assertions verified Name at `/name`, Accept at `/ok`, exact submitted `{name:@/name,accept:@/ok}`, one Button with Submit text, and rejection of the unadapted original `{name,ok}` context. The action oracle accepted `{name:'Ada',accept:true}` and rejected both the old `ok` key and string `'true'`. These are pure contract assertions, not real browser submissions or model acknowledgements.
- Independent `tsc --noEmit`: exit0; empty `.local/v016-evidence/final-authoring-review-r3-typecheck.log`.
- Git comparison confirms no changes to `src/`, `dist/`, `scripts/`, original examples, package.json or lockfile since R2. Previously verified source/dist parity therefore remains applicable; no rebuild/full-browser repetition was needed. Check057/058's newly committed historical review receipts do not broaden those older reports' identities.
- Fixed HEAD confirmed before/after checks; only the existing untracked node_modules link was present. Review wrote only ignored evidence and removed its owned temporary probe directory/alias.

## Boundary and next stage

This GO accepts the implemented A03 corrective slice and closes the scoped code/document review gate for making a new candidate artifact. It does not establish whether GLM follows the corrected guidance. The new archive/source-bound run of the same single story and same admitted model remains a separate acceptance stage under the existing authorization and AC, with new owned receipts. Preserve the original failure and do not relax keys, rerun the old candidate automatically, switch models, infer whole-release reliability/cost gains, merge/tag/publish or change the user's installation from this report.

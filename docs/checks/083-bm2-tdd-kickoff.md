# BM2 v2 fixture and TDD admission

2026-11-15. Scope: Spec016 v2, issues51/52; 68 cases (46compiler/15session/7browser;45positive/23negative). User authorizes implementation after fresh independent design/TDD review. Node24.18.1. No model, merge, release or global installation mutation.

Complete drafts are `tests/golden/cases.json` and `tests/golden/fixtures/`; committed fixture manifest is `bm2-design-evidence/fixture-drafts-v2.json`. Fixtures/handwritten expected values precede adapter code. Compiler feasibility probe used actual018 compiler: all32 positive subjects and14 valid controls accepted;14 defective sources rejected at declared status. This is input characterization, not harness RED or proof of semantic oracles. Probe corrected draft reason vocabulary (Forbidden map key / not reachable) and named Tabs children explicitly; no runtime fix.

TDD intent: AC001 registry/path/identity guards; AC002 actual compile and actual CLI plus relevant subject/data/tree values; AC00315 real session paths and HTTP/artifact/controlled timer; AC0047 real browser paths; AC005 detector faults; AC006 compatible source-bound union/pack exclusions; AC007 full type-aware stable local sort; AC008 same-ID retry/collision versus distinct-ID intentional repeat. Spec016 defines deadlines, owned children, asynchronous controllers, cleanup and RED boundaries.

First evaluator RED will use an explicitly constructed new compile-only adapter with complete fixtures. Mutated C04 filename and C25 value remain legal to actual compiler but must fail intended semantic tests. Record baseline source/hash and failing assertions; then implement semantic checks. This does not allege a defect in018 runtime. Negative family mismatch, wrong64count, wrong accepted revision and missing actual POST canaries must fail their proper stage. Setup/timeout/cleanup cannot satisfy a negative case. No automatic expected-data capture or baseline rewrite.

#51 source characterization: null<boolean<number<string; numeric numbers, UTF-16 code-unit strings; stable equal ties including descending. Numeric-looking strings and U+1F600/U+E000 discriminator have literal expected row IDs in B05. No locale/numeric coercion.

#52 source characterization: `acceptAction` already reserves accepted eventIds and canonical fingerprints before dispatch. Identical same-ID retry does not dispatch again; conflicting same-ID rejects409; browser generates new UUID per intentional click, so repeated intent may forward twice with identical JSON (forwarded payload omits eventId). Adopt docB, preserve legitimate repeat actions, require application idempotency/intent verification for ambiguous non-idempotent effects. No runtime/sequence/exactly-once change.

Admission: pending independent review of exact commit plus concrete fixtures. Canonical spec lifecycle remains draft until this review GO; only then walkthrough-approved → tdd-approved → in-progress. Risks/rollback follow Spec016. Plans remain static; execution evidence belongs here and tracker.


## Independent admission outcome

R1 at86c22fc: NO-GO,0P0/3P1/1P2 (independent input/oracle, observable row identity, active counts, literal/diagnostic drift). Original report retained in bm2-tdd-evidence/review-r1.md, SHA2569557d4fb574191ad0913f2e339e4fc87fd5cc50346c9adb7b20a7167b2cbbfcd. Corrections are separate commits eda1439/1628582/ca45a9e/1aefd43.

R2 fixed1aefd439a910f8355f00ed75f0260c802cf767a4: GO,0openP0/P1/P2, bm2-tdd-evidence/review-r2.md SHA256231b2d9b149462aa9342bfd0e5103bc319980a33441ec7886aab56b11d901b89. Lifecycle draft→walkthrough-approved→tdd-approved→in-progress. Root may implement the minimal evaluator and obtain constructed-adapter behavioral RED; no68case/browser/CI pass, BM3/4/model/merge/release claim.

## Constructed evaluator RED and compiler GREEN

Node24.18.1, baseline `33dd94813cd95220ab9ac187f5fbcde4e3f49ba7`: new compile-only adapter receives the frozen case/expected but checks legality alone. Both changed C04 filename and C25 value first compile successfully through the actual owned SDK child. Both intended semantic assertions then fail (`null !== semantic`),2failed/0passed, exit1, preserved `bm2-tdd-evidence/semantic-red.log`. This is behavioral RED for the constructed evaluator, not a runtime018 defect or missing-module/setup failure.

Added handwritten relevant-value/tree/data/diagnostic oracles and actual CLI parity: narrow compiler suite55/55,0skip/cancel;46registered compiler cases plus9registry/semantic controls/canaries. Node24 typecheck passes. Session15/browser7 remain not run; no68/68 claim. Final source-bound evidence follows after complete implementation/review.

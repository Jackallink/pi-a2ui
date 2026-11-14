# v0.1.4 planning walkthrough

State: walkthrough-approved and tdd-approved for W1–W7; independent design GO b4d48d1 (Check024). Canonical scope: ../../specs/007-v0.1.4-usability.md.

## Round1 — User stories and AC

W1–W7 correspond to seven original recommendations. C01–C14 in007 carry user problem, observable result and exact test intent. No low-priority original item is dropped; Video and AudioPlayer are required planning scope. R01–R08 belong to v0.1.5 (spec008, issues19–26).

## Round2 — Technical trace

007's seven paths trace user→render/native event/registered artifact→shared schemas/session authority→browser→existingPi event loop. Copy/filter/open state are local; execution/file access remain owned byPi. Official component registration must include allslot/reference/binding checks. New catalog capability uses matched server/browser schema, preserving legacy snapshots.

## Round3 — Integration/errors and pre-code decisions

Text/layout/state groups need bounded/schema/keyboard/live-draft and lifecycle tests. W6/W7 have explicitD1–D4 gate decisions on authorized source, file changes, resource/cache/range/encoding/CSP and revoke/restore. D1–D4 and test intent were independently admitted at b4d48d1; implementation evidence remains required. Global source/snapshot/client limits stay binding.

## AC→test map and boundaries

Each C row's test intent maps to planned per-slice tests named in plan007; finalRLS-01–04 cover old-snapshot/production-package/Pi/GLM/publication evidence. No behavioral test was executed for unimplemented components. Planning coverage validation only checks omission/links/status integrity; it is not behavioralGREEN, designGO or permission tocode.

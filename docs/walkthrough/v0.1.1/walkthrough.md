# v0.1.1 walkthrough

## Round 1 — Stories and observable acceptance
F-01 checkbox false→true and slider2→7 reach the dispatch JSON with their original types. F-02 multi choice [a,b] and empty/single choice pass; forged IDs, duplicates and multiple values for exclusive choice never dispatch. F-03 valid leap day, empty/date/time/datetime and min/max boundaries pass; invalid calendar/range/type reject atomically. F-04 switch away/back retains the typed draft; unrelated surface and SSE reconnect retain input/model identity. F-05 historical six-widget snapshot restores with new epoch; bad slots/types reject before replacement. F-06 production-only archive loads with Pi1.5 and GLM renders/acknowledges the mixed typed form; listener releases on shutdown.

## Round 2 — Closed technical trace
Pi a2ui_render raw Express → official catalog-derived compiler → validateSurface topology and initialized typed inputs → UiSession atomic revision commit → existing authenticated SSE snapshot → official Lit controls update SDK data model → Button resolves declared context → POST → current epoch/revision/source/event/exact keys → input validator reused for each declared bound path → pi.sendUserMessage followUp. Context literals remain exact. Invalid initialization/action never changes the committed snapshot.

## Round 3 — Integration/errors and AC→tests
F-01/02/03/05 → tests/forms.test.ts deterministic mixed-type dispatch, every rejected adversarial value, atomic restore and slot counterexamples. F-04 → tests/browser.spec.ts actual tab edits/navigation/reconnect plus other-surface update. F-06 → scripts/live-acceptance.mjs version scenario and production archive consumer. Existing tests/session.test.ts, extension/server/browser regressions retain event idempotency, stale revision, resource and permission checks. Required checks: targeted forms tests then build/check/npm test/browser; package install; GLM actual roundtrip. Known upstream audit is not waived or described as green.

## Risk and rollback
The browser remains untrusted. Static constraints cannot be modified through input paths. New typed inputs have unique paths; multiple legacy TextFields may share a string path to preserve v0.1.0 compatibility. A typed input cannot collide with any other input. Restore old version through validation only; rollback uses immutable v0.1.0 package and does not migrate/delete session data. Separate design/TDD review admission and final code review are required; no merge/release/issue closure is implicit.

## Owning SDK evidence
Inspected installed @a2ui/web_core0.15.0 v1_0/schemas/catalogs/basic/catalog.json and universal/basic_catalog/components/{CheckBox,ChoicePicker,Slider,DateTimeInput,Tabs}.js. The published schema declares ChoicePicker value DynamicStringList, mutuallyExclusive/multipleSelection variants; options[].value string; Slider value DynamicNumber and steps divisions; CheckBox DynamicBoolean; Tabs tabs[].child Child. Actual DateTimeInput emits date YYYY-MM-DD, time HH:mm, or combined dateTtime:00; plugin accepts only those local forms with explicit flags and static matching bounds, avoiding timezone normalization. Official Tabs holds activeIndex and mounts the active child's SDK model; browser acceptance verifies drafts survive navigation.

Node24.18.1 baseline: existing44 tests passed. New8 forms tests all failed because the old catalog lacks the requested widgets (behavioral RED); output retained privately under .local/takeover/v011-red-v24.log. Check artifacts, not this plan, record final validation.

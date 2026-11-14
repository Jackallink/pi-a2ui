# Pi A2UI iteration roadmap

Baseline: [v0.1.0 checkpoint](docs/releases/v0.1.0.md). The user approved the version-to-scope mapping on2026-11-13. This document defines scope/dependencies/admission gates; live issue progress belongs in GitHub Issues and validation results in docs/checks.

The user consolidated all three slices into **v0.1.1** on2026-11-14. Former0.1.2/0.1.3 labels are historical development slices, not planned public versions.

| Slice in0.1.1 | Outcome | Canonical feature contract |
| --- | --- | --- |
| Step1 | Typed requirement collection and navigation: CheckBox/ChoicePicker/Slider/DateTimeInput/Tabs/Divider | [Forms/layout](docs/specs/002-v0.1.1-forms-layout.md) |
| Step2 | Read-only CodeDiff and structured TestResults | [Coding components](docs/specs/003-v0.1.2-coding-components.md) |
| Step3 | Bounded LogView and constrained Chart | [Live components](docs/specs/004-v0.1.3-live-data.md) |

Release path:0.1.0 →0.1.1 (all three steps). [Distribution contract](docs/specs/005-v0.1.1-distribution.md) governs Git/local packaging; no npm publication.

## Shared requirements

- Retain Pi as conversation/tool/permission owner. Browser actions express user intent, not direct filesystem/shell authority.
- Preserve epoch/revision isolation, snapshot recovery, atomic failure and bounded payloads/resources.
- Compile and render matching versioned catalog contracts; derive model instructions from the supported contract.
- Preserve old checkpoints; specify snapshot compatibility/rollback before changing catalog or transport shape.
- Use only Agent Plan `glm-5.3-flash` for this project's live acceptance unless the user changes the model/cost instruction. Do not silently substitute another model.
- Keep installable prebuilt assets and relevant tests; do not claim dependency-audit cleanliness while the upstream advisory remains unresolved.
- Each feature slice follows draft ->walkthrough-approved ->tdd-approved ->in-progress ->review-ready ->complete. Mapping approval covers planning; implementation starts after that version's spec/walkthrough/TDD admission and independent review.

## Release admission

For the consolidated version: closed user/technical/error walkthrough, AC-to-test map, meaningful RED/GREEN, independent counterexample review with P0/P1 closed, package install/reload/rollback checks, and the relevant actual-browser/GLM end-to-end case. Record evidence separately from reviewer advice and release/deployment state.

## GitHub delivery tracking

Issues [#1](https://github.com/Jackallink/pi-a2ui/issues/1), [#2](https://github.com/Jackallink/pi-a2ui/issues/2), [#3](https://github.com/Jackallink/pi-a2ui/issues/3) retain the slice acceptance criteria and now target milestonev0.1.1. Issue state owns active delivery; Check records own validation and publication receipts.

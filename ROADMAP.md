# Pi A2UI iteration roadmap

Baseline: [v0.1.0 checkpoint](docs/releases/v0.1.0.md). The user approved the version-to-scope mapping on2026-11-13. This document defines scope/dependencies/admission gates; live issue progress belongs in GitHub Issues and validation results in docs/checks.

| Version | Outcome | Scope | Canonical spec |
| --- | --- | --- | --- |
| 0.1.1 | Richer requirement collection and plan navigation | CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs, Divider; typed bindings/context; slot traversal | [0.1.1](docs/specs/002-v0.1.1-forms-layout.md) |
| 0.1.2 | Review coding proposals and test results in Pi's canvas | Read-only CodeDiff, structured TestResults, versioned Pi catalog and named follow-up actions | [0.1.2](docs/specs/003-v0.1.2-coding-components.md) |
| 0.1.3 | Observe execution and result trends | Bounded incremental LogView and structured Chart with event-driven data | [0.1.3](docs/specs/004-v0.1.3-live-data.md) |

Dependency order: 0.1.0 ->0.1.1 ->0.1.2 ->0.1.3. Milestones/issues track delivery; this roadmap is not permission to skip feature gates or claim planned components exist.

## Shared requirements

- Retain Pi as conversation/tool/permission owner. Browser actions express user intent, not direct filesystem/shell authority.
- Preserve epoch/revision isolation, snapshot recovery, atomic failure and bounded payloads/resources.
- Compile and render matching versioned catalog contracts; derive model instructions from the supported contract.
- Preserve old checkpoints; specify snapshot compatibility/rollback before changing catalog or transport shape.
- Use only Agent Plan `glm-5.3-flash` for this project's live acceptance unless the user changes the model/cost instruction. Do not silently substitute another model.
- Keep installable prebuilt assets and relevant tests; do not claim dependency-audit cleanliness while the upstream advisory remains unresolved.
- Each version follows draft ->walkthrough-approved ->tdd-approved ->in-progress ->review-ready ->complete. Mapping approval covers planning; implementation starts after that version's spec/walkthrough/TDD admission and independent review.

## Release admission

For each version: closed user/technical/error walkthrough, AC-to-test map, meaningful RED/GREEN, independent counterexample review with P0/P1 closed, package install/reload/rollback checks, and the relevant actual-browser/GLM end-to-end case. Record evidence separately from reviewer advice and release/deployment state.

## GitHub delivery tracking

| Version | Milestone | Iteration issue |
| --- | --- | --- |
| 0.1.1 | [v0.1.1](https://github.com/Jackallink/pi-a2ui/milestone/1) | [#1](https://github.com/Jackallink/pi-a2ui/issues/1) |
| 0.1.2 | [v0.1.2](https://github.com/Jackallink/pi-a2ui/milestone/2) | [#2](https://github.com/Jackallink/pi-a2ui/issues/2) |
| 0.1.3 | [v0.1.3](https://github.com/Jackallink/pi-a2ui/milestone/3) | [#3](https://github.com/Jackallink/pi-a2ui/issues/3) |

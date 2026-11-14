# Pi A2UI iteration roadmap

Baseline: [v0.1.0 checkpoint](docs/releases/v0.1.0.md). The user approved the version-to-scope mapping on2026-11-13. This document defines scope/dependencies/admission gates; live issue progress belongs in GitHub Issues and validation results in docs/checks.

The user consolidated all three slices into **v0.1.1** on2026-11-14. Former0.1.2/0.1.3 labels originally described development slices. A subsequent user instruction publishes0.1.3 as a version-alignment checkpoint with the same functionality as0.1.1;0.1.2 remains unpublished.

| Slice in0.1.1 | Outcome | Canonical feature contract |
| --- | --- | --- |
| Step1 | Typed requirement collection and navigation: CheckBox/ChoicePicker/Slider/DateTimeInput/Tabs/Divider | [Forms/layout](docs/specs/002-v0.1.1-forms-layout.md) |
| Step2 | Read-only CodeDiff and structured TestResults | [Coding components](docs/specs/003-v0.1.2-coding-components.md) |
| Step3 | Bounded LogView and constrained Chart | [Live components](docs/specs/004-v0.1.3-live-data.md) |

Release path:0.1.0 →0.1.1 (all three steps) →0.1.3 (version alignment only). [Distribution contract](docs/specs/005-v0.1.1-distribution.md) governs Git/local packaging; no npm publication.

## v0.1.4规划：日常交互与可读性

**范围全部保留，设计门禁见Check024，实现证据见Check025–031；发布单独执行。** 此前七组能力全部保留，低优先级不等于删除；Node24.x only和既有Pi权限/资源边界不变。

| 组 | 必选能力ID | 内容 |
| --- | --- | --- |
| W1 | C01, C02 | List / DataTable：结构化结果浏览 |
| W2 | C03, C04, C05 | CodeBlock / MarkdownView / CopyAction：阅读与复制 |
| W3 | C06 | Details / Accordion：结论与证据分层 |
| W4 | C07, C08 | StatusBadge / TaskProgress：真实状态反馈 |
| W5 | C09, C10 | Modal / Icon：聚焦详情与可扫描状态 |
| W6 | C11, C12 | ArtifactPreview / Image：本地视觉产物预览 |
| W7 | C13, C14 | Video / AudioPlayer：媒体产物回看 |

[canonical spec007](docs/specs/007-v0.1.4-usability.md) · [交付顺序/依赖](docs/plans/007-v0.1.4-components.md) · [走查](docs/walkthrough/v0.1.4/walkthrough.md)。W1/W2/W3优先阅读，W4/W5强化状态/详情，W6/W7完成受审产物与媒体；媒体D1–D4设计门禁未关闭不得开始资源实现。R01–R08全部归入v0.1.5（spec008/issues19–26），不属于v0.1.4范围；当前候选入口见下方v0.1.5。

## Shared requirements

- Current supported runtime is Node 24.x only (`nvm use 24`, `.nvmrc=24`); previous lower-floor statements belong to historical releases.

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

## v0.1.4跟踪入口

[Milestone](https://github.com/Jackallink/pi-a2ui/milestone/4) · [总任务#9](https://github.com/Jackallink/pi-a2ui/issues/9)；七个必选分组issue#10–#16，后续八组扩展在v0.1.5总任务#17登记。候选package身份可为0.1.4，tag/release仍单独执行。

## v0.1.5：八组已纳入能力

用户已将R01–R08全部归入v0.1.5：[spec008](docs/specs/008-v0.1.5-interactions.md)、[milestone5](https://github.com/Jackallink/pi-a2ui/milestone/5)、[总任务#17](https://github.com/Jackallink/pi-a2ui/issues/17)。0.1.4已发布；0.1.5继续按spec008的八组及配套skill/CLI #32推进。活跃进度看issue，验证看Check036及后续，不把规划/单组GO写成整版发布。

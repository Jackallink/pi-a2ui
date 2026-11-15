# DX34/35/38 独立设计与 TDD 意图评审 R1

日期：2026-11-14。**GO：设计门及 TDD kickoff 意图准入。** P0 = 0，P1/Major = 0，P2 = 2（非阻断建议）。用户已授权按34→35→38实施；本 GO 允许在该顺序/范围内编写测试并观察真实行为 RED，之后按既定切片流程最小实现。不是已经取得 RED/GREEN、代码评审 GO、整版验收、merge 或发布 GO。

## 固定评审身份与证据层

仓库 `/Users/jakeliu/.codex/worktrees/pi-a2ui-dx/pi-a2ui`，branch `codex/dx-34-35-38`。唯一设计提交 `e43da13db1422c39bae7c7166170c15d4ec2d758`，其直接父提交核对为 PR44 固定基线 `570b67afe7cec90e37177ac656abef78374ea75f`。两者差异只有以下五份设计文档；审查时工作区文档与固定提交字节一致：

| 提交内文件 | SHA256 |
|---|---|
| docs/plans/013-dx-usability.md | 28e501b1e61ec70896fa94ccbd2962f279b6ff755d86b6a6aed0ac57da826588 |
| docs/specs/013-dx-usability.md | 5a15b5343761d4688c592bb9078303bcb38aa5ceee3d95ee83c4e45eb64a2441 |
| docs/walkthrough/dx-usability/01-round1-user-stories.md | 759b4f02744680d43794d8bb9d1f0a74a0b924dc402aca2f81ddc4268f8b987d |
| docs/walkthrough/dx-usability/02-round2-technical-trace.md | 517df20b9ccbd187959f230f5895db818c1d6d45fcaf4e0f772c1ec709025a7e |
| docs/walkthrough/dx-usability/03-round3-integration-check.md | 479b9d28e70a2e82207798bd28a1e5a5ef5bde25c2316afbaa1d741471cce8aa |

实际执行：固定提交/父提交/五文档身份核对，完整设计阅读，相关 compiler/protocol/inputs/coding/live/workbench/interactions/artifact-store/session/controller/extension/helper 调用链与现有测试的静态阅读。未修改生产、测试、设计文件、Git index/HEAD；只写本评审报告。未运行 Node/npm/新测试/浏览器/Pi/模型/网络请求，未读取或修改真实全局配置/凭据。主任务报告的 Node24 fresh npm ci、baseline199/199、结构 validator 通过是主任务提供的证据，不是本 reviewer 独立重跑；不能当成新功能已通过。

## 设计与测试可证明性

### D1 / #34：真实诊断、归属与活动 root

Spec013:13–21、AC-001–004（41–44行），Plan013:7–13 与三轮追踪闭合。

- 既有 `src/compiler.ts:41–47,73–74` 的递归 forbidden predicate/遍历顺序及 valid absolute `@path` 例外被明确冻结。新文案用 typed `forbiddenKey`，不再把每个同源错误一概提示 FormValidation；`src/assistant-guidance.ts:45–55` 当前的泛化提示正是可由真实 helper subprocess 观察的目标差异。
- owner 只能由 `createSurface.components` 的真实条目建立；嵌套 Event 数据恰好含 `id/component` 不能切换 owner。JSON-pointer path、malformed `@path`、global/dataModel 与 SDK parse 的诚实范围写明；未知上游错误不从名字/正则猜组件 ID。
- 项目自己的 per-component 约束包裹点有真实 owner：inputs 后一个冲突输入、coding 实际错误 Button、live Chart/LogView、workbench table/media/native、interactions FormValidation 等。跨组件规则与现有 schema/迭代/赋值顺序不变是明确验收约束。`src/compiler.ts:209–212` 会先执行 initial validators、再进入 validateSurface；实施必须同时保留该路径，否则编译阶段可能先丢 owner。Plan 的文件范围已覆盖这些入口。
- 真实 coding 规则在 `src/coding.ts:35–55`：先得到当前 CodeDiff/TestResults IDs，再检查所有声明 Button。设计没有将规则缩小为邻近按钮，也没有改变 literal ID 或 typed input/media 验收规则。
- `extension.ts:84` 将实际 `ctx.cwd` 传给 `UiSession.registerArtifact`，再到 ArtifactStore。`src/artifact-store.ts:24–30` 当前先作词法拒绝再 realpath；Spec要求在保持该顺序下附加 lexically resolved 的实际 override root，能用不存在的 root 加绝对输入作判据，不需要新增文件访问或权限。安全回归仍由原 symlink/containment/signature/quota/cancel 路径证明。
- CLI success `{surfaceId,source}`、source bytes、0/1/2、已有粗粒度 error fields 保持，新增诊断不会要求离线 helper 假称在线状态；cause 与 status 保留也明确。SDK line/column/name 是原始证据，不被伪造定位替代。

### D2 / #35：committed/attempted 与失败原子性

Spec013:25–31、AC-005/006（45–46行），Plan013:17–21、Round2:8–9、Round3:8–9 足以定义独立 oracle。

- 当前 `src/session.ts:85–95` 在同名替换后的 next snapshot 上检查容量，再 admit identities、检查 operation、commit；设计维持顺序，纯共享计数器只集中实际组件/ surface 数，不代替其他 byte/native/identity 配额。
- 37+30→67 拒绝且 current37 不变、同名37→30 后加34→64、65组件与第5 surface 是固定数字预期，不是复制当前结果。计数包含编译后的 flat components 和 SDK 生成的 Text；离线单树溢出只报告已知 local count，不虚构全局数。
- `extension.ts:55–75` 是实际成功 consumer；设计要求通过真实注册工具 executor 验证 text 与 additive `details.a2uiUsage`，保留 `a2uiSnapshot`、auto-open/历史恢复语义。没有引入 archive/delete/reset 的新能力。
- failure contract 同时冻结 snapshot/revisions/identities；既有 `tests/coding.test.ts:41–45` 已有 byte 拒绝不得预留 immutable identity 的行为测试。新 aggregate路径宜也以失败后再使用同一新 record ID 的方式覆盖隐藏 ledger，不只比较公开 snapshot（建议，见下）。

### D3 / #38：实际规则知识与包消费者

Spec013:35–37、AC-007/008（47–48行）及 Plan013:25–29 以真实模板/修复例/实际 helper outputs 验证，不要求通过逐行 prose snapshot 固化措辞。19 examples/8 routes/32 components、示例未执行 provenance、summary 现有可见 cases 精确计数及128上限、workspace cwd、64/4与同名替换都明确。没有把 #36 summary166 或 #37 epoch/queue 混入。

source/dist parity、实际 helper consumer、必要 pack 与相关 Chromium 回归列为后续检查；当前只是意图，不代表运行验收。BM1 会另行升级诊断 profile 并走自己的准入，现有 benchmark 草案未被本设计隐式实现。

## P2（非阻断）

### P2-01：给 UiError 上下文合并增加直接测试意图

位置：`docs/specs/013-dx-usability.md:13,41–44`，`docs/plans/013-dx-usability.md:10`。

幂等追加、保留更具体 owner、旧构造器不变、非 UiError 转400并保留 cause 已有明确合同，但计划主要列真实业务错误路径，没有点名这些 helper 自身边界。建议在 dx-diagnostics 测试中直接列：旧 constructor message/status 不变；同一错误定位两次不重复；外层 scope 不覆盖已有 owner/property；UiError413不被降400；普通 Error 的 cause 保留。它们与业务路径互补，可防止多层 catch 都追加或重写状态。当前合同没有缺失，因此不阻断设计/TDD意图 GO。

### P2-02：实施 D2 前在 canonical spec 明确 a2uiUsage 字段形状

位置：`docs/specs/013-dx-usability.md:25–29,46`。

计数语义和 limits 已固定，`details.a2uiUsage` 的具体字段名/嵌套形状尚未列出。建议在 D2 测试前用一个简短对象定义冻结 global counts、limits 和 selected-surface count 的字段，测试从明确合同写 literal oracle；不要由实现对象反推期望。这是 additive输出的局部常规选择，未改变已批准语义或外部限制，不必扩张成新 API 框架。

补充测试建议：AC-005 的 aggregate拒绝后，用未成功提交的 record ID 配不同内容作一次可容纳的后续 render，确认隐藏 identity ledger 未预留；同时保留现有 byte/native/restore checks。公开 snapshot 相等本身不能证明 private ledger 未变。

## 下一阶段与停止边界

没有阻断级设计问题。可以按 D1→D2→D3 推进：针对实际 compiler/helper/ArtifactStore/UiSession/registered executor 先写测试，以旧实现缺诊断/错误指导/缺usage的可观察行为取得 RED；缺模块、fixture、环境或编译错误不得替代行为 RED。每片 GREEN 后执行相关回归/typecheck/build、固定源码身份独立代码评审与纠偏 GO，记录 Check，再进入下一片；本报告不替代这些门。

生产判断变化（forbidden谓词、绑定/typed inputs、coding IDs、media/权限/limits/order、已提交身份/epoch）都属于漂移，应先停在当前片、更新 spec并重新评审。D3保持运行时源码不变。#36/#37/BM2–BM4、新归档能力、merge/tag/npm/global安装/模型调用均不在本报告 GO 内。

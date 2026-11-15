# BM2 oracle / intent review R1 — NO-GO

固定对象：`9e475ee97eab79e3b10cc8d614a506fedbce07e4`，对比构造的 compile-only RED baseline `33dd948`。范围仅 Spec016 v2 的意图、数据独立性、反例真实性与 AC 漂移；CI、pack、进程生命周期由另一评审覆盖。本报告 **0 P0 / 3 P1 / 1 P2**；先修正下列 harness 缺口，再以新固定提交复核。

## Findings

1. **P1 — C22 的扁平文本判据不能证明 Modal slot 意图。** `tests/golden/oracles.ts:16–27` 合并 trigger/content 全部 Text；C22 仅期待 `["Open","Body"]`，并未断言各 slot 的类型/内容。Spec016:60 要求 Text Open trigger / Text Body content。独立 Node24 窄反例：`root = Modal(trigger=Icon(name="help"),content=Column(children=[Text("Open"),Text("Body")]))` 经真实 compiler 接受、实际 CLI 接受，`evaluateCompiler(C22, override)` 却返回 `pass:true, failedStage:null, canary:true`。修复为按 slot 检查手写预期，并保留此 compile-valid wrong-slot detector canary；不必冻结生成 ID 或整份 message bytes。

2. **P1 — capacity 判据与被测生产 guard 共用计数实现。** `tests/golden/oracles.ts:30–33` 直接调用生产 `snapshotUsage`，而 `src/session.ts:49–53` 正用同一函数决定 admission。S03/S05 和 `tests/golden.test.ts:59–63` 的 count canary 因而没有独立测量 raw snapshot 的组件/slot 数，可能把相同计数缺陷当成正确结果。应直接从实际 snapshot arrays 独立计数，比较手写 64/2 等预期，再另核公开 usage（如需），不将生产计数器用作唯一 oracle。

3. **P1 — S04/S07 未完整验证已承诺不变量。** `tests/golden/session.ts:48–51` 的 S04 只接收任意 UiError413，未核 Spec016:98 的 attempted65/current37 与 surfaces2/4/current1/4；`session.ts:59–67` 的 S07 只检查一个 series/sequence 和 revision1，未证明 Spec016:101 的 epoch 不变、仅 series/sequence 改变。独立当前 runtime probe 确认 S04 实际 reason 为 `attempted components 65/64, surfaces 2/4; current components 37/64, surfaces 1/4`，故可据合同增加精确已知事实判据；S07 应比较 pre/post snapshot 与 batch，允许的 delta 仅为已声明 series/dataSequence。为错误 reason 或额外状态变化保留窄 evidence-canary。

4. **P2 — 一部分新 input 字段仍未被静态 handler 消费。** `session.ts:80` 将 S09 的 filename/kind 写死；`:99–101` 的 S12 从 helper 自带 revision 构造 action，忽略 `input.submittedRevision`。同类还有 `:106` 忽略 S13 第二 eventId/reorderKeys，`browser.spec.ts:59,71,77` 写死 accept/selection/hidden target。当前常量与 fixture 相同，尚未证明当前产品结果错误，但 Check084:9 的输入独立化声明及 fixture hash 会掩盖“已改输入而执行未改”的漂移。消费这些明确字段，或删除冗余字段并将固定操作契约写清；不能从 expected 生成操作。

## 独立证据与保留项

- 审查开始/结束 HEAD 均为上述固定提交，`git status --short` 空；无 source/index/HEAD 修改。Node 全部经指定 wrapper，为 **v24.18.1**。未跑全套、浏览器、模型或真实 CI。
- 独立窄执行：68 registry 加载；C04 wrong-file、C25 value4→5 均真实 compile accepted 后 `semantic` reject；C22 首个非法 Column-trigger probe 被 compile 正确拒绝，随后上述合法 Icon-trigger 反例才证明假绿，未将 setup/compile 失败当作目标证据。S03/S04/S07/S09/S12 当前分别通过，S03 raw arrays 独立计数64；另直接读取 S04 实际 UiError。
- 静态确认：compiler 真实 CLI 正负退出/流与手写 values/dataModel/tree-order 判据分层；14负例有完整 compile control。S01–06 操作由 input source 序列产生。B05 用可见 Row 标签、字面量 ascending/descending 证明类型分层、UTF-16 码元与双向 stable ties；S13/S14/S15、B07 区分同 ID retry/collision 与新 ID 两次有意点击。真实 aborted-POST canary 不伪造202，要求无 ACK/无 callback 后 receipt 判据失败。这些保留项不覆盖上列缺口。
- 关键 SHA256：registry `cases.json`=`6c458aa923be3d900c0c0e96ece7a82287a64a3eaefcd40047003e683037b878`；matrix=`5b749fb34c4b6529e0a64d031c8362eeff490236c578a2b0c69a93b6399d85e5`；oracles=`f8ccdbcb960305a7d15683bf40169f8f3dd9d8fd023d22ef5c85ab4e8e721ee3`；session=`2bb6e0424357fc07832bc228842aa5bc8d24f0044e167cae34f945fb9df193a1`。

本 NO-GO 指向 BM2 新 checker 的 AC 闭合，未发现/声称018产品运行时缺陷。修复后只需针对上述反例和不变量进行窄复核；其他评审及真实 PR CI、source-bound exact68 union 仍是后续独立门槛。本轮不授权 merge/release/issue closure、BM3/BM4 或模型调用。

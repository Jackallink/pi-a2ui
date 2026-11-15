# BM1 benchmark 设计独立评审 R2（限定复核）

日期：2026-11-14。结论：**GO（仅 BM1 设计门）**。R1 两项 P2 均在设计合同层关闭；本轮新增 P0 = 0、P1/Major = 0、P2 = 0。未发现本次修订扩大实施范围或改变授权边界。

## 固定输入与验证层次

唯一设计输入为 `r2-input/` 的六份设计文档，另有一份不可变 R1 报告作历史辅助证据，共七文件。`manifest.json` SHA256：`3d1377920ce95f15f14c4352e1f235d5feddae817c95e8e999e93679c0b0ddc4`。独立重新计算七文件 hash，7/7 与 manifest 匹配；R1 报告 hash 也与 R1 结束时身份一致。

| 快照相对路径 | SHA256 |
|---|---|
| docs/plans/009-benchmark.md | 8b710f3d2e18c4b2449fc4bbb51f6bdb6f36bb9cd70cd23f3a6cc7ca18f70c94 |
| docs/specs/012-benchmark-diagnostics.md | b7466ed5834c307b80c8de8f60eb7688729ebaa9f08ba6ac21765007a7a0cb6c |
| docs/walkthrough/benchmark-bm1/01-round1-user-stories.md | 84962a5a284d784718a57cc2811ff8ebca02de0770ace1584ae208ec3c5992dc |
| docs/walkthrough/benchmark-bm1/02-round2-technical-trace.md | 327f844cc6674776110ffa6555daa82a7686d6fdcbe960d8aa40250a86c03131 |
| docs/walkthrough/benchmark-bm1/03-round3-integration-check.md | 520135eccb336b2d3a08079963a8f1869d9c823cc1e95e29df17015749cd4f57 |
| docs/checks/062-benchmark-design.md | 5002def6d7030396ca1d0c500a3472c31d91663eca4454d27c09b354b1240df1 |
| docs/checks/benchmark-design-evidence/design-review-r1.md | 5e2a0e50409d35d6420bb27194e2906b34a384e7f91fca52665c5964e108b81f |

实际复核：逐文件 hash；六份设计文档相对 R1 的完整静态 diff；全部六个相对 Markdown 链接解析；两项 P2 关联的 canonical spec、计划步骤和 Round3 测试意图一致性。Round1/Round2 未变化。未重复源码审查，未执行 Node、类型检查、BM1 测试、Pi、模型、CI 或网络调用。仅写本报告，输入快照和主 repo 未改。

主任务报告的结构/空白检查，以及 Node24.18.1 对计划中一个 TypeScript 示例的 syntax parse，不属于本 reviewer 重新执行的证据；syntax parse 不证明类型、行为或 TDD RED/GREEN。

## P2 关闭核对

### P2-01：compile-valid 的错误语义 canary — 已关闭（设计层）

证据：`r2-input/docs/specs/012-benchmark-diagnostics.md:60`；`r2-input/docs/plans/009-benchmark.md:82`；`r2-input/docs/walkthrough/benchmark-bm1/03-round3-integration-check.md:11`。

修订要求把 literal-file 示例值从固定的 `src/x.ts` 改为 `src/other.ts`，先单独证明该副本编译成功，再由同一个独立 oracle 因固定意图不符而拒绝。不能将编译错误计为 semantic canary 成功。计划与集成矩阵同步，足以区分生产校验器拒绝与意图 oracle 捕获；实际 compile 成功和指定阶段拒绝仍待实施时证明。

### P2-02：同章节、围栏外 marker 与块提取边界 — 已关闭（设计层）

证据：`r2-input/docs/specs/012-benchmark-diagnostics.md:50–52,60`；`r2-input/docs/plans/009-benchmark.md:82`；`r2-input/docs/walkthrough/benchmark-bm1/03-round3-integration-check.md:11`。

修订规定唯一 marker 位于对应章节的代码围栏外，遇下一同级/更高 heading 即停止，围栏里的 heading/marker 不作结构标记。新增“只有围栏内伪 marker”与“本章节缺块、下一章节有合法块”两类内存副本，要求 doc-contract failure。缺块不得借后文示例通过，边界和测试意图闭合。

## 漂移与保留边界

- 本次仅 plan009、spec012、Round3 与 Check062 变化，另添加不可变 R1 报告辅助链接；没有把 BM2–BM4 转成实施准入。
- Spec012:54 新增自动门禁只证明注册的可执行修复与显式语义、自然语言解释仍由独立设计/代码评审审阅，准确限制自动化保证，没有削弱既有可执行合同。
- Check062:18–20 记录 R1 结论、报告身份和当前等待 R2 的设计状态，历史未覆写。报告中 R1 的两个建议保持历史原文；当前合同以 R2 spec 为准。
- PR44/0.1.6、DX #34–38、后续实际模型成本控制、CI job、提交/推送/合并/发布边界均未扩大。未将结构检查或示例语法解析称为实现 RED/GREEN。

## 下一阶段

可将本限定复核记录为两项 P2 的设计关闭及 BM1 设计门 GO。本轮仍只交付设计与评审；本报告不授权实施。

未来实施前仍须冻结实际基线、完成 TDD kickoff 意图审计；正负 fixtures/registry 可运行后，取得真实文档契约 RED，再验证独立语义 oracle、指定阶段 canary、setup/config 分类、类型/相关 npm checks/pack 清单与独立代码评审。授权 PR 后的真实 Node24 离线 CI receipt 是后继验收；BM2–BM4 与模型运行各自另走规格/评审/授权门。

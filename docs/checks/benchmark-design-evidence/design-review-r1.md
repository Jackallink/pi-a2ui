# BM1 benchmark 设计独立评审 R1

日期：2026-11-14。结论：**GO（仅 BM1 设计门）**。P0 = 0，P1/Major = 0，P2 = 2。不是实现 RED/GREEN、远端 CI 上线、merge、0.1.6 或整版发布 GO。本轮授权仍仅设计与评审，不能据此开始 BM2–BM4 或付费模型调用。

## 评审身份与验证层次

唯一被评审设计 artifact 是 `r1-input/` 下六文件；没有将主目录随后可能发生的修订混入结论。

`manifest.json` SHA256：`fad2ec91bd424573e27e81230af1f51411d64abddc513d7378fd1150304ba068`，与派发身份一致。逐文件重新计算，6/6 匹配：

| 快照相对路径 | SHA256 |
|---|---|
| docs/plans/009-benchmark.md | 67d36740a92be0ab4b8660eb5d5983009eafb9e51487c1c28518253deea8a716 |
| docs/specs/012-benchmark-diagnostics.md | bb66d6b94cfe297aa338468125042f3a594e35784c1fbb032d32713514c4e9c1 |
| docs/walkthrough/benchmark-bm1/01-round1-user-stories.md | 84962a5a284d784718a57cc2811ff8ebca02de0770ace1584ae208ec3c5992dc |
| docs/walkthrough/benchmark-bm1/02-round2-technical-trace.md | 327f844cc6674776110ffa6555daa82a7686d6fdcbe960d8aa40250a86c03131 |
| docs/walkthrough/benchmark-bm1/03-round3-integration-check.md | aec4c4e1af53d44a5de5d098ff4993703d637c929736b3bf02956559a8a0880e |
| docs/checks/062-benchmark-design.md | 29ab0722ed6e4c9331d2a56756fc133126173eb98de868f30bfd00b8fde2237a |

独立执行的证据只有：SHA256/快照链接静态检查（5 个相对 Markdown 链接均可在快照解析）、六文件语义阅读、实际源码/调用链/既有测试与包脚本阅读、两个参考 checkout 身份和差异核对。未运行 BM1 测试、未观察实现 RED/GREEN、未运行 Node/模型/Pi、未创建 workflow、未联网或读取凭据。主任务提供的三轮结构 validator 通过和官方 Actions API receipt 不作为本 reviewer 重新执行的结果。

源码参考已核对：

- 主工作区 HEAD `3b8947d7fbaf9729418ff9a85487e6f22786aa1c`（package 0.1.5）；tracked 源码无改动，设计文件为未提交新增。
- PR44 参考 checkout HEAD `570b67afe7cec90e37177ac656abef78374ea75f`（package 0.1.6 候选），工作树干净。它是参考身份，不代表已合并/发布/升级。
- 主基线 `src/compiler.ts:40–45,73,123–137,186–215`：递归策略拒绝 `path`，Button context 校验后进入 `validateCoding`。PR44 保留该两 family 行为，仅将 authoring keys 提取并改进其他错误包装。
- 两 checkout 的 `src/coding.ts` SHA256 均为 `4384f0208616b2c3a84c0194ee808984ef3f352d4dc3f702ea36a6194520239c`；35–55 行先收集 surface record IDs，再遍历所有声明 Button，不以邻近关系筛选。两 family 的设计事实与源码相符。
- `package.json:18–33` 的 files 白名单包含 skills、不包含 tests/workflow；`npm test` 发现 `tests/*.test.ts`，`tsconfig.json:13` 包含 `tests/**/*.ts`。`npm pack --dry-run` 仍须实施阶段实际验证，当前未作归档证明。

## 已成立的设计优点与前期 Major 闭合

1. **不再以 compiler 充当所有 oracle。** Plan009:7,30,95–103 分开 compiler/session/browser/意图；BM1 Spec012:21,41–46,50–52 明确固定期望值与独立语义断言。真实生产 compiler 仍拥有合法性校验，测试内两种 allowlisted oracle 不重写生产 validator。
2. **不再靠全错误字符串 grep 定义分母。** Spec012:15,26–39、Plan009:44 固定两个 family/profile，真实 negative 检查 status/原因，文档提取后真实编译与语义断言。全部诊断覆盖保持 unknown；错误文字仅是有版本的识别材料。
3. **不再允许截图失败后降级。** Plan009:23,97 预先定义确定性布局/交互为主、截图 advisory，未来像素门禁需新 policy，detector fail closed。这里只评审路线图约束，未认可 BM3 实现。
4. **补足模型指标、成本与环境边界。** Plan009:24,99–103 将 BM4 单独准入，区分传输/编译/意图/交互/首试，禁止以全局 retry 设置或 hook throw 假称硬预算控制，付费路径在成本规则审定前不得实现。本轮未证明未来预算控制有效。
5. **BM1 不是 DX issue 解决声明。** Spec012:11–13,54、Plan009:15,91 明确不改 #34 运行时定位、不关闭 #38；完整正负 fixture 的目标差异与 setup failure 分离。Spec012:76,80 和三轮 AC/路径/错误矩阵足够定义设计门及后续 TDD 入场要求。
6. **CI 边界清楚。** Spec012:62、Plan009:85–90 冻结离线 Node24、只读 contents、无持久 checkout 凭据、无 secrets/模型/publish、不改 branch protection；仅授权推送后的真实 job receipt 才验收 CI。官方 action 身份仅采用主任务已核验的 SHA，不在本评审重复网络核验。

## P2 建议（不阻断设计 GO）

### P2-01：将 semantic canary 具体化为编译可过、固定意图失败的变异

位置：`r1-input/docs/specs/012-benchmark-diagnostics.md:60`；对应 `r1-input/docs/plans/009-benchmark.md:82`、Round3:11。

Spec 已明确要求分别捕获 doc-contract、compile、semantic failure，这足以阻止仅 compiler 的实现通过验收；但列举的 `path` 与缺 inspect IDs 恰是生产 compiler 已拒绝的两种变异，不能充当独立 positive oracle 有效性的证据。建议显式加一条：将 file 从 `src/x.ts` 改成另一个普通字面值，先断言该变异仍编译成功，再要求同一检查器以 semantic stage 拒绝。coding family 可将两记录及两按钮 IDs 一并改成一致的新字面值，验证 oracle 仍检查冻结期望，而非只检查彼此相等。具体变异是否可编译须实施时实证，当前未运行。

影响：避免后续测试作者把“生产校验器拒绝”误记为“独立意图 oracle 捕获”。这是可审计示例完善，不是当前 spec 缺少 semantic 拒绝要求。

### P2-02：明确文档示例提取不得跨章节或把 fenced 内容中的 marker 当结构

位置：`r1-input/docs/specs/012-benchmark-diagnostics.md:50–52`；对应 `r1-input/docs/plans/009-benchmark.md:81`、Round3:22。

目前唯一章节 anchor/marker、完整 block 和缺 block 失败的合同已成立；“其后第一段”尚可进一步约束解析边界。建议写明 marker 必须位于所属章节、位于 fenced block 外，例子搜索在下一同级/更高 heading 截止，不能把后一个 family 或无关章节的代码借来验收。增加一个内存 canary：删除本章节代码块但保留下个章节的合法块，仍以 doc-contract failure 拒绝。保持小型、明确的文档格式即可，无需引入泛用 Markdown 框架。

影响：避免未来简单向后搜索解析器在 marker 移位或示例删除时误取别处合法块。当前没有检查器实现，未发现可证实的运行假绿。

## 下一阶段边界

设计门 GO 仅说明固定快照无阻断级设计问题。记录本报告、处理或明确接受两项 P2 后，仍须按 Spec012:76/80 完成 TDD kickoff 意图审计与集成基线冻结；本轮只设计的授权不变。

未来获准 BM1 实施时，先准备实际可运行的正负 fixtures 与 registry，确认正例/目标错误，再取得真实缺指导的文档契约 RED；缺模块、缺 fixture、SDK/环境失败不能替代 RED。GREEN 应同时覆盖真实文档、独立语义 oracle、指定 stage canary 和 setup/config 分类，然后完成类型检查/相关 npm checks/pack 清单/独立代码评审。CI 创建与授权 PR、实际 job receipt 属后继门，不得提前报验收。

BM2–BM4、#34–38 实际修复、模型预算机制、提交/推送/合并/发布各依自己的规格与授权边界推进；本报告不授予这些阶段的 GO。

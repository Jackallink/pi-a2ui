# 主动触发pilot · Round1 · 2026-11-16

参与者：用户提出设计目标；Codex整理草案。Canonical：Spec022；状态walkthrough-approved；用户已授权十二episode、每个最多三请求、整批最多三十六请求；Gate2/代码离线检查仍需通过。原draft指纹对应Check113下draft-snapshots。

## 用户故事

| ID | 故事摘要 | 优先级 |
| --- | --- | --- |
| US-001 | Pi用户想知道有展示价值的自然任务是否更易自主选择画布，并区分准备/尝试/正确提交。 | P1 |
| US-002 | Pi用户不希望纯文字或确认任务被多余画布打断。 | P1 |
| US-003 | 用户只允许已确认的GLM调用预算，并保留冻结评价历史和本机状态。 | P0 |

## 验收标准

| ID | Given | When | Then | 优先级 |
| --- | --- | --- | --- | --- |
| AC-001 | 六个固定任务与同一0.1.10包 | 执行新旧描述配对 | 仅首请求中触发句不同；不给场景注入render要求或答案，固定顺序可复核。 | Must |
| AC-002 | 正例和负例均不指定A2UI | 模型选择工具或结束 | 在SDK校验前由完整assistant toolCall记录requested，extension tool_call另记attempted；schema拒绝仍计选择/误触发，成功提交/准备/纯文字/预算限制作独立观察，不把原生卡当触发。 | Must |
| AC-003 | 所有任务有完整给定事实 | 渲染成功或失败 | 编译/语义/DOM正确性分别记录，语法错误不抹去工具选择，合法不同布局可接受。 | Must |
| AC-004 | 唯一Ark GLM身份、已批准预算 | 每次发送前 | 单episode≤3、批次≤36、max_tokens1536、无retry/fallback；未知请求结果保留并停批，完整结果只缺token usage则记unknown且不返额度。 | Must |
| AC-005 | 无预算批准或默认入口 | 预检/设计 | 零推理、零真实凭据读取；冻结v1与v2入口均不执行，用户环境无写入。 | Must |
| AC-006 | setup/取消/清理失败 | episode未完成 | 保留主错、已admit请求与unknown，不当作no-render或免费调用，不自动补跑。 | Must |

## 路径与边界

- P-001：正例配对；第一次失败check/render就止，准备被窗口截断另记。
- P-002：负例配对；正常纯文字是期望，任何完整模型render请求都是误触发，即使SDK参数校验或编译随后拒绝。
- P-003：未批准/超预算/身份漂移/取消；不发送新请求，保留私有证据并清理owned资源。
- IN：Spec022六场景、仅description对照、首次尝试、可复核调用/结果。
- OUT：冻结基线重跑/重算、其它模型、产品改动、真实发布/文件操作、全局环境测试、显著性/总体质量宣称。

## 增量走查：离线诊断修复 P-004

旧表的付费预算已经使用并停止，不能复用。US-004：用户希望一次受限调用即使中断也有可定位、无凭据泄露的证据，不再依赖不成立的thinking-off假设。当前只修脚本、预算0；不做效果判断。

| AC | Given / When / Then | 测试映射 |
| --- | --- | --- |
| AC-007 | GLM请求进入准入时，必须enabled/low和总输出1536；live入口在配置读取前拒绝 | TPS01首请求差异；TPD01 CLI/directlive；TPD02严格body拒绝 |
| AC-008 | usage已收到而流随后取消/中断时，立即持久保留部分/完整usage，缺失不记0 | TPD03–06 SSE取消、EOF、chunk边界、坏usage、read error/timeout/1MiB |
| AC-009 | 两请求中第二个失败时，逐请求status/finish/error/usage准确归属，SDK错误有界脱敏且不续跑 | TPD07–08实际SDK及脱敏控制 |
| AC-010 | 脚本修复完成时，本地CI/独立审查通过，旧证据、产品/冻结指纹不变，实际推理0 | Check116固定身份/完整CI/正常offlineCLI/审查 |

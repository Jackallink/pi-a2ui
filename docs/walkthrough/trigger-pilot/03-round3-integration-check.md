# 主动触发pilot · Round3 · 2026-11-16

参与者：Codex设计草案。Canonical：Spec022。以下是实施前测试意图，不是已经运行通过的结果。

## E2E / 场景矩阵

| ID | 路径/场景 | 离线控制与验收 |
| --- | --- | --- |
| IT-001 | 正例配对 | 实际SDK首请求对比只差触发句；记录description/hash/path/time/model/tool_choice；没有强制UI或期望DSL。 |
| IT-002 | 自主准备→render | synthetic read/helper/write与正常render，分别计准备/requested/attempted/committed；不强制CLI前置；首次render后禁止额外供应商请求。 |
| IT-003 | 负例文字与schema拒绝 | render工具仍可用；正常文字结束，零requested；缺source/错误surfaceId类型触发真实SDK拒绝时requested=true、attempted/committed=false且无repair续请求；编译失败也不抹去误触发。 |
| IT-004 | 原生卡/错误分类canary | 仅native card不得算主动；准备/编译/语义/browser/setup/truncation/unknown不混为一种。 |
| IT-005 | 上限与取消 | 第4个episode请求、第37个batch请求及post-render请求发送前拒绝；SDK retry0；已admit后失联仍记unknown并停批；完整模型结果仅usage缺失仍记已占额度、usage_unknown，不当零费用。 |
| IT-006 | 隔离、保密、清理 | command配置拒绝；非helper shell/越界文件/其它provider拒绝；真实凭据仅live内存，脱敏canary；timeout/cleanup主错保留；用户config与冻结文件hash不变。 |

## 错误矩阵

| 条件 | 用户可见报告 | 行为 |
| --- | --- | --- |
| 无明确预算 | design/dry-run only | 不读真实凭据，不发送provider请求 |
| 身份/首请求非句子差异 | admission error | live前修正；不开始测量 |
| 正常结束未render | text_only/clarification | 保留回答；不补提示 |
| 准备到预算耗尽 | ui_preparation_only/budget_limited | 不称模型永不触发，不自动扩额度 |
| 首次预检/render失败 | preflight/schema/compile/semantic事实 | requested、attempted和正确性分开；无repair/retry |
| 401/403/429、超时、缺最终回执 | provider/unknown，已发送请求下界 | 停批，未开始的not_run，已admit不返预算 |
| 输出截断或cleanup失败 | output_truncated / harness_error | 不能充作普通no-render或有效配对；保留主错与额外清理错 |

## 一致性与开放门槛

- 两组同工具/安全约束；新旧对照只在测试host元数据中，不修改发布包。
- 原BM4 hints/explicit skill命令/expectedDSL禁止；原数据/profile/report不改、不执行。
- 不点击产生新用户消息的按钮，不测试后续模型业务执行，不更改全局安装。
- 主要风险：三请求窗口可能只够准备；分维度报告处理，禁止追到成功。

| ID | 门槛 | Owner | 状态 |
| --- | --- | --- | --- |
| OQ-001 | 批准6配对/36请求预算，或改为单组6例/18请求 | 用户 | 已确认六配对/三十六请求；不得自动补跑 |
| OQ-002 | 独立harness实现、TDD与实际SDK零推理请求差异/边界/清理验证 | 实施者+独立评审 | 未实施；阻止付费调用 |
| OQ-003 | 真实AgentPlan身份与只读凭据admission、source/归档/scenario/guard冻结 | 实施者 | 仅live前执行；本次不读取真实凭据 |

其余门槛未闭合不称implementation/live-ready；走查结构检查和设计审查都不替代预算或harness验收。

## 增量 P-004 错误矩阵与准入

| 条件 | 期望观察与边界 |
| --- | --- |
| --execute/直接live、无新预算 | 配置读取/工作区创建/HTTP前拒绝，原执行锁不变 |
| SDK off/缺thinking/错effort/max_tokens混用 | journal前拒绝；合法body精确enabled/low/max_completion_tokens1536 |
| finish与usage同chunk，随后消费端cancel | usage已保存、stream=cancelled；不排空/不续请求、不声称流完整 |
| usage晚于最后消费chunk | null/unknown；不为补usage追加读取/调用 |
| read error、AbortError、无finish、1MiB越界 | 源状态和有界脱敏错误保留，SDK error→provider_unknown，整批停 |
| 重复/部分/非法usage | 单请求最后已观察快照，不累加；缺字段null，总用量未知 |
| 第一请求read成功、第二请求中断 | 两个独立诊断条目、第二error，journal仍2，不追第三请求 |
| SDK/error-message中嵌入header/body/messages/reasoning、URL/secret/token变体及多字节文本 | TPD07–08/脱敏控制断言diagnostics只留安全占位+指纹；普通错误保留脱敏信息且UTF-8≤1024 bytes |
| 缺失/异常最终回执、硬杀 | 旧保守journal路径，actual=null，不保证恢复未落盘诊断 |

增量Gate1/Gate2审查重点：官方版本能力不等于alias实测；low与1536是拟定线级策略，付费入口仍禁用；合成响应必须使用live相同observer。Gate4只验离线修复，旧pilot效果保持未验收。开放问题仅为下一个另行授权批次的实际服务端策略/错误原因，无需付费求证才能完成此修复。

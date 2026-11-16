# 双场景smoke · Round3 · 2026-11-16

Canonical：Spec023。以下为设计测试意图；执行证据尚无，不冒称TDD/代码门槛已过。

## E2E / AC测试映射

| ID | 路径 | 测试意图 |
| --- | --- | --- |
| IT-001 / SMG01–02 | P-001 | CLI/script/import拒绝与持久fs/fetch计数；两种每例超限、全批第5、额度不互借、短写/fsync/torn/缺receipt/错profile |
| IT-002 / SMS01 | P-001 | actualSDK两例B自然消息、工具/skill元数据、enabled/low/1536；旧句/capture/source漂移发送前拒绝，不旧normalize |
| IT-003 / SMS02 | P-002 | exact收到/其它文本/read/render坏参数/半toolCall；requested先记录但任何完整toolCall不得执行，SM01仅pass后开始 |
| IT-004 / SMS03 | P-003 | 合法form实际compiler/server/DOM，3步准备耗尽、schema/compile/缺字段/native-only；首次结果/失败/窗口后provider0续调 |
| IT-005 / SMS04 | P-001–003 | 超时/取消/硬杀/认证限流/丢usage/清理失败；42/102/180实际父截止、owned PID退出、主错/准入保留与2行report |
| IT-006 / SMI01 | 全部 | 新固定源码完整本地CI与正常smoke-offline、旧5回执/76payload/冻结profile/Check099不变、独立代码GO；不借旧505检查充新适配验收 |

## 错误矩阵

| 条件 | 结局 | 行为 |
| --- | --- | --- |
| 无新授权/仅本轮设计 | design-only/denied | 不读真实配置，不实现，不调用模型 |
| 旧CLI/profile/journal被用作本批次 | admission rejected | 不能外围截断36预算冒称4；需新experiment身份与两行report |
| SM02其它文本或toolCall | negative fail | tool执行前停止，render意图照记，SM01 not_run |
| SM01文字或准备窗口耗尽 | ui_not_observed | 不认定插件故障，不延长额度/强载模板 |
| 预检/schema/compile/content/DOM失败 | UI分维度事实 | 不修复重试，不抹去已观察requested，不声称UI成功 |
| HTTP非成功、SDK/stream/截断/身份/工具/清理错 | stopped/unknown | 整批停，下一行not_run，不续跑不换模型 |
| 完整输出缺usage | usage_unknown | 不返额度，不记0，不误称无响应；若其它条件通过可继续 |
| 主错后缺最终receipt | provider_unknown+admissions | 机械脚本退出不等于效果成功，原journal不改 |

## 准入与开放项

设计Gate1由独立审查判定；当前调用授权pending，适配未开始，Gate2/完整代码门槛pending。未来代码/配置/消息与拟定1/3/4边界必须一同绑定，任何grant不能由执行器自批。当前可审设计，不可执行。

| ID | 事项 | Owner / 门槛 |
| --- | --- | --- |
| OQ-001 | 新批次真实≤4预算 | 用户；设计GO后申请，当前未授权 |
| OQ-002 | 当前12×3×36适配为双例1/3/4 | 实施者+独立代码审查；非设计缺定义，明确阻止live |
| OQ-003 | 3次窗口是否够authoring、alias/参数是否被服务端支持 | 未来该批次只能观察，不能先付费探针或默认扩大额度 |

保留旧未知结果/锁/冻结状态；本轮无任何模型实测结果。设计、代码、预算和执行是四项不同证据。

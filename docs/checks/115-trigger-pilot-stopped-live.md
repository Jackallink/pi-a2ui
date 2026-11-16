# Check115：0.1.10 主动触发 pilot — 停止，结论不足

2026-11-16。用户授权的一次新批次已执行；首次 episode 出现未知请求结果，按预注册规则停止。**没有完整 A/B 配对，不能判断新文案是否改善主动触发，也不能判定插件触发失败。未重试、续跑或重跑冻结 BM4。**

[Spec022](../specs/022-v0110-trigger-pilot.md)、[Check114](114-trigger-pilot-implementation.md)、[脱敏结果](trigger-pilot-implementation/stopped-result.json)、[证据指纹](trigger-pilot-implementation/receipt-manifest.json)。原始私有日志保持原字节；公开结果只导出允许字段，不包含模型推理正文、用户配置、凭据或浏览器访问令牌。

## 源码、环境与准入

- 评测源码 `6832b06b6ee3278da885aa6f6d823b0efd94b3b3`，tree `504976526a724c82e64dec36ae050b47e7558393`。本 Check 是后续文档收口，不把它的提交冒称当时执行源码。
- 全程 Node `24.18.1`、Pi `1.5.0`；唯一实际模型为 Ark AgentPlan `glm-5.3-flash`。没有其他模型、付费裁判或 GitHub Actions 执行。
- 两组原定使用同一正式 0.1.10 归档，SHA256 `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`；A 仅私有 host 替换为旧触发句，B 原样使用新句。
- 准入前固定源码本地检查：496 Node tests、90 browser cases、typecheck、68 个严格 golden union（45 正/23 负）；公开 offline CLI 的 12 个 synthetic episode 通过、真实模型请求 0。完整日志及原先失败/不完整记录保留，见指纹清单和 Check114，未将历史失败改写为通过。
- 独立代码/成本/隔离 R1 NO-GO 后修正；[R2 GO](trigger-pilot-implementation/code-review-r2.md) 仅准许一次限定批次。该 GO 已使用，不构成再次运行授权。R2 未识别下文的思考模式与观测缺口，后验发现不能追溯美化成准入时已验证。
- 原定上限 12 episode、每个 3 请求、总计 36；串行、自动重试 0。只调用一次 live CLI，保留独占执行锁；正常结束码 0 表示脚本完成受控停止，不表示实验成功。

## 十二行原始结局

“未观察到”仅描述中断前已收到的完整消息，不能外推模型后续意图。未启动行的计数为未观察，不计作负例或零触发样本。

| Episode | 结局 | 已持久记账准入 | requested / attempted / committed | 已观察准备动作 |
| --- | --- | ---: | --- | --- |
| T01-A | provider_unknown | 2 | 未观察到 / 未发生 / 未发生 | 成功读取 packaged skill |
| T01-B | not_run | 0 | 未观察 | 未启动 |
| T02-B | not_run | 0 | 未观察 | 未启动 |
| T02-A | not_run | 0 | 未观察 | 未启动 |
| T03-A | not_run | 0 | 未观察 | 未启动 |
| T03-B | not_run | 0 | 未观察 | 未启动 |
| T04-B | not_run | 0 | 未观察 | 未启动 |
| T04-A | not_run | 0 | 未观察 | 未启动 |
| N01-A | not_run | 0 | 未观察 | 未启动 |
| N01-B | not_run | 0 | 未观察 | 未启动 |
| N02-B | not_run | 0 | 未观察 | 未启动 |
| N02-A | not_run | 0 | 未观察 | 未启动 |

第一条完整 assistant 消息选择 `read`，工具读取 skill 成功；下一条 assistant 以 `error` 结束。整批立即停止，余下 11 个 episode（包括全部新文案 B 组）未启动。未生成 UI，没有模型画布、内容/排序/DOM 正确性或按钮交互可验收；没有完整文本答案可人工标记 clarification。

完整配对 **0**。不计算 A/B 触发率、误触发率、内容成功率或改善差值；原始报告中的全零聚合不是这些比率的证据。

## 请求与费用口径

- journal 有 2 条完整且 fsync 后才准许发送的记录；`knownAdmittedRequests=2`、`requestAccountingKnown=true`。它们均占用本次授权额度，不退款、不重置。
- `requestOutcomesKnown=false`、`actualModelRequests=null`。第一条完整响应和实际工具读取已被观察，但第二次结果不完整，不能给全批完成请求或账单次数作精确断言。
- `confirmedProviderRequests=0` 是当前聚合器按完整 episode 保守求和的字段；**不表示零请求、零响应或免费运行**。同样，`harnessAccepted=true` 只覆盖脚本的机械停止/记账判定，不能充当完整协议/效果验收。
- `usage=[]`、`usageKnown=false`，实际 token 和费用未知。输出参数上限不是实际用量或账单证明；不可将缺失 usage 解释为供应商未返回 usage。
- 最后记录的 HTTP status 为 200；现有单值字段不按请求关联，不能据此断言两次流均完整成功。

## 后验偏差与诊断边界

1. **思考模式假设错误。** 原设计写 `thinking off`，worker 也设置 SDK `thinkingLevel:'off'` / 模型描述 `reasoning:false`，但捕获的实际 SDK 首请求没有 `thinking`、`enable_thinking` 或 `reasoning_effort`；两条响应均存在非空推理块。不能声称线上关闭思考。火山官方[深度思考文档](https://ark.volcengine.com/region:cn-beijing/docs/deep-thinking)（本次只读查询，页面更新日期 2026-11-13）明确列出 `glm-5-3-flash-260828` 始终开启思考；这说明原关闭思考假设不可沿用，但不证明 AgentPlan alias 的精确版本映射。
2. **参数名称漂移。** 实际 SDK 首请求使用 `max_completion_tokens=1536`，不是设计表的 `max_tokens=1536`。官方 [Chat API](https://docs.volcengine.com/docs/ark/chat-api?lang=zh) 将前者定义为回答加思维链的总输出上限，不能混称两个字段。未据此增大任何额度。
3. **错误与用量观测不足。** worker 保存了 `stopReason:'error'`，未持久化 SDK `errorMessage`；SSE usage 仅在 `TransformStream.flush()` 记录，消费端取消流可能绕过该记录。这是脚本的可诊断性缺口，不能归咎为“供应商没返回 usage”。现有字节无法确定中断由超时、流错误、输出问题还是其他原因引起；不将推理内容或 HTTP 200 冒称错误根因。

本次不修改原始回执、不补造错误、不将中断记成普通未触发或产品编译错误。下一次评测前应先修正模型实际思考策略/线级参数契约、逐请求状态与脱敏错误/usage 捕获，并用合成流的正常结束、取消、超时和报错控制验证。该后续工作不能恢复本批次，也不能自行扩大时限、输出或模型预算；新的真实批次需要独立评审及另外明确授权。

## 保存、清理与状态

收口时只读重算 17 份离线原始证据、5 份 live 回执、归档、全部 76 个生产文件及冻结 profile/Check099 的哈希。已匹配准入身份；原始目录 `.local/trigger-pilot/run-LUrFUb` 和独占锁保留。owned workspace 已删除，`cleanupErrors=[]`，worker 的用户配置前后 hash 检查为 unchanged。没有修改发布包/依赖/用户安装，也未执行冻结模型基线、merge、发布或全局更新。

本轮交付状态：独立脚本和离线验证已完成；一次获授权 live 已按停止规则终止；**主动触发效果仍未验收，Spec022 保持 in-progress，Gate4 不通过。** 独立后验复核只可接受该停止证据的如实收口，不可批准效果结论或第二次推理。

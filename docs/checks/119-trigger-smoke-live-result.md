# Check119：0.1.10 主动触发真实双场景结果

状态：complete（协议/预算/隐私/证据收口独立GO）；一次受审批次已停止。Spec023的最小adapter与单次观察已完成执行；**正例可用UI效果未通过**，不存在第二轮调用授权。

## 决策与结果

在正式0.1.10新描述、自然skill发现、未强制预载skill正文的条件下，GLM负例正确只回“收到”；正例主动选择并尝试a2ui_render，却生成了不满足组件可达性约束的Express，被正式编译器拒绝。因此观察到一次主动工具选择，**没有形成可用表单或DOM**。不能据此声称触发率提升、A/B改善、总体成功率或发布操作成功。

| 实际场景 | 请求/限额 | 工具选择/执行 | 编译/提交/DOM | 结局 |
| --- | --- | --- | --- | --- |
| SM02-B：已确认测试环境和版本，只回复收到 | 1/1 | 无toolCall/无工具执行 | 无画布 | negative_pass |
| SM01-B：收集应用名/环境/版本，再确认；不发布 | 1/3 | 选择并实际尝试a2ui_render一次；没有read或helper预检 | render_compile；未提交，无DOM/浏览器实例 | incomplete_or_invalid |

原始错误：`Invalid Express source: Component 'root_child_children_5_buttons_0' is not reachable from 'root' (Orphaned component 'root_child_children_5_buttons_0' is not reachable from root) [surface "release-info-form"]`。

原始公开toolCall把Button直接嵌入FormValidation.buttons，而该按钮不在root的可达子组件树内；正式compiler首次失败即停止。这里仅解释已经观察到的第一条错误，不推断修正它之后整份source就合法，也不改写模型答案或偷偷补跑。自然skill发现和工具选择本身未能保证模型遵守组件契约；下一步应先设计首次authoring查模板/预检的可靠路径，再另议是否需要新模型预算，本轮不修改产品或skill。

## 固定对象与本地门槛

- 实际source：`05e1517fd266238d4f062aab5bb9cd152f6a50aa`，tree：`51cc4016e09adf13ea8c3738161581a0b33c6205`；执行时clean。
- 全程Node24.18.1、Pi1.5.0；唯一Ark AgentPlan `volcengine-ark/glm-5.3-flash`。锁定Chromium158.0.8127.18/revision1254用于合成browser验收，真实正例在编译阶段停止，未启动浏览器。
- 0.1.10发布source：`b7022efd48d6ed679eb08b17b672bb10cec9425f`；归档SHA256：`c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`。76个产品文件与正式归档原字节一致，无产品/skill/package/依赖改动。
- 固定source本地：538/538Node、typecheck、四组90/90browser、strict golden68=45正/23负、默认dry-run、normal offline、prepare均exit0；原始报告身份一致。浏览器套件含BM4合成控制，不是冻结真实BM4重跑；BM3平台像素对比仍为advisory。
- Gate1/三轮走查见Check117；Gate2/TDD及R1/R2 NO-GO纠正见Check118；独立R3 GO之后才创建grant，并获精确命令绑定GO后只运行一次。review-ready指本批次协议/证据，不把UI失败标绿。

## 预算、用量与费用边界

用户已明确授权：新批次一次、SM02≤1通过后SM01≤3、总≤4，无重试/续跑/借额/回退/探针/付费judge。受审grant只用于run-wdo9bd，精确命令exit0，耗时19053ms；日志完整记录先负例再正例、首次编译失败停止。

实际准入/HTTP/SDK结果一致：**2次请求，2次HTTP200**，负例SDK stop、正例SDK toolUse；journal次序SM02-B→SM01-B，无unknown。正例回执还包含编译失败后本地SDK停止产生的一条空assistant/aborted，无文本、无新增journal/请求诊断；不计为第三次请求或provider_unknown。剩余2请求不再使用，不变成下一批额度。grant lock、两个episode-started标记、terminal保留，禁止重放；未实际尝试重新执行命令来证明重放，因为那会违反单次边界。

| Provider原始usage合计 | 数量 |
| --- | --- |
| prompt_tokens | 14653 |
| completion_tokens | 280 |
| total_tokens | 14933 |
| reasoning_tokens | 16，已含在completion中，不重复相加 |

两次usage均完整；API回执没有权威货币费用字段，**货币费用unknown，不宣称免费/0费用**。未查价格或发送其他模型请求。

## 保全、清理与隐私

运行后两例配置hash均未变、cleanupErrors为空、子进程正常exit0且未用fallback；owned workspace移除。编译失败前未生成浏览器资源ledger，没有浏览器成功或动作成功证据；动作POST为0，没有填字段、点击确认、真实发布或继续模型会话。

92个受保护运行输入、4份首请求capture、76个产品文件均hash复核不变。旧Spec022五份raw、两份冻结BM4文件及旧公开停止导出共8份仍保持原SHA；旧批次2admissions/0pairs/11未跑不改，未返还或复用旧额度。

新回执只投影assistant公开text/toolCall，不持久化原生thinking/signature，不修改SDK内存历史；诊断只含受限元数据。原始失败回执与之前NO-GO均保存，不回写旧思考内容、不删旧失败。公开导出无凭据/头/推理正文/完整请求上下文。

## 证据与回退

- [公开结果及14份原始回执SHA](trigger-smoke-implementation/live-result.json)，导出SHA256：`57382d5a0ff8f9c6f0ffc26ec021832e48a7e1575bfe710963b9d1a52a883f18`。
- [固定源码离线证据](trigger-smoke-implementation/r3-offline-evidence.json)、[独立R3](trigger-smoke-implementation/code-review-r3.md)、[精确命令绑定](trigger-smoke-implementation/live-command-binding-r1.md)。
- 私有原件在`.local/trigger-smoke/run-wdo9bd/`；独立[post-run协议/预算/隐私/证据收口GO](trigger-smoke-implementation/post-run-review-r1.md)，SHA256 `b42110ba06950ad2ab4df12aafc116952502b4ef21cc50cb64c9acb3b8d4f012`；正例UI仍未通过。无合并、推送、发布、全局更新或GitHub issue关闭。

本批次终止后不再消费其剩余额度。adapter仅为private测试工具，回退可用版本控制撤销其独立提交，保留所有回执和已消费锁，不恢复授权。后续authoring可靠性是新的设计/验证范围；本次没有修复模型生成内容，也没有为其另起调用。

# Check116：trigger pilot 离线诊断修复

用户同意在 Check115 后修正脚本。范围为 Spec022 当前 repair/AC007–010；真实模型预算0，不发起新批次、不恢复原批次，也不修改产品/依赖/安装或发布。全程Node24，本地CI。旧效果结论仍为不足。

## 设计与TDD准入

[设计/增量走查](../specs/022-v0110-trigger-pilot.md)、[计划](../plans/022-v0110-trigger-pilot.md)固定稿提交a27fb6b；[独立Gate1/Gate2 GO](trigger-pilot-repair/design-review.md)只准入离线修复。走查结构校验先报告P004缺追踪字段，补齐表格后通过；该结构错误不是行为RED。

- contracts-red.log：针对原代码，TPD02严格思考参数guard、TPD07实际SDK请求参数两条行为RED成立。TPD01最初只在泛化CLI报错文字上失败，不算配置/网络隔离RED；其最终控制增加持久访问计数和工作区目录前后断言。
- stream-red.log：新observer安全passthrough基线的5个行为RED，展示缺少usage/终止/错误记录，不冒称是原live流的重放。随后同一合成ReadableStream控制通过。
- diagnostic-edge-red.log：发现JSON token错误文本未充分遮盖，以及第4个请求被拒时SDK aborted覆写了第3条成功read诊断；两条RED后修正。SDK每次调用开始清空当前诊断，只有成功journal准入才绑定新条目；嵌入credential/payload标记整段省略，仅留安全占位和指纹。两条针对性控制GREEN。

原始日志存ignored `.local/trigger-pilot-repair`；最终完整验证及源身份在固定候选检查后补录。当前窄范围33个检查及typecheck已通过，后续边界修正的2个针对控制通过；这些中间结果不替代最终固定源码回归或独立代码评审。

## 变化与边界

新增private diagnostics helper；synthetic/live Response均走同一reader，usage在转发chunk前更新，取消不排空；逐请求记录journal/body指纹、status、finish/DONE、usage、SDK结果和有界脱敏错误。usage缺失/部分不记零；硬杀前尚未写回执的诊断仍可能丢失，journal保守unknown路径不变。

SDK reasoning=true/low，受保护body明确enabled/low/max_completion_tokens1536；guard禁止max_tokens混用及缺少usage请求。新profile为offline id、liveEnabled=false；CLI和直接worker在真实配置/工作区创建前拒绝。这里验证的是线级契约，不是AgentPlan alias映射、服务端实际策略或触发效果。原预算/超时不增大。

回退只涉及新脚本/测试/设计切片，不改正式0.1.10包；即使回退也不能重新使用旧授权。原run-LUrFUb五份live回执、公开脱敏结果、冻结profile/Check099和76生产文件已在实施阶段重算匹配；完整结束时再次校验并记录清单。

## 独立代码审查纠正

第一候选74948d5完整505项Node测试通过，但独立审查发现两个未覆盖缺口：exported episode API可绕过argv层的live禁用，在配置读取前仍会创建工作区；错误脱敏只覆盖HTTP(S)，不满足所有URL的约定。新增动态导入调用控制先出现status0而非拒绝的行为RED；ws/wss/file/ftp/mailto/data/custom URI控制同样先RED。函数最前端补同一liveEnabled guard，错误文本按URI scheme遮盖；这些修正仍是原AC007/009，不扩大预算/产品范围。74948d5的通过记录保留为中间证据；最终检查须绑定修正后的source。

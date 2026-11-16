# Check126：helper适配有限实施与零推理验证

Canonical Spec026。状态complete（仅有限工程/零推理）；固定source完整本地CI、代码R3与最终独立zero验收均GO，结论和identity见末节。以下开发记录按发生顺序保留，早期“待验收”均为历史状态。本Check只记录新offline控制，不重评旧Spec025、不跑冻结真实模型、无新真实grant或费用授权。Node24.18.1；模型名称仅glm-5.3-flash的synthetic wire，无provider网络。

## TDD与分层证据

- `policy-red.log`：旧policy对合法新ID拒绝的真实RED，只证明该第一准入缺口；最小注册后`policy-green.log`1pass。
- 新profile/fixture/owned接入打通但仍用原helperCall时，`sdk-prefix-red.log`2项中direct真实SDK/DOM对照pass、prefix实际tool_policy失败（1pass/1fail）；这是parser功能RED，非缺模块/编译或fixture失败。
- 新纯parser→plan→可信单Node命令接入后，`parser-green.log`5pass，`sdk-prefix-green.log`2pass；全部针对实际readonly helper/受信cwd/case数据，非模型效果样本。
- `targeted-green.log`中SDK10路径通过，进程探针因误用Pi1.5 wrapped AgentTool的上下文调用失败（14pass/1fail）。`type-initial.log`同样发现该测试接口参数数目错误；两者是fixture/setup错误，不冒充行为RED。按systematic-debugging读SDK工具定义接口后，探针改用createBashToolDefinition+明确ctx.cwd且关闭无关session-env，`process-green.log`5pass、TypeScript恢复通过。实际Node进程观测固定Node24、精确argv及cwd（与创建时fallback cwd不同），包括空格/中文/单引号和引号内&&/分号等固定路径。
- SDK10已验direct/prefix、真实C/G helper/check/首source与DOM、非法cwd/额外&&/重定向/替换无helper执行/sentinel不变、usage/缺draft普通、真实helper timeout fatal。`cli-and-unit-green.log`10pass（6unit+4CLI）：含新6/12 durable限额/不能借额/torn、实际default/help/execute/grant/import API/direct live早拒绝见证器，及同一hook正例证明SDK evaluation可被发现。正常拒绝路径SDK/config/network/setup/spawn计数0。

## 实现边界

新tests/helper-adapter/{profile,invocation}.ts及profile/fixtures.json，新增scripts/helper-adapter.mjs默认dry-run/只支持offline。仅新helper-invocation-offline-1 opt-in，两行HX01-C/G，marker/base独立，真实预算恒0。当前3个既有private改动为policy.ts（新ID/输入集）、episode.ts（按policy选parser/新的synthetic条件、独立安全说明/plan事实）、authority.ts（4个只读包/capture函数已知ID参数、默认PAIR）；旧helperCall/旧安全说明/旧CLI/profile/付费guards不放宽。

parser先验证全串、quote-aware separator、固定cwd/Node/helper/op/args，再构造argv和安全单参数引用的Node命令。仍沿用Pi bash执行，未实现shell:false；不执行原始模型shell或cd。accepted plan与实际结果分层、blocked不改成executed，firstCandidate仍按实际check/首render计。模型native reasoning块不写报告。当前只定向开发证据，不借用过去581/91为新实现验收。

保全快照含166unique。旧99runtime中允许3私有文件按本设计改变，其余96保持；新增运行输入要纳入固定source identity。76产品payload、lock、两归档、旧真实raw/锁/审查/冻结均须保持。新固定实现source完整Node/type/四组browser/strictunion、normal zero CLI、独立代码/隐私/边界GO后才将本阶段complete。其后只设计下一轮场景/调用预算，真实调用另授权。

追加分组运算符反例：grouping-red.log确认未执行的括号组合被过早归usage；lexer把引号外括号明确归policy，unit-final.log 6pass。所有166保护文件hash未变；实际代码仍未获最终GO，后续新source完整CI不可借历史值。

已读锁定SDK的validateToolArguments：工具入参为原assistant arguments的structuredClone。history-green.log实际SDK正例再核对后续provider body中的bash原串hash等于helperAdmissions的rawCommandSHA256，不等于执行重建串；新增字段只投影命令hash，不存原生推理内容或完整续请求。

## Code R1 NO-GO及见证纠正

固定8c96fde4bf9feedea97a50696f3f85ac840c6b79/tree9a2d6d5da3a50508c069c8db143a5841fb498fcc代码R1 NO-GO（1P2、0P0/P1），报告SHA625f7b1020e502b09b54427b94db4f299796dd541de026c309303402485c1247。缺口：substitution sentinel相对project但断言run，workspace清理会抹掉可能副作用；AC003缺真实子进程执行见证。不是发现运行时注入漏洞，未因此放宽parser。

先补witness-red.log两个真实SDK验证字段缺失的RED（证据缺口，不称漏洞复现）；所有有副作用的SDK canary改为run下绝对sentinel。新增process-witness.ts透明观察owned cwd的实际Node spawn调用/PID，持久文件在run外于workspace保留，正常helper两次先命中、非法command零次；finally恢复cp.spawn。独立受控真实child写绝对sentinel，模拟workspace清理后仍保留，证明detector有效。witness-green.log 17pass。追加exec-provenance-red.log记录规范命令与实际spawn命令尚缺闭合字段的RED；随后记录shellCommandSHA256，和accepted plan的commandSHA逐条独立相等，未经验证不写“真实执行”。本修正仍仅零推理observability，旧付费guard/产品/旧raw不改，待新source复审/完整验收。

## Code R2 NO-GO与观测故障边界

40cc4d3fb99800d6a28bc16384e80dca1a55bed1/treecda5d8be2f849637eb130e2169e1d10bd52e56fb完整Node602/602通过（node-full-40cc4d3.log，490527ms），但R2仍NO-GO：原P2已closed，新1P2是observer在spawn成功后的save抛错会丢child句柄。报告SHA f3b9416d63723a442d9352d308fcabdafad6a13f5aadc41ac257bc7d37bfc49b；未用通过覆盖NO-GO，未继续browser/最终zero GO。

observer-fault-red.log纯内存fake backend pre/post两RED（0实际子进程），observer-cleanup-red.log实际owned长驻fixture helper，审计错误取代了应发生的SDK timeout（test finally显式清除owned组，未泄漏）。纠正：pre-save失败标pre_spawn_persist且不调用backend；backend已返回child后整段观测catch、标post_spawn_persist，始终归还原child，不吞审计错误为成功。worker tool_result/cleanup看到auditErrors即fatal+harnessFailure/process_witness_error，保留原provider诊断与实际helper结果。

observer-fault-final-green.log 4pass：fake pre/post、实际Pi timeout清理（owned group已退出）、实际offline worker预载仅对其run审计文件一次post-write失败→2 synthetic回合fatal/harnessFailure、0model/0operator config、workspace和helper组清理、auditErrors回执明确。新正常路径仍需完整固定source重验；原166保护不变，未来场景和实付预算尚未推进。

R3故障fixture的env推断曾触发TS7053（type-r3.log）；显式NodeJS.ProcessEnv修复，仅类型层，不算行为RED。type-r3-corrected.log退出0。全部故障raw与失败类型记录保留，新固定source的完整检查另计。

## 固定新source最终零推理验收 GO

执行/测试source7ee904581982519ebec43c6df6edd671bedc261a/tree9dcb065a963076ac167eaa8ca5d12827f2a469f0：完整Node606/606（494331ms）、TypeScript0、四组browser91/91、strict golden union68（45正/23负），Node24.18.1/Chromium158.0.8127.18。Model测试transport全部synthetic，冻结真实基线没有重跑。

normal新CLI run-AhdBKO：C/G两行各5数据回合，另capture各1；12 synthetic合计、0真实provider/0operator config。两行真实helper各2spawn/PID、执行shell commandSHA逐一等于accepted canonicalSHA，后续provider body保留raw assistant command hash；auditErrors为空、checked/render source exact、3fields/rules与真实DOM通过、actionPosts实测0、cleanup为空。独立105运行输入/原166unique保护/双档76x2/7diff保持；旧99仅允许3private改动。normal报告不计算模型效果，schema modelEffect=not_evaluated。

验证包`.local/helper-adapter-implementation/validation-7ee9045.json` SHA c601a6b528455a0804129a95f07cc4dafad630499573eb424345909b38dfc086。R3 source review SHA56e65ca66218db5bc3dcf3694a2ccf5a04fbeb1a857bc641657a487c523c7f76保持不改；最终独立zero-final-review-r1.md SHA f77a7e1a989fa4103afcdb50a1718cae146e9e53fc8af3e0790795b2e2d5255e、zero-go.json SHA dfc9d5c49d052853067e5c182cb5088e35a596c821fc4c5ddcec3cbf769e7fc3（0600），0开放P0/P1/P2。GO仅本有限工程/zero；用户真实授权0、无新grant/paid入口实现/旧21/冻结重跑/发布或全局修改。

Spec026 complete只指上述有限工程完成；受限helper是否改善真实模型firstCandidate尚未评估。进入独立Spec027的新题/预算设计申请阶段，不执行。最终docs checkpoint不改105运行输入，原Spec025 STOP全部封存。

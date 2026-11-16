# Check123：配对首次候选驱动实施与授权批次

用户在Spec025设计R2 GO与明确6×4/总24条件申请后回复“授权”。已授权必要最小private适配、完整零推理和独立代码GO后一次新批次≤24；不是先执行再补检查。只用Node24/Ark AgentPlan glm-5.3-flash。旧余量/冻结基线/旧raw与锁不动；无发布/合并/推送/全局更新授权。

基点875d18a3bb39a32259351e02efa3e3d379c45ecc，既有隔离worktree及codex/authoring-paired-pilot-design分支，初始clean。当前仍无新grant或真实调用，Gate2待独立审查。

## 最小适配与Gate2测试意图

复用现有private budget/control/worker/offline guard/diagnostics和DOM可用性观察器；新增tests/authoring-pilot/profile.json（固定已审scenarios/arms/caps、default live禁用）、纯profile/authority、case oracle/报告与scripts/authoring-pilot.mjs。原产品76文件和两个已审归档均不改，旧profile/capture/真实grant保持。新已知policy贯穿6/24/12；不引入通用实验平台。

worker对新policy从run内本臂归档payload复制到同一workspace/package路径，并在新child实际import该包extension/compiler/interactions；新C/G不经过descriptionForArm的NEW→OLD。旧模式默认行为不变。准备阶段验证两档/76paths/7diff，在run下物化两个arm只读payload，live guard校验它们的全部hash。每case新session/同路径；capture原body，独立比较仅实际注册render description和shortSnippet对应system片段能解释C/G差异；不修改captured/live body。四个case contexts独立绑定新grant。

新authority与旧smoke入口分开：三入口和每次POST核验exactsource/profile/captures/两档/输入集；一次claim/每case marker不删；下一case必须按固定order且前case父receipt与durable journal均完整、非fatal/无cleanup错误。缺/错/重放/乱序/fatal前态在SDK/配置/工作区前拒绝。默认dry-run/synthetic不读真实配置/不发provider；实际grant只在最终代码GO后操作人记录已有授权。

| AC / 测试 | 必测与有效RED口径 |
| --- | --- |
| AC001 APG01 | 新profile/gate拒绝脚本/API/CLI无授权、伪造ticket/source/capture/payload/前case状态；合法fake authority先证明能到workspace见证点。并发真实CLI fake grant只能一赢家、同case重放禁止。所有fake config/provider0。模块/fixture缺失不当RED |
| AC002 APC01 | synthetic实际SDK4首body、真实C/G包factory/skill/helper/compiler、同ownedpath、NEW原句不改；actualregistered metadata/source payload与臂一致。只用真实C/Gdescriptor/snippet作离线差异解释，额外system/user/tool字段变更拒绝 |
| AC003 APB01 | 先测试现有policy拒绝合法新FP01-C/6/24身份的行为RED；首断言之后未到达的第7/第25/12边界不冒称RED，随后GREEN逐项验证。每种receipt/parser/parent共享policy，短写/fsync/torn/缺receipt保持unknown/no refund；model/native/body/response边界 |
| AC004 APF01 | 首check compiler/semantic成功/失败、直接render、schema错/INPUT/preparation限额、check后再写；首次source与实际UI分开。可先用既有formCandidates对新增固定case参数返回0的真实行为说明旧oracle不适用，然后只增加new-case路径；不宣称原app oracle有bug |
| AC005 APO01 | 同臂compiler+纯validateSubmission的3keys/labels/empty/TextField/plain variants/3rules/range边界；错误key/额外输入/数字或密码/不可达/漏绑定反例。DOM按组件ID；静态正确但实际input type被synthetic改number必须拒绝，无关可见输入不替代隐藏目标 |
| AC006 APS01 | 普通check/schema/compile/semantic/prep失败只关case、CLI仍按order完成剩余；401/unknown/transport/truncate/drift/越权/timeout/cleanup停批4行。已closed且无新request的空localaborted不改已知diag；inflightabort仍fatal。实际owned browser deadline/TERM/fallback包含在总180内，batch780不足完整180不再启动 |
| AC007 APR01 | 固定4行，noCandidate实际分母0=N/A，4候选合取known才方向比较；compilefalse直接判firstcorrectfalse，UI不可由check推断；exact/单LF/mismatch/unchecked/no-render，unknown不转0，usage不假造fee |
| AC008 API01 | 新固定source完整Node/type/四组browser/strictunion；公开正常offline和4capture/preflight source+modelbody差异审核；两个归档/原76产品/旧raw/锁/冻结保持。独立代码/隐私/成本GO和实际grant/command绑定之前不读真实模型配置/发真实请求 |

12工具意图在完整assistant toolCall、SDK schema校验前计数；实际执行另记。首次check保存实际读取source与surfaceId，即使source在render inline变化仍只观察首render，sourceMatch单列，不在产品execute加receipt。仅私有oracle/控制层施加first-candidate/no-repair的评测边界。

## 准入顺序

Gate2独立GO→先有意义RED→最小实现及synthetic GREEN→固定source完整本地checks/公开offline/prepare→独立代码GO→操作人创建只反映这次用户授权的唯一source-bound grant与精确命令→一次live≤24→原始四行/费用/缺失保留→独立执行后收口。不重试、不替换grant补样本；正常失败继续只是既定其它case，不是重做当前case。

当前只有测试意图，无新增实际测试或模型结果。后续所有结果按source/tree/runtime/两档/profile/oracle/contexts/hash分别记录于本Check或后续Check，原始日志在.local/authoring-pilot-implementation；计划文件不维护进度。回退只撤销本private适配，不复活旧grant。

## Gate2与实施中的实际证据

Gate2独立报告`.local/authoring-pilot-implementation/gate2-review.md` SHA256 `6ebd3890d49d5608e7e39372aab8017a2386096d45cef86cecd9933b4907df05`，固定539ce7e/treefe86ab9c，0项开放P0/P1/P2，明确仅test-first有限实施准入。状态由tdd-approved进入in-progress。

- 首批真实行为RED：现有policy拒绝合法新实验身份、旧app oracle忽略新case返回0；`red.log`保留2 fail。最小适配`first-green.log`2 pass；未声称首RED到达第7/第25断言。
- Oracle补充cancel Event反例，`cancel-red.log`显示true≠false，修正后`oracle-green.log`5 pass。非法变体/keys/labels/多输入/rules、FP02 Unicode边界、分母/N/A和单LF来源比较均覆盖。
- 导入式live API的SDK evaluation计数从1的RED降至0的GREEN（`api-red.log`/`api-green.log`）。复用heavy implementation移到episode.ts，worker.ts成为先pure authority后dynamic import的薄入口；非CLI live API在SDK前拒绝。
- 开发中`paired-r2.log`24/24 synthetic checks通过（含真实双包四capture/只允许真实descriptor+system snippet差异、实际SDK/DOM/普通继续/致命停批/owned browser TERM fallback）；这些属于开发诊断，不代替后续固定candidate完整验收。增加tool12/第二check/缺draft/真实inflight abort反例的`additional.log`4 pass。
- SDK收到DONE及有效finish后会cancel读取器；不得把该已知终止误作未完成。保留原始cancelled，仅在DONE+有效SDK stop/toolUse+finish+errors为空时接受；真的inflight abort仍fatal unknown。Ark系统消息在实际body映射为developer，比较器同时处理system/developer且只替换精确一处实际短snippet，原body不改。
- 私有driver12工具意图在完整assistant消息中、SDK schema前计数；实际tool execution另计。首次check保存实际source/surfaceId与hash，schema/INPUT/ordinary与fatal严格分开。POST前重验物化两包及实际workspace拷贝76文件，实际active factory/compiler/validator从该臂import；新C/G不走NEW→OLD。

保全快照`.local/authoring-pilot-implementation/preservation-before.json`：原产品76+锁+冻结profile/Check099共79文件未变。历史22回执/旧grant/锁与两归档另按原static-preflight核对。没有provider/model请求或真实配置读取；无grant。当前还不声称完整CI、代码GO或执行准入完成；准入继续按上节顺序。

## R1 NO-GO与纠正（保留失败，不扩大授权）

9c1d039bbf92ab357a3227454a177abc0b845579/treee6ced1662b7d85c5b1b0f014da7c080f48408bfd的完整Node568/568通过（`node-full-9c1d039.log`，405s）；独立code R1仍NO-GO：3P1+1P2，报告SHA `93754b8b359dee21f0f2da01f085fa2934c755d6c961c409d28ece88e2204746`。因此不继续browser/live grant；这份通过不能覆盖审查失败。

F1第6响应内合法write/check/render被tool_result过早stop；F2方向信号漏了完整batch/成功workflow门槛；F3parent未检查每行诊断，尤其末行；F4单LF较短源已有CR/LF也被容忍。分别先补反例：`r2-pure-red.log`3fail；`r2-sdk-red.log`2fail真实SDK证明第6响应被截断、末行已render却缺DONE仍known。追加`sse-flag-red.log`与`unknown-red.log`证明SSE error flag和lost receipt候选分母问题；失败均保存。

纠正：paired仅在下一次stream/POST入口关闭已用满请求的会话，同响应其它合法工具仍受12意图及单check/render约束；parent每一行核对journal index/body hash、SDK stop/toolUse、唯一有效finish、DONE、空errors、无SSE error、eof或DONE后cancelled，缺口保留raw及firstCandidate/observedOutcome但promote fatal unknown。已观测source判分不因transport缺口丢失；丢失receipt无candidate证据时分母为unknown，只有已知无candidate才是0/N/A。

方向信号需4个实际候选+known grades+完整journal/diagnostics、无fatal/harness/cleanup/unknown；G至少一个usable UI还需成功preflight、exact/严格single-terminal-lf及首次candidate之前成功skill/example观察。单LF只在较短源末尾不含CR/LF时允许。静态grade、首UI、流程与provider终态分别保留。

`r2-pure-green.log`8pass，`r2-sdk-green.log`3pass（含6响应8意图实际UI，无第7请求，以及实际末行缺DONE→unknown），`r2-unknown-green.log`4pass；当前这些仍是开发定向证据，新source完整验收及独立R2仍待。无新实际grant/config/provider请求。原两包、79文件与历史冻结材料保全要求不变。

## R2 NO-GO与最后边界纠正

0b4fc336a3ee326b8745da2a9cc0bcf0f70a0d6e/tree0d73af196de74e21a9d229f13fc1bf1d90052362完整Node574/574通过（397s，`node-full-0b4fc33.log`），但独立R2仍NO-GO，报告SHA `272cb8d71208a0cdafe2bbacdab31cdf904e25d07890c22e19f573158b168fc5`：R1四项closed，新1P1 helper只读参数错误被误判fatal、新1P2合法Row包装按钮caption被误判。仍无paid准入；未用通过覆盖NO-GO。

已先补真实SDK的safe-usage、bad-surface和FP01/FP02 wrapped-caption四条RED（`r3-red.log`4fail），以及pure compiler caption RED。纠正只在确认固定Node/helper路径、无shell/外部文件、已知read-only opcode后，将USAGE参数形状/ID错误标为preparation_error普通关case；未知程序/op/越权文件仍fatal。完整check遇实际CLI INPUT也不计为提交DSL失败；实际超源文件INPUT canary确认3请求、noCandidate、ordinary。真正helper timeout无正常exit_code继续fatal（`helper-stages.log`先RED、`helper-stages-green.log`GREEN），不将未知工具结果混成可继续的CLI参数错误。

caption从编译后可达child/children树的Text文字汇总、与实际DOM同样空白规范化后精确匹配；额外Text文案仍拒绝。两个包任务的Row包装均通过真实SDK/DOM，目标Button仍按实际component ID与原生可用性核对，不替代为其它按钮。

`r3-green.log`5pass（safe CLI ordinary后剩余固定3行完成、两个wrapped实际UI等），`r3-pure-green.log`9pass，`helper-stages-green.log`4pass。上述为定向开发证据；接下来新固定candidate完整本地CI/独立R3，不借用574结果。新grant/真实配置/provider请求仍0。

## 固定候选最终验收与执行收口

最终执行source7c88a9fd9731e029ee5e8b9241ef84f4f11e0613/tree8c9cbb5c1e8c9b472ebdf68be549f1c4d5825cc0，完整Node581/581、type0、四组browser91/91、strictunion68；normaloffline四行完成、fourcapture/preflight公平性及103保全通过。验证包SHA7a30d03cddc520acdfbd110166f6344dcf58ba78f8339472198e835741e9a063，R3代码/隐私/成本最终GO SHA43be5af49ec70fc472effba1956b7d09bdb3c0f6094cb884568497e842ce5de9，精确单次命令GO SHAe1ee6cbbb762f858fd40ffbcb19b36ef40a8c3652afb782b59fad446f27c89d5。

原命令仅一次、实际3请求后按tool_policy停批。执行后独立GO仅回执收口（SHA9f2074a34fe49cd15354bc7771b4e22cce7df40c7490b931fac08cdb32e3b2af），不是效果/UI通过；完整事实、usage、N/A/not_run与后续决策见[Check124](124-authoring-paired-pilot-result.md)。canonical Spec025 complete仅有限实施与执行闭环，配对比较incomplete；无补跑/替代grant/旧余量/冻结重算/发布或全局变更。R1/R2及所有失败证据保持原样。

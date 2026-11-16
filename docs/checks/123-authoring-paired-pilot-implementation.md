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

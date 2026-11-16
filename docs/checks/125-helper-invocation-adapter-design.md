# Check125：helper适配设计与准入

基点f9c1ac8c36d1ee92c44601a428f035c6855f90bf；当前已有隔离linked worktree，切新分支codex/helper-invocation-adapter，初始clean。沿用Node24 wrapper，Host默认Node22不用于任何项目JS/npm/Pi。用户授权设计/独立GO后的有限实现和零推理，未来模型预算当前0，唯一允许未来模型Ark AgentPlan glm-5.3-flash；21余量禁用，冻结基线不重跑。

Canonical Spec026及Plan026/三轮walkthrough已落文档draft。本阶段无代码变化/SDK/配置/provider。目标是新known offline policy的有限冗余cwd prefix→单Node模板；旧Spec025仍STOP，不回改规则/grade。Gate1和Gate2（AC→测试意图）都待独立GO；GO后才准实现/零推理。

保全快照`.local/helper-adapter-implementation/preservation-before.json`含原产品/lock/两归档/旧22历史以及Spec025已消费grant、锁、真实raw、诊断、评审/validation等现有166unique files（含旧三canonical封存文档与旧运行输入中不允许改变的部分）。旧99runtime输入另存；允许必要共享private代码policy.ts/episode.ts/authority.ts改变，不冒称99全部不变。实际所有保全结果与source/tree/命令/hash在后续Check更新，计划不作进度看板。

目前没有新模型场景/预算执行profile、没有真实grant，没有真实配置或provider读取。一次正常失败的预期是可观察结果，不能为了拿GO放宽设计或重评旧样本。用户已明确独立GO后按序推进，未要求重复人工确认同范围。

三轮结构校验：skill-bundled validate_walkthrough.py通过（仅文档结构，不代替独立Gate1/Gate2）。推荐有限parser，明确沿用Pi bash做可信单命令执行，不宣称shell:false；否定开放通用shell和为本轮更改受试skill包。

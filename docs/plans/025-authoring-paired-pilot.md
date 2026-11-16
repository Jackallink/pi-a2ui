# Plan025：首次候选配对验证准入

Canonical：Spec025及其document-only profile。计划只定义目标/门槛；设计/执行状态与证据见Check122及后续Check，不在计划维护实时进度。

目标：2fresh任务×C/G两个固定包、4session≤6/24，比较第一候选编译/任务语义、首UI和流程/开销，只有小样本方向信号。依赖：C正式包c7d451...、G候选c96125...及同锁SDK/Pi/Node24；同case同path、唯一glm-5.3-flash。模型当前预算0。

1. 本轮：定义精确消息/labels/keys/rules/指标分母、6/24/12/180/780与停止矩阵；三轮走查/两档diff/新题非冻结/历史hash检查、独立设计GO。当前不实施/加载模型配置/造livegrant。
2. 设计GO后申请明确条件授权：必要最小已知policy适配与零推理验收/独立代码GO之后，记录一次新批次≤24；拒绝/未获授权则不实施或调用。不继承旧余量/不跑冻结题。
3. 授权后Gate2：APG/APC/APB/APF/APO/APS/APR/API测试意图审查、真实SDK synthetic及普通/致命停止控制。旧2行1+3/profile/A句改写/根extension/oracle不能直接套用；新profile/包选择/6×4/24/12都贯穿guard/parent/report。只新增必要private测试适配，无新产品/通用实验平台。
4. 固定新代码：完整本地Node/type/四组browser/strict union、normal offline/4capture/两归档校验、隐私/成本/授权与独立代码GO；绑定所有source/runtime/包/输入/contexts/hash。此时才由操作人记录已有用户条件授权的唯一一次grant并做最终command绑定。
5. 原命令只执行一次，case普通失败继续固定序列，fatal停批，记录原始usage/未知/失败/not_run与两个分母、source匹配。独立post-run证据收口，旧结果/档/配置/锁保持。没有任何重试/替代grant/补样本，或者发布/全局升级授权。

风险：6请求仍可能不足；firstCandidateCorrect不等于usable UI，remote模型/cache/时序不受控；2对无统计提升结论。回退仅撤销新private适配，保留原始失败与已消费锁，不恢复额度。

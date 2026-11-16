# Check122：首次候选配对验证设计

用户要求先设计glm-5.3-flash小规模验证、独立评审GO后才申请真实调用授权；Node24、不重跑冻结基线。本轮仅设计，当前模型预算0，未读真实模型配置、未造grant、未实施新驱动。

基点309c8ba11615947bb98dc1c2afa5e0c48b6b84a3，初始clean；复用isolated worktree，分支codex/authoring-paired-pilot-design。Spec024代码/合同已经完成不等于模型改善；Spec023的2次/4上限原始结果（首候选orphan/未UI）及剩余不可用状态保持。

[Spec025](../specs/025-authoring-paired-pilot.md)、[Plan025](../plans/025-authoring-paired-pilot.md)、三轮walkthrough和[document-only profile](authoring-paired-pilot-design/profile.proposed.json)为本轮交付。建议2fresh三字段任务×正式C/候选G，4session各≤6、总≤24，一次、6/24不借额；第一候选/首UI/流程各自记录；普通失败关case继续，基础设施fatal关batch。所有数值是拟申请，不是授权或当前运行配置。

已读当前worker/policy/预算/CLI与observations：旧smoke只1+3/4，旧pilot A改写NEW→OLD，worker static import根extension，oracle硬编码app/env/version，失败fatal策略也不支持fresh C/G比较。新协议必须最小适配且独立代码GO，不能仅改flag/旧profile/重签旧grant。source identity当前未实现，以未来完整新候选为准。

本轮Python只读核对两个现有归档：C SHA c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55、G SHA c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8；76path相同，G各文件与当前生产source相同、两包只7guidance路径不同；release package-lock与当前锁原字节同。没有构建/安装/SDK/浏览器/provider请求；设计静态检查、保全和独立评审后续各自记录。

场景fresh：FP01任务登记、FP02归档信息，均不是M01–12、T01–04/N01–02或SM01/02旧消息；不复用旧seed/轮次或评价分数。没有新negative实测，不宣称误触发率或总体首次成功率提高。

独立设计评审待完成；本轮不能执行任何旧live入口。预算申请必须在设计GO后，且仍以未来实际代码/隐私/成本GO为执行门槛。不推送、合并、发布或本机更新。

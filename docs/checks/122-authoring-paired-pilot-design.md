# Check122：首次候选配对验证设计

用户要求先设计glm-5.3-flash小规模验证、独立评审GO后才申请真实调用授权；Node24、不重跑冻结基线。本轮仅设计，当前模型预算0，未读真实模型配置、未造grant、未实施新驱动。

基点309c8ba11615947bb98dc1c2afa5e0c48b6b84a3，初始clean；复用isolated worktree，分支codex/authoring-paired-pilot-design。Spec024代码/合同已经完成不等于模型改善；Spec023的2次/4上限原始结果（首候选orphan/未UI）及剩余不可用状态保持。

[Spec025](../specs/025-authoring-paired-pilot.md)、[Plan025](../plans/025-authoring-paired-pilot.md)、三轮walkthrough和[document-only profile](authoring-paired-pilot-design/profile.proposed.json)为本轮交付。建议2fresh三字段任务×正式C/候选G，4session各≤6、总≤24，一次、6/24不借额；第一候选/首UI/流程各自记录；普通失败关case继续，基础设施fatal关batch。所有数值是拟申请，不是授权或当前运行配置。

已读当前worker/policy/预算/CLI与observations：旧smoke只1+3/4，旧pilot A改写NEW→OLD，worker static import根extension，oracle硬编码app/env/version，失败fatal策略也不支持fresh C/G比较。新协议必须最小适配且独立代码GO，不能仅改flag/旧profile/重签旧grant。source identity当前未实现，以未来完整新候选为准。

本轮Python只读核对两个现有归档：C SHA c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55、G SHA c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8；76path相同，G各文件与当前生产source相同、两包只7guidance路径不同；release package-lock与当前锁原字节同。没有构建/安装/SDK/浏览器/provider请求；设计静态检查、保全和独立评审后续各自记录。

场景fresh：FP01任务登记、FP02归档信息，均不是M01–12、T01–04/N01–02或SM01/02旧消息；不复用旧seed/轮次或评价分数。没有新negative实测，不宣称误触发率或总体首次成功率提高。

独立设计评审待完成；本轮不能执行任何旧live入口。预算申请必须在设计GO后，且仍以未来实际代码/隐私/成本GO为执行门槛。不推送、合并、发布或本机更新。


## R1与限定纠正

独立[R1 NO-GO](authoring-paired-pilot-design/design-review-r1.md)绑定6e80e3f/tree6eae939，SHA256 `1e1bd09cab0cb4e1f71546439c3f1caf59159ef5bb6a0e0aca52fd0c37a6edd2`；仅3个P2，没有P0/P1。原设计/静态回执由6e80e3f及原文件保留。

F-01：正确性方向比较必须4行各自确已提交候选且合取判分known；编译失败可确定false而不伪造静态执行。known noCandidate只描述预算内交付/准备，保留全部4行/双分母，0候选分母为N/A，不伪称正确率改善。

F-02：case闭合且已有请求终态known之后，无新admission/diagnostic的local空aborted不能覆盖stop/toolUse/usage/UI或升fatal；in-flight取消/timeout仍fatal unknown。测试意图必须actualSDK对照验证两类。

F-03：TextField的string绑定不证明可输入任意文字。已只读核对安装SDK basic v1 schema variant包括shortText/longText/number/obscured，默认shortText；universal TextField.js将number→input number、obscured→password、longText→textarea；项目validateInput只验string。本设计固定omitted/shortText/longText，DOM只text input/textarea；未请求的number/password判语义invalid并列反例。未运行SDK组件或浏览器。

同步将Round3的98KiB笔误更正为98304bytes=96KiB。精确任务消息、顺序、两个包、6/24/12与180/780预算、原产品和当前授权0均不变；只澄清判分/停止。修订静态校验与R2审查待补，本轮仍不实施/调用。

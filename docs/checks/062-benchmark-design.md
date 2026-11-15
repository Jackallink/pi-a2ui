# Check062 — benchmark 设计准入

2026-11-14。当前仅设计，独立设计评审已完成；不得据此写实现或触发付费评测。本轮针对用户“然后呢”的继续指令，修订 plan009，拆出 canonical spec012/BM1 三轮走查；BM2–BM4 是路线图，未准入实现。

版本边界：PR44/0.1.6 不变；DX #34–38 和 benchmark 属后续迭代。主工作区基线3b8947d，参考PR44 head570b67a，仅本地未提交设计文件变化；原plan009 SHA2565ba7da86e8ff8dcbd81ff9ebc7050825809d01e59516ae51ad9d4ba8c9e3e454 已留ignored备份。未修改runtime、SDK、package、现有skill/fixture、PR44或真实用户安装/配置。

已完成的设计检查：三轮结构validator通过。语义自审修正compiler-only oracle、全量grep、事后视觉降级、缺失指标/成本边界；BM1两family含真实负例/可执行文档/positive意图/检查器canary和真实CI接线。现时仓库无workflow，设计通过不代表CI已上线。未运行新测试、未产生BM1实现RED/GREEN、0模型调用。

2026-11-14 通过GitHub官方API读到并冻结：actions/checkout v7.0.1 →3d3c42e5aac5ba805825da76410c181273ba90b1；actions/setup-node v7.1.0 →949feb2413d6458794dcd2491c4babbbce0c15c1。各tag的action.yml均声明runtime node24；未来实现仍须复核runner兼容与真实job，当前没有创建活动workflow。

本地Pi1.5源码事实：setAutoRetryEnabled调用settingsManager.setRetryEnabled并save全局；before_provider_request handler异常由runner捕获。路线图已禁止将它们假称无副作用的硬预算开关。BM4完整控制及证明属于其独立spec，不在BM1设计GO中。

独立评审使用文档hash冻结快照；反馈与修订追加于此，未决Major阻断准入。原始文件/失败评审不覆写。计划只记范围依赖/步骤，进度在issue、验证在Check。本次不提交/推送/合并/发布；实现和实际CI/模型运行是后续单独门禁。


## 独立设计 R1

固定6文档快照manifest SHA256fad2ec91bd424573e27e81230af1f51411d64abddc513d7378fd1150304ba068，独立GO：0P0/0P1、2P2。报告 [R1](benchmark-design-evidence/design-review-r1.md)，SHA2565e2a0e50409d35d6420bb27194e2906b34a384e7f91fca52665c5964e108b81f。评审只读文档与公开源码、校验hash；没有运行实现测试/Node/Pi/模型/CI。

root已补明两个P2：compile-valid但file值错的独立语义canary；章节内围栏外marker以及禁止跨章节借block。并明确自动测试不证明全部自然语言解释正确。新快照交R2限定复审；原R1输入/报告不改写，当前仍不执行实现。结构/链接/空白检查仅为文档验证，不是BM1业务RED/GREEN或CI上线。


## 独立设计 R2 / 本轮完成

固定R2 snapshot manifest SHA2563d1377920ce95f15f14c4352e1f235d5feddae817c95e8e999e93679c0b0ddc4（6设计/检查文档+1不可变R1报告）。[R2](benchmark-design-evidence/design-review-r2.md) SHA256dbc6bd10125921a72e7fe302f6e7ea8b6007e397149ba662f1d44419b2f2171a：**BM1设计GO，R1两P2关闭，0新增P0/P1/P2**。Reviewer独立校验7文件hash/6相对链接与限定语义delta；未运行Node/Pi/模型/实现测试或CI。

root另完成三轮结构validator、覆盖未跟踪文件的链接/空白检查，以及Node24.18.1对计划中1个TS片段的syntax-only检查。语法通过不证明类型/运行/实现行为。最终只补生命周期与此证据记录，已审功能合同未改；完整R1/R2输入快照和原始Pi草案备份保持不变。

交付：plan009已改为分层路线图，spec012与三轮走查仅BM1；BM2–BM4各自后续准入。当前保持draft供用户审阅，不跳过TDD kickoff；运行时、现有测试/skill、package/锁文件、PR44/主HEAD、全局安装与用户配置均未改。没有提交、推送、合并、发布或付费评测。issue43不关闭。后续建议先按用户优先级推进DX34/35/38设计，再按冻结的诊断profile推进BM1；36/37先明确定义计数/事件时效合同。

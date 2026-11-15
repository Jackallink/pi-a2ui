# BM2 限定澄清复核 R2

2026-11-15。**设计GO保留；P0=0，P1/Major=0，剩余P2=1。** 固定输入 `6e766154178a9efa56bead57a12fff178c263d05`，仅对比R1 `e4082196e1437aa2bf0a34bf7e36828b24a58f98`。当前仍仅设计/review，不授予fixture、TDD实现、代码、CI、模型或发布权限。

六个文档delta与Git blob逐字节一致；R1报告复制hash仍为 `8e1e02305a7b8e7f5d9a64c4215d7e0a94905327c7f3922a5e04a101c0e2ea4d`。matrix/产品/测试/包/workflow未变，64仍planned、0implemented/0executed。本轮未运行Node/tests/模型、读auth或创建资源，只写本报告。

**P2-01已关闭。** Spec016:131–135明确两job均计算全64输入的datasetHash和所有adapter/worker/browser/oracle的oracleSetHash，case实际input只匹配本manifest，canary另hash且不入64；source/lock/catalog/profile共同校验，环境按层兼容而非伪装相同。与Plan/trace/IT同步，解决跨case误比与跨层漂移隐藏问题。

**P2-02的deadline/owned cleanup合同已补实，但接口仍需一处澄清。** Spec016:143–154明确30s实时parent watchdog、child隔离同步工作、CLI/HTTP/browser/teardown界限和owned TERM→KILL，且明确Promise.race不能抢占同步JS，方向正确。

剩余P2位置：Spec016:21仍声明`evaluateCompiler(...):CaseResult`，Plan016:14相同；Plan:34–36直接读取`compileInOwnedWorker(changed).kind`及同步evaluateCompiler结果。若这些是负责实时watchdog/IPC的**父进程入口**，应明确Promise返回并在示例await；若evaluateCompiler是**worker内同步函数**，应另命名/注明父进程异步入口并让示例通过它。否则读者可能用同步blocking调用实现“实时父watchdog”，与新增生命周期合同相冲突。最小修正只涉及设计签名/调用角色，不需要新框架或产品API。

这项是非阻断设计细化，但在宣称两P2全部关闭前应定向确认。后续仍须用户明确implementation授权，并在具体fixture/matcher/worker协议TDD kickoff复核后才编码；现有64矩阵、case counts和BM3/BM4/parent43/merge-release边界不变。

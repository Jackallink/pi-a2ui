# Helper调用适配 · Round1

Canonical：[Spec026](../../specs/026-helper-invocation-adapter.md)。设计/zero授权，真实预算0。

## 用户故事 / 范围

| ID | 故事 | 优先级 |
| --- | --- | --- |
| US-001 | 用户希望固定当前目录的只读helper查询不因冗余cd前缀中断 | P1 |
| US-002 | 用户要边界可证明，不能借此开放其它shell/目录/程序或真实调用 | P0 |
| US-003 | 用户保留旧STOP，零推理验收后才确定新场景/额度 | P0 |

IN：P-001有限命令解析/执行，P-002 zero SDK/UI与错误分流，P-003隔离/保全/无模型入口。OUT：真实推理、产品包/skill改动、旧case重评/余量、通用shell、发布/全局部署。

## AC（Given / When / Then）

| ID | Given | When | Then | 优先级 |
| --- | --- | --- | --- | --- |
| AC-001 | 新offline policy或旧grant | 默认/CLI/API/worker请求live | SDK/配置/workspace前拒绝，provider0 | P0 |
| AC-002 | 固定owned上下文 | 解析direct或唯一合法prefix | 全串先验，仅得到固定Node/helper/参数计划 | P0 |
| AC-003 | 合法plan或注入/外部串 | 进入进程边界 | 前者只运行实际helper/Node24/owned cwd，后者无执行/副作用 | P0 |
| AC-004 | usage/INPUT或policy/timeout | 工具处理 | 前者普通关case；后者fatal；候选/调用事实不混 | P1 |
| AC-005 | C/G actual SDK synthetic | 示例/check/渲染与错误 | 同样适配、真实helper/DOM，继续/停止有据，不称模型改善 | P1 |
| AC-006 | 固定候选源码 | 完整验收/保全 | 本地完整checks/独立GO，原76/lock/两包/历史不动，真实0 | P0 |

空命令/未闭引号/非owned cwd/多条命令/取消均拒绝或依既有fatal状态关闭；已知缺draft按准备失败。技术未知转R2闭合，不新增真实授权。

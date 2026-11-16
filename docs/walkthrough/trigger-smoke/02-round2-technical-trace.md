# 双场景smoke · Round2 · 2026-11-16

Canonical：Spec023。当前为待实现闭环，不声称当前12会话脚本已满足。

## P-001 设计/准入

| 用户操作 | Handler/组件 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| 当前请求设计，或未来未授权执行 | 文档检查；未来smoke CLI / worker / imported API同一policy guard | design-only / denied | 当前Node24只读JSON/哈希，无SDK/auth/API；未来先验证新grant/源码/1与3及总4，旧pilot guard仍禁用 | 本地设计/拒绝报告，无画布 |
| 未来获授权并通过代码检查 | 新smoke入口→受限policy→actualSDK capture→新grant/独占锁 | approved→preflight→admitted | 两例原样B首body，不使用旧normalizedBody；逐次验证唯一Ark endpoint/body，journal fsync后才POST | 独立2行结果，不用旧12行paired summary |

## P-002 简单确认

| 用户操作 | Handler/组件 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| 固定SM02消息 | actualSDK完整message_end观察→新smoke判定 | ≤1准入；complete / unknown | glm-5.3-flash仅1请求；相同5工具可见；完整toolCall先记requested再停在执行前，无后续请求 | 正常收到且无tool则无模型画布；tool误选记fail_tool/stopped_by_policy而非schema拒绝；失败则SM01 not_run |

## P-003 信息收集

| 用户操作 | Handler/组件 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| SM02通过后提交SM01 | 新session/owned workspace→actualSDK→相同安全tool guards | ≤3准入；preparing / text / requested | read/helper/write可自主选择；只允许owned draft；未准入下一请求不污染已完成requestDiagnostics | 三请求只准备则preparation_limited，不强制UI |
| 模型选择render | SDK schema→正式extension/compiler/UiSession→owned server/browser | requested→rejected或attempted→committed/error→stopped | actual handler不改；首次预检/handler结果终止；snapshot/DOM只读，POST动作spy=0 | 检查应用/环境/版本可填写字段与提交/确认入口；无真实发布、无虚构已确认值 |
| 超时/错误/预算/清理故障 | durable预算、R2增量observer、父进程与receipt checker | unknown/stopped | request30s、worker42/102s、批次180s；usage先保存，缺收据保留journal；不重试 | 两行保留主错/unknown/not_run，无效果对比 |

状态：design→future-authorized→offline-code-GO→capture/locked→SM02→(pass才SM01)→stopped→receipt。所有未来POST都受1/3/4政策约束；当前停在design，未开放任何真实请求路径。

# 主动触发pilot · Round2 · 2026-11-16

参与者：Codex设计草案。Canonical：Spec022；新harness尚未实现，以下为待离线验证的闭环。

## P-001 正例配对

| 用户操作 | Handler/位置 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| 提交一条固定自然任务 | 新pilot驱动→Pi1.5 SDK；实际0.1.10 extension注册边界 | 新session、同路径重置workspace；A只替换description句，B原样 | 离线捕获实际provider首请求，比较消息/工具/参数，仅允许该句delta | 无UI；不启动原生摘要画布 |
| 模型自主决策 | ModelRuntime受保护fetch；完整assistant message toolCall观察，再由Pi tool_call观察/安全guard | 发送前journal；SDK校验前记requested，SDK校验后记attempted；保留准备和文字 | 唯一POST Ark /api/plan/v3/chat/completions；tool_choice auto，完整脱敏SSE输出 | 准备步骤不算画布；普通文字正常结束；参数拒绝仍计选择 |
| 模型选择render | SDK参数校验→现有extension.ts→compiler→UiSession→owned loopback server | schema拒绝即止且attempted=false；实际提交后取snapshot/revision；禁后续provider调用 | 未改actual a2ui_render handler；模型source原样；真实浏览器只连owned origin | snapshot/DOM给事实检查；不点击产生新消息的Button；native卡排除 |

后端响应：供应商错误/截断单独归因；工具错误保留。状态 `prepared→admitted→streamed→preparing/text/requested→attempted/rejected→committed/error→closed`；只有实际tool_call进入render边界可设attempted，但选择/误触发以校验前requested为准。

## P-002 负例配对

| 用户操作 | Handler/位置 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| 提交N01/N02 | 与正例同一SDK/工具/上下文设置 | 新session；无历史，禁止特殊负例工具集 | 同一受保护Ark API，正常自动tool choice；不得移除render工具来制造通过 | 模型纯文字结束则无画布；完整模型render调用即记误触发，即使SDK随后拒绝；准备另列 |

后端与状态复用同一驱动，正常文本不附加“请用UI”的二次提示。UI可用性由正式工具定义决定，不能靠隐藏工具作弊。

## P-003 预算与取消

| 用户操作 | Handler/位置 | 状态 | API/后端 | 响应后UI |
| --- | --- | --- | --- | --- |
| 未授权或仅预检 | 新pilot CLI admission | default dry-run；provider=0、credentialReads=0 | 不初始化真实auth/runtime；API不发送 | 仅本地计划/身份结果 |
| 达上限、身份错、限流、超时或取消 | 发送前预算/身份guard、worker父进程、cleanup | stopped；journal已admit不回退；receipt未知即unknown | 禁重试、redirect、其它provider与后续请求；认证/限流/未知请求结果停整批；完整结果仅usage缺失仍占请求额度并记usage_unknown | 持久报告标not_run/unknown；关闭owned浏览器/server/session，保留主错 |

已确认可复用的现有边界：ModelRuntime fetch拦截、Pi inline extension factory/工具事件、read-only配置admission、真实renderer/server和父进程清理。不能复用原BM4的强制skill/render hint或固定dataset/profile入口。实现者负责在付费前用实际SDK synthetic transport证明以上路径与首请求一致性；尚无live请求或闭环通过声明。

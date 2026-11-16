# Fresh helper pair · Round2

Canonical：Spec027。未来paid driver未实施；本轮无配置/model。以下是后续技术契约，不是现有paid实现。

## P-001

| 用户动作 | Handler/组件 | 状态 | API | 后端 | UI/响应后 UI |
| --- | --- | --- | --- | --- | --- |
| 用户另行明确新条件授权 | 未来known paid profile/grant早guard | fixed source/两新captures/档/hash；一次claim | 全部zero/code GO后才允许readonly Ark配置 | durable准入先于SDK/config/provider，不复用永久offline ID或旧21 | 尚无UI；当前保持document-only/live=false |

## P-002

| 用户动作 | Handler/组件 | 状态 | API | 后端 | UI/响应后 UI |
| --- | --- | --- | --- | --- | --- |
| FC01-G→FC01-C；读取准备资料、生成首source | 各自actual factory/metadata、受审finite adapter、同臂compiler | 同题/路径/工具；包引导不同；plan接纳与actual spawn独立 | 唯一glm原生12cap；read/owned write/edit、helper、check、a2ui_render | canonical单Node参数、实际cwd/PID/退出码持久见证；raw历史不改；首check或首render判分 | 首check/首render单列；实际commit+目标DOM才算UI，不修原候选 |

## P-003

| 用户动作 | Handler/组件 | 状态 | API | 后端 | UI/响应后 UI |
| --- | --- | --- | --- | --- | --- |
| 普通失败/额度耗尽，或致命异常 | case closure / batch stop / 新两行summary | 普通关case继续下一计划臂；fatal余行not_run、grant封存 | 每6/总12；worker180/batch420；无retry或换票 | usage/INPUT/compile/static按普通；漂移/unknown/policy/audit/timeout/cleanup按fatal；durable日志及清理 | 未commit不假称UI；2行report保留unknown费用，不称总体改善 |

新summary须处理两行/每臂1，不使用Spec025固定四行统计。当前document-only profile不是这些接口的执行实现。

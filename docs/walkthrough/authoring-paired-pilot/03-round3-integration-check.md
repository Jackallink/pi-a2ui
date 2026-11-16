# 首次候选配对验证 · Round3 · 2026-11-16

Canonical：Spec025。测试意图，尚未实施或跑新模型。

## E2E / AC映射

| ID | 路径/AC | 未来应证实 |
| --- | --- | --- |
| IT-001 / APG01 | P-001 / AC-001,008 | 未授权CLI/script/API早拒绝、grant单赢家/不可重放、C/G哈希/capture/源码漂移拒绝、真实配置/provider见证器0 |
| IT-002 / APC01 | P-001,002 / AC-002 | factory/skill/helper/compiler均来自同臂包；相同绝对路径/消息/工具；SDK初始差异仅登记description/system snippet，不改写NEW/吞有意义差异 |
| IT-003 / APB01 | P-002 / AC-003 | 每6/全24/tool12、一check一render、短写/fsync/torn/丢receipt不返额；native/model/URL/1536/98304bytes（96KiB）/1MiB边界 |
| IT-004 / APF01 | P-002 / AC-004 | check成功/失败、schema错、直接render、INPUT错误、partial draft、预算耗尽、check后改稿、无candidate/unknown各自归因；旧指标不重算 |
| IT-005 / APO01 | P-003 / AC-005 | 两case3keys/3TextField/空值/三required/FP02 1-2-40-41Unicode边界；允许omitted/shortText/longText且DOM仅text/textarea，string绑定的number/obscured反例；错key/额外Checkbox/隐藏真实控件+无关可见控件反例；actual DOM绑定与POST0 |
| IT-006 / APS01 | P-004 / AC-006 | 首check/compile/schema/语义/准备限额结束case但继续其它3行；401/stream未知/drift/越权/timeout/cleanup停批；闭合case后empty aborted/no新admission不改diagnostic的actualSDK对照，而in-flight取消/timeout仍fatal unknown；180/780含终止清理 |
| IT-007 / APR01 | P-004 / AC-007 | 两分母、0分母N/A、4actual候选且合取判分known才比较；known无candidate只描述交付/开销，不完整pairs不提升、G胜/反向/持平/无UI、usage缺失/knownprefix、exact/单LF/mismatch/unchecked，不能把preflight当UI |
| IT-008 / API01 | 全部 / AC-008 | 新驱动固定source完整本地CI及normal offline/capture/两包身份与独立代码GO；旧raw/锁/档/冻结结果保持 |

## 错误矩阵

| 条件 | 结果 | 后续 |
| --- | --- | --- |
| 当前仅设计授权 | design-only / budget0 | 不实现/读真实配置/造livegrant/调用 |
| 首候选编译/任务语义错，schema/内容错 | case闭合、分层失败 | 不修复当前臂，继续剩余固定计划行 |
| 只准备或无candidate/正常cap用完 | not_observed/preparation_limited | 不当DSL错误、不借额；继续下行 |
| check成功但没render | firstCandidate可正确、UI未观察 | 不叫整任务成功 |
| check/render有单LF或其它变化 | 兼容/不匹配如实记录 | 不trim-all或倒改原判分，不加产品receipt拒绝 |
| HTTP/流/SDK未知、截断、身份漂移、越权、timeout/cleanup | fatal stop / unknown或protocol | 后续not_run，锁/账本/已知准入保留 |
| 闭合case后空SDK aborted，已有请求终态known且无新准入/diagnostic | 本地停止产物 | 不覆盖stop/toolUse/usage/UI，不升fatal；in-flight取消仍fatal unknown |
| known noCandidate或实际提交分母0 | 正确性比较不可用 / N/A | 保留4行，仅描述预算内交付/准备，不称候选正确率改善 |
| usage/fee缺失 | unknown | 不零填；其它无fatal时可按状态继续 |
| 剩余batch时间不足完整180s | 后续not_run | 不给最后一臂更短窗口 |

技术定义无悬空的新公共API；驱动未实现是明确的后续准入门槛，不是可以当场运行的假命令。Gate1已获独立R2设计GO，来源9156b34/Check122；其后仅申请一次≤24新调用条件授权，最小适配/零推理/独立代码GO完成前仍不可运行。模型改善未知，2paired方向不能变成总体率证明；额外读skill准备开销会被记账。

漂移与回退：本轮仅设计。当前两个包/lock/旧raw/冻结材料不变；未来撤销新private适配也不能恢复旧grant/剩余额度。不发布、不更新用户全局安装。

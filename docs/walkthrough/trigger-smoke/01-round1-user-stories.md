# 双场景smoke · Round1 · 2026-11-16

Canonical：Spec023。当前draft；用户授权设计/独立审查，不授权真实请求或适配实现。

## 用户故事

| ID | 故事 | 优先级 |
| --- | --- | --- |
| US-001 | 用户先用一个简单确认核对修复链路，再观察发布信息收集是否自主用表单 | P1 |
| US-002 | 用户限制全批4请求且不为准备瓶颈、异常或未知结果补钱重试 | P0 |
| US-003 | 用户需要保留旧失败/冻结基线与本机状态，区分设计GO和付费运行资格 | P0 |

## 范围与路径

- IN：正式0.1.10原样新句，SM02-B确认≤1后SM01-B表单≤3，新batch总≤4；当前只设计。
- OUT：A组/效果提升比较、冻结重跑/重计分、其它模型、真实发布、安装/产品/skill改动、当前实现/livemode开启。
- P-001：未获新授权的dry-run/设计及未来发送前准入。
- P-002：SM02-B完整回复或误选工具，决定是否继续。
- P-003：SM01-B正常authoring、窗口耗尽、render/DOM及错误停止。

## AC（精确定义在Spec023）

| AC | Given / When / Then | 优先级 |
| --- | --- | --- |
| AC-001 | 无新授权或身份漂移 / 任一入口 / 配置、工作区和HTTP前拒绝 | Must |
| AC-002 | 1/3/4额度 / 每次准入 / durable记账与双重限额，不互借、不退款 | Must |
| AC-003 | 新句与自然消息 / actualSDK首body / 只用B、相同工具、无强载skill、参数/哈希一致 | Must |
| AC-004 | SM02完整消息 / 正常文本或toolCall / 收到且无tool才pass；其它停批，意图先于SDK拒绝计数 | Must |
| AC-005 | SM01 authoring / 准备、首次render、窗口 / 分维度记录、不追加请求、无真实发布/按钮POST | Must |
| AC-006 | 错误/取消/缺收据 / 终止 / 记unknown/主错及not_run、清理owned资源，不自动重跑 | Must |
| AC-007 | 未来适配完成 / 付费准入 / 固定源码完整本地检查/独立代码GO与历史hash不变 | Must |

风险：3请求未必够表单authoring；允许记录ui_not_observed/preparation_limited，不擅自扩预算。SM02无render但调用read仍不符合用户的只回复要求，不算负例通过。

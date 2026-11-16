# Fresh helper pair · Round1

Canonical：Spec027；设计提案，paid当前授权0。

| ID | 用户故事 | 优先级 |
| --- | --- | --- |
| US-001 | 用户先看修复后真实helper通路和全新任务的单题首次候选差异 | P1 |
| US-002 | 用户将新请求上限缩为12，不复用21或冻结题，不自动补样本 | P0 |
| US-003 | 用户需区分意图/实际执行/编译/真实UI及未知，不能假称率提升 | P0 |

IN：P-001新授权与对照、P-002两session原生模型/helper/首source/UI、P-003预算/停止/两行报告的设计。OUT：当前paid入口实现/配置/model/grant、旧题改分、业务操作、发布/安装。

| AC | Given | When | Then | 优先级 |
| --- | --- | --- | --- | --- |
| AC-001 | 无新授权/旧额度 | live请求 | SDK/配置/provider前拒绝 | P0 |
| AC-002 | 固定同题C/G档 | 新capture | 同路径/安全说明/工具，仅允许真实descriptor/snippet差异 | P1 |
| AC-003 | 每6总12与工具12 | 准入 | durable先记账、原生参数唯一、超限无dispatch | P0 |
| AC-004 | 首source/UI | 判分 | 同臂compile/static与实际DOM分别；INPUT不算DSL错 | P1 |
| AC-005 | 准备/进程/普通或致命错误 | 响应/清理 | raw/canonical/actual分层、普通继续/fatal stop | P0 |
| AC-006 | 2行及缺失 | 统计 | 每臂计划1、无candidate N/A/unknown，不称总体率或因果 | P1 |

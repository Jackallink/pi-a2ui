# Check126：helper适配有限实施与零推理验证

Canonical Spec026。状态in-progress；设计Gate1/Gate2独立GO后实施，实际代码GO/固定source完整CI待后续。本Check只记录新offline控制，不重评旧Spec025、不跑冻结真实模型、无新真实grant或费用授权。Node24.18.1；模型名称仅glm-5.3-flash的synthetic wire，无provider网络。

## TDD与分层证据

- `policy-red.log`：旧policy对合法新ID拒绝的真实RED，只证明该第一准入缺口；最小注册后`policy-green.log`1pass。
- 新profile/fixture/owned接入打通但仍用原helperCall时，`sdk-prefix-red.log`2项中direct真实SDK/DOM对照pass、prefix实际tool_policy失败（1pass/1fail）；这是parser功能RED，非缺模块/编译或fixture失败。
- 新纯parser→plan→可信单Node命令接入后，`parser-green.log`5pass，`sdk-prefix-green.log`2pass；全部针对实际readonly helper/受信cwd/case数据，非模型效果样本。
- `targeted-green.log`中SDK10路径通过，进程探针因误用Pi1.5 wrapped AgentTool的上下文调用失败（14pass/1fail）。`type-initial.log`同样发现该测试接口参数数目错误；两者是fixture/setup错误，不冒充行为RED。按systematic-debugging读SDK工具定义接口后，探针改用createBashToolDefinition+明确ctx.cwd且关闭无关session-env，`process-green.log`5pass、TypeScript恢复通过。实际Node进程观测固定Node24、精确argv及cwd（与创建时fallback cwd不同），包括空格/中文/单引号和引号内&&/分号等固定路径。
- SDK10已验direct/prefix、真实C/G helper/check/首source与DOM、非法cwd/额外&&/重定向/替换无helper执行/sentinel不变、usage/缺draft普通、真实helper timeout fatal。`cli-and-unit-green.log`10pass（6unit+4CLI）：含新6/12 durable限额/不能借额/torn、实际default/help/execute/grant/import API/direct live早拒绝见证器，及同一hook正例证明SDK evaluation可被发现。正常拒绝路径SDK/config/network/setup/spawn计数0。

## 实现边界

新tests/helper-adapter/{profile,invocation}.ts及profile/fixtures.json，新增scripts/helper-adapter.mjs默认dry-run/只支持offline。仅新helper-invocation-offline-1 opt-in，两行HX01-C/G，marker/base独立，真实预算恒0。当前3个既有private改动为policy.ts（新ID/输入集）、episode.ts（按policy选parser/新的synthetic条件、独立安全说明/plan事实）、authority.ts（4个只读包/capture函数已知ID参数、默认PAIR）；旧helperCall/旧安全说明/旧CLI/profile/付费guards不放宽。

parser先验证全串、quote-aware separator、固定cwd/Node/helper/op/args，再构造argv和安全单参数引用的Node命令。仍沿用Pi bash执行，未实现shell:false；不执行原始模型shell或cd。accepted plan与实际结果分层、blocked不改成executed，firstCandidate仍按实际check/首render计。模型native reasoning块不写报告。当前只定向开发证据，不借用过去581/91为新实现验收。

保全快照含166unique。旧99runtime中允许3私有文件按本设计改变，其余96保持；新增运行输入要纳入固定source identity。76产品payload、lock、两归档、旧真实raw/锁/审查/冻结均须保持。新固定实现source完整Node/type/四组browser/strictunion、normal zero CLI、独立代码/隐私/边界GO后才将本阶段complete。其后只设计下一轮场景/调用预算，真实调用另授权。

追加分组运算符反例：grouping-red.log确认未执行的括号组合被过早归usage；lexer把引号外括号明确归policy，unit-final.log 6pass。所有166保护文件hash未变；实际代码仍未获最终GO，后续新source完整CI不可借历史值。

已读锁定SDK的validateToolArguments：工具入参为原assistant arguments的structuredClone。history-green.log实际SDK正例再核对后续provider body中的bash原串hash等于helperAdmissions的rawCommandSHA256，不等于执行重建串；新增字段只投影命令hash，不存原生推理内容或完整续请求。

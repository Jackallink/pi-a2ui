# BM4 single-run outcome interpretation — scoped GO

实际once-only source：`365b783214a961b900e7fc3afc38296f318d3cf3`；receipt `.local/bm4/run-1794747888378-59220/report.json` SHA256 **`cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b`**。独立确认7239→365仅6份docs/evidence变更，无被审实现/profile变化。**事实解释与原始测量保留 GO；0 P0 / 0 P1 / 1 P2（非阻断DX后续建议）。** 本结论不是release gate或再次推理准入。

## 实得分母与结果

|层次|本次结果|解释边界|
|---|---|---|
|计划/启动|12/12；unknown-start0，not-run0|12个不同episode，一次baseline|
|Provider|43 admitted HTTP attempts，41 completed|实际usage记录41；缺2次usage不能作0或完整账单|
|Preflight|10 checked、10 compiler-legal|10/10已检查成功，另2例未到check；不是12/12编译成功|
|Render/intent/native|7 rendered、7 intent/native通过|7/12 first-pass success=58.3%；7/7 rendered通过只是条件分母|
|Static/local|6/6 planned通过|M04/M05/M06/M07/M11/M12；0POST/queue，不算dispatch成功|
|Interactive|1/6 planned通过；1/1 rendered通过|仅M01；5个未render场景的交互未被检验，不能宣称100%交互成功|

独立读取12个Mxx.json并逐项与总report核对stage/started/compile/render/intent/action/static/providerCompleted/usageKnown；每个case requests与其journal行数一致，合计43。M01实际[202]及Pi queue含accepted epoch/revision1/sourceComponentId和typed `{file:"src/app.ts",line:42}`。其他成本、真实配置hash及完整cleanup审计由另一reviewer负责；这里不代替其结论。

## 三例 handoff 失败：不能改写成compiler defect

独立从actual bash tool result JSON取checked.source，再从assistant transcript的a2ui_render toolCall取attempt.source，均各1份，surfaceId同为bm4，且case保存source等于check返回source。**三者唯一差异均为删掉末尾一个LF**：

|Case|UTF-8 checked→attempt bytes|实际分类|
|---|---|---|
|M02|536→535|toolpolicy：terminalLF丢失，guard在render执行前阻断|
|M08|305→304|同上|
|M09|331→330|同上|

全部满足`checked.source === attempt.source + "\n"`。已检查候选确实compiler-legal；attempt没有进入实际render/其生产compiler，因而没有证据说compiler拒绝合法DSL、render runtime损坏或typed browser失败。人工阅读checked source的核心Name/Accept guard、Target数组绑定、Requests signed series与任务相符，但没有补跑intent/browser验证；**维持原7/12，不补成10/12，也不把缺LF视作本轮准许的等价source。**

**P2 follow-up：** 三个独立episode的同一种source-string重序列化摩擦，足以支持一个窄DX研究项：skill/CLI/check结果到render参数的可信source交接如何减少末尾字节丢失。后续可先做明确handoff说明或设计受审的源引用/字节传递方案；不能据此直接发明archive API、宣称现有生产compiler有bug，或在当前baseline里自动trim、修复、重试、换profile重算分数。现有guard是按已冻结合同工作；这是guarded-profile authoring friction，不是已确认的生产缺陷。

## 两例超时与证据限制

M03：3requests/2completed/2usage，case90s deadline，未check/render；M10：1request/0completed/0usage，request45s timeout，未check/render。两者usageKnown=false原样保留；不能把没有候选归因于DSL/intent错误，也不能把SDK零默认值当实际零成本。报告harnessAccepted=true表示已启动case/accounting与边界完整，不表示12个任务成功。此次12例是固定profile的一次描述性测量，不是通用GLM/产品成功率或模型对比结论。

关键case receipt SHA256：M02=`99ec32e8fa7644cbffaaf62ebd9fce9dcf05cbe8d0bacd242e159372a2fcd89b`；M08=`00ecc00e981011d17c598908441eeea48a86d5f819f1d81712853f059e73d544`；M09=`e4f3047a1bb70e28b2ed22f7788073781e8fbdda79cf851828e8f7d38c3fe96d`；M03=`fbf937acde923e1c0ef0ad8099519a56edaac5db4b9be66f9d151563db75a0f2`；M10=`9856df5f846bd1614df886915baa4d246831c9e3f6041e93fac2f8450f8c376f`。

本轮仅只读JSON/journal/transcript、source diff/hash与静态源检查；未读真实config/auth，未新增tests、运行模型、重拍/修复或远端修改。未做pixel QA/全组件/a11y/Pi后续执行保证。原首尝试分数和失败保留；PR55、43/51/52、merge/release/global升级均保持各自独立边界。

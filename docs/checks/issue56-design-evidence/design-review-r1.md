# v0.1.9 / issue56 design and TDD-intent R1 — GO

固定设计：`8a48619da34ed4ca244d0e6b4cb88687b7d02ab7`，base `906155450e60723a44c5b42a3fee74787e96a15c`。**0 P0 / 0 P1 / 2 P2；bounded design/TDD意图准入 GO。** 两项文字消歧应在对应消费者/分类测试落笔前收口，不需新平台/产品API。当前仅6份设计文档新增，尚无handoff实现或v2模型结果。

## P2 findings

1. **synthetic计数的0口径需一致。** Spec019:36 AC004写`0providerrequests`，但既有actualSDK synthetic路径会累计非零providerRequests；Round1:16已正确写0actualmodels。应明确 **0外部provider HTTP / actualModelRequests=0，synthetic admitted requests照实计数**，避免为了表面0而抹掉SDK机械路径的请求证据。
2. **未知B异常不能归为候选不合法。** Spec019:19要求unknown internal exception不冒充candidate illegality，正确；但Plan019:33的“Only failed checkedA is harnesserror”和Round3:13的“attemptedcompilererror→false”过宽。应明确：实际compiler的typed UiError B rejection可记attemptedCompileValid=false/attempted-compile；handoff边界unknown/non-UiError在任一侧均记null/setup-harness failure并阻断，B也不能例外。补此分类canary意图。只按现有compiler可观察边界分类；它包装为UiError的内部cause不应被benchmark伪称已可靠诊断，不能为此重写production validator。

## 主合同 / AC闭合

- Spec019:11–19选择实际compile A/B和wholeSurfaceMessage canonical equality；仅排序objectkeys，arrays、IDs、catalog/surface、所有action/context/bindings/data/opaqueartifact值不丢失；直接比较完整canonical内容，hash只诊断。它是保守compiled-contract identity，不是可见UI等价推断。原B字节不trim/repair/替换，actualextension只收到同一个B，且原一次preflight/一次attempt与成本/path/config/cleanup限制不变。无公开sourcehandle/RPC/state/dependency扩张。
- AC001–003对3原始A/B retrospective controls、格式正控与独立compile-valid changedcontract负控映射明确；非法参数、invalid/overbudget source不进入render。PlanTask1要求先真实compile preconditions，再旧bytepredicate consumer RED，并另留actualSDK terminalLF control RED→GREEN；不能把缺模块/fixture/setup失败当RED。后续还须核新helper/worker typed观察和actualB字节传递，当前没有实现PASS声称。
- AC004以真实SDK/packedskill/helper/server/browser/202+typedPi queue证明新profile，不伪造ACK，不让synthetic进入模型分母。AC005分别记录checked legality、attempt legality、compiled identity、byte fidelity、render/intent/queue；v1profile、Checks094–100、365真实7/12完整保留。新v2只有synthetic/offline证据，real baseline明确not-run，无预算追加/重试/重算。
- AC006的local-only CI替代执行地点，未豁免Node24/types/fullbrowser/strictsame-source68union/prepack/payload/install/skill+toolownership/独立review。quota override将以rootAGENTS的Scope/Inheritance/Override/EvidencePath记录，workflow保持disabled。实际integration/main与组件检查分层，43/51/52/56只在对应集成acceptance后关闭；version/archive pin与包外profile不产生hash自引用。远端状态是本任务给定事实，本轮未网络复核，也未授权任何发布/closure动作。

## 独立只读证据

已读Spec019、Plan019、3walkthrough、Check101及必要compiler/caller/tests。指定wrapper **Node24.18.1** 窄characterization：直接从原365 case receipts取M02/M08/M09 A/B，逐一证实A=B+terminalLF、两者均actualcompile接受、完整canonical message相同；另合法changed context number→string仍编译接受而whole message不同。这只是设计可行性分析，不是新guard TDD/行为测试或旧模型重评分。未启动SDK/浏览器/model、未读真实auth/config、未改source/index/HEAD。HEAD始终8a48619，status空。

SHA256：Spec=`5c37223c52823517f0562e91b186abf368990460f3a87f02cf3bc3f5c862df2c`；Plan=`5e6c4ec5309a9462ef7da550933269d643d51281ab14bdb8dea073d93588df74`；Round1=`2fb84edc2fe58365561d4c5440d418e1708ed3fd9fddff66bd27b66f95aa0b1b`；Round2=`46d63661382759a3441610421b22e8c4d3150b168fcca5db9cdd3b9479c4c324`；Round3=`a88266f2a092f86e9c046a3dfef642bc1467e2f2a5bd98adc1002ed0c331800b`。原profile.json在365和当前均=`dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`；原report=`cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b`。

后续只需关闭两项消歧，再root按已授权范围实施，取得有意义RED/GREEN、独立code/profile/localpackage GO及实际integration证据。此GO不是实现/本地CI/发布完成，不授予新实际模型预算或用户global变更。

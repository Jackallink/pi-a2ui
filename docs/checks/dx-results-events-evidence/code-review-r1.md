# DX36/37 独立源码评审 R1

2026-11-15。**GO：仅固定候选的 #36 文档 alternative + #37 acceptance provenance 源码交付。P0/P1/P2均为0。**

## 固定范围

最终候选 `1ee16f99e3b37fb482bb7d8d765b71191f40b1f4`，设计基线 `7715f2ccef676ad7cf7e49d0a0ba9089e3d62bdc`，全scope基线61640a2（PR45）。branch `codex/dx-36-37`。最终相对scope基线的15个文件已逐字节核对Git blob，无漂移。

最终提交比初始实现 `e5b8f9424123f8429b5f06ea429441fb8da51e61` 只补review模板comment及spec/plan/Check；runtime/tests/dist/scripts/manifests无diff。旧e5包是superseded history，未获本reviewer最终GO。设计合同与详细主任务receipt见Spec014、Check066及[设计评审](design-review-r1.md)。

## 独立证据

- **Node v24.18.1，相关92/92、tsc通过。** 在e5固定实现上运行dx-results-events/session/server/extension/forms/coding/interactions-validation；覆盖真实HTTP/注册adapter、queued/reentrant replace/reset、typed/nested同名数据、dedup/guard/bridge retry和安全回归。最终相同runtime/tests身份已确认，因此不重复运行。
- 两个bundle按原esbuild参数`write:false`内存重建，逐字节一致；最终dist及build输入相同。
- **最终75文件**：tar entries/pack manifest/外部consumer/最终Git blob/receipt hashes全部逐项一致。最终归档SHA256 `b7bb7e4855cd3d708b635cdb50448cc94192fd8df7902f1f7f8fc6432a42e69e`；consumer receipt SHA256 `788c0d46ecef5f8cfd6d674e786c39ad33e0d52a4c7db62299d8896523967e60`。
- 最终production helper从repo外cwd独立执行：review模板含新comment、example原文与check source bytes不变；166reported/2visible样例通过，summary166/max和summary3/equality变体分别拒绝。consumer无typescript/tsx/esbuild/optional Pi host，执行后75文件hash不变。
- 原first-red.log已核为**8个missing-metadata行为RED + 1个reference gap**，非missing import/setup；reviewer未在旧源码重跑历史RED。root的full230/230、Chromium45/45、最终template15/15及production32/19/8/3查询是主任务receipt，未冒称本reviewer独立重跑。SDK packaged-skill发现不代表production Pi启动。

## 审查结论与边界

唯一runtime差异 `src/session.ts:219` 从已捕获epoch及选定surface读取revision，JSON在callback前序列化；prefix/旧四字段/context、input/HTTP202、校验/guard/reserve-before-dispatch/same-epoch失败回滚顺序未改。reentrant replace/reset不能retag原字符串，同名context数据不能覆盖顶层身份。

`examples/review.express:3`已补128visible-summary/evidence替代提示。完整166/2/164示例明确synthetic/not executed；schema、128上限、summary equality和19templates/8routes/32types不变。event-provenance文档准确区分accepted与delivery-current，历史snapshot未知则保持未知，无autodrop、执行授权或模型效果声称。

无未决阻断项，可归档本源码交付GO。已知4high上游依赖风险/README披露保留，manifest/lock未变，不是audit-clean或production风险豁免。只补不进入package白名单的评审/Check时核对75payload身份即可，不必重复全套测试。

**本报告不批准merge、release/tag/npm、issue closure、真实安装升级或模型评测。** 未改source/index/HEAD或真实用户配置/凭据，未调用模型/Pi或远端网络；Pi/OS边界使用明确doubles。后续源码/包变更须重新固定并针对变化验证/复审。

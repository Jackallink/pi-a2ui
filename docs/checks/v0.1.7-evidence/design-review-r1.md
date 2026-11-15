# v0.1.7 独立设计 / TDD 意图评审 R1

2026-11-15。**GO：限固定设计的本地集成与版本合同TDD准入。P0=0，P1/Major=0，P2=1（非阻断）。** 不是实现/consumer/model验收或merge/release/issue closure GO。

## 固定输入与证据层

候选设计 `3d26ca98058d00738b03d8e97363d7ddf742c6ec`，base main `67bcb7db5b2d202defb3a3ad52a677c18a23e03b`；branch `codex/v0.1.7-dx`。新增仅Spec015、Plan015和三轮走查；五文件已与Git blob逐字节匹配，无生产改动。

独立静态审查上述文件、现有package tests/README/changelog与acceptance runner；按固定ref读取当前main尚未拥有的Spec013/014，未把依赖缺席误判为实现缺陷。独立验证PR45 `61640a24e7fe0b1cc564258964e3cffba464ec5f`是PR46 `b653cf2e400d20412f33198ecf038e3bc91a0244`祖先，单次local merge46可包含两者。未执行merge、Node/模型、网络或tracker写操作，未改source/index/HEAD/凭据；只写本报告。32issues及milestone counters是主任务audit事实，本reviewer未重新查询远端。

## 范围与合同结论

- 017只收34–38，复用Spec013/014 canonical行为；无新runtime策略/依赖/权限/组件。AC001冻结来源和一次集成，要求保留main已完成016release/guide记录、原45/46heads不变，不能用branch旧文档覆盖已发布状态。
- AC002用现有package版本/changelog测试先在016取得version-contract RED，再改017metadata/root lock与candidate prose；它不是新runtime缺陷RED。README发布安装/移除仍pin016，017仅candidate开发验收；没有虚构017tag。
- AC003/004闭合真实DX→Node/type/build/Chromium→fresh外部production helper→正常private注册0inference。包文件数从实际manifest确定，32/19/8及源码bytes/typed错误保留；production helper、SDK发现、正常Pi启动和模型story是不同层证据，不能互相替代。
- AC005把仅GLM/exact endpoint、natural-language guarded story、原typed context/invalid0POST/valid1POST202/ACK/实际LF双hash/cleanup纳入窄验收，且先offline/package GO；最多一次fresh story，不是BM4或效果/成本比较。没有模型fallback或全局015替换授权。
- AC006仅进入review-ready候选PR；34–38/parent的关闭须后继单独门，43继续open。BM1仍需冻结017诊断profile并另行准入，旧草案不是已实现。历史milestone计数漂移只记录audit差异，不能捏造open缺陷或重开已closed issue。

## P2-01：把accepted-tuple验收的独立oracle落到明确收据/检查步骤

位置：`docs/specs/015-v0.1.7-dx-integration.md:31`；`docs/plans/015-v0.1.7-dx-integration.md:20,23`。

现有 `scripts/skill-acceptance.mjs:220–232`只验证POST/RPC的旧身份和typed context；`verifySubmittedAction:332–335`不会检查epoch/revision。因此旧runner的`rpcContextVerified=true`不能单独满足AC005。

建议在进入实际GLM前明确独立post-check的输入/输出：从同一run原始rendered committed snapshot、实际POST envelope与实际forwarded JSON逐项比较 `(epoch,surfaceId,revision)`，断言顶层metadata，保留精确context；结果与source/package/run identity写Check。可用离线篡改epoch/revision/missing-field反例证明检查器不会假绿。若需要改冻结runner，按Plan已有spec/TDD/review例外处理，不应把缺断言当成付费重跑理由。

这只是已明确AC005的执行证据补细，**不阻断当前本地集成设计GO**；当前尚无付费路径实现/运行GO。

## 下一阶段边界

可以一次local integrate固定46，再以017package测试取得真实版本合同RED，最小调整metadata/文档并验证集成来源和016记录保留。集成冲突或产品source drift必须先记录/复审，不能静默改Spec013/014行为。

实际Node计数/Chromium/pack/startup结果只记Check；offline/code/package固定身份GO后，才按AC005的具体准入审视单次GLM；之后再做最终源码/consumer评审。既有上游依赖风险保留，不是audit-clean或发布豁免。本报告不授予main merge、release/tag/npm、issue closure、真实用户安装或benchmark实现权限。

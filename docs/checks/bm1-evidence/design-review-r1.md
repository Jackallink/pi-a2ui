# BM1 current-profile 独立设计/TDD意图评审 R1

2026-11-15。**GO（仅设计/TDD意图准入）：P0=0，P1/Major=0，P2=1（非阻断澄清）。** 固定输入 `43186540d3fe90224188932fd4e60c9c3674fafd`，base `46f04c6d63819c2cb72c6febd748322ffd7c3f5b`；不是实现通过、CI上线或发布GO。

**身份与证据层：** 11个设计/历史证据文件已逐字节匹配Git提交；无src/extension/dist/scripts/deps/package/skill/tests/workflow实现delta。八份primary原稿及三份复制历史记录均匹配manifest（SHA256 `1f598246c3ec9cd292c252b812d30cf3645370484b5c07b56a1683873aeece0f`）。已读Spec012、Plan009、三轮走查、Check076及必要当前compiler/coding/既有doc/package脚本；未执行Node/tests/model/auth/CI/install或网络查询，只写本报告。230/230 baseline与官方Actions API核验是主任务receipt，未冒称独立重跑。

**合同结论：** `v0.1.7-dx-v1`明确替代legacy profile；固定两family/current400/reason/typed owner事实，与现有源码相符。registry固定字段/路径/静态oracle、四完整fixtures及setup/negative/doc-contract/compile/semantic分层闭合，不重写生产validator，也不把已关闭34–38重算未解决。覆盖分母仅2registered，全项目未知；43原blanket-grep措辞须在交付前校准。

已有两份repair确实存在，因此新RED只能是fixture正例/目标negative均通过后，实际017文档缺少machine-verifiable binding marker所致的**doc-contract RED**；不能称缺prose/runtime bug RED，缺import/fixture/环境也不能替代。两个marker是唯一有意packed-byte变化，017版本/75file边界保持，018release另行准入。

scanner同章节/围栏外唯一heading+marker、禁止借下一章节block、backtick/tilde围栏边界，以及真实compile+手写固定语义oracle，足以定义可检验合同。canaries要求同checker、准确stage；wrongfile和一致修改record/引用IDs必须先独立证明compile-valid，再semantic拒绝。自然语言仍人工review，不能以marker/grep或任意exception自证GREEN。AC001–005及三轮关键路径/错误矩阵闭合。

**P2-01 — 注入范围措辞冲突：** Spec012:34将readText注入限定为“only for missing-fixture tests”，但:60/AC004同时要求invalid-positive及negative分类反例，:63允许injected fixture reads。建议明确仅test-local、仍固定路径的missing/invalid-positive/positive-oracle及negative分类canary可注入读取结果/异常；禁止caller paths、动态oracle和真实fixture写回。阶段定义及目标scope无需扩大。该小delta快速确认后即可开始代码，不需重新扩大设计。

**后继门：** 定向澄清复核 → runnable fixture/checker/tests与真实missing-binding RED → 仅两marker+typed canaries GREEN → targeted/full/check/build/75file与产品零漂移核对 → **独立offline code GO后才创建workflow** → 固定只读Node24/action SHA/workflow最终评审后才授权push/PR → 真实job记录PRhead/event/checkout或synthetic-merge SHA、Node patch与conclusion。未运行/cancel/timeout不GREEN；本地成功不等于hosted CI。无secrets/models/publish/write权限/branch-protection变更。

最终只交review-ready BM1 PR及真实CI证据；parent43/BM1 child仍待后续集成交付门。无merge/publication/global upgrade/018版本或BM2–BM4实现授权。原稿、失败receipt、已发布017及用户配置保持。

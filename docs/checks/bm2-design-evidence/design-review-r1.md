# BM2 独立设计 / AC / TDD意图评审 R1

2026-11-15。**GO（仅设计）：P0=0，P1/Major=0，P2=2（非阻断细化）。** 固定输入 `e4082196e1437aa2bf0a34bf7e36828b24a58f98`，base `63ec895a607d4fe32cc9cedce1344754078ce93c`。当前授权仅设计/review，**不准入fixture、代码、CI或模型实施**。

**独立证据：** 10份设计/evidence文件与固定Git blob一致，无production/tests/skill/deps/package/workflow delta；source-facts内源码hash和018tag peeled identity均重新核对匹配。静态核对Spec016/Plan016/三轮/Check082及必要实际API/browser fixture：64个唯一ID/contractKey与矩阵逐项一致，46C+12S+6B、42positive/22negative；32个compiler-positive subject恰匹配冻结实际catalog名单。**64 planned、0implemented、0executed**。未运行Node、265全套/browser、模型、Pi、auth读取或网络/CI；只写本报告。32helper查询/三项compiler probe是主任务设计characterization，不是BM2 pass。

**合同判断：** 覆盖有实际维护价值：单树合法性与固定数据意图、跨surface/state/resource、真实renderer操作分层，没有通过标签/语言/controls凑64。媒体假URL仅C层syntax，S09才证明注册/auth/reset后404；S07区分structural revision与controlled data sequence；S11/S12区分accepted-reentrant provenance与stale-at-submit；B层要求实际POST/status+callback或明确local0POST，未用fake response/Pi/model代替。64不是全产品/全组件视觉覆盖。

静态adapter/固定枚举/contained regular non-symlink fixture、手写期望及真实compiler/CLI/status分工合理，未另造产品validator。positive controls、wrong-intent先compile-valid再semantic、wrongnegative/state/action canaries和setup/cleanup不假绿已写明；新constructed compile-only adapter的RED只证明新evaluator缺语义检查，不能说018runtime有bug。AC001–006与四路径/错误矩阵闭合。Node58与browser6分开执行/兼容后并集才可64complete，缺失/重复/失败/not-run不能抹去。保留018与BM1、无runtime/权限/模型/像素/成本范围扩张。

**P2-01 — job级数据集身份与case级输入hash分开。** Spec016:123–125、Plan016:20,60。现有receipt列每case fixture/oracle hash，却要求不同层job具有“same fixture/oracle identity”；不同case本来使用不同fixture。建议在未来concrete TDD kickoff明确共享dataset-manifest/oracle-set指纹（或等价完整映射）及每case actual-input/control hash，combiner校验映射后再合并；canary override保留独立hash且排除64。避免错误地拒绝异层正常结果或只看Git SHA漏查实际输入漂移。无需新增通用报告平台。

**P2-02 — 冻结异步deadline/取消清理合同。** Spec016:108,123,133–137、Plan016:47–60。已有finally/timeout失败原则，但CLI subprocess、HTTP fetch、data-frame等待、browser和cleanup的具体deadline/abort与退出顺序尚未明确。建议未来kickoff给出有界默认值和timeout可观察结果：超时必须abort/终止仅owned资源并完成teardown，原断言失败与cleanup失败均保留；fakeclock与真实deadline隔离，S07使用受控tick，不能靠任意sleep。CI job timeout不能替代case级failure/cleanup证据。

**后续门：** 当前停在设计成果。两项P2细化与explicit implementation授权之后，先独立审具体完整fixtures/control/reason-location matcher及TDD kickoff，再做新adapter真实合同RED/GREEN；实现与workflow各自固定源码review，最后才实际Node/browser CI与交付。不得从本GO推导BM3/BM4、parent43closure、merge/release/global升级或任何BM2实现权限。

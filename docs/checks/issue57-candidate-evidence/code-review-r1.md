# Issue57 runtime / restore / visual R1 — scoped GO

固定运行时代码：`32588db722e661112b799a9dfa295720f2e14877`，Spec020/Plan020，design c564 GO；meaningful RED `01642636d9a94c245b367529220b1ea9ca6d58da`。**0 P0 / 0 P1 / 0 P2；runtime/ownership/restore及本次三图视觉 scoped GO。** 不覆盖尚未完成的76file包/v2pin/docs/fullCI/actual-main或发布。

## 代码与authority

- extension.ts:43–58同步消费endedRun、核currentlive/closed/clients/工具数/ownership/budget；直接已served session.render，无ensureServer/await/opener/message/provider。成功立即认领committed revision，再flush真实native snapshot并官方appendEntry。render失败不flush/append；flush/append失败不throw到agent、不回滚用户UI，已创建ownership保留以便下轮替换。重复settled无endedRun，因此不重复card/receipt。
- run-card.ts:18–23为生产gate使用实际snapshot usage减matching-owned旧面再加6；原UiSession.render仍终裁4slots/64components/bytes/native reserve，未预删/evict。原模型run-summary输入ID/schema/prompt未新增限制，15e7109未混入。成功同ID模型替换撤owner，失败不撤；其他render/chart只对matching revision增加可选details metadata。
- controller.ts:37–51只恢复当前branch最新valid known-custom或successful render/chart snapshot，经原reset校验/预算/新epoch/artifact revocation，ownership只来自该selected receipt的匹配safe revision。custom需exact type/customType/data2keys和bounded snapshot，不把tool text/unknown custom当authority；旧tool无meta恢复UI但不猜owner/回扫旧记录。SDK文件roundtrip证明custom留在branch、未入LLM context。
- LiveTools.flush复用原publication逻辑，清原timer、observe elapsed并同步返回实际updateLog snapshot；原refresh/timer throttle和best-effortcatch保留。相关原native/coalescing/late-reset/close/byte-headroom测试通过，未增加runOutcome getter。badge只按agent终止/aborted，工具失败计数和timeline仍实际可见；未宣称任务正确性或immutable历史流。

## 测试真实性与独立验证

读回old history RED：既有成功tool恢复及6-node compile前提通过后，target custom恢复0≠1；browser RED在实际认证/正常model face可见后缺Run summary。不是missing-module/auth/setup RED。后续selector改为实际badge AX文字、截图改卡片scroll/inViewport/原生数据就绪后截取，未改产品制造GREEN；原失败保留。

指定wrapper **Node24.18.1** 独立运行相关extension/live/run-card/history/adapter检查：**48/48通过**。严格身份说明：47项属于固定325测试；另外1项为root审查期间增加、尚未提交的empty-canvas正控（实际/a2ui→真实SSE、从未model render→自动1面6节点/0user-context），另列补充证据，未假称属于原commit。四份被审runtime文件与325 blob完全一致。测试覆盖58+6/59+6、4full、nativebyteheadroom原子413、flush实际failed1、custom最新/坏记录/旧history/接管，以及真实SSE render/flush/append故障。未重复全套/真实browser运行或推理；实际browser正控的断言已静态核对，包括草稿不丢、recovered-tool-error、三终止状态、session_tree/较新chart receipt ownership、失败接管保owner/成功接管及恢复后不认领、0POST/opener增量/user-message。

## 实际视觉检查

独立view_image逐张查看3张card截图：均完整可读，无明显遮挡/裁切/布局重叠。completed图显示success·Run completed，同时真实1started/1settled/1failed及bash error；error图为Run failed、read completed、failed0；interrupted图为warning/interrupted、read completed。它们符合终止状态和工具观测分层，不是pixel gate/全布局/a11y/其他OS证明。

PNG SHA256：completed=`9e5bfbb49beefc3b37cb8a86ac9f2fcdf0e2b51fcf2cebeb3e149806ec679b11`；error=`e8a4e82f70b4645bcb8317cbdbab89330fd6bc6cbe83b83638482e0bfa7806c6`；interrupted=`5801ef2b238839a3d393f6adf76755f471ee34b827452bb274c32b434ddef22a`。

源码SHA256：run-card=`0bfd1729e3ffadd21e5292e949176987084eb0af97d621e04fb186005f79161f`；controller=`cff2afa6cfb2d414f526eb3d95dd69c307e8ac0efe3298d30c95c648dbc96415`；live-tools=`b8b664068c169236409d58d462e0cb803b9cffae0c496263f27c92d353562b71`；extension=`8849357ce80aaa5b246df93c63aa0f338680ac96c5f5f3454617c119d5f95c9f`。历史RED日志SHA：history=`0e02135a449a8d3c28406dffb72bb701e6e3c9cf38a07cc070b00b86940003a1`；browser=`db552ea03f216a2af6e7100a82b8b30e2c97519c340e52c8fc2ca09adcfad182`。

审查期间root准备Task2 dirty docs/skill/payload76/worker expectedcount与上述补充test；未作为固定runtime准入对象，未改写325身份。当前75pin/旧readiness不可当新增runtime包验收；后续需固定76file包和v2pin、完整本地CI/68union/offline/normal消费者、独立最终code/package/main验收，再考虑57 closure。无模型/真实auth内容读/源码或远端变更；Actions仍disabled，publication/tag/global upgrade另行门槛。

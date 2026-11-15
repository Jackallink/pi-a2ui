# DX36/37 独立设计与 TDD 意图评审 R1

日期：2026-11-15。**GO：限 Spec014 的设计门与 TDD kickoff 意图准入。** P0 = 0，P1/Major = 0，P2 = 0。未发现必须先修订的阻断项。实现仍须先在既有 accepted-action API 上取得缺 acceptance metadata 的真实行为RED，再进入最小生产变更；本报告不是实现GREEN、源码交付、merge、issue closure或发布GO。

## 固定设计身份

位置：`/Users/jakeliu/.codex/worktrees/pi-a2ui-dx/pi-a2ui`，branch `codex/dx-36-37`。

唯一被评审设计提交 `7715f2ccef676ad7cf7e49d0a0ba9089e3d62bdc`；比较基线 `61640a24e7fe0b1cc564258964e3cffba464ec5f`（61640a2/PR45）。范围恰为下列五份设计文档，未包含生产或现有测试改动。写报告前五文件与该提交Git blob逐字节一致：

| 文件 | SHA256 |
|---|---|
| docs/plans/014-dx-results-events.md | 644bca118bb92f2a003665d51c87f253541aecaec2c3a3529b53d259959b6586 |
| docs/specs/014-dx-results-events.md | 63f8fa50556cdefb94f723109bf6d37ba75538b007979106da43b948d54bb465 |
| docs/walkthrough/dx-results-events/01-round1-user-stories.md | 5a5255b999b119e30b00471adec5651a80aadca8a3a4be6c74bec922ab836610 |
| docs/walkthrough/dx-results-events/02-round2-technical-trace.md | 5be040db8bf5ba3dceff7413cf3d362e39bc929951a72f2608495b6b82828c7f |
| docs/walkthrough/dx-results-events/03-round3-integration-check.md | cde7a942a798784eaea5acc3e3d2627515db88184393a3fb1cf6c3f55df6bb6a |

独立执行：提交/范围/hash核对，全部设计文档阅读，以及必要session.acceptAction/server/client/extension/coding/renderer和repository acceptance consumers/旧tests的静态审查。只写本报告，未改source、tests、设计输入、index/HEAD或凭据。未运行Node/npm/模型/Pi/浏览器/网络或真实global配置操作。

主任务的Node24.18.1 baseline57/57是主任务提供的运行证据，reviewer未重跑。已阅读只读行为probe `.local/dx36-37-evidence/probe.json`，SHA256 `182d128e3bfd62e97b2fe1bd3ffbc3b0f70ae43160ce09d2574c2f04201c594b`；该probe准确自标不是新feature TDD RED，不能替代后续测试。

## R1 / #36 文档方案

Spec014:7,15,25，Plan014:5–12与三轮P-001/IT-001闭合。按派发给定的issue允许范围选择文档alternative；不发明totals字段、不扩大schema，也不隐含变更visible summary合同。

当前 `src/coding.ts:7` 对case数组及每个summary项均有128上限；`src/coding.ts:43–50`另行按实际rows统计并精确比较summary。单独提高summary max仍不能接受小样本配166总数。`src/coding-elements.ts:9–12`当前把evidence文字和summary/rows分开渲染，因此把reported166及省略说明放入已有evidence、保留2visible pass/summary2可由既有组件表达。

设计要求完整可编译示例、reported/illustrative/no-execution provenance、明确omission及row/DOM/payload边界理由，同时保留其他source/JSON/byte/native/global限制。示例在reference中，不新增第20个template，不动19examples/8routes/32types。完整示例和packaged helper检查可证明修复源合法及固定case语义；自然语言正确性仍需代码/文档review，不能凭编译推断reported166真实执行过。

AC-001及Round3 IT-001可测试：summary166的SDK max拒绝与validateCoding独立equality拒绝应分别证明，129rows仍拒绝，reported166/visible2正例应由真实compiler及packaged helper接受。缺reference示例是documentation gap，不是运行时bug的RED。probe符合这一层次边界。

## R2 / #37 additive acceptance identity

Spec014:9,13,17–19,26–30，Plan014:14–22和P-002/P-003/IT-002–005闭合。

- 当前 `src/session.ts:182–224` 依次执行available、bounded envelope、官方action schema、当前epoch/revision、dedup、实际Button声明/context类型/guard、event容量；之后捕获epoch并同步reserve，再调用dispatch。设计只扩展该处JSON literal，保留prefix与surfaceId/event/sourceComponentId/context四字段，新增server epoch和surface.revision，未添加异步边界或改变reservation顺序。
- 代码中的epoch在reserve前已捕获，revision在JSON.stringify求值时从已选server surface读取，整个字符串在进入callback前完成。因此reentrant replace/reset不能回写已经排队的身份。既有callback同步抛错后仅同epoch删除reservation的规则仍保持；不是把任意后续队列/模型失败当成重新dispatch条件。
- `src/client.ts:173–181`现有请求已携带epoch/revision/eventId；`src/server.ts:120–122`在实际acceptAction结果后回HTTP202。设计不扩input/HTTP response，不为metadata放宽auth/origin/body/guard/context，也不把202承诺为未来模型执行成功。
- `extension.ts:9–12`现有桥接调用 `pi.sendUserMessage(text,{deliverAs:"followUp",expandPromptTemplates:false})`。真实注册adapter+HTTP测试仅替换Pi/OS边界，足以覆盖该桥接而不调用模型。直接mock session.acceptAction的旧server fixture本身不能证明新的metadata，设计明确要求actual UiSession/HTTP/registered executor，避免层次替代。
- acceptance后再replace/reset与submit时已经stale不同。设计前者保留原bytes、不drop/retag，不宣称delivery-current；后者仍409/0dispatch。比较身份必须包含epoch+surfaceId+revision；UUID无顺序意义，历史tool snapshot/restore不足以证明current时保持unknown，没有偷加新current-state query或自动丢弃策略。
- context可合法含同名epoch/revision数据；它们仍留在context，不能用对象spread覆盖顶层server metadata。AC-002已明确typed/nested context保留与六字段边界，可用固定literal oracle断言。

## Consumer兼容与测试意图

已静态审查 `scripts/skill-acceptance.mjs:220–231,332–335` 的forwarded JSON读取/verifySubmittedAction，以及component acceptance和现有form/browser tests。它们读取身份/typed context，严格检查的是context内部字段，未发现必须因新增顶层键而放宽context的现有消费者。外部未公开exact-key消费者风险已在Spec014:36显式记录；不声称所有外部consumer无条件兼容。

测试意图满足设计准入：

- AC-002/004从真实session、authenticated HTTP、注册adapter与实际Chromium点击观察相同acceptance tuple、固定旧prefix/context/options。
- AC-003以确定性queue捕获原字符串，覆盖接受后replace/reset与callback reentrancy；新current event得到新tuple，不能只验证mock的预期对象。
- AC-005保持stale revision/epoch409+0dispatch、current duplicate只dispatch一次、forged context403、disabled503、bridge同步失败503及既有retry规则。reserve-before-callback和same-epoch rollback应由具体矩阵断言，而非只查新增JSON字段。
- AC-006冻结catalog/routes/helper source bytes与input schema，旧snapshot恢复及安全回归保留；后续Node24窄测→full/type/build→实际Chromium和affected package边界，来源与证据层次分开。

这些是尚未执行的准入/验收合同。本reviewer不把probe、baseline或结构文档检查计为新feature RED/GREEN，也不要求运行模型来验证确定性metadata。

## 下一阶段及边界

无需阻断性设计修订。可按R1→R2推进：R1先补真实compiler/参考提取测试并记录reference-gap；R2先让旧dispatch实际发生，再因缺top-level epoch/revision产生行为RED。之后只改批准的一处dispatch JSON与相应guidance/tests，不改其他队列/权限/ordering语义；如consumer审计发现实际破坏或scope变化，先记录drift并重新审查。

完成相关GREEN、源码/dist与production payload验证后，固定实现提交另行独立代码评审。本报告不批准PR44/45变更、版本/tag、全局v0.1.5替换、issue closure、merge/release、benchmark/BM1或模型调用。既有upstream4high风险未被本设计处理，也不构成audit-clean或public production waiver。

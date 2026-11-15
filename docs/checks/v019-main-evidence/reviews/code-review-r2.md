# Issue56 handoff / v2 profile code review R2 — scoped GO

固定对象：`08f9e5bbf64ca3c45a72830771e5f4d28e7c3666`，限定R1 hash P2、handoff完整性/分类、v2profile/report、原B保留和v1冻结。**0 P0 / 0 P1 / 0 P2；R1 P2关闭，handoff/profile scoped GO。** 不表示完整本地CI、安装/集成或发布验收通过。

- **P2关闭：** handoff.ts:12–25以own data descriptor安全提取string source，先记hash/bytefidelity再拒绝invalid record，不执行getter，不编译/放行extraargs。新增extraarg consumer先留RED，再验证拒绝仍保留可用A/B原hash；requireHandoff仍failclosed。完整actualcompile/canonical内容比较及typedUiError B false、unknown/null/harness边界未放松。
- **原B与反例：** worker继续用默认actualcompiler，guard前记录checkedSource/attemptedSource/handoff，未把B替换成A；一次attempt上限不变。SDK LF M02/M08/M09测试显式核实际render tool input source等于assistant原B、bytefalse但compiledEqualtrue、实际202/typedPi queue/0actualmodels。新增legal changed context/binding/artifact SDK负控均先独立compile A/B，再核阻断、未执行render、无POST/queue。六个测试的断言与Check103记录一致；本轮静态复核，未重复跑浏览器。
- **v2与历史：** entry和guards导入新profile-v2；每case带profile，parentreceipt拒绝错profile；aggregate分开byte、attempted legality、compiled identity与render/intent/queue，不将bytefalse当语义失败或synthetic当modelscore。新profile v0.1.9-glm-first-v2 / compiled-surface-identity / package0.1.9 / previousProfilev1清楚。MODEL/CAPS/Node/Pi/case/retry/CI字段逐项与旧profile相同。旧profile、365/report7of12保持原hash，v2真实baseline仍not-run，无新预算/推理。
- **候选身份边界：** profile archivepin与candidate manifest相同，为`e3403959ab64f2fe2c12e579940a1d97bc00068a05e081a0c9437ea77220f806`；独立核75/75 manifest payload SHA与当前file匹配，tests/profile/AGENTS不入payload。rootlock逐项比较仅root version两处变化，dependency graph/SRI不变。本轮未重建/安装tar，完整package/consumer/release gate仍另行待证。

独立执行：指定wrapper **Node24.18.1**，`tests/benchmark-handoff.test.ts`与`tests/benchmark-profile-v2.test.ts`合计 **38/38通过**；含actualcompiler正负、未知/invalid分类、rawhash诊断、实际public dry-run及summary轴。未读真实config/auth，未执行SDK/browser/model或全套；未改source/index/HEAD。完整457Node/89browser等不能按预计数量记绿，等待实际固定源日志、publicoffline/strictunion和最终验收。HEAD保持08f9e5b、status空。

SHA256：handoff=`402433b8cd74290be7adf552211d16477d4160b5d3b76e78cd11ad99597dcada`；worker=`881fb8aa1be32347656d90423c1ad9af05ceb03ab28598578b44453fb067db14`；entry=`83f3d42fbfec619e8af10501849d30778e086f905c0e2f66eff7dbeb29f05a65`；profile-v2=`3d8251ce732ecffd7eabd98516a6667be9e3c4b9c07ecb61abb6f2840ada766a`；candidate manifest=`65b973f8368c9327ae3efd0eafa82d0fc319bc7afea1d871cb14cc4ae5f3e392`。原v1profile=`dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`；原v1report=`cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b`。

后续可继续已授权本地CI/包与集成验收；不恢复/触发Actions，不追加真实模型run/重评分，不把本scoped GO当merge/release/issue closure或用户global/config变更许可。

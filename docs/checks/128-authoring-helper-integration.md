# Check128：首次编写引导与受限 helper 工具合并

## 当前用户决定与范围

用户在Spec026独立zero GO、Spec027设计/预算申请GO之后明确：“先提交合并，后续通过实际使用报issue。”本轮因此获得提交、推送、创建PR并合并到远端main的授权；不再推进Spec027的新付费适配或真实调用。Spec027保留为已评审设计提案，并非排期或获批预算。旧21余量不可复用、所有冻结真实基线与失败回执继续保全。没有版本发布、tag、npm publication、全局更新或issue关闭授权。

远端基线main为77715bfa097d706cae9a1c95b0589fb481d2b818；已审候选aeef146ea2daf08d64183b41fd0a1505f702fd88/tree decbc8764f7ecf3618c2eba830505e813646b621，其36提交全部在该基线上，0远端独有提交。合并范围覆盖Spec022–026已完成的有限工程与历史证据，以及Spec027的纯设计提案。状态和计划中的早期“无合并授权”保留为历史，不改变当前用户授权。

产品变化仅Spec024的7个既有路径：extension.ts、src/assistant-guidance.ts、dist/assistant-cli.mjs、skills/pi-a2ui/SKILL.md及references/helper.md、summaries-and-feedback.md、syntax-and-errors.md。行为是先读skill→匹配示例→适配→check→原样render的建议，以及FormValidation组件ID/绑定/事件键和三字段可执行例子；不是强制预检、自动修复或已证实的模型改善。其余69产品payload、package-lock、版本0.1.10保持；不替换已有发布归档。

其余新增运行代码仅private离线/受授权历史试验工具和测试。有限helper adapter只允许可信cwd/Node/helper/op/args，支持冗余cd前缀后重建单一Node命令；新helper-invocation-offline-1永久offline，拒绝live。历史paid入口仍保留原授权门禁，不创建或复用grant。旧Spec025 STOP/inconclusive保持，不借新synthetic结果改分。

## 既有评审与保全

Spec024 Gate1/Gate2/代码/包与owned discovery及最终文档GO见Check120–121；Spec022/023/025见Check113–124。Spec026完整Node606/browser91/type0/strict68及代码R3、最终zero GO见Check125–126。Spec027仅设计预算GO见Check127，真实授权0。

便携的只读评审副本位于[helper-invocation-adapter-implementation](helper-invocation-adapter-implementation/zero-final-review-r1.md)：code-review-r3、zero-final-review-r1、fresh-design-review-r2、fresh-design-final-bind均逐字复制sealed原件，其原SHA和历史source不改。它们不是本轮新source的测试或合并授权；当前用户授权与本轮本地CI另记。原105输入与166保护文件、17验证附件、16normal run artifacts保持。

## 本轮合并准入

仅本地Node24。固定新source上验证build不漂移、完整Node tests、TypeScript、四组browser与兼容strict golden union；所有模型transport为synthetic，不重跑冻结真实基线。GitHub workflow418909498仍disabled_manually，不改required checks或权限政策。最终结果绑定新source/tree/runtime及日志hash，独立合并审查GO后推送并合并；远端若前进或产生冲突，先重新核对集成树与必要验证，不强推。

风险：模型仍可能跳过提示，收益未量化；仅据实际使用提issue。回退：后续单独revert本PR相关提交，不删除失败证据或复活旧grant。合并不等于release或本机全局部署。

当前本Check是合并准入记录；本轮检查与独立评审尚待完成，不能借旧606/91结果声称新source已绿。

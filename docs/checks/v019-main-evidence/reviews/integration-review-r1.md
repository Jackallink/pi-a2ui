# v0.1.9 fixed stack pre-integration review — scoped GO

固定候选：`48da2f7952076bc34a419f2b6bfd490ca7e72261`（tree `148d0693c0f05268ddcba65730a04272790295e9`）。**0 P0 / 0 P1 / 0 P2；可按下列固定head顺序，以merge commits集成到main。** 该GO仅集成准入，不替代actual-main/localpackage/发布/issue closure门槛。

## 当前只读远端核验与顺序

|顺序/PR|固定head|当前base|
|---|---|---|
|53|`fef18935165efdc2d6b152bebf75e2f830a06341`|main|
|54|`07d6f164b19781870de84c968c7b9c159fcae5a7`|codex/bm2-and-feedback|
|55|`906155450e60723a44c5b42a3fee74787e96a15c`|codex/bm3-layout-regression|
|58|`48da2f7952076bc34a419f2b6bfd490ca7e72261`|codex/bm4-model-benchmark|

本轮GET APIs确认四PR均open/non-draft、mergeable=true/clean且head/base完全一致；main仍`63ec895a607d4fe32cc9cedce1344754078ce93c`，repo允许merge commit，workflow418909498仍disabled_manually。Git本地逐段祖先链成立。远端open issues恰为43/51/52/56/57；57是新增runtime auto-card需求（自动运行摘要卡），不在本次范围。

执行边界：每次合并前重新读head/base/main状态并绑定对应完整head（例如--match-head-commit）；53先--merge，readback merged/mergeCommit/main；之后逐个将54→55→58的base retarget到当时main，再读回base/head/mergeability后--merge。**保留所有分支**，不squash/rebase/force-push，不提前删依赖branch。若head/payload变动、外来main改动或合并冲突，暂停该步并做差异/必要fresh review。每步记录实际mergecommit/tree与main readback；不触发/恢复Actions或绕改规则。当前链可产生最终head内容；不将预测tree等同已合并main。

## 证据与scope闭合

- 读回BM2 code/oracle correctiveGO、BM3 code/baseline/hostedGO、BM4 code/cost/measurement及实际365receipt审查；原NO-GO/RED均保留。BM2最终407→fef仅doc/evidence后继，后续BM3/BM4各有独立GO及源绑定证据。BM1仅两诊断family；BM2为68/45positive23negative，BM3硬geometry/native/3state且MacPNG advisory，BM4真实v1仍12cases/43requests/7of12及2usage unknown，synthetic v2不改写实际模型成绩。
- 新#56设计4424GO→真实compile前提byteguard/SDK LF RED→完整compiled-contract guard→sourcehash P2修复→dd41code/profileR3 GO，完整实现审查未新增P0/P1/P2。B原字节不改，array/ID/action/context/data/binding/artifact均参与比较；v1profile/report冻结，real v2 not-run/无预算。当前48da相对dd41只Check105/evidence和Spec019 review-ready，无代码/payload/oracle变化。
- 独立核manifest的**15个raw/offline文件SHA全部一致**、node/browser identity完全相同且61+7结果均pass、68union正确；dd41 tree与receipt一致。实际日志457/457 Node、89/89 lockedChromium1254、tsc完成；最初78setup fail的错误browser-cache run保留，未假称行为RED或抹除。public--offline为12started/37synthetic/0actualmodels、12检查/compile/render/intent成功、6queue+6static；不是新模型质量分数。
- package/localCI独立R2已读并hash核对：`dd96fc1d6e4c0b97ac7f1c2ec06fe9db4379b7ba26061d07e58ba530b38deb11`，0new/unresolvedP0/P1/P2。候选75payload与当前48da每字节hash一致；archivepin `6a2dd059571c5f1fb56c16cbfbd650d2cb79979694a9eea7845ddb92af70c5eb`。独立R2核实tar/normal local+Git@dd41消费者、Node24/skill/tool唯一性/0agent-model/cleanup-preservation；它仍是candidate而非actual-main/tag证据。Check105“R2 follows”保留当时chronology，不将旧时点文字改成新成绩。
- 独立确认基线018 main→当前combined candidate的src/dist/extension完全无diff；#51/#52是实际sort/event/dedup语义文档+测试，#56仅benchmark guard/profile和正常019元数据，不包含#57 runtime feature。4high Zod/A2UI依赖baseline已披露，未引入/修复或豁免其风险，不是零漏洞发布声明。

## 合并后仍必须执行

取得actual-main clean source后，按既定Node24本地门槛重新验证full Node/types/完整browser、same-source golden union、publicdryrun/offline、prepack/payload及owned normal Git/local consumer/skill+tool唯一性，并保留新commit/tree/log/artifact指纹；不能仅用dd41预测或复用其source标签称main已验收。通过对应独立gate后才关闭**43/51/52/56**，逐项链接BM范围/文档/guard/零模型v2证据与限制；**57保持open**。保留原7/12，不能把#56关闭写成v2实测模型改善。

审查只读，未重跑suite、推理、读真实auth/config或做任何远端写入。Check105 SHA=`9905499c68182bf4244d32edae158f9ca16297a1d84a3e789724f6f08b04741b`；manifest=`f85f4b24d2a8cb6bd6aa2eb5381481912c56b28aae41218e55adf6f21e6aeddb`；consumers=`e75a04f00f6fb06de96d92d5a43881e1a0179dcd8e4876a4f85ef1cd7493fe61`；offline summary=`cf77b8f0704d9ca3211af0d27c50e12a6927062560016a5fe3d277b942d938ad`。本GO不授权publish/tag/global upgrade/新模型预算。

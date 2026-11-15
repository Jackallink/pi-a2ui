# BM2 v2 concrete fixture / TDD kickoff 独立评审 R1

2026-11-15。**NO-GO：固定86c22fc尚不准入evaluator代码。P0=0，P1=3，P2=1。** 本次输入由853346a更新为 `86c22fc5323c4cee21201a1fe2a74ce27375a6ed`（初始parent1c4f7f3）。后续工作区修订未混入本结论；按Git对象取证。历史v1 GO不代替此审查。

**P1-01 输入与oracle未独立冻结。** `tests/golden/fixtures/S03.json:2–10`、`S05.json:2–11`及S01–S06：source均为同一guarded form，所需1/37/27/28/30/34组件render序列却只在expected.sizes/replacementSize/addSize等字段。由这些expected生成输入再核同一值，会使golden自证；直接用source又不满足声明数量。应给独立input/完整source序列，expected只保留人工结果；其他S/B行动参数同样不要藏在expected中。

**P1-02 B05关键顺序不可观察。** `fixtures/B05.json:2–36`只有Score列，oracle却要求row IDs排序。实际 `src/table-elements.ts:10–11`不将row.id渲染到DOM；数字158、字符串"158"及n158/tieA/tieB同样可见文本，无法证明类型分组和stable ties。加可见独立Row/Label列并断言其顺序，仍点击Score排序；不能读取props后重复生产comparator来冒充DOM证据。

**P1-03 当前canonical仍有v1计数冲突。** `docs/specs/016-bm2-golden-scenarios.md:168`写exactly68却46+12+6/42+22；:173仍source-bound64complete。Plan016:50仍12session，:63 Node61+browser7却unionexact64。应统一当前v2为68、46/15/7、45+/23−、61+7，只有明确历史证据保留v1数字，避免coverage gate写错。

**P2-01 固定matrix与具体expected需对齐。** Spec016:40–41,56,59要求C02 label Illustrative、C03/C18 description、C21 **ok**，draft cases分别为Preview/无description/不同text。另:89的C46 known inspect owner在`cases.json:1717`起的expected未冻结diagnostic。应明确更新canonical或fixture/expected，并把已承诺的相关值/定位置入独立断言；不把合法literal差异称为runtime缺陷。

**独立证据与已成立部分：** 逐读Spec/Plan/三轮/Check083、registry和draft inputs/expected及真实018源码。Node24.18.1只读characterization：32positive与14control可编译，14negative全部匹配声明status/reason；C34确为SDK parse/EOF，原疑点已排除。不是BM2 evaluator pass/RED或CLI/browser验证。#51字面升降序符合null<boolean<number<string、数值及UTF-16码元、双向stable ties；#52同ID canonical retry去重、冲突409、新ID合法重复/forwarded JSON可相同，符合source。新compile-only adapter的可证伪semantic RED、typed stages、异步worker/watchdog/owned cleanup及source/dataset/oracle身份边界方向成立。

只写本报告；未改source/index/HEAD、运行模型/合并/发布。请修正后重新pin concrete fixtures/spec/manifest，再做限定R2；当前不能靠旧v1 review或输入characterization跳过evaluator准入。BM3/4及任何实际模型执行不属本轮。

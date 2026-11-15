# Issue56 Task1 handoff code review R1 — scoped GO

固定对象：`8ac0fcf561aeba3294c19df182a1045a48243b98`，仅Spec019 AC001–004的handoff模块、worker接线、相关正负控与v1来源。**0 P0 / 0 P1 / 1 P2；Task1完整性 scoped GO。** Task2 v2profile/version/pack/localCI尚未准入，不将开发时v1tag称最终v2结果。

## P2 — 参数拒绝时遗漏仍可用的raw-source hashes

`tests/benchmark-model/handoff.ts:18` 在任一record参数不合法时立即return。独立例子：A为合法record，B有string source但多一个extra字段；正确failclosed为arguments，但A/B source hashes均null。Spec019:17–19要求captureB before judgment、hash when available。worker仍保留raw checkedSource/attemptedSource和transcript，因此不是放行漏洞/数据全丢失；建议在record拒绝前安全提取可用own string source的hash，或由worker另存rawhash，并补extraarg诊断canary。不要为了取hash编译/接受非法record。该P2应在Task2/final收口。

## 完整性 / 分类 / source保留

- `handoff.ts:12–27` exact own fields/ordinary record/typed strings/same surface校验，default actualcompile A/B，再比较**整个canonical字符串**而非hash或选取字段。canonical仅object key排序，array顺序/IDs/action/context/binding/data/artifact值仍参与。未知异常/canonicalization失败为compiler-error/null，typedUiError B才attempted-compile/false，checkedA错误为harness。`requireHandoff`只放行accepted且compiledSurfaceEqual=true。
- `worker.ts:105–106` 在guard前记录第一次attempt、原A/B和观察，unknown/checked错误fatal+harness；失败停止case。没有trim/replace B或改写input.source；放行后工具使用同一个input，one-attempt/cost/config/cancel/cleanup线路保留。checked compileValid与attempt合法性/equality/bytefidelity分开；未知不是候选错误。
- 事件名、context值/类型/key、binding+data、初始值、ID、Text literal/空白、children顺序、opaque artifact负控均先actualcompile两边，再assert changed-surface；LF/CRLF/comment/外空白/keyorder正控及未知A/B/canonicalization控制覆盖相关故障模型。actualSDK LF control验证一次原B、preflight合法、真实render/202/typedqueue/0actualmodels；generic changed-render SDK control验证wiring阻断。具体context/binding/artifact为unit负控，未把它们谎称逐一执行过SDK场景。

## 独立验证 / hash

指定wrapper **Node24.18.1** 实际运行 `tests/benchmark-handoff.test.ts` **35/35通过**。另独立核对copy fixture三例A/B及caseReceiptSHA与365原始case完全一致，原report SHA也一致；没有重算原7/12。查阅RED/Check102及2SDK GREEN日志（LF202+queue、changedrender拒绝）；本轮未重跑browser或完整suite、未调用模型/读取真实配置。无source/index/HEAD写入。

SHA256：handoff=`93ad98aa4c05889be828c76495b83042798d70dabd9a66917bba25021a16015d`；handoff tests=`29e47457e7b9a2e837a201dc35554a5302d3ddfb4b4c9f3acfd3e3e59008d463`；worker=`0bbf33cf60335f480fe2b5bfcb52f85672a97ccfcc5d190843d084034dfb161e`；3pair fixture=`6e58acef8a82237d7243fa61816c1eacdb773d2fdbfdc685d4e979781a1eba4b`；v1profile=`dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`；v1report=`cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b`。

评审尾部root推进8ea5820并准备dirty Task2；独立git diff/blob确认相对本固定对象仅新增13行profile测试，handoff/worker仍同blob。未把Task2未提交内容作为本报告输入。后续须新固定v2/profile/version/package、本地CI/实际integration/sourcebound验收及P2关闭；无新实际模型预算、Actions执行/恢复、发布/merge/closure/global变更准入。

# BM4 bounded measurement review R2 — NO-GO

固定对象：`769ea274b6cc57f6f64ab9f8ff9f109122548c6d`。限定原测量P1、已请求M12/M11/profile漂移及unknown/not-run分类。**0 P0 / 1 P1 / 0 P2；原P1大部修复，但一处同类误判仍未关闭。**

**残余P1：M07 Modal trigger Text仍只接受literal。** `tests/benchmark-model/oracles.ts:29` 用`c.text==='Open details'`，未复用已新增resolved。独立Node24真实compile接受：在原M07前加 `$/trigger="Open details"`，将trigger改为 `Text(text=$/trigger)`；Details、content、可见trigger文字/事件均不变，但intent因上述assert失败。Text绑定是现有产品能力，与Details.title（workbench.ts:9只允许literal string）不同，不需改生产schema。最小修复仅把该trigger文字经现有resolver比较，并补真实compile-valid正控，保留错误slot负控；无需新框架或更多模型场景。

已关闭部分：oracles.ts:8–15独立解码~1/~0，正确解析field标签、Text及Button显示子树；R1的escaped-name path、boundlabel/buttonText、nestedButton三正控当前全过。独立selected Node24 **29/29**通过：12原semantic positives、8合法wrong-intent negatives、3原修复变体，以及defaultdry-run、opaque/env/layout、missing/malformed journal分类等相关控制。上述M07残余是另一个完整可运行输入的反例，不是setup失败。未重跑完整browser/大套。

报告分类复核：worker仍以actual SSE usage presence决定usageKnown，不用SDK defaultzero推断用量；script:50–59将缺失/无效final receipt保留started/requests/actualModelRequests=null、knownAdmittedRequests下界并阻断acceptance，显式notRun不与unknown混合。独立missing/malformed journal控制通过；planned/started/providerCompleted/candidateChecked/compile/render/intent/action/static/firstPassSuccess字段分离。此处不扩大到另一reviewer的完整journal耐久性/安全审查。

既定漂移可接受：M12明确ArtifactPreview metadata+独立Image同实际src，实际img载入判据有真实subject；M11只验证native tools组件/stream，不声称固定总量或实时遥测质量；macOS/Linux、sequential实际tools、ownedcleanup等已在Spec018:67–71记录，未改模型、任务数、产品runtime或预算。SDK/browser新M01/M02 typed202+Pi queue正控已加入；本轮只静态查看其断言，未重复执行。

SHA256：oracles=`fe619aad9a2df968d51e6f2daf3acef6b3c9bac1ad90cf14e29396c56ae68e10`；worker=`4e8772bea67b2558235c23c9f036def01e2cf93bd3c5ea779c348f0224f2d3c0`；entry=`165037ba777055770f2e4b43217734fc462f0725ecf8c2f4d13d08222361b686`；Spec018=`f91cb99999dc39966ef5b1106ce14e4eb474b898985d807bfdfb46dd2ff00c45`。R1报告保留SHA `679ef38985db0a732912313f664394efe27bac8242a76af63cdbe3dd4d896941`。

Node仅指定wrapper v24.18.1；固定HEAD/clean source核对，无实现/真实auth内容读取/模型/远端修改。该单点修正新pin后只做限定确认即可；live仍须两独立GO与source-bound full offline checks，不将本NO-GO当GLM或018产品失败。

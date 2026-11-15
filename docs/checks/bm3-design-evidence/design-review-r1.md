# BM3 design / TDD-intent review R1 — GO

固定设计：`ab7219fc7111f93ceb9a53d5ecb9c9c7c8d68d2b`；base `fef18935165efdc2d6b152bebf75e2f830a06341`，新 worktree `pi-a2ui-bm3/pi-a2ui`。**0 P0 / 0 P1 / 1 P2；设计/TDD意图准入 GO。** 允许 root 在本合同内写消费者、构造 no-op detector RED，再最小实现；不代表 detector、baseline、CI 或交付已通过。

## Finding

**P2 — 明确表格本地操作的字面量输入/可观察结果。** Spec017:21,34,65 要求 sorting/filtering 等 native controls 实际工作；目前 matrix 指定 Filter/File/Status 控件，但未给出具体操作与行序预期。`tests/visual/fixtures/audit.express:2` 两行在 File 和 Status 上均已升序，首个 sort click 后顺序不变，故“可点击且行序不变”无法识别 no-op。建议消费者落笔前补固定意图：filter `src/example.ts`→仅a（以可见文件/状态识别），clear→a/b；File、Status 各自检查升/降方向和降序b/a，并持续0额外POST。该澄清收口既定本地操作，不扩展几何/产品范围；非阻断 detector 准入。

## 合同与 TDD 闭合

- **真实三态：** Spec017:15–21,80 将两个主流程 source、手写 exact acceptedSearch/Back context/version、单surface rev1/2/3、同epoch、2真实POST202及返回空Query闭合。应用 controller 只模拟应用响应；不能把 SDK/Pi/model ACK 或回调重建值当真实 receipt。
- **独立几何：** :25–34 固定 unrelated pairs，intersection 两维均>1px才报 overlap，所有主体 finite/visible/nonzero/inviewport；活跃控件需穿 open-shadow 的真实 center-hit、native actionability 和实际操作。Card/table containment 是合法正控；:40,78 的独立 Modal fixture 只测 active dialog，Close 仍须 hit/action/focus/0POST，不把背景遮挡误判成错误。
- **可证伪 RED：** :38 明确先观察真实 CSS overlay 的正面积交叉和 Query center blocked，再对完整可运行 no-op detector 产生 consumer failure；最终同 oracle 必须给 named overlap/occlusion，撤销style恢复正常。missing-target 为 setup failure。该证据链可证明新 harness 缺能力，未冒称018产品缺陷；尚未实施/执行的 RED 不计为已取得。
- **Baseline 生命周期：** :44–50,74–76 使用 actual CDP h1/.brand/Find-actions family/PostScript/custom records，fonts.ready 不代替实际字体观测。capture-only accepted=false→root及独立视觉检查3PNG→手工复制原bytes/manifest→代码/基线复审；正常运行先验证全部声明Mac PNG/path/symlink/hash/dimensions完整性，再决定环境可比较性。Linux未知为明确 noncomparable，geometry/interactions仍硬gate；同profile像素变化从设计起仅 advisory，不自动覆盖。当前 characterization 不是批准基线。
- **边界：** :54–58/Plan017 明确5s操作、30s case、5s teardown、5min owned runner/10min job、primary+cleanup保留、synthetic-only7day artifact、tests/baselines/CI不入包；不改runtime/CSS/依赖/权限/BM2数据，不访问用户auth/model，不越过独立代码/基线/workflow review及真实CI、merge/release/closure门槛。

## 独立证据与身份

只读检查 Spec017、Plan017、3轮walkthrough、Check088、3完整fixture、characterization与action pin收据及直接相关 session/table/modal/renderer source。Node经指定wrapper，为 **v24.18.1**：3fixture逐一raw-SHA匹配manifest，实际compiler给 search6/audit6/modal8组件，Search query绑定/Back事件/Modal零事件均符合合同。未启动浏览器/模型、未实现detector、未重跑大套。官方pin只独立校验本地冻结action.yml与receipt SHA一致及 `using: node24`，未重新向官方API请求；不能扩大为本轮新外部验证。

SHA256：Spec017=`9d25e2a9d363cfcad8511f8fbe348033adb9f7a1cbdb62e9bcf25930a2184a2a`；Plan017=`42eec2b0569f87244a5964a8c822414c15cf7cffc8fbfafa57c5f3551fd06ef7`；fixture manifest=`4e10a09211e6a2caf0b272da48dca54d930bc47c2e0f8c15b3ad697908168157`；characterization=`f4256d26347f042115b083ea15053483cef909c2cf05364885a2d5833a94c9ca`；action pin receipt=`c04c1dee5368b93833d323d0461c73480f266662a571700825a00424abd71fa4`（pin `cf430e030ddbb5b0abf93d22962f4752f3646cd9`，本地action.yml SHA `c5979822866a72362e609844b6ebe77d4b7e759af68cc1c2c425dcf51481fab4`）。

后续 required gates：真实 CSS/no-op behavioral RED、最小 detector 正负/恢复/失败路径、capture-only3PNG独立视觉inspect及手工baseline复审、源/环境收据与bounded回归、独立code/workflow/pack review、实际PR CI。当前 GO不授权像素门禁、BM4推理、合并、发布或issue closure。

# Check130：#67 渲染美化设计、固定样张与交接

状态：设计交接完成（独立R2 Gate1与Gate2测试意图GO）；Spec028 walkthrough-approved，不代表实际RED、产品实现或代码验收完成。Canonical Spec028、Plan028与三轮walkthrough；issue67。基线main0c1fe67649b3f61d520ca0318f7dd977a208b3b5/package0.1.11，独立本地分支codex/67-render-polish-design。用户授权本阶段设计/样张/独立评审，Pi只给提示词不触发；没有真实模型/内核改造/合并发布/全局更新授权。

## 当前事实与证据边界

- 实际SDK源码adoptLightDomStyles会给Light DOM的static styles按tag作用域化；probe computed style确认DataTable td8px/Chart svg maxHeight260px等已生效。根因不是样式全部失效，不迁移root。
- 6份Express固定fixture由当前UiSession/compiler接纳，32/7/12/10/14/25组件。固定3宽度＋640×450等效reflow的前后共48截图；after是真实renderer上的CSS/有限展示DOM原型，未改产品。每对sourceSHA/snapshotSHA相同，原始Chart table不变，草稿保留、空表单3错误且业务POST0。
- 实际Node24.18.1/Chromium158.0.8127.18，DPR1/light/zh-CN/Asia-Shanghai/reduced-motion；无body溢出，外部页面请求/业务action/dispatch0。局部Chart滚动允许，不等于所有几何/hit-test通过。
- gallery/samples、capture-manifest、style-audit、component-coverage、contrast-pairs位于docs/designs/028-render-polish；48样张约4.4MiB，仅设计文档，不随产品files分发。实际helper列出32类，component-coverage明确未在6场景捕获的类型，不借此称全组件验收。
- 11组候选配色公式校验通过，只是候选token pair核对，不等于全部实际背景组合/WCAG认证。主按钮的实际子Text在最终捕获有白字computed断言。

样张后续硬边界：真实desktop200%缩放、Modal打开、全部32类、bar/空/负/4系列与动态patch、完整键盘和全部对比度/遮挡验证留到实施；设计中的640×450不冒充实际zoom。没有跑完整生产606/91，也不借历史结果称本次实现CI通过。当前本地检查只证明设计fixture和preview工具；真实模型预算0，冻结基线与grant不动。

## 原型错误与纠正记录

初始Text.variant=h2被当前Catalog拒绝→改用合法MarkdownView标题；capture脚本字符串转义setup错误；随后Log fixture在建立baseline后原生flush导致dataSequence0→1，独立小探针确认message/epoch不变，改为订阅等待其真实一次flush后再建立全snapshot基线，不忽略sequence。它们都是设计工具/fixture问题，不是产品行为RED。第一版主按钮子Text错用正文色，视觉检查后用内部前景继承纠正并加computed white断言，再生成完整样张；不掩盖中间失败。原log/截图保留在.local/render-polish-design。

最终设计工具采用新owned run目录，不覆盖前轮raw；公开样张与manifest需要显式设计审查才更新，旧BM3和冻结真实模型结果不重录。Spec028→RP-T1..10→Plan028 T1..4已映射；实施Gate2要先把测试意图落实成真实RED，再改产品。当前只交接用户自行启动Pi。

## 独立设计准入

待固定docs-only source后审Spec028/三轮/Plan028、48图身份和代表性外观、演示/产品边界、scope与Node24/零模型/内核不变。GO只到walkthrough-approved与实施测试意图准入；不等于已发生Gate2行为RED、代码GO/发布授权。NO-GO按原定义缺口纠正并换固定source复审。

## 本地设计检查终态（非产品CI）

最终capture工具退出0，48张图片/6fixture/全snapshot与Chart原表/草稿/主按钮白字computed断言通过。见[design-ci.json](../designs/028-render-polish/design-ci.json)及[capture-manifest](../designs/028-render-polish/capture-manifest.json)；captureScriptSHA 206441229b37eae75778ad229f0b2161128177fdfb0b743971db2cca228b2c9b，previewCSS SHA d23dc2badde1d9944ee57a5f28359693ebace2350ae4dff8c5ab1b9498edd64c，manifest SHA 76be8ef6807882a83ca16ba36dc3059a3bc42c8ad373d1a38ed6ae8a88852ec4。初始manifest记录73个运行/样式/manifest文件逐字保全；补充product-preservation.json核对全部76已有payload加lock共77文件均等于基线Git对象。全部设计变更仅docs路径。walkthrough结构校验通过。

[对照画廊](../designs/028-render-polish/gallery.html)与[概览图](../designs/028-render-polish/overview.png)已生成，已目视检查RP01桌面、RP02表格、RP03窄屏错误等代表图；不因此声称全部图片具备业务/无障碍正确性。独立评审仍需固定本设计commit，检查合同与证据分层。

## 独立R1 NO-GO与局部修正

固定f8de033f1bf6ff0ca5cf834bfa55d82c2a27b0bf/treebb5d2d84133acc6f9a2a87e320054b567199b1f9，R1报告.local/render-polish-design/independent-review-r1.md SHA927bd453b78363d93125a777d232c09feccc5fd66ce67a8400613e0bfdd3c288；0P0/P1，3P2：窄屏scalar拆行、极值tick定义、Pi route/model条件式。未越过NO-GO实施。

修正只影响design：候选表格scalar nowrap与局部横滚/region，新增真实Range单行断言和数值列横滚补图；Spec/Plan与三轮补非零不伪0、极大/微小值科学计数、有效gutter和11场景corpus（输入由原compiler接纳，不代表formatter已实现）；handoff无条件绑定Ark AgentPlan/glm-5.3-flash，缺失停不改配置。新owned run run-cCkfed退出0，48主图＋1补图；after scalar拆行0，before保留4个原退化反例，24个before PNG与R1逐字一致；全snapshot/原Chart表/草稿/白字断言保持，外部/业务/dispatch0，无body overflow。

更新manifest SHA 78f0b614d4da9bbf897cb5e431c5c194a9b4f7b38a80ac2acdc3d76c18ec6418，captureScriptSHA e2f542a9fbf58e3743ae6827a008a61c5575bade23f2a95019490c7c7721ad52，previewCSSSHA 5a84a5d50a68a618e46f0e2c8ed93865715863732dba5da6997a03f92234f50c；design-ci.json是当前证据，前节hash为历史R1来源，不覆盖或重判旧回执。产品77文件仍与基线字节相同，当前待新固定docs source的独立R2。

## 独立R2 GO与交接边界

固定source **68b2974a62ffeaac606f63b6292a3de2def40cbf** / tree **3b910aaf6d83941f5412d4d32623a86b1b44a56c**，独立报告[independent-review-r2.md](../designs/028-render-polish/independent-review-r2.md)，SHA **d42138e339454145159f1bac1e22ccec2a78b0a9037beeba6831e8caecbdd5c4**。Gate1设计与Gate2测试意图GO，R1三项closed、0开放P0/P1/P2。R1与R2公开副本均逐字匹配sealed原件，不改旧失败。

Reviewer独立核48+1图、24before逐字、24snapshot pairs、6fixture、77payload+lock/73运行文件、新raw/log hash与11配色；目视数值横滚补图。Node24只做seriesSchema与11手写tick期望的只读算术核对，不是产品formatter或极值视觉验收。handoff精确限制Ark AgentPlan/glm-5.3-flash，仍禁止本chat触发Pi/真实评测/内核/merge/release/global/issue关闭。

最终收口仅Spec/Check/handoff状态和reviewed identity/报告hash、公开逐字review副本，CSS、样张、数据、测试意图不变；随后固定最终metadata提交做独立最小绑定。交付用户自行启动Pi的提示词，按Plan028 T1→T4并先Gate2实际RED；没有第二次付费预算申请。实施交接不等于当前产品已变或任何发布授权。

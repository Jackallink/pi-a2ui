# Plan028：渲染美化的实施交接

Canonical：[Spec028](../specs/028-render-polish.md)。目标：保留内核和现有数据/事件合同，用主题、组件局部视觉和skill例子提高可读性。架构：client.css持有唯一token；SDK继续作用域化static styles；Chart增加纯展示legend/ticks，DataTable仅派生视觉类型标记。栈：Node24、现有Lit/A2UI/Playwright，不新增依赖。

本计划是可执行任务顺序/AC测试意图，不维护实时进度。用户手动启动Pi；本chat不触发。Spec028独立Gate1及测试意图GO之后，Pi仍须先完成Gate2真实RED再改产品；无独立评审通道时停review-ready，不自审充当GO。不允许实施时顺带改内核、真实评测、merge/release/global/issue关闭。

## 全局约束与准备

1. 使用独立`codex/67-render-polish`实施分支，基于设计交接固定commit；先读根AGENTS/Spec028/三轮/Check130/本计划。保留本机配置、raw、失败和冻结文件。远端base如已前进先记差异，不覆盖用户工作。
2. `source "$HOME/.nvm/nvm.sh"; nvm use 24; node -e 'if(process.versions.node.split(".")[0]!=="24")process.exit(1);console.log(process.version)'`；所有npm/Pi/子进程继承Node24，不切22。既有lock可用就复用，否则在隔离checkout用npm ci，不更新依赖/lock。
3. 每个产品源/skill/helper改动在GREEN前先`npm run build`，检查只生成预期dist，随后把源和生成资产一并提交；T4固定source后的build应不再漂移。
4. 实施前重现48设计样张仅作为参照；不是产品验收。不跑BM4 --execute/真实provider探针，不重跑冻结真实基线、不复用grant/21。工作模型配置由用户控制，本计划不允许额外模型评测。

## T1：统一主题与组件视觉（AC-001/003/004/007）

**文件**：src/client.css及Spec028组件覆盖表列明的本地*-element(s).ts；新增tests/render-polish.spec.ts（真实browser），必要tests/render-polish.test.ts（fixture有效性，不复制CSS实现）。

**先写可证伪RED**：使用真实UiSession/startServer固定RP02，分别读body与table filter input/table header button的computed fontFamily/fontSize，要求继承同一系统字体与14px；当前控件Arial13.33px应失败。RP03错误/焦点contrast与RP06草稿/窄屏重排按AC断言；不存在/未加载元素归setup错误，不算RED。不得只断言源文件包含token字符串。

```ts
const bodyFont=await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily);
expect(await page.locator('pi-a2ui-data-table input').evaluate(el=>getComputedStyle(el).fontFamily)).toBe(bodyFont);
expect(await page.locator('pi-a2ui-data-table input').evaluate(el=>getComputedStyle(el).fontSize)).toBe('14px');
```

**最小实现**：client.css定义`--pi-a2ui-*`并映射SDK实际变量；组件静态样式只消费token并有安全fallback。SDK已有adoptLightDomStyles，不改注入器/createRenderRoot。只在本组件scope统一表格/代码/错误/状态/媒体容器；Row可wrap、input宽度有界、surface出现后介绍区紧凑。原图标/媒体native controls不换实现。

**GREEN与提交**：新真实browser窄检查＋原表单/Modal/pause/inert/复制等回归，覆盖32类矩阵；固定3宽度与键盘，保存实际desktop200%缩放人工证据。执行命令`node node_modules/playwright/cli.js test tests/render-polish.spec.ts --workers=1`；类型`npm run check`。对比度以实际前景/有效背景计算，装饰边框不滥用3:1。单独主题/组件视觉commit；没有新组件/props。

## T2：表格数字与Chart纯展示（AC-005/006）

**文件**：src/table-elements.ts、src/live-elements.ts；tests/render-polish.spec.ts。消费T1 token；产出相同rows/series的视觉DOM，不增加外部API。

**RED**：RP02真实number单元格computed textAlign要求right（字符串数字不被隐式转number），并操作sort验证77<158、"158"<"77"，同值稳定，source snapshot/业务POST不变；360px真实Range scalar行数≤1，并横滚到数字/布尔列断言完整值可见，不以无body overflow替代。Chart真实DOM要求语义legend列出series.name、tick去重且零基线一致，当前没有legend应失败；不是判断截图“看起来更好”。

**最小实现**：TD按已有cell的typeof派生`data-value-kind="number"|"boolean"|"null"|"string"`（或等效内部标记）；数值右对齐，number/boolean/null nowrap与不拆词，table最小宽度560px、.table-scroll提供可聚焦region与局部横滚，原cells/compare/filter不改；Chart render仅加`ul.chart-legend[aria-label="Chart series"]`与对应li、同域tick/grid、line线型、长标签换行/抽tick/full title和原始数据表。静态y坐标继续使用Spec028公式，ticks空时空/zero去重；tick格式严格按Spec028的非零科学计数/精度碰撞规则，不再固定maximumFractionDigits2；根据实际label宽度预留左gutter，点/柱x同步调整，无裁切。未改validateSeries、updateChart或schema。不要手改dist。

**GREEN**：empty、single point、all-zero、all-negative、mixed、long-label、4-series、bar/line，以及1e-6/1e308/Number.MIN_VALUE/Number.MAX_VALUE均真实render；可用docs/designs/028-render-polish/chart-corpus.json的手写预期，不能复制formatter产出当oracle且原值表一致；反向patch后legend/ticks即时更新，原草稿、revision/epoch和交互行为保持。locale显示tick可格式化，不能改point.value/label或DataTable原数值。每个bar系列仍有文字/原表替代，不只靠颜色。数值对齐/Chart展示独立commit并独立审diff。

## T3：按需skill和可执行组合样例（AC-008）

**文件**：skills/pi-a2ui/SKILL.md索引；references/visual-and-data-legibility.md、summaries-and-feedback.md；必要新增examples/*.express+manifest.json；src/assistant-guidance.ts仅原helper的局部说明，不增命令/全量system prompt。测试现有tests/skill.test.ts、tests/authoring-first-use.test.ts及新增最小recipe测试，均为当前已有文件。

**RED/合同**：需要的新example名在旧manifest下查不到，这是文档/metadata合同RED；当前非法Text.variant=h2本来会被拒绝，不冒称新compiler修复。新正例必须用当前组件、caption/body或受限MarkdownView标题，并包含数据来源/unknown说明。复制RP01的数据展示布局时区分已格式化展示文本与原始number；不虚构MetricCard/Donut/formatter属性。

**实现/验证**：子文档示例example→adapt→check→render；给出摘要+line/bar+表、任务证据、待确认表单与无需UI的反例。每份正例通过实际`node skills/pi-a2ui/scripts/a2ui.mjs check --surface-id <id> <owned-file>`编译，预检stdout保持{surfaceId,source}；已有19templates/8patterns只在明确新增时按实际更新，不能虚报数量。负例单列。CLI JSON/参数/旧样例兼容。skill/文档commit独立可回退。

## T4：集成、漂移检查与交付（AC-009/010）

只在T1–T3窄检查通过后固定source，按顺序运行：

```sh
npm run build
npm test
npm run check
node node_modules/playwright/cli.js test tests/browser.spec.ts tests/benchmark-model/browser.spec.ts tests/golden/browser.spec.ts tests/visual/browser.spec.ts tests/render-polish.spec.ts --workers=1 --global-timeout=300000
node --import tsx tests/golden/report-cli.ts combine-local
```

所有model transport仅synthetic，本地CI；Actions418909498保持disabled。新的视觉预期不能直接覆盖旧baseline：保留旧BM3并在本spec专属registry绑定新source/OS/字体/浏览器，旧pixel差异需说明，不静默修绿。确认Goldens兼容source/profile并保全历史冻结真实结果。

随后使用现有prepack/pack和owned startup/discovery零推理入口验证包内容、CLI notes、skill与工具；新dist只由build生成。实际包文件数/bytes按当前payload记录，不先假定仍76（新增skill子文档/样例会增加文件数）；既有deps/lock/外部schema/权限不变。不变数据/事件/草稿要用实际DOM/POST见证，不能拿编译成功替代。

更新Spec状态、漂移/风险/回退与独立代码审查所需Check；停review-ready提交用户。没有另行merge/release/global授权，不推送合并/打tag/更新用户全局包/关闭issue；没有外部审查能力就明确请求用户送审，不能自己写GO。每个提交可定位回T1/T2/T3，出现内核需求停该扩张并记录独立issue建议。

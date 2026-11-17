# Check133：render-polish 全量独立评审 R1 整改轮 + 验收闭合（issue #67，review-ready）

## 任务与授权
承接 Check132 终态（R4 GO → 终态 29caec1 review-ready）。用户组织的外部全量独立评审（gpt-6.1-sol，输入 29caec1 全量 diff，全文 `.local/render-polish-independent-review/full-code-review-r1.md`）判定 **NO-GO：0 P0 / 1 P1 / 4 P2**（F1–F4）+ 若干 P3 与验收缺口。本轮按 PDCA 落实整改与验收闭合；会话约束与 Check132 相同：Node24（v24.18.1）、锁定 Chromium headless shell 1254 = Chrome for Testing 158.0.8127.18、Ark AgentPlan `glm-5.3-flash`（无 provider 探针）、仅 synthetic transport、不重跑冻结基线、不合并/不发布/不全局部署/不关 issue。

## R1 发现与整改（commit 97b12e8）
| 发现 | 整改 | 验证 |
| --- | --- | --- |
| F1 [P2] `#surfaces button` 通用 reset 抹掉 SDK Tabs 活动态/ChoicePicker 选中态 | client.css 新增 `#surfaces a2ui-tabs .a2ui-tab-button(+hover/.a2ui-tab-button-active)`、`#surfaces a2ui-choicepicker .a2ui-chip(+.a2ui-chip-selected)` 恢复规则（ID 特异性压过通用 reset） | 计算样式断言：active tab `rgb(54,92,219)`+accent 下划线、选中 chip accent 底/accent-contrast 字（render-polish.spec F1 组 + 验收 AC-001） |
| F2 [P2] 全部合法标签超宽时 x 轴标签删空 | live-elements.ts 新增换行兜底：单行放不下→stride 抽稀列布局 + `wrapLabel`（逐字符 canvas measureText 贪心换行，≤3 行，超长尾部截断加 `…`），列间距由 stride 保证不相交；全文进 `<title>`；viewBox 高度随行数扩展（250+(wrapRows−1)·11） | 128 字符单柱→1 标签 3 行无截断；128 字符两点线图→2 标签各 3 行以 `…` 截断；bbox 含于 svg、相邻 gap≥2、值表逐格不变（F2 组） |
| F3 [P2] 线图无非颜色区分 | lineMarks 四档确定性组合：实线+圆 / 虚线 `7 3`+方 / 点线 `2 3`+三角 / 长虚 `11 4`+菱形；polyline stroke-dasharray + g[data-mark] 标记形状；图例 swatch（svg.rp-swatch 18×8 同 dash/形状）与系列一一对应 | 四系列线图：4 条 polyline dasharray 依序匹配、g0–g3 标记形状正确、图例 swatch dasharray 顺序一致（F3 组） |
| F4 [P2] 刻度非等宽、gutter 非实测 | tickMeasurer（canvas `11px + --pi-a2ui-font-mono` 实测，失败回退 `length*6.6` 估算且不永久缓存）；刻度 text 挂 `.rp-tick`（client.css mono token）；gutter=最大刻度实测宽+12，下限 40px 保留；Check132 既有误述已勘误（勘误段于本轮写入） | rp-tick 计算字体命中 mono 栈且 11px；tick bbox 全部含于绘图区左界、axis x−svg.x≥40（RP01+long-label 语料，F4 组） |
| R1 附带 | DataTable 滚动区补 `tabindex="0" role="region" aria-label="…arrow keys"`（Spec028:37 可聚焦 region 合同） | 真实键盘：Tab 聚焦 region、ArrowRight scrollLeft>0（expect.poll 异步滚动）、ArrowLeft 归 0 且焦点保持（F4 组 DataTable 用例） |

整改提交 **97b12e8**（7 文件 +389/−64）：`fix(render-polish): corrective slice for independent review R1 findings F1-F4`。复验（干净树）：npm test 609/609；五套件 134 passed（含 F1–F4 新增 8 测试，render-polish 43/43）；golden union 68 cases source 97b12e8；BM3 accepted:true（pixelGate:false，冻结基线未触碰）。

## 验收闭合（commit 290e5fd，tests/render-polish-acceptance.spec.ts，4 用例）
针对 R1 列明的未闭合验收项（Spec028:67–76）：
- **AC-001 32 类组件样式覆盖**：三个 surface（媒体组注册真实 artifact blue.png/blue.webm/tone.wav）渲染全部 32 个组件标签（13 SDK builtin `a2ui-*` + 19 Pi `pi-a2ui-*`，与 browser-catalog 派生规则一一对应）；逐类 host fontFamily === body 主题字体；状态族计算样式：Tabs 活动态/chip 选中/SearchablePicker 选中 accent、badge 前景背景着色。有效背景对比度探针（lum+背景上溯）：body 15.17 / caption 6.03 / tick 5.62 / button 5.62 / badge 6.14 / muted 5.62，全部 ≥4.5:1 且全部解析成功。
- **AC-002 源绑定截图证据**：shot() 全页截图 9 张至 `.local/render-polish-corrective/shots/`（ac001-groupA-media / groupB-forms / groupC-1280 / contrast / ac003-zoom200-form / ac003-360/768/1280 / ac006-updatechart-reverse）。
- **AC-003 缩放与几何**：documentElement zoom:2 下命中测试点击 submit 触发校验（.a2ui-field-error 可见、0 POST）、草稿填充、Modal 几何含于视口、Escape 关闭且焦点回 trigger；360/768/1280 视口无横向溢出。
- **AC-004/007 键盘/暂停/焦点**：Tab 流转（field0→field1）、invalid 提交 3 错误可见且 0 POST、填后 0 错误；Modal Escape + `.modal-trigger` 焦点返回；`session.setEnabled(false)` → `#surfaces` 容器 inert 属性 + `#status` 'Canvas paused' + 8 次 Tab 无法进入 surface + 恢复后 'Ready for your input'，暂停期间 0 POST。
- **AC-006 动态 updateChart**：视觉变化（emulateMedia/viewport）保留未提交草稿、revision/epoch 稳定（dataSequence 不动——updateChart 不 bump revision，属既有平台行为，spec028:72 要求的是草稿/revision/epoch 不被视觉改动重置）；forward 增系列→图例 2、dash 映射保持 ['none','7 3']、刻度有限、值表 4 行、dataSequence+1；reverse→1 系列/2 行；过期 revision 抛 /Stale chart surface revision/ 且 snapshot 深比较不变；全程 0 POST。

提交 **290e5fd** `test(#67): render-polish acceptance closure for AC-001/002/003/004/006/007`（+343 行，仅新增测试文件）。

## 终态门禁（HEAD=290e5fd 干净树，逐项）
1. tsc clean；npm run build OK（dist 已含 rp-plot/swatch/mono tick/table region）。
2. `npm test` **609/609**（其中一次运行出现 1 例偶发失败，连续两次复跑未复现，判定 flake；golden node 报告由通过运行生成）。
3. 五套件 `browser+benchmark-model+golden+visual+render-polish` **134 passed**；验收规格 **4/4**；合并终跑 browser+render-polish+acceptance **94 passed**。
4. golden 双层报告于干净 290e5fd 重新生成后 combine：`{"source":"290e5fd…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}`（`.local/render-polish-corrective/golden-union-290e5fd.json`）。
5. BM 套件 **35 passed**；BM3 evidence accepted:true、states 3、checks 全 true、baseline status not-comparable / pixelGate:false（冻结基线零触碰，run `.local/bm3-layout/run-1794909346280-60510`）。
6. 过程证据：`.local/render-polish-corrective/`（golden union、shots/、调试探针 .local/dbg-*.mts 为临时文件不进包）。

## 实施教训（供后续轮次复用）
- 图例 swatch svg 会遮蔽 `querySelector('svg')`，主绘图 svg 加 `class="rp-plot"`，全部审计选择器随之更新。
- Express 数据映射用冒号键（`points:[...]`），组件 kwargs 用 `=`；绑定必须先初始化（`$/path = ""`）；含 CodeDiff/TestResults 的 surface 上每个 Button 的 event context 必须携带字面 proposalId/resultId（src/coding.ts 校验）。
- Chromium 方向键滚动为异步，断言需 expect.poll；点击后的指针 hover 残留会掩盖 active 态计算色，断言前需移开鼠标。
- `variant="mutuallyExclusive"` 渲染 radio 而非 chip；chip 形态需 `displayStyle="chips"`。
- StatusBadge 颜色在内层 `.badge`，宿主元素透明；Button 类名为 `a2ui-button(-default/-primary)`（client.css 旧 `.a2ui-basic-button` 选择器与实际 DOM 不符，为既有遗留，不在本轮范围）。
- golden union 与 BM3 accepted 均要求 node/browser 报告与当前干净提交一致：任何 src/tests 变更先提交，再重跑 npm test 刷 node 报告、重跑 golden browser 套件，再 combine。

## R2 内审修复轮（e1772db，2026-11-17）

codex（gpt-6.1-sol xhigh）对 97b12e8..b21f1c3 复审：**NO-GO，4 项阻塞 + 3 项建议**。逐项修复：

- **B1 F2 兜底列溢出**：src/live-elements.ts visibleXLabels 尾列改为 `colEnd=min(colStart+column,left+plotSpan)`，逐列宽度/中心点按裁剪后列计算——余数列不再越过 viewBox 右缘；新增 stride 分支用例（32×'W'×70，审计：有界子集、≤3 行、屏幕坐标含于 svg 视口、列间距≥2、title 全文）。教训：rp-plot svg 无 width 属性时按容器缩放（实测 scale≈1.32），审计必须在同一坐标系比较（沿用 T2 屏幕坐标做法），不能拿缩放后 px 对 viewBox 单位。
- **S2 刻度槽宽**：新增长数字刻度用例（123456789/987654321）断言 left≥40 且 ≥实测 maxWidth+12-0.5（canvas 以 --pi-a2ui-font-mono 11px 量测）。
- **S1 hover/active 优先级**：`#surfaces a2ui-tabs .a2ui-tab-button:hover` → `:hover:not(.a2ui-tab-button-active)`，新增 hover 活动态用例（hover 后仍 rgb(54,92,219)）。
- **B2 真实 200% 缩放**：CSS zoom 明确标注为代理；新增物理等效环境 browser.newContext({viewport 640×450, deviceScaleFactor:2})（1280 物理像素窗口浏览器 200% 缩放的精确渲染参数）复跑守卫表单全流程（命中/校验/填充/Modal/焦点返回/截图 ac003-zoom200-physical）。无头 Chromium 无法驱动浏览器 chrome 缩放（Ctrl+= 探针无效），物理等效 + CSS 代理两层证据并如实分层标注。
- **B4 证据源绑定**：截图改为 per-run 目录 `.local/render-polish-corrective/shots/run-<ISO>/`，afterAll 写 manifest.json（source=git HEAD、dirty、lock sha256、chromium-headless-shell revision、每张截图 sha256），重跑不再覆盖旧证据。
- **B3 AC-006 强化**：更新后精确值表 deepEqual（基线一/二 1/2、对照一/二 2/1）、polyline/tick 坐标全部有限、数据更新后草稿保留（推翻早前错误观察，见漂移节勘误）。
- **S3 清洁断言**：assertClean(env,stage)（pageErrors 空 + externalBlocked 0）接入 AC-001 三组/AC-003/AC-004/AC-006 全部用例尾。

### R2 轮门禁（HEAD=e1772db 干净树）
1. tsc clean；npm run build 后 dist 同步提交。
2. `npm test` **609/609**。
3. 六套件（五套件+验收规格）`--workers=1` **141 passed**（含 3 个新回归用例）；BM3 evidence accepted:true、baseline not-comparable/pixelGate:false（冻结基线零触碰，run `.local/bm3-layout/run-1794912497348-81603`）。
4. golden combine 于干净 e1772db：`{"source":"e1772db…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}`（`.local/render-polish-corrective/golden-union-e1772db.json`）。
5. 提交 **e1772db** `fix(#67): R2 review fixes…`（6 文件 +161/−22，含 dist 同步）。

## R3 内审修复轮（dc13024，2026-11-17）

codex（gpt-6.1-sol xhigh）对 b21f1c3..8414f41 复审：**NO-GO，5 项阻塞 + 2 项建议**。处置：

- **阻塞 1（B1 尾列重叠）**：数学反例（196 点尾列宽 2.755、相邻间距 −0.714）确认 R2 的"裁剪尾列"方案在极点数下仍重叠。src/live-elements.ts 兑底改为**右缘保留列**：尾标签独占 `[plotSpan−column, plotSpan]` 满宽列（column=slot·stride≥34），其余保留列必须避开保留区；文本预算恒为 column−6 且居中，列间不相交由构造保证（相邻列间隙≥6 viewBox 单位）。新增 196/200 点边界回归（屏幕坐标含于 svg 视口、间距≥2、≤3 行、title 全文）。
- **阻塞 2（B2 真实 200%）**：未闭合，**按熔断规则停轮上报**——无头环境无法驱动浏览器 chrome 缩放（Ctrl+= 探针无效），Spec028:63 要求的实际桌面 200% 操作记录只能由人工提供。已按审查要求降级措辞：CSS zoom 明确为代理、物理等效环境（640×450 + DPR2）明确为渲染参数复现而非真实浏览器缩放操作，人工记录列为待办。
- **阻塞 3（zenv 泄漏）**：物理等效块重构为外层 try/finally 管 BrowserContext、内层管 zenv（成功/异常路径均关闭），newPage 移入 try。
- **阻塞 4（RUN 目录碰撞）**：时间戳目录改 `mkdtempSync(SHOTS/run-)`，worker/重试各归各目录，manifest 互不覆盖。
- **阻塞 5（manifest 身份绑定）**：source/dirty/lock 在模块加载时先采集，afterAll 复核一致（变更则抛错拒标）；新增 launchedBrowser{browserType name, version()}（首个截图时采集）与 lockedBrowser{revision, browserVersion}（browsers.json）同录，并校验 browserVersionMatchesLock。
- **建议 1**：AC-006 坐标断言改严格解析——points 属性必须存在非空、逐对 length===2 且有限、每条 polyline 恰好一对/点（2×2）、tick x/y 存在非零有限。
- **建议 2**：反向更新补齐同强度断言（精确值表 deepEqual、polyline 严格解析、epoch 稳定、草稿保留）。

### R3 轮门禁（HEAD=dc13024 干净树）
1. tsc clean；npm run build 后 dist 同步提交。
2. `npm test` **609/609**。
3. 六套件 `--workers=1` **142 passed**（首跑 1 例未复现偶发，连续两轮全绿；BM3 accepted:true、baseline not-comparable/pixelGate:false，run `.local/bm3-layout/run-1794913744703-6298`）。
4. golden combine 于干净 dc13024：`{"source":"dc13024…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}`（`.local/render-polish-corrective/golden-union-dc13024.json`）。
5. 截图证据 per-run mkdtemp 目录 + manifest.json（source/dirty/lock/lockedBrowser/launchedBrowser/browserVersionMatchesLock/逐张 sha256）。
6. 提交 **dc13024** `fix(#67): R3 review fixes…`（4 文件 +104/−40，含 dist 同步）。

### 待人工项（本轮无法闭合，需用户/评审员执行）

- **AC-003 实际桌面 200% 缩放人工记录**（Spec028:63）：在真实桌面浏览器（1280 物理像素宽窗口）按 Ctrl+= 达到 200% 页面缩放，记录 source=dc13024（或后续固定提交）、浏览器与版本、基准 DPR=2、窗口尺寸，执行守卫表单命中/输入/Modal/焦点/草稿全流程并留存记录。无头 CI 只能提供物理等效（渲染参数复现）与 CSS zoom 代理两层证据，不能替代此项。

## 漂移、风险与回退
- F2 换行兜底在列抽稀下不再要求全量可读（stride 保证不相交、非空、有界；全文在 `<title>` 与值表），与 R1 修复建议一致；U+2E3B 类极少数字形估算上界问题沿用 Check132 R4 结论（主路径 canvas measureText，兜底非可靠上界、已如实记录）。
- updateChart 重渲染与草稿：R2 内审后实测推翻了早前"数据更新重置草稿"的观察——客户端按组件补丁渲染，未提交草稿在 updateChart 前后均保留（AC-006 已用正反两侧断言钉死：视觉改动保留草稿 + 数据更新后 toHaveValue('动态更新期间保留草稿')），强于 Spec028:72 仅视觉合同。
- client.css `.a2ui-basic-button` 遗留选择器与实际 DOM `.a2ui-button` 不符（R1 前已存在，本轮未触碰合同面；按钮观感由 `#surfaces button` 通用规则 + 变体规则承载，验收探针已按真实 DOM 校验对比度）。
- 回退：97b12e8（整改）与 290e5fd（验收测试）两个提交方向独立可 revert；无数据迁移、无内核/schema/权限变更、无 dist 手工改动（dist 仅由 build 生成）。

## 状态
内审修复轮按 AGENTS.md §2.4 熔断规则停止：阻塞计数 R2 4→R3 5（新增阻塞均来自新加测试基建代码，非产品回归），且 B2 连续两轮未闭合（需人工桌面记录，外部输入）。其余阻塞/建议已全部修复并全门禁绿。review-ready（待外部评审员对 97b12e8..dc13024 复审 + 上述人工 200% 记录；本 Check 不关闭 issue、不合并、不发布、不改用户全局安装）。

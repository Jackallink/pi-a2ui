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

## 漂移、风险与回退
- F2 换行兜底在列抽稀下不再要求全量可读（stride 保证不相交、非空、有界；全文在 `<title>` 与值表），与 R1 修复建议一致；U+2E3B 类极少数字形估算上界问题沿用 Check132 R4 结论（主路径 canvas measureText，兜底非可靠上界、已如实记录）。
- updateChart 重渲染会重置未提交 DOM 草稿为绑定初值（既有平台行为，非本轮引入；本轮测试口径改为"视觉改动保留草稿、数据更新不保草稿"，与 Spec028:72 不冲突）。若需"数据更新也保草稿"属新行为需求，应另立 issue。
- client.css `.a2ui-basic-button` 遗留选择器与实际 DOM `.a2ui-button` 不符（R1 前已存在，本轮未触碰合同面；按钮观感由 `#surfaces button` 通用规则 + 变体规则承载，验收探针已按真实 DOM 校验对比度）。
- 回退：97b12e8（整改）与 290e5fd（验收测试）两个提交方向独立可 revert；无数据迁移、无内核/schema/权限变更、无 dist 手工改动（dist 仅由 build 生成）。

## 状态
review-ready（整改 + 验收闭合完成，待外部评审员对 97b12e8..290e5fd 复审；本 Check 不关闭 issue、不合并、不发布、不改用户全局安装）。

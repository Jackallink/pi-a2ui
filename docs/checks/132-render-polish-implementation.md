# Check132：render-polish 实施 T1–T4（issue #67，review-ready）

## 任务与授权
按 Check130 交接与 Plan028 实施 Spec028：分支 `codex/67-render-polish`（自固定设计提交 454c6e5），独立实施分支，不合并/不发布/不全局部署/不关 issue。工作会话 Ark AgentPlan `glm-5.3-flash`（PI_PROVIDER/PI_MODEL 核对一致，无 provider 探针）；测试仅 synthetic transport；未跑任何真实模型、未重跑冻结基线；Actions418909498 保持 disabled。全程 Node24（v24.18.1），锁定 Chromium headless shell 1254 = Chrome for Testing 158.0.8127.18，macOS arm64。

## 提交序列（每步独立可回退）
| 提交 | 内容 | 关键验证 |
| --- | --- | --- |
| 71f27ec | Gate2 真实 RED 套件：tests/render-polish.spec.ts（31 测试）+ tests/render-polish.test.ts + docs/checks/131 | RED 22 个（原因逐项核实）/ GREEN 9 回归 + T3 LOOKUP RED；npm test 608 通过 |
| f88716d | T1 主题 token + 组件视觉：src/client.css 重写（--pi-a2ui-* 语义 token→--a2ui-* SDK 映射、壳层、#surfaces 基础组件规则、≤700px、reduced-motion）+ 13 个组件局部 static styles + tests/browser.spec.ts:245 旧 .add 颜色断言更新为 Spec028 认可色 | render-polish 16 通过/15 失败（T1 全绿，剩余为 T2 集）；browser+visual 51 通过；BM3 accepted:true source f88716d |
| 620198e | T2 数据可读性：Chart 图例（.rp-legend 命名全系列）+ 零基线去重刻度（text.rp-tick，动态左 gutter，11 语料全对齐）+ 系列色 Spec028 调色板；DataTable data-rp-numeric（按真实 cell 类型派生右对齐）/ data-rp-scalar（原子不断行）派生标记，纯展示 | render-polish 31/31；browser+visual+golden+benchmark 35 通过；BM3 accepted:true source 620198e；npm test 608 |
| ed072cd | T3 skill（AC-008）：references/visual-and-data-legibility.md 新子文档（摘要+line/bar+表 recipe、展示文本 vs 原始 number、未知留空、显式负例）+ examples/visual-summary-data-digest.express + manifest 第 20 条 + SKILL.md 索引行 + src/assistant-guidance.ts Chart/DataTable 有界说明 + tests/authoring-first-use.test.ts AF05 | skill+AF 9/9；npm test 609；browser+golden+render-polish 87；example→编译 rc=0；旧 19 样例/8 patterns 兼容（S3 全覆盖） |

## T4 全量本地 CI（HEAD=ed072cd 后运行）
1. `npm run build` OK；`npm run check`（tsc）clean。
2. `npm test` 609/609 通过（.local/render-polish-red/t4-nodetest.txt）。
3. `node node_modules/playwright/cli.js test tests/browser.spec.ts tests/benchmark-model/browser.spec.ts tests/golden/browser.spec.ts tests/visual/browser.spec.ts tests/render-polish.spec.ts --workers=1 --global-timeout=300000` → **122 passed**（t4-all-browser.txt）。
4. `node --import tsx tests/golden/report-cli.ts combine-local` → 68 cases（45 正/23 负），node v24.18.1 / browser 158.0.8127.18（t4-golden-union.json）。历史 frozen union 兼容，无覆盖。
5. `npm pack --dry-run`（prepack=build，新 dist 只由 build 生成）→ pi-a2ui-0.1.11.tgz，**78 files / 286.4 kB**（76+2：新增 skill 子文档与样例，未先假定 76）；两个新文件在包内（t4-pack.txt）。
6. owned startup/discovery 零推理：`node scripts/live-acceptance.mjs --package /Users/jakeliu/Workspace/pi-a2ui --expected-version 0.1.11` → **passed:true**，11/11 stages（helper/host identity、fixture、registration、startup、status、cleanup×4、preservation），agentRuns=0、modelRequests=0、resolved volcengine-ark/glm-5.3-flash、uniqueA2uiCommands=3、uniqueSkill=true（t4-startup-acceptance.txt）。

## 合同保全证据（实际 DOM/POST，非编译成功替代）
- 排序/过滤语义：数值升序 0→8→77→158→12040、字符串字典序、tie 稳定、server snapshot JSON 不变（render-polish.spec）。
- 草稿/事件：RP06 草稿跨 dark/light 与 360↔1280 重排保留且不 POST；RP03 invalid 不 POST / valid 恰好 1 POST（forwardedPayload 实测）；RP04 pause/resume、RP05 modal/状态、值表 12 行逐格不变。
- 不变数据类型/事件/权限合同：dataTableApi/chartApi schema、APPROVED_ICON_NAMES、assistant-cli 参数面均未改；S3/S4 全部兼容。

## 漂移、风险与回退
- 旧 BM3 像素基线未触碰（git diff 454c6e5..HEAD baselines/baseline-manifest/golden 为空）：本轮 status=not-comparable（sourceChanged/assetsChanged/oraclesChanged=true）、pixelGate:false，几何/交互断言为主门禁，未静默修绿、未录新像素基线（如需按 Spec 回退节独立走审核）。
- 计算样式断言精确绑定 Spec028 调色板/字号；调色板变更需同步测试（有意钉住，防视觉漂移）。
- BM4 hung-worker 测试在高负载并行下曾出现 1 次 fallbackBrowserKill 未定义（10.1s 贴 8s 超时），单独复跑与 T4 合跑均绿；已知时序敏感，非本轮改动引入（T1 前亦未跑过该套件）。改动文件与其无交集。
- SDK TextField `<label>` 缺 for/id 关联（既有 aria 合同，#67 范围外，仅记录，见 Check131 风险节）。
- 回退：主题/组件视觉（f88716d）、Chart/表格展示（620198e）、skill 文档/样例（ed072cd）三个独立方向可单独 revert；无数据迁移、无状态库/网络服务变更。
- 已知边界：32 类组件逐类像素级覆盖、actual desktop zoom、动态 patch/完整键盘矩阵未全量验证（设计已声明的漂移允许范围，由测试设计承担的部分已按 AC 覆盖：字体统一、token 消费、primary/focus/error、窄屏堆叠、数值右对齐、标量原子、排序/过滤稳定、图例/刻度语料 11 例）。

## 独立评审与修复轮（R1 NO-GO → 修复 → 复验）
- **R1 评审**（gpt-6.1-sol xhigh，read-only，输入 00120ac 全量 diff；全文 .local/render-polish-red/codex-review-r1.txt）：结论 **NO-GO**，4 项 [阻塞性缺陷] + 6 条建议。
- **d5bc5d2 修复轮**（全部阻塞项 + 建议 a–e）：
  1. 按钮可读性：`#surfaces a2ui-basic-button button` 重映射 `--a2ui-color-on-secondary`→accent-contrast + 内部 `.a2ui-text{color:inherit}`；borderless 变体恢复链接观（透明底/无框/accent 文字）；测试改为断言内部可见文字颜色并新增 default/primary/borderless 三变体测试。
  2. 图表 x 轴标签：新增 visibleXLabels 抽稀/锚点策略（首 start/末 end/中间 middle，估宽 CJK 10px·其余 6px，防裁切+防重叠，`<title>` 保留全文）；svg 改动态 `min-width=width px`（窄屏走 .chart-plot 横滚，绘图区不再缩水 <480px）；新增 bbox 包含 + 相邻间距 ≥2px 测试（RP01 + long-label 语料，后者用独立 page 避免复用已关 page）。
  3. caption 正体：`#surfaces .a2ui-text-caption em{font-style:normal}`（SDK 渲染 `<em>`，span 级覆盖不及文字）；测试改读 em 元素。
  4. 页面规则不再压组件状态：删除 `#surfaces [data-status]{color:inherit}`；新增页面级 `.picker-options button[aria-pressed=true]` 与 hover 状态重断言（ID 特异性模式与 #surfaces th button 一致）；新增 SearchablePicker 选中/未选中 + StatusBadge success/warning/error 前景 computed style 测试（未选中基线观感 = 页面中性边框 rgb(219,226,234)，为级联有意结果）。
  5. 建议：open() 记 externalBlocked 计数并断言 0 + 失败自清理（try/catch 关闭 server/session）；pause 400ms 固定等待改双 rAF 同步点；负例拆成 3 个独立 invalid-express（MetricCard/donut/真实组件未知 prop）逐个断言 COMPILE；digest note 改为按日趋势与按模块计数两份独立示例、口径不同。
  - 修复后：render-polish 34/34；五套件 **125 passed**（BM3 accepted:true source d5bc5d2）；npm test rc=0；tsc clean；golden union 68 cases source d5bc5d2。
- **9095e99 测试隔离修复**：TPD01 原“全局 .local/trigger-pilot 目录清单元相等”断言与并发测试文件（多文件 createRun→mkdtempSync 同目录）存在跨文件竞态（node --test 文件级并行；T3 新增编译触发改变时序后暴露，连续两次复现，单独文件运行始终绿）。修法保意图：guard 拦截 mkdirSync/mkdtempSync/promises.mkdir，对含 `.local/trigger-pilot` 的路径计数 `runs`，进程内断言 {config:0,network:0,runs:0}，删除竞态清单比较。修复后 npm test 连续 3 次 rc=0。
- 未确认阻塞→建议处理：刻度字体未改等宽（Spec028 未要求，7.5px/字符估宽对 11px 数字刻度保守），维持现实现并记录。

## 状态
review-ready（R1 已回环修复并复验，等待 R2 独立复评）：本 Check 不关闭 issue、不合并、不发布、不改用户全局安装。

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

## R2 独立复评（NO-GO，3 阻塞收敛自 4）与 f6383c2 修复轮
- **R2 评审**（同命令 read-only，输入 00120ac..b17f085 全量 diff；全文 .local/render-polish-red/codex-review-r2.txt）：结论 **NO-GO**，3 项 [阻塞性缺陷]（caption 与 picker/badge 两项判定 RESOLVED；未发现新注入面/竞态/泄漏/越权）。收敛趋势 4→3，无同一缺陷原地停滞。
  1. 默认变体与 primary 同为 accent（违反 Spec028:29 “主要操作用accent，次要与本地控件中性”）。
  2. visibleXLabels 边界留 1px margin 致 start/end 锚点标签被吞（单点/双点/三点实测 []/[]/[B]）。
  3. 非 CJK 6px/字符估宽低估宽 Latin（WWWWWWWW@10px 实测 ≈78px vs 估 48px），11×8W 条形图保留标签有 ~19px 重叠。
  建议：externalBlocked 按值拷贝假绿；pause 双 rAF 不能证明 controller 已收到数据；guard 缺 callback fs.mkdir/mkdtemp 与 promises.mkdtemp；formatter 负例栅栏因列/格数错误而失败（原因错位），缺“仅去禁用项即可编译”正对照。
- **f6383c2 修复轮（全部 3 项阻塞 + 4 条建议）**：
  1. client.css：default 画布按钮回归中性（surface 底/中性边框/text 色，`--a2ui-color-on-secondary`→text）；primary 独占 accent + accent-contrast 白字 + 600 字重 + 11px16px padding；borderless 保持链接观。测试同步：RP03 submit（默认变体）断言中性观感；三变体测试断言三种独立观感。
  2. live-elements.ts：visibleXLabels 改精确包含（无 margin，首/末锚点标签可贴边）；x 轴标签宽度改 canvas 2D measureText（`10px + body font-family`，模块级缓存，try/catch 回退 CJK 10.5/其余 8 保守估宽）；条形图末标签 end 锚点贴 plot 右缘。
  3. 测试新增：单点/双点/11×宽 Latin 密集场景 per-chart audit（count/outside/minGap/nonEmpty）；RP01 六个日期标签全保留断言。
  4. 建议：externalBlocked 改共享计数对象（route 回调与 env 同引用）并断言 0；pause 断言前用 `page.waitForFunction(controller.props.text.includes('AFTER_PAUSE_MARKER'))` 证明浏览器已收到更新（controller/props 为 SDK 公开面）；guard 补 mkdir/mkdtemp 回调与 promises 变体；formatter 栅栏修正列/格结构 + AF05 增两个正对照（kind→line、去 formatter 均编译通过）。
- **f6383c2 复验（全部在本提交干净树上）**：tsc clean；render-polish **35/35**；五套件 **126 passed**（BM3 accepted:true）；npm test 61 results 0 fail（union validateReport 通过即完整交付）；golden union `{"source":"f6383c2…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}`（.local/render-polish-red/t4-golden-union-r2fix.json）。
- 备注：golden union 需 node.json 与 browser.json 同为当前干净提交——提交后重跑 npm test 刷新 node 报告再 combine；BM3 accepted 同样要求干净树（提交前一次合跑 125 passed / BM3 fail 为预期门控行为，非回归）。


## R3 独立复评（NO-GO，2 项新边界缺陷）与 9e2f073 修复轮
- **R3 评审**（同命令 read-only，输入 b17f085..69154b0 diff；全文 .local/render-polish-red/codex-review-r3.txt）：R2 七项中五项判定完全解决、两项部分解决，另发现 2 项新 [阻塞性缺陷]（评审员实测函数前后版本复现）：
  1. 单点条形图唯一 x 标签必丢：count=1 时锚点取首项 start 而坐标取末项 left+plotSpan，右缘必然越界被过滤（实测 bar ["A"]→[]，line 正常）。
  2. 精确包含仍有浮点误差缺口：134 点线图 step=540/133，末项 i*step=580.0000000000001>580，end 锚点标签被吞；且标签坐标公式与数据点公式（i/(count-1)*plotSpan）不一致。
  建议 [P3]：canvas 初始化失败被永久缓存（恢复后不重试）、两条降级路径不统一且非可靠上界；AF05 正对照可补精确输出契约断言。
- **9e2f073 修复轮（2 项阻塞 + 2 条建议）**：
  1. visibleXLabels 首末坐标显式钉死（i===0→left；i===count-1→left+plotSpan；中间与数据点公式一致 left+i/(count-1)*plotSpan；单点 line/bar 均落 left 组起点）——浮点误差不再影响边界包含。
  2. labelMeasurer：canvas 初始化失败不再永久缓存（下次渲染重试）；两条降级路径统一为启发式估算（label.length*10，R4 复评指出对极少数字形如 U+2E3B 非可靠上界，仅作兜底，主路径为 canvas measureText）。
  3. 测试扩展为五图 audit：单点 line、单点 bar（R3 回归覆盖）、两点、11×8W 密集、134 点超宽前缀+短末端标签（断言 B 保留且不出界）。
  4. AF05 正对照断言 helper 精确输出契约 {surfaceId,source}（deepEqual）。
- **9e2f073 复验（干净树）**：tsc clean；render-polish **35/35**；npm test 609/609（node 报告 61 results 0 fail）；五套件 **126 passed**（BM3 accepted:true）；golden union `{"source":"9e2f073…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}`。评审中的一次测试断言失配（texts 数组成员 vs 子串）属测试自身写法，已修；功能探针确认五图标签渲染正确。
- 经验记录：golden union 与 BM3 accepted 都要求「node.json/browser.json 同为当前干净提交」——任何 src/tests 变更后需先提交，再重跑 npm test 刷新 node 报告，再 combine；浏览器证据在提交后的套件运行中生成。


## R4 独立复评：GO（0 项阻塞性缺陷）— 审查闭环收敛
- **R4 评审**（gpt-6.1-sol xhigh read-only，输入 69154b0..bb528e1 diff，93 行；全文 .local/render-polish-red/codex-review-r4.txt）：结论 **GO**。
  - R3 两项 P2 均实质解决（评审员以函数前后版本探针独立复现：旧版单点 bar → []，新版保留 {label:"A",x:40,anchor:"start"}；134 点末标签旧版丢失、新版保留 B@580/end，且 line 1–200 点坐标均与数据点公式一致）。空数据、两点两种 kind、抽稀顺序/包含判断/2px 间隔、超宽前项不阻挡后续短标签均复核无误；缓存发布策略无重入风险；无注入/敏感信息/未捕获异常/接口漂移；dist/client.js 与内存重建字节一致。
  - 遗留 2 条 [P3] 优化建议（评审明确不升级为阻塞）：① label.length*10 为启发式估算而非可靠上界（U+2E3B 实测 ≈26.34px@10px），Check132 措辞已改，主路径 canvas measureText 不受影响；② 可补窄断言（坐标/锚点、两点 bar、初始化失败恢复、measureText 抛错）——按 m00001 范围按需采纳，不在本轮阻塞闭环内实现。
  - AF05 精确输出契约断言判定完全解决。
- **收敛曲线**：R1 4 项 → R2 3 项 → R3 2 项 → R4 0 项，严格单调收敛，无同缺陷停滞、无回归，满足全局审查工作流放行条件（阻塞性缺陷归零）。

## 终态（review-ready 停止点）
- 分支 codex/67-render-polish；提交链 71f27ec → f88716d → 620198e → ed072cd → 00120ac → d5bc5d2 → 9095e99 → b17f085 → f6383c2 → 69154b0 → 9e2f073 → bb528e1 → 本记录提交。
- 独立审查 R4 GO；本 Check 不关闭 issue、不合并、不发布、不改用户全局安装。

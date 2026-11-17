# Spec028：统一渲染视觉与现有组件可读性（#67）

状态：draft（设计/真实渲染器样张，尚未独立GO；**不是生产实现验收**）。Tracker：[issue67](https://github.com/Jackallink/pi-a2ui/issues/67)。基线main `0c1fe67649b3f61d520ca0318f7dd977a208b3b5` / package0.1.11。用户授权先完成设计、固定场景前后样张及独立评审；本轮不触发Pi，不改产品，不调用真实模型。实施由用户自行发起Pi agent，交接提示词随设计交付；没有合并/发布/全局部署/issue关闭授权。

三轮：[R1](../walkthrough/render-polish/01-round1-user-stories.md)、[R2](../walkthrough/render-polish/02-round2-technical-trace.md)、[R3](../walkthrough/render-polish/03-round3-integration-check.md)；验收记录Check130；[实施计划](../plans/028-render-polish.md)；[样张/设计入口](../designs/028-render-polish/README.md)。状态/实际检查归Check，计划不维护实时进度。

## 目标、选择与非目标

让同一份合法Express不靠反复提示就有协调的视觉默认值，并让skill指导作者合理组织信息。选A：现有Lit主题token＋组件局部样式/必要展示标记＋既有组件组合样例。B仅修改prompt不能保证一致字体/间距/对比度；C迁移CopilotKit/React/Tailwind会扩大依赖与内核改动，均不选。借鉴[CopilotKit surface styling](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/a2ui/styling)及[semantic theming](https://docs.copilotkit.ai/a2a/generative-ui/components/theming)的原则，不复制另一实现的变量合同。

IN：浅色默认外观；32类现有组件的视觉覆盖清单；重点表格/图表/表单/代码日志/状态/弹窗；响应式和按需skill子文档。保留现有构造函数/参数、排序/过滤、业务草稿、绑定、事件与revision/epoch，数值原始类型不变。

OUT：compiler/session/protocol/server/认证/预算/事件生命周期/SDK版本的改动；更换组件根节点/Light DOM策略；新Catalog/组件或样式props；深色模式/主题切换与配置API；远程字体/图片/HTML/CSS执行入口；donut/area/horizontal-bar等新图表；自动聚合“其他”、插值平滑、自动发布/重试；真实模型、冻结基线重跑、旧grant/21余额。不得把视觉改版和独立内核修复合并：发现内核缺陷先记录并停该扩张。

## 已核实的样式入口

本地锁定 `@a2ui/web_core0.15.0` 的 `src/universal/a2ui-lit-element.js` 明确有adoptLightDomStyles：把Light DOM static styles作用域化后注入文档。真实探针观察Chart svg maxHeight260px、DataTable td padding8px等已生效；因此**不以“static styles全部无效”为根因，不改createRenderRoot/SDK注入机制**。

差异是主题覆盖不全：自定义表格筛选/表头按钮仍可继承原生Arial13.33px，而基础Text采用系统字体16px；多处固定色值、边框、密度缺统一。组件级static styles继续由SDK按tag作用域化；跨组件token定义在已被server服务的`src/client.css`，不新增需要server路由的theme资源。所有canvas surfaces共享本默认主题；“不泄漏”指组件规则不污染其他组件类型/canvas外控件，不是新增每surface独立主题。

## 候选视觉合同（单一提案，不新增用户配置）

候选为中性浅底＋靛蓝强调；色彩是设计提案，实施必须保留该已审样张方向，若用户后续改主色需记录设计delta。生产token命名`--pi-a2ui-*`，映射已被SDK消费的`--a2ui-*`；预览中的`--rp-*`仅为设计标识，不是公共API。

| 语义 | 候选值/规则 |
| --- | --- |
| canvas / surface / raised | #f5f7fb / #ffffff / #f5f7fb |
| text / muted | #172033 / #566477；caption正常字形，不用低对比浅灰或默认斜体 |
| accent / focus | #365cdb / #1d4ed8；主要操作用accent，次要与本地控件中性 |
| border / input border | #dbe2ea装饰边框；#8190a5输入边界；不要求纯装饰分隔线3:1 |
| success / warning / error | #166534 / #92400e / #b42318，配文字，不把上升/红绿固定等同好坏 |
| chart series | #365cdb / #0f766e / #9a5b0a / #92419c；line再用实/虚/点线等标记 |
| spacing / radius | 4/8/12/16/24/32px；控件8px、卡片14px；浅阴影不作为边界唯一证据 |
| typography | 正文14px/1.55、caption12px、section15–16px、页内标题24px、摘要数字28px；代码/日志12px等宽，关键内容允许缩放；数字tabular-nums |
| layout | desktop main max1240px/左右40px，≤700px左右16px；Row卡片换行，窄屏单列；只允许表格/图表/代码局部滚动 |

当前Text只支持body/caption，不能使用h1/h2新variant；标题和摘要通过既有受限MarkdownView的heading子集组织，不开放HTML。样例MetricCard仍是Card/Column/Text/MarkdownView组合，不注册MetricCard函数。Table数字单元格仅由现有number类型派生内部`data-value-kind="number"`用于右对齐；number/boolean/null作为原子文本，white-space:nowrap且禁用anywhere断词；表格不足宽时只在table-scroll区域横向滚动并提供可聚焦region，长字符串列可换行。不得仅凭bodyOverflow=false称数值可读；number/boolean/null的Range实际行数必须≤1，原始text与value保持。不把number变字符串，不改compare函数/顺序/原始事件。

## 组件覆盖与允许文件

| 区域 | 实施触点 | 不变的契约 |
| --- | --- | --- |
| shell/基础Card/Row/Text/Button/输入 | src/client.css；SDK实际变量与作用域内类；Row重排 | 组件类型/children/绑定/原生事件不变；不增加root策略或注入器 |
| DataTable | src/table-elements.ts static styles＋TD/TH展示类型标记 | rows/cells值和类型、stable sort/filter、aria-sort不变；不自动合计/缩写 |
| Chart/LogView | src/live-elements.ts static styles及Chart legend/grid/tick纯展示标记 | line/bar、≤4序列、≤200对齐points，validateSeries/updateChart/LogView源不变 |
| CodeDiff/TestResults/CodeBlock/Markdown | src/coding-elements.ts、text-elements.ts视觉局部 | 原文、proposal/result身份、复制/只读与安全Markdown子集不变 |
| Details/Modal/Icon/Validation/Picker/Status/Timeline/媒体 | 各现有*-elements.ts（selection/validation/timeline为*-element.ts）仅本组件样式 | 键盘/焦点/错误/原始数据/事件/资源注册播放边界不变；不以CSS隐藏交互问题 |
| skill/helper | skills/pi-a2ui/SKILL.md索引、references/visual-and-data-legibility.md、summaries-and-feedback.md、必要examples/manifest与src/assistant-guidance.ts的有界说明 | 不扩所有轮次prompt，不新增CLI命令或改变check输出；已有样例名/模板兼容 |
| dist | 现有build生成client.css/client.js/assistant-cli.mjs | 禁止手改产物；THIRD_PARTY_LICENSES无依赖变化应不漂移 |

文件允许清单以本表为界；加入未列出的生产文件需解释必要性并先重审范围。媒体只统一容器、标题/错误状态，保持native controls，不做新播放器。

## Chart展示算法与数据不变量

继续使用现有零基线归一化域：maxAbs=max(1,max(abs(values)))、low=min(0,values/maxAbs)、high=max(0,values/maxAbs)、span=high-low或1；标注与现有点/柱用同一y映射，不能另算不一致的坐标轴。ticks从low/mid/high去重，空数据不画伪数据刻度，全零最多一条0刻度。不是“nice ticks”新算法，也不生成目标/预测。

显示顺序/系列名与输入一致，legend对应实际series并保留4条文字区分；原始表始终保留完整标签与值。内部tick显示规则：精确0（含-0）显示0；非零abs<0.01或abs≥1e6用toExponential(2)（3有效数字，保留正负与指数），其它值用固定en-US无分组、最多6位小数。非零不能显示成0；允许刻度显示近似值，原表不改。若不同tick值格式化后标签碰撞，逐步提升精度至Number.toString()，不得合并不同值为同标签。tick标签采用ASCII等宽字体并为最大标签保留足够左gutter（至少40px、按最大实际标签宽度+12调整；绘图区最小宽480px，加右边距24px后形成最小SVG宽度，窄屏只做局部横滚，不能硬裁到140px），绘图区x起点和点/柱坐标同步内缩，y保持同域公式；不会新增formatter属性或更改schema。所有值必须finite，包含最小subnormal与接近MAX_VALUE，空与zero逻辑如上。不能改points或表格源值。长标签先换行/选择较少tick并保留完整title与原表，窄屏绘图区使用≥540px局部滚动，不把字缩到不可读；不可旋转45度遮挡或改label原值。现有原生SVG title继续保留，首轮不宣称完整keyboard Tooltip组件；可见legend与原表为非颜色替代。

样张的after通过注入CSS、局部legend/网格/线型和数字单元格派生标记模拟此方向，**没有修改src实现**。真实Chart长标签/空/零/负/4series与动态patch仍需实施后的测试，不能借RP01两条正值折线样张称边界全部通过。

## 固定样张、可证伪边界与AC

固定RP01摘要/line/明细（32组件）、RP02长中文/原始数字与布尔表（7）、RP03三必填/本地错误（12）、RP04只读Diff/示例Log（10）、RP05空/加载/错误/Details/Modal入口（14）、RP06多卡片/草稿（25）。所有样例明确非真实工具结果。每场景同一源、同一server快照、同一locale/字体/浏览器；before没有注入样式，after仅上述设计标记。360/768/1280×900各前后，另640×450的reflow等效前后，共48张。等效reflow不充当真实desktop200%缩放验收；Modal打开、禁用/发送中等状态在实施补足。

| AC | 优先级 | Given / When / Then | 实施测试（目标名） |
| --- | --- | --- | --- |
| AC-001 | P1 | 现有组件在真实renderer / 加载主题 / 32类矩阵完成，关键样式computed值和字体统一，未迁移根节点/引入新依赖 | RP-T1 token consumption与scope DOM；非仅字符串断言 |
| AC-002 | P1 | 六固定场景 / 相同source与data前后 / 有界before/after和manifest可追溯，不把prototype当生产 | RP-T2 capture registry/hash/known fixture/实际截图 |
| AC-003 | P0 | 360/768/1280和desktop实际200% / 重排与输入/弹窗操作 / 无非预期body溢出、遮挡/重叠，局部滚动可用，草稿不丢 | RP-T3 geometry/hit-test+已有BM3 canary、实际zoom人工记录 |
| AC-004 | P1 | 文字/输入边界/焦点/状态 / 键盘/reduced motion / 普通文字≥4.5，大字及必要非文字信息≥3，状态不只靠颜色；焦点/aria原合同保持 | RP-T4 computed有效背景的contrast对+tab/Modal/error/focus；不把token数值表当全WCAG认证 |
| AC-005 | P0 | 表格数字/字符串/null/boolean / 展示、sort/filter / value/type/稳定排序和Event.context完全不变 | RP-T5 actual browser numeric/string sort+snapshot+no POST，360窄屏Range scalar单行及横向可达 |
| AC-006 | P0 | line/bar空/单点/零/全负/混合/长标签/4series / 展示及updateChart / 刻度/legend/table一致，有限坐标，无伪0样本/插值，草稿和revision/epoch不被视觉改动重置 | RP-T6 chart corpus（含tiny/huge/subnormal/MAX_VALUE）/formatter非零不伪0与label宽度、patch回归、原表/数据精确相等 |
| AC-007 | P0 | 空guard表单、本地控件、发送中/暂停 / 键盘/点击/样式切换 / 无无效POST；Details/Modal/复制/筛选不多发事件；valid动作按旧通路 | RP-T7 invalid0+valid1 POST、焦点返回、pause/inert/隐含事件回归 |
| AC-008 | P1 | 新skill索引/组合例 / helper example→check / 可编译、组件名真实、无虚构props/测量/单位或预载整篇system prompt | RP-T8 actual helper/正例与显式负例/CLI shape回归 |
| AC-009 | P0 | 固定产品候选 / 本地CI/包启动 / Node24窄→全Node/type/四browser/strictunion+build/pack/owned discovery，通过独立代码GO；无依赖/内核漂移 | RP-T9 fixedsource CI/package/rollback审查 |
| AC-010 | P0 | 设计或Pi实施 / 任意评测入口 / 新真实模型0、冻结和旧grant保持；设计GO不等于merge/release/global/issue关闭 | RP-T10 git path+hash/网络拒绝/授权清单 |

## 门槛、漂移与回退

本轮状态最多walkthrough-approved（含Gate2测试意图被审的明确记录），不冒称tdd-approved已有行为RED或production complete。独立审查必须看规范/样张和身份，发现P0/P1/P2定义缺口先纠正。Pi实施先核固定base/依赖/dirty证据，再将P0/P1测试意图落实为真实失败并通过Gate2，之后按T1–T4依次做最小改动；实现/集成另做独立code GO。用户仅让我们给提示词，本轮不启动Pi或代做生产实现。

允许漂移仅样张与实施方式的明确边界：候选截图是CSS/DOM演示；尚未验证所有32类、actual desktop zoom、动态patch/完整键盘与全部contrast组合，计划测试负责补齐。不能重录before或覆盖旧BM3/frozen结果“修绿”。实现后如需更新像素基线，固定source/OS/字体/浏览器，独立审核新预期后新增有版本的视觉基线；几何/交互断言仍为主要门禁，像素继续保留平台条件。

回退分主题/组件视觉、Chart纯展示、skill/示例三个独立提交方向，保留失败与before/after。无数据迁移、无状态库/网络服务变更，源码revert即可；不撤历史证据、不复活grant。

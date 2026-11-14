# 组件支持与日常交互扩展

当前运行环境：**Node 24.x**，先执行 `nvm use 24`。现有能力清单面向 pi-a2ui0.1.3；用户已将下面七组能力规划到0.1.4，规划项不代表已经实现，也不授权浏览器直接执行命令或读写文件。

## 已支持什么

2026-11-14 对照官方 A2UI v1.0 Basic Catalog，并直接枚举本项目锁定的 Web Core/Lit0.15.0 catalog：官方有18个基础组件，本插件启用其中12个，另加4个Pi自定义组件，共16个。最新在线协议可能演进；实现以锁定SDK、共享schema和匹配的浏览器实现为准。

| 状态 | 组件 | 日常价值 |
| --- | --- | --- |
| 已支持：官方布局 | Column、Row、Card、Tabs、Divider | 分区、对比方案、按任务切换视图 |
| 已支持：官方文本/输入/动作 | Text、TextField、Button、CheckBox、ChoicePicker、Slider、DateTimeInput | 需求澄清、参数选择、结构化提交 |
| 已支持：Pi自定义 | CodeDiff、TestResults、LogView、Chart | 看改动、测试记录、真实工具输出和受约束趋势图 |
| 官方存在，插件未接入 | List、Modal、Icon、Image、Video、AudioPlayer | 结果列表、局部详情、状态图标、视觉产物和媒体预览 |

官方 Text 支持简单Markdown，但本插件当前将Text作为转义纯文本；不能把这说成现成的富文本能力。官方有格式化/校验等函数，当前插件catalog的functions为空，相关函数、checks、动态模板及通用RPC尚未启用。官方“有这个组件”不等于本插件现在可直接生成使用。

## v0.1.4已纳入的七组交互能力

以下七组已全部纳入v0.1.4规划（C01–C14），包括Video/AudioPlayer。优先级只决定顺序；完整范围、用户故事/AC与入场门禁以[spec007](specs/007-v0.1.4-usability.md)为准。本次规划未实现组件，也未批准媒体权限/资源设计。

| 优先级/方向 | 用户眼前的问题 | 推荐实现方式与边界 |
| --- | --- | --- |
| 优先：结果列表/表格 | 文件列表、搜索结果、依赖检查和诊断结果挤成一大段文字 | 接入官方List的受限静态children；同版实现自定义DataTable的列、排序和筛选，限制行列/字节和分页范围 |
| 优先：CodeBlock/受限Markdown/复制 | 代码、命令、配置与说明混在一起，难读难复制 | 保留Text纯文本契约；新增CodeBlock或受限MarkdownView。只允许明确Markdown子集，禁止原始HTML；复制只是复制，不直接执行 |
| 优先：Accordion/Details | 长日志、Diff和工具结果占满页面，结论不好找 | 结论默认可见，证据按需展开；展开状态留在浏览器，数据更新保留选择和滚动 |
| 随后：StatusBadge/TaskProgress | 不知道任务在排队、运行、失败还是结束 | 状态由真实Pi生命周期/工具事件驱动；没有分母就显示进行中，不编造完成百分比 |
| 随后：Modal/Icon | 表单细节和低频说明干扰主任务，状态区分慢 | 接入官方组件；验证Modal全部child slots、焦点/键盘/退出返回行为，图标本地打包 |
| 阶段C必选：ArtifactPreview/Image | 截图、生成图片或测试产物不便检查 | 优先静态预览；只接入明确授权的产物ID/来源。当前CSP不允许图片，资源服务/CSP/大小边界需成套设计，不能仅加白名单 |
| 阶段C必选：Video/AudioPlayer | 音视频任务需要回看产物 | 同版纳入；先通过W6源/权限/预算门禁，再用真实音视频fixture验证播放与资源清理，不以标签挂载替代验收 |

同版T01组合示例也提高可读性：用现有Card/Row/Column/Text组成键值摘要、方案对比、步骤清单；使用已有Button收集“继续/修改/放弃”意图。它们仍回到同一Pi会话，由Pi执行工具和权限判断。

## 其他有用的候选

下面R01–R08是新增建议，先评估现有组件组合是否足够；单独进入候选tracker，不自动扩大C01–C14必选范围。它们大多不是官方Basic组件。

| ID | 组件/模式 | 日常价值 | 取舍 |
| --- | --- | --- | --- |
| R01 | TreeView / Breadcrumbs | 文件树、调用层级、任务位置一目了然 | 自定义；选择只发送当前作用域内的意图，不直接读文件；限定节点和深度 |
| R02 | SearchablePicker / ComboBox | 从较长分支、文件或选项列表快速选中 | 先评估TextField+ChoicePicker组合；键盘筛选且值必须属于已授权选项 |
| R03 | KeyValueView / MetricCard | 把环境、构建摘要、耗时和参数压缩为清楚的键值信息 | 优先复用现有Card/Row/Column/Text模板，不先造新catalog类型；数值有来源 |
| R04 | InlineValidation / FormErrorSummary | 错误直接定位到具体字段和原因 | 客户端反馈配合服务端复验；不把模型给出的checks当授权或放开任意函数 |
| R05 | Callout / EmptyState / Skeleton | 分清失败、无结果、未执行与加载中，并给恢复动作 | 可先做现有组件组合；状态从实际请求/工具生命周期推导 |
| R06 | ActivityTimeline | 回看工具执行顺序、耗时和失败节点 | 共用真实事件源和有界窗口；不建立无限历史库或编造时序 |
| R07 | EvidenceLink / SourceLocation | 从结论定位文件行、测试记录或来源 | 携带固定来源ID/位置；由Pi确认处理，浏览器不开放任意file://或路径读取 |
| R08 | CommandPalette / ActionBar | 键盘查找当前可用动作，减少鼠标往返 | 只引用当前epoch/revision的现有动作；不增加直接命令执行权限 |

## 本插件如何扩展

1. **先定义数据契约。** 给新组件明确props、状态、大小/数量上限、静态或可绑定字段；在共享schema中定义。官方组件也要检查本插件是否允许相应绑定、子槽和模板，不要直接开放全部SDK能力。
2. **同时接入Agent与浏览器。** 服务端在`src/catalog.ts`派生明确版本catalog，并给模型相应指令；浏览器在`src/browser-catalog.ts`注册同一schema的Lit实现。现有`coding.ts`/`coding-elements.ts`及`live.ts`/`live-elements.ts`展示了这种分工。catalogId是标识，不要依赖运行时下载未审查schema。
3. **补齐整条链路再开放。** `compiler.ts`和`session.ts`要覆盖新children slots、树深、输入类型、动作上下文、原子失败及快照/旧版本恢复。交互仍走现有事件/修订校验；动态数据使用受限更新路径，不创建通用执行RPC。验证schema一致、真实浏览器可访问性/长数据边界、重连/恢复和原有表单草稿保留。

这不是“写一个前端组件就完成”：模型可生成的schema、服务端接纳的状态和浏览器渲染行为必须一致。七组能力已归入spec007用户故事/AC和分组tracker，逐组通过设计/TDD/代码审查后实现；本轮只完成规划与候选说明。

## 一手依据

- [官方Catalog概念与基础组件清单](https://a2ui.org/concepts/catalogs/)：基础组件、schema与渲染实现的共同契约。
- [官方定义Catalog指南](https://a2ui.org/guides/defining-a-catalog/)：声明schema、Agent加载、客户端注册及schema一致性。
- 本仓库实际能力：`src/catalog.ts`、`src/browser-catalog.ts`、`src/compiler.ts`、`src/session.ts`；数量由锁定SDK和restrictedCatalog实际枚举确认，functions当前为0。

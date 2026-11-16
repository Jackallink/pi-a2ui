# Spec025：GLM首次候选正确性的双任务配对验证

状态：walkthrough-approved（独立R2 Gate1设计/拟成本边界/可比性GO，0项开放P0/P1/P2；受审设计稿9156b34be57d2daaf84d722ff406f55deef188e7，见[Check122](../checks/122-authoring-paired-pilot-design.md)）；本轮仅场景/预算设计与独立评审，实际模型预算仍0，不实施驱动、不读真实模型配置、不创建live grant。用户明确要求GO后再申请真实调用授权。完整机器定义见[proposed profile](../checks/authoring-paired-pilot-design/profile.proposed.json)，其documentOnly/live=false不能作为执行配置。

授权续记：用户在上述独立设计GO及明确条件申请后回复“授权”，已批准必要最小适配、完整零推理/独立代码GO之后一次新4session/总≤24批次。当前进入[Check123](../checks/123-authoring-paired-pilot-implementation.md) Gate2，尚未建立live grant或调用。原设计阶段“预算0/不实施/未授权”等为当时状态，由历史9156b34保留；新执行仍严格受代码门槛和一次性源绑定约束，不复用旧余量。

## 目标与证据边界

比较正式0.1.10与Spec024候选这组skill/CLI/入口引导，对**新的两个任务**的首次候选正确性和可用UI交付是否出现方向性帮助。不测主动触发频率，不提供DSL、模板名或“请读skill/check”等额外提示。两例明确要表单；本轮没有新的真实负例，因此不评价误触发率。

四个独立session，每臂2任务，每个任务/臂只尝试一次。不是冻结BM4、旧Spec022或Spec023的续跑/重算；旧4请求授权的余量不复用。2对样本不足以证明总体成功率/因果效应/统计显著性；只报告观察值、成败路径和成本，不为“跑绿”改场景/预算/模型。

## 对照和对象

| 臂 | 包与来源 | 不可混淆的身份 |
| --- | --- | --- |
| C / released-control | 正式0.1.10 source b7022efd48d6ed679eb08b17b672bb10cec9425f | archive SHA c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55 |
| G / guided-candidate | Spec024受测source095459084f0bf8ab26c803c4b7e2f2dbb6b004ba | archive SHA c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8，私有未发布 |

两包版本文字同为0.1.10，必须用source+archive+payload hash区分，不能以version作为identity。76path一致，仅extension.ts、src/assistant-guidance.ts、dist/assistant-cli.mjs、SKILL.md及helper/summaries-and-feedback/syntax-and-errors三个reference共7路径不同；其余69payload和package-lock相同。C保留0.1.10已有NEW主动触发句，**不是旧pilot的A文案**。这测的是整组引导包，不把效果拆归因到某一句/某个CLI note。

两臂使用完全相同的Node24/Pi1.5.0/锁定SDK依赖/Chromium158.0.8127.18 revision1254、模型、工具、自然消息和沙箱。当前参考Node24.18.1；最终执行源码、精确runtime/lock/profile/capture/两归档身份要在未来代码GO后固定。本轮不改产品、版本或本机安装。

## 全新场景与次序

精确UTF8消息和oracle fields只以proposed profile为准：

| 场景 | 用户需要 | 必须可验证的差异 |
| --- | --- | --- |
| FP01 | 同页任务登记：任务名称、运行环境、构建版本；三个初始空、必填文本；只回传taskName/environment/buildVersion | ID/值路径/提交键正确适配，不附加Checkbox或别的输入；不运行任务 |
| FP02 | 同页归档信息：归档名称、源目录、批次标签；初始空/必填文本，名称2–40字符；只回传archiveName/sourceFolder/batchLabel | 正确适配required与名称长度规则，不把目录键写为保留的path；不读目录/创建归档 |

两例按钮标签都要求“提交信息”，字段标签原样使用profile文字；不是模型自行猜同义词后的宽泛判分。固定顺序`FP01-C → FP01-G → FP02-G → FP02-C`，控制一次先旧、一次先新，不谎称随机化或消除远端时序/缓存影响。不更换顺序补做不利样本。

每个session全新无历史；同一owned绝对workspace/package/project/agent路径按臂顺序复位，同case提示与安全append相同。仅清理新owned子树，先前session/receipt/锁不删。独立子进程加载**该臂包里的extension.ts、skill、helper与compiler**，不能static import工作区当前extension充当C。依赖可链接同一锁定node_modules，须记录不等于独立新装依赖。

## 模型可见条件与沙箱

仅Ark AgentPlan `volcengine-ark/glm-5.3-flash`、`https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions`，native enabled/low/max_completion_tokens1536、include_usage、auto工具、非parallel；禁止max_tokens替代、fallback/retry/redirect/model refresh/warming/compaction/付费judge/probe。服务端alias精确实现不作新保证。

可见工具恰为read/bash/write/edit/a2ui_render；插件其它工具不激活。仅发现本臂一个skill的metadata，不强制预载正文、不使用/skill显式展开、不加载用户其它插件/skill/AGENTS/context文件。首context捕获须核实skill正文未被强载。read仅owned包/项目（拒绝symlink逃逸）；write/edit仅新的draft.express，32KiB/有效UTF8；没有真实工程数据。模型prompt不加入臂标签、source/hash、oracle反馈或额外流程要求来暗示实验；安全append仅说明统一沙箱。bash仅直接Node24运行本臂helper的只读catalog/component/examples/example/patterns/pattern/check，不给shell操作符、任意程序或命令执行权限。不能运行归档/任务，也不为教程放宽沙箱。两个arm安全限制一致。

每会话≤12串行工具调用、≤1check、≤1render；完整toolCall意图在SDK校验前计attempt，实际执行另记，不能用schema拒绝绕过attempt上限。source/schema/depth/components等原产品限制不变。准备可含多次write/edit，**首次提交候选**前允许整理草稿；不是把第一个partial write或第一token当完整生成。check之后再write/edit属于第二候选尝试，阻止并停该会话，不算编译器故障；不进行自修复。任何render后不让SDK再续一个解释请求。不点击/填表/POST/ACK/执行业务。

## 指标定义：不混淆首次候选与画布

1. **首次候选**：第一次check实际读取的完整source；没有check时取第一次完整a2ui_render.source。render schema错误单列，不能伪称没有选择工具；check INPUT/缺文件等未触达编译的准备错误，不当DSL语法错误。记录此前write/edit次数，不能把此定义叫“第一份原始草稿”。
2. **首次候选正确**：本臂正式compiler成功且下述静态任务oracle通过。第一次check编译/任务语义失败立即停该会话，不给模型错误反馈后的第二次机会，也不将task-oracle结果追加为新的修复提示。仅预检成功绝不是已渲染UI；无候选/准备耗尽单列。
3. **首个可用UI**：第一次render成功提交、实际owned浏览器读取目标surface、同一所选组件ID的3个字段及提交入口可见/可用、任务语义通过且无动作POST。schema/编译/commit/DOM/内容分别记录。render提交不等于内容成功。
4. **流程证据**：成功skill read是否在首次候选前、成功helper example是否先于首次候选、首次check是否成功、check输出与render.source及surfaceId是否匹配。只观察动作次序，不推断模型理解或看过全部参考。未check但直接得到正确UI仍计UI成功，流程记unchecked，不能在运行时新增产品receipt门禁。

source匹配记exact / single-terminal-lf / mismatch / unchecked / no-render。唯一兼容差异沿用既有精确规则：仅多/少一个末尾LF且较短source不以CR/LF结尾；保留两份原字节/SHA，只有exact叫原字节一致，不做trim-all或改写DSL。若check后inline render source不同，仍观察唯一真实render结果，mismatch不反写首次候选的编译判分，也不把产品成功误叫运行时拒绝；流程不能算完整匹配。首次候选正确但没有render时，UI记not_observed，不叫整任务成功。

### 静态与DOM oracle

以profile的3个标签/字符串keys为任务定义，从一个非取消“提交信息”Button的**直接Event.context**精确3键回溯3条不同的绝对input value路径，再定位唯一3个TextField组件；ID由实际snapshot导出，不猜变量名/DOM位置。标签须匹配请求原文、dataModel初始值为string空串，不能加未请求的可编辑输入。TextField.variant只允许省略（SDK默认shortText）、shortText或longText；number/obscured不是任务要求的任意可读文本，即使value仍是string也判任务语义invalid。

FormValidation的按钮引用、root可达性、fieldId和直接绑定覆盖先由该臂compiler检查。任务oracle另外确认3条required规则精确绑定选定输入；FP01不附加未要求的长度约束，FP02仅归档名称minLength2/maxLength40，其余仅required。用同臂纯validateSubmission核查空草稿三项无效、满足任务的合成值有效，FP02名称1/2/40/41个Unicode字符边界（单独synthetic数据，不发事件或模型请求）。不增加新正确性模型/LLM裁判。

render后按实际SDK host.context.componentModel.id跨shadowRoot核对所选字段和Button本身，所选原生编辑控件须是input.type=text或textarea，拒绝number/password等未请求类型；拒绝隐藏/关闭Details/inert/disabled/readOnly或被modal隔离的控件；不允许别处三个无关输入/同caption按钮替代。profile要求同页，所以必须在初始目标form可见可用；不点tab/按钮来补满足。布局和任意自动组件ID不做字节比对。只要求caption/字段标签是用户明确指定的文字。

### 报告与方向口径

固定4行、每臂2个计划任务：分别给首次候选observed/correct/invalid/not_observed/unknown，首个render requested/schema/compile/commit/UI，流程证据和费用。报`已确认正确首次候选/2计划任务`及`正确/实际提交候选数`两个分母；不能隐藏未提交样本来提高比率，实际候选分母为0时记N/A（not_applicable），不计算0/0或0%。未知不当普通fail或零请求；任一基础设施/unknown导致不完整时不输出改善结论。

首次候选正确性比较中的“2对完整”明确要求：4行均实际提交了首候选，且编译/静态语义的合取判分已知。编译已失败可确定该合取为false，不假称未执行的静态阶段也执行过。只要有known noCandidate/text_only/preparation_limited而未提交候选，就不触发正确性direction_support；仍保留全部4行及双分母，只描述预算内交付/准备开销，不声称候选正确率改善。unknown/fatal仍为批次证据不完整。仅满足上述4候选完整条件时比较：每对候选正确性的G胜/C胜/持平、各臂可用UI数和准备开销。若G至少一对更好且无反向对、G可用UI数不低于C、G至少一个可用UI具备skill/example/成功预检及source兼容匹配证据，可称**本小批次方向支持**；否则无方向改善/混合，分阶段如实解释。即使2/2对0/2也不推断总体提升或统计显著性。预检变好但没有形成UI只叫阶段改善，不叫实用效果通过。

## 拟申请预算与停止

| 资源 | 新批次上限；当前未授权 |
| --- | --- |
| session / 顺序 | 固定4、并发1，只执行一次批次 |
| provider请求 | 每session6、全批24；所有准备/失败/未知准入都算，不互借/退款/替换 |
| 输出 | 每请求max_completion_tokens1536；24×1536=36864为配置输出上限，含reasoning，不是费用保证 |
| 输入/响应 | body≤98304bytes、response≤1MiB、source≤32KiB |
| 工具/check/render | 每session≤12/1/1；无动作POST |
| 时间 | request30s，active150s，worker总180s（含setup/cleanup/TERM2/fallback），batch总780s=13分钟；owned cleanup≤10s |

worker总180s必须包含清理/kill/fallback，不能实现成180+cleanup。每会话同样的完整上限；剩余批次时间不足180s时不再开下一会话，记not_run，不缩短最后一臂制造不公平。batch时钟包括live准入/包校验/切换/收据，整个批次不越780s。cap或时间不足不保证能走完6请求，结果如实有限。

普通authoring失败（首次check编译/语义、schema/compile/内容失败、准备错误/无render/准备耗尽、第二候选尝试）停**该会话**，仍按固定顺序做剩余会话；这是新对照必须看到两臂的正常结局，不是重试。认证/HTTP非成功/transport/SDK或流未知/截断、源码/包/context漂移、durable账本失败、跨沙箱/工具权限违规、timeout/取消/清理异常等停**整批**，后续not_run。区分12工具调用正常耗尽与越权：正常限额停该会话，未知记账或绕过边界停整批。

正常case已经闭合、已有provider请求终态可知以后，SDK本地stop留下的空assistant/aborted且无新admission/请求diagnostic，是本地停止产物：不得覆盖既有stop/toolUse、usage和UI判定，也不升级fatal/provider_unknown。不能把所有aborted都如此处理；尚有in-flight请求时的真实传输中断、timeout/取消仍fatal unknown并停止整批。未来APS控制必须分别复现这两类。

任何已准入请求先fsync记账再POST；未知不能回额度，报告knownAdmitted与confirmed HTTP/SDK结果及missing receipt差别。usage逐请求保留prompt/completion/total/reasoning（subset不重复加）；缺usage或货币fee就是unknown，不写0/免费。当前不估算或保证金额。无额外ACK、health probe、付费评分/修复请求。一次性grant/锁保留，任何失败不另起替代batch来补齐配对。

## 当前代码差距与准入

旧smoke是2会话/1+3/总4、固定发布归档、硬编码app/environment/version oracle；旧pilot A会将NEW触发句换成OLD，worker static import工作区当前extension。**不可直接复用live入口**，也不能改旧profile/flag/描述归一化/旧grant签名来放行。拟定新实验ID/C-G臂、4行配对、6/24账本与消息判定，在原私有工具上作最小已知policy适配；不是通用评测平台。

未来必须：从同臂包实际加载factory/skill/helper/compiler；先验证两包hash/76paths/恰好7差异；同case相同owned绝对路径与消息/工具/安全prompt；每行先synthetic实际SDK capture，明确初始差异仅该臂description及active shortSnippet形成的system字段，其它规范字段相等，读取后的skill/helper差异属于干预。原样canonical保留各臂capture/hash，禁止NEW→OLD或其它有意义字段归一化。日期/路径漂移先拒绝，不暗改body掩盖。准备capture不读真实配置/不发provider；已签live grant后的drift失败不换票。grant绑定四行contexts/captures、两个包、所有新旧运行输入、case/oracle/policy/Node/SDK/lock/source及额度/一次机会。

未来Gate2/TDD与独立代码审查重点：6/24/12贯穿所有guard/receipt/parent；单grant并发单赢家与会话不可重放；4种普通失败继续其它行、致命失败停批；实际包加载/相同path/context差异的反例；case-specific oracle及隐藏控件反例；firstcheck计数/source mismatch/LF/unknown分母；硬截止/清理和原始隐私。固定新源码完整本地Node/type/四组browser/strict union和新driver normal offline/capture/包身份通过并独立代码/隐私/成本GO，之后才可记录用户新调用授权于一次性grant。540/91旧证据仅证明Spec024候选包，不替代新驱动验收。

## 走查、风险与回退

[用户/AC](../walkthrough/authoring-paired-pilot/01-round1-user-stories.md)、[技术追踪](../walkthrough/authoring-paired-pilot/02-round2-technical-trace.md)、[集成错误](../walkthrough/authoring-paired-pilot/03-round3-integration-check.md)。本轮独立设计GO后仅申请明确范围：必要最小适配及零推理代码门槛后，一次≤24真实请求新批次；不是现在可执行、不是当即发grant。用户若不授权就停在设计，不暗用新flag执行。

小样本、远端不确定性、准备开销和语义oracle严格性均限制外推；只读DOM不能证明真实用户提交闭环。两包副本可随owned workspace清理，但原档/全部raw/失败/not_run/锁/用户安装与配置/冻结结果不改；回退新私有适配也不复活旧授权。不合并、发布、全局更新或关闭issue。仅公开汇总/身份/usage/受限诊断，原始assistant仅公开text/toolCall；不持久化native thinking/signature、headers/key/bootstrap URL，不修改SDK内存历史。

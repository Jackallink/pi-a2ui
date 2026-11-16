# Spec024：首次编写表单的模板与预检引导

状态：walkthrough-approved（独立Gate1设计GO，0项开放P0/P1/P2；不是实施或效果验收）。基点fc558daf252126ee91362f07bab7874d74684d69；受审设计稿af6d5593980a496140653c9e912d402b89e53228。用户同意继续聚焦skill模板和CLI预检，本轮完成设计与独立评审，见[Check120](../checks/120-authoring-first-use-design.md)。设计书面确认、Gate2/TDD准入后才改产品。真实模型预算0，不沿用Spec023未用的2请求。

## 问题与目标

[Check119](../checks/119-trigger-smoke-live-result.md)在0.1.10观察到：负例正确；正例直接调用a2ui_render，未read skill或helper check，生成FormValidation.buttons内嵌Button导致orphan编译错误。这里只能证明一次选择和一次首次生成失败，不能证明模型总不会读skill或插件编译器有缺陷。

当前skill已有example→adapt→check→render、初始化绑定、可达组件和正确validated-form；helper的component FormValidation已有稳定ID说明，却没有直接写明buttons是字符串ID列表、不是子组件槽。入口描述先给大段SDK契约，短promptSnippet笼统推荐读skill。可核实的缺口是信息位置及针对本次误用的清晰度，不是假设缺少CLI功能。

目标：选择需要画布的任务后，提供更直接的首次编写路径，并把FormValidation的ID、绑定路径、事件键讲清，所有新增正例可由现有helper编译。正确的文档/CLI引导可以确定性验收；模型是否遵从、首次成功率和成本变化仍未知。

## 决策与范围

推荐A：前置精简指引 + 补充现有CLI组件notes + 现有skill子文档的可执行三字段正反例。沿用现有19templates/8patterns/32types和CLI命令，无新模板文件/命令/组件/依赖。

备选B：强制预载整个skill。会改变全部上下文和成本，也不能证明遵从；不选。备选C：render校验CLI receipt/自动修复DSL或新增prepare工具。需要新公共契约和状态，超出当前缺口；不选。

IN（批准后）：extension.ts的description/promptSnippet文字；src/assistant-guidance.ts现有FormValidation notes；skills/pi-a2ui/SKILL.md及references/{summaries-and-feedback,syntax-and-errors,helper}.md；必要可执行文档/CLI/集成测试及由既有build产生的dist/assistant-cli.mjs。19个模板本身、manifest和CLI JSON形状保持。

OUT：修改render execute/schema、compiler/session/renderer/事件/认证/预算/浏览器打开策略；新增运行时预检票据或权限门禁；强载skill、自动修复/重试；新模型调用、冻结基线重跑/重算、复用已消费grant；版本号/发布/合并/推送/全局更新。此spec不分配发布版本。

## 产品引导契约

仅在已决定UI有价值后触发authoring指导。保留0.1.10的主动触发范围和“纯文字/简单确认跳过”条件，不让简单确认先跑CLI。

拟定新增description片段置于promptSnippet()生成的长catalog之前（最终英语仅可等义润色，新增块UTF8≤1200bytes）：

> AUTHORING: Before composing new Express, read the installed pi-a2ui SKILL.md unless its body is already in context. Start from a matching helper example, adapt it, run helper check on the final source, then pass its returned arguments unchanged. For FormValidation, buttons contains reachable Button ID strings, not Button(...); fieldId is an input component ID, not a binding path. If skill reading or helper execution is unavailable, explain the limitation in prose; do not claim a check ran.

短promptSnippet保留SearchablePicker/FormValidation现有能力信息，并前置example→adapt→check→render指路；不复制整份skill。source参数契约仍是原样完整Express，工具参数形状不加字段。

这是模型侧建议，**不构成技术强制**。已有合法直接API调用仍能render；没有check receipt也不新增拒绝条件。若skill正文已显式展开，免重复read；已读过且未变的参考不要求每次重复加载。新建/修改source后再做最终check，传其原样surfaceId/source；`check`只编译不发布，不证明业务语义、live预算/资源或用户已确认。

skill仍先选已知validated-form或user-form；不强制patterns/catalog巡游。新增子文档示例从validated-form的命名变量/ID规则推广三文本字段。字段label、组件ID、value路径、Event.context键分开说明，不再以Checkbox样例暗示任意收集任务必须有勾选框。需要必填守卫才用FormValidation。参数不确定时只查component NAME。

FormValidation新增notes明确：buttons=["submit"]引用可达Button ID字符串；rules.fieldId是可达input组件ID而非$/路径；所有组件包括validator、字段、按钮必须在root树里，每个guarded Event直接覆盖每条受约束value路径。保留现有required/minLength/maxLength和客户端/服务端语义，不改变校验器。

shell受限不能mktemp/重定向时，可用获准的write/edit在新owned文件写入source，再以现有helper check独立检查；不降沙箱权限、不覆盖既有文件、不声称受限环境执行过教程。

## 设计正例：只收集发布信息，不执行发布

下列为设计稿，未来同步进现有子文档；不是本轮产品实现。三个value初始空是合法业务草稿；提交入口收集数据，不授权部署。

```text
$/form/appName = ""
$/form/targetEnvironment = ""
$/form/version = ""
appInput = TextField(label="应用名",value=$/form/appName)
envInput = TextField(label="目标环境",value=$/form/targetEnvironment)
versionInput = TextField(label="版本号",value=$/form/version)
submit = Button(child=Text(text="提交信息，等待确认"),action=Event("collect_release_info",{appName:$/form/appName,targetEnvironment:$/form/targetEnvironment,version:$/form/version}))
validation = FormValidation(buttons=["submit"],rules=[{fieldId:"appInput",message:"请填写应用名",required:true},{fieldId:"envInput",message:"请填写目标环境",required:true},{fieldId:"versionInput",message:"请填写版本号",required:true}])
root = Column(children=[appInput,envInput,versionInput,validation,submit])
```

反例两类分开：buttons=[Button(...)]可能引入不在root结构边上的orphan；buttons=["submit"]但submit没在root.children也不可达。不是看到任意orphan就认定FormValidation导致。fieldId写成数据路径或Event漏路径由原compiler拒绝；只说明实际触达的第一条错误，不承诺修正一处后整份source合法。新文档明确标识负例，测试不能把负例当作应编译正例。

## 验收与测试映射

| AC / 优先级 | Given / When / Then | 检查意图 |
| --- | --- | --- |
| AC-001 / P1 | 已选择有价值的UI / 查看真实注册description及promptSnippet / 长catalog前有首次读取与最终check指引，保留原主动触发与简单确认skip；不宣称强制或效果提升 | AF01：独立语义审查真实descriptor；现有extension/合成SDK回归。无仅复述整段新字符串的测试 |
| AC-002 / P1 | component FormValidation / 现有CLI查询 / notes直接区分Button字符串ID、fieldId、绑定路径；旧JSON键/参数required flags、reference和examples保持 | AF02：实际prebuilt CLI shape/metadata回归+独立notes语义审查，非模型遵从测试 |
| AC-003 / P1 | 三字段正例及原validated-form / example→适配→最终check / 正例编译，三条初始化string绑定、三个字段ID、三rule、同一submit context覆盖且全树可达；check输出原字节工具参数 | AF03：执行子文档recipe/编译并断言上述不变式；不同cwd/空格路径/既有sentinel不变 |
| AC-004 / P1 | 内嵌Button、不可达引用、路径当fieldId、漏Event绑定 / check / 当前compiler拒绝、stderr COMPILE/no stdout，按实际诊断解释，不自动修复发布 | AF04：最小负例及现有CLI错误/UTF8/32KiB边界；原错误已能拒绝，不伪称编译器新RED |
| AC-005 / P0 | 合法旧API调用或预检 / unchanged execute及helper / 合法直接render兼容；helper无HTTP/发布/模型/业务动作，成功只{surfaceId,source}，失败不产工具参数 | AF05：已有extension/helper回归+真实helper→工具入参原样→owned DOM合成闭环；技能/CLI不可用退回文字属指引语义 |
| AC-006 / P0 | 新候选与所有旧回执 / 开发/检查 / Node24、本地CI、模型0；旧grant终止/锁和raw、冻结baseline保持，禁止靠翻flag/改签名恢复 | AF06：hash保全/配置网络见证器，冻结旧结果不重算 |
| AC-007 / P1 | 源码修改需dist交付 / build/包及完整检查 / helper包含同一notes，browser资产无无关改动，现有32types/19templates/8patterns、正常安装/skill发现与字节保持契约 | AF07：现有package/authoring/skill回归+本地全Node/type/四组browser/strict union、pack与owned startup零推理 |

## 技术影响与验证准入

调用链详见三轮走查：[用户与AC](../walkthrough/authoring-first-use/01-round1-user-stories.md)、[技术追踪](../walkthrough/authoring-first-use/02-round2-technical-trace.md)、[集成/错误](../walkthrough/authoring-first-use/03-round3-integration-check.md)。三轮检查通过与独立Gate1 GO只是设计准入，不能冒称Gate2或实现/模型验收。

必要测试维护：SMG07当前owned fixture复制候选payload，却拿固定0.1.10归档校验。未来extension/helper修改会使该fixture合法并发winner在archive层先失败，无法触达spawn witness。应仅在该owned fixture中从现有受检0.1.10归档提取76个payload，保留当前实际guard/entry代码，并按混合fixture的实际字节重新签synthetic identity；明确该测试只证明授权入口，不证明候选产品行为。不得改actual validateArchive、旧profiles/captures/真实grant来“修绿”；归档缺失仍是setup失败，禁止暗取网络。候选产品由独立AF03/05/07真实当前包测试。

批准后Gate2先确认测试意图：新增recipe/CLI引导的RED仅可称文档/元数据合同RED，设置/导入失败不算行为RED；当前编译器本来就拒绝orphan，不伪造修复RED。旧Check119是已封存模型首次生成失败，不能改写成新候选的改善证明。完成相关窄检查后，固定候选全Node/type/四组browser/strict union、必要build/pack和owned正常发现，独立代码/契约评审GO才收口实现。不要在docs-only设计阶段跑完整CI冒充未来实现验收。

## 风险、回退与漂移

模型可能继续跳过提示；读取skill/helper可能增加准备请求与输入tokens，额外description≤1200bytes不等于总token上限或成本节省。模型改善仍未知；若后续需要真实验证，先设计新的候选/场景/请求预算，再申请明确新授权，只用Node24/glm-5.3-flash，不使用旧余量或重跑冻结基线。

cli文字修改需由原build生成dist/assistant-cli.mjs，避免只改TS导致实际安装仍给旧notes。保留browser资产与其他功能；未知/通用编译错误不被归因为FormValidation。回退仅撤销本spec的引导/文档/notes及其生成资产，不变更用户配置、历史回执/锁，不恢复旧授权。当前无实现漂移，因为尚未实施；之后任何公共API/运行时行为扩张须先更新spec并重审。

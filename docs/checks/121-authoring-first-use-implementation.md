# Check121：首次表单编写引导的实施

状态：complete（有限实现/合同与本地验收），独立代码GO；未验证模型遵从/改善，未发布或全局更新。

用户已同意聚焦skill/CLI，在完整Spec024设计及独立Gate1 GO交付后以“然后呢”要求继续。本轮按继续推进已收敛的有限设计处理，明确继续Gate2/TDD后实施；不是扩大模型/权限/发布范围的授权。基点b569203acb84575fdfecd5fbf2a503f62b37a46d，既有隔离worktree/branch codex/authoring-first-use-design，初始clean。当时Gate2待准入；随后独立Gate2 GO后开始测试先行实施，真实模型预算仍0。

## Gate2：测试意图与RED口径

| AC | 准入的验证 | 有效失败 / 边界 |
| --- | --- | --- |
| AC-001 / AF01 | 独立检查真实注册descriptor，前置已审494byteauthoring块；保留NEW触发句/skip及异步发布原语义，≤1200byte。合成SDK/extension现有回归 | 不做新文案整段字符串镜像测试，不声称模型遵从或新增行为RED |
| AC-002 / AF02 | 既有authoring-cli32组件shape/required flags/reference/examples；实际prebuilt component FormValidation供独立语义审查IDstrings、fieldId/路径说明 | 不增JSON字段/命令或参数类型推断API；TS与dist必须一致 |
| AC-003 / AF03 | 新tests/authoring-first-use.test.ts执行子文档完整三字段recipe，从不同cwd/空格路径/已有sentinel运行；检查output原字节、三string路径、三rule与same reachable submit直接context覆盖；空草稿校验失败/真实字符串值通过现有validateSubmission | 文档recipe尚不存在时的断言是文档可执行合同RED，不是编译器或模型修复RED；imports/fixture错误不算 |
| AC-004 / AF04 | 同一测试执行明确标记invalid-express的内嵌Button负例，以及把正例的fieldId替换成路径、移除submit root、删除一个context绑定 | helper exit1/COMPILE/no stdout；原compiler本来拒绝，属于回归/负例，不编造新RED |
| AC-005 / AF05 | tests/browser.spec.ts新增真实helper→原样工具参数→实际extension.execute/controller/session/server→认证owned DOM闭环。按componentModel.id核查三个选定字段和绑定button可见/可用，user/action POST0；关page/shutdown | 确定性示例consumer，不声称模型主动生成；不点确认、不做业务发布。旧合法直接render仍由现有extension测试证明无需receipt |
| AC-006 / AF06 | 旧真实raw/锁/terminal、冻结文件hash保持，所有CLI/children Node24，测试只synthetic/owned；0真实配置/provider | 不改旧profile/捕获/已消费grant/真实archive guard；不借旧2次余量 |
| AC-007 / AF07 | 原build产生helper；相关测试后固定source全Node/type/四组browser/strict68union、pack和owned正常注册/skill discovery启动0inference | 不改版本/依赖、32types/19templates/8patterns；browser dist资产不可无关漂移；代码评审GO后才complete |

SMG07必要维护的先RED：仅在owned fixture复制出的extension.ts添加无行为comment，fake preflight用其实际hash签名，复现固定旧归档造成race winner在archive层停掉（worker spawn0，不是权限拒绝）。合法negative/positive workspace witness仍需先到达；修正仅将固定受检归档76payload写回owned fixture，保留当前guard/entry/profile代码，按实际fixture字节签synthetic identity。固定archive SHA+完整path列表必须先验证；不使用通用tar解包到任意路径，按allowlist逐文件读取写owned目的。原guard/validateArchive及真实旧状态均不改。修正后保留两个合法witness、全部拒绝计数、单racewinner和replay拒绝，配置/provider0。此fixture证明授权入口，不证明新candidate产品；后者由AF03/AF05/AF07负责。

## 顺序与证据边界

独立Gate2 GO→先记录文档合同/fixture RED→最小修改入口文字/现有notes/既有子文档→原build→对应GREEN→固定候选全本地验证/pack/startup与独立代码GO→本地checkpoint。root实施，reviewer只读。不将写skill的通用压力测试建议当成新模型预算，效果仍未知。没有合并/推送/发布/本机安装授权。

原始RED/错误/产物置于.local/authoring-first-use-implementation，原始模型收据和历史设计稿保持。本段是Gate2 kickoff时的测试意图，不冒称当时已有实际结果；后续执行结果及固定身份另节记录。


## Gate2 GO与首轮RED→GREEN

独立[Gate2/TDD kickoff GO](authoring-first-use-implementation/gate2-review.md)绑定aa0c2c2ef23f13a4a61fb5f678664b6c516187ba/treee865e64e549fb19ec8fe1c2b24b38ea9645ba4c0，报告SHA b0a0a6695b844268a2d48336b4b3a1d1284833dca8d432ffc5ea41525cc652a0，0项开放P0/P1/P2技术问题。保留既有方向续接的上下文说明，不将其写成模型/权限/发布的新授权；root实施、reviewer只读。

原始contract-and-fixture-red.log：两个用例因缺三字段可执行文档而断言失败；AF03为文档合同RED，AF04在缺文档处先失败、未触达其四个拒绝边界，不冒称这些边界已RED。SMG07先通过合法negative/positive工作区witness和拒绝矩阵，再因future-candidate comment造成archive mismatch，race实际worker-spawn0而非预期单赢家1。这是测试归档耦合RED，不是运行时授权bug或模型行为RED。

仅修改工具描述/promptSnippet、现有FormValidation notes、SKILL和三份子文档，原build生成dist/assistant-cli.mjs；没有新命令/模板/JSON字段或execute/schema/内核变化。旧授权owned fixture仅按固定受检归档hash+76路径逐文件恢复发布payload，保留当前guard并签实际fixture字节。contract-and-fixture-green.log三项通过，合法witness/单racewinner/重放拒绝仍在，配置/provider0；四个DSL负例实际均拒绝/no stdout。原失败fixture和日志保留。

新增AF05合成consumer通过：真实prebuilt helper输出原字节参数，实际extension.execute→controller/session/server→认证浏览器，按所选componentModel.id核查appInput/envInput/versionInput和submit，POST/forwarded消息均0，page/shutdown释放owned服务。不是模型遵从或主动生成证据。Node24类型检查通过。

此时仅相关GREEN；固定候选完整本地检查、pack/owned正常加载与独立代码门禁尚待完成。生产allowlist7文件按spec改变，另69payload/85受保护输入及22历史raw entries保持；不冒称全部旧92输入仍原SHA。完整计数和source-bound原始指纹后续补录。

相关authoring-cli/skill-docs/skill/skill-patterns/extension回归34/34通过；AF03/04+SMG07三项和AF05浏览器一项另有独立日志。浏览器warning仅为继承的NO_COLOR/FORCE_COLOR环境提示，不是页内错误。下一候选将以全量检查替代此窄范围结论。


## 固定候选完整验收

实际代码候选`095459084f0bf8ab26c803c4b7e2f2dbb6b004ba`，tree`21b59f8f369e592de073de74ade2c5899391ba34`，执行时clean；Node24.18.1/Pi1.5.0/Chromium158.0.8127.18 revision1254，lock hash与全部原始回执见[validation.json](authoring-first-use-implementation/validation.json)，该公开文件为私有原件逐字节副本，SHA256 `b51a48b849c27432783f19676e415f4704d5d3ebd163db7b99d73a9705ece319`。

| 必需检查 | 本候选实际结果 |
| --- | --- |
| 全Node（serial） | 540/540，0fail，exit0，297467ms |
| TypeScript | tsc --noEmit，exit0 |
| 完整四组browser（serial） | 91/91，exit0，含新增AF05真实helper→extension→owned DOM |
| strict golden union | 68=45positive+23negative；原始node/browser报告身份一致，当前source/lock/dataset/oracles/catalog/assets/浏览器均校验 |
| 原build与候选pack | exit0；76文件逐字节等于候选源码和独立解包consumer；仅helper生成资产按spec改变，browser JS/CSS/HTML/第三方许可原SHA |
| 正常包注册/skill发现启动 | startup exit0；1个skill、3个命令、hostPi1.5.0，5个Node24子进程均在owned cwd，agentRuns/modelRequests0、external fetch denied；registration已移除，package/operator files unchanged |
| AF01/AF02实际交付metadata | 实际registerTool的AUTHORING index602、长catalog index1097，参数schema未改，注册捕获fetch0；独立解包包的component FormValidation实际输出新notes，旧JSON shape/reference/examples保留 |
| SMG07完整来源 | authority-ZtJlHW owned结果：旧发布payload+当前guard，合法双witness、13拒绝/额外漂移、并发spawn单赢家、replay0，配置/provider0 |

本地浏览器套件中的BM4是synthetic控制，不是冻结真实基线重跑；BM3像素比较仍为平台advisory，不宣称像素发布门禁通过。最终golden原件逐字节保全在`.local/authoring-first-use-implementation/golden-{node,browser}.json`。上表没有借旧538/90结果为新候选验收。

候选归档SHA256 `c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8`，**未发布**；package version仍为0.1.10，仅是私有候选身份，不替换正式0.1.10归档/标签。既有正式归档SHA `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`保持。consumer解包后仅在owned包目录链接本工作区现有锁定node_modules以提供运行依赖，未另装依赖；76个payload保持原字节。未注册到用户全局安装，也不把-e/--skill强载当正常包发现。

## 独立代码GO、保全与范围

独立[最终代码/合同GO](authoring-first-use-implementation/code-review-r1.md) SHA256 `3c677e695a92080297b1fa83bdb196dfa148c872f09f4fa568bf7e32aafee26b`，绑定上述精确source/tree，0项开放P0/P1/P2；初审prefix保持，不以初审pending冒称最终GO。reviewer只读源码、元数据、图片及22份原始验收产物SHA，核对helper只有notes插入及各完整检查/包/consumer/保全，无JS/SDK/模型/配置/网络操作。

允许的7个生产路径改变：extension.ts、src/assistant-guidance.ts、SKILL.md、helper/summaries-and-feedback/syntax-and-errors三个既有reference及dist/assistant-cli.mjs。其他69个payload、85个运行输入和22份历史raw entries按原SHA保持；未改compiler/session/renderer/事件/权限/预算、tool参数schema、依赖/版本、manifest、32types/19templates/8patterns。不会把旧92项全部宣称未变。最新Spec023已消费grant/lock/terminal、旧停止批次和冻结profile/Check099/公开结果均保持，实际UI RED不改写。

状态依次为Gate1→Gate2/TDD→in-progress→固定候选review-ready→独立代码GO→当前complete。这里的complete只指有限代码/参考合同完成：没有新的真实模型请求，不能推断GLM首次生成成功率提高、会遵循工作流或成本减少。旧Spec023的剩余2次额度不恢复。本地后续docs checkpoint只保存收据/状态，不替换实际测试来源0954590，也不声称docs提交重新跑过全CI。

如后续要测效果，需另行收敛新的候选/场景/请求预算，获得明确新授权后只用Node24/glm-5.3-flash；本轮不做模型调用、PR合并/推送、发布、issue关闭或全局更新。回退可撤销本slice生产与必要测试修改并重建helper，保留全部原始失败和已消费锁，不恢复旧授权。

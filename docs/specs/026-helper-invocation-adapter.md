# Spec026：受限环境的只读 helper 调用适配

状态：in-progress（独立Gate1 GO、Gate2 GO后进入test-first有限实施，见Check125/Check126；所有真实请求仍0授权）。基点f9c1ac8；[Check124](../checks/124-authoring-paired-pilot-result.md)的STOP已封存。用户授权本设计/独立评审GO后的有限实施与零推理验证，再设计新场景/预算；**真实请求当前授权0**。全程Node24，未来模型仅Ark AgentPlan glm-5.3-flash；旧21余量不可复用、冻结真实模型基线不重跑。三轮：[R1](../walkthrough/helper-invocation-adapter/01-round1-user-stories.md)、[R2](../walkthrough/helper-invocation-adapter/02-round2-technical-trace.md)、[R3](../walkthrough/helper-invocation-adapter/03-round3-integration-check.md)。实施步骤见[Plan026](../plans/026-helper-invocation-adapter.md)，状态/结果归Check记录。

## 目标、方案与非目标

原G臂成功read SKILL后意图`cd <owned-project> && node "<packaged-helper>" example validated-form`，原白名单在任何`&`处拒绝；helper没有执行。这是已知的调用形状衔接问题，不能据此宣称skill改善/无效，也不回改原评分。

选择：仅在一个新、永久offline-only的已知policy中解析有限的冗余cwd前缀，并重建单一可信Node命令。备选A修改skill反复强调不写cd：不保证模型服从，且改变受试包，不能修复调用边界；备选B开放一般shell/cd/脚本：范围超出当前需要，拒绝。未来增加专用工具会改变模型工具面，本轮也不做。

IN：新的纯parser/plan、已知新policy/zero CLI、实际SDK synthetic两臂接入、命令准入/执行/回显错误的端到端验证。OUT：产品extension/compiler/catalog/renderer/skill/CLI包内容、依赖/版本、旧policy语义、旧真实case重评、任何新真实授权/grant/配置读取、发布/推送/合并/全局安装或issue关闭。原76产品文件、lock、两归档及全部历史raw/锁保持。仅必要共享private代码可改变，明确列在Check保全记录，不能称旧99运行输入全部不变。

## 受信上下文与语法

parser输入是原始bash.command和由owned worker提供的`{cwd,helper,draft}`；Node固定process.execPath且24.x。三个路径均为已验证owned workspace的绝对路径，helper来自实际C/G归档；parser不读文件、不启动进程、不求值shell。单command最多8192 UTF8 bytes。先解析全串、确认全部词法和参数，之后才准入执行，不能先做cd或部分查询。

只接受两种形式：

```text
NODE ABS_HELPER OP ARGS
cd ABS_OWNED_PROJECT && NODE ABS_HELPER OP ARGS
```

NODE只能字面`node`或当前process.execPath。ABS_HELPER须逐字等于该包helper；prefix目录逐字等于当前owned cwd，不做realpath/`..`别名猜测，不允许其它cwd、cd --、多次cd或后续组合。允许前后ASCII空格/tab、单/双引号包裹的字面词；引号不拼接，反斜线/美元符/反引号/换行/控制字节拒绝。`&&`只能是引号外、上述prefix的一处token；引号内的`&&`不是separator。`; | < > & ( )`等引号外运算符全拒绝；引号内仅可作为逐字匹配的固定路径字符，不能成为新命令。相邻运算符也须识别，不能靠空白split漏掉`a&&b`。`${...}`、`$(...)`、反引号、env赋值、env/npx/npm/其它解释器、Node flags、重定向、管道和命令后缀均拒绝。

| OP | 合法尾参数 | 输入边界 |
| --- | --- | --- |
| catalog / patterns / examples | 无 | 不增加未知op |
| component / pattern / example | 一个NAME | ASCII `[A-Za-z0-9_-]{1,64}` |
| check | `--surface-id ID FILE` | ID同上；FILE只能固定draft绝对路径、`draft.express`或`./draft.express`，执行时统一为固定绝对draft；不允许stdin或其它文件 |

安全结构确认后的已知只读op参数形状/NAME/ID错误为`usage`，普通关case；不同程序/helper/cwd、外部文件、未知op、运算符/扩展/词法不明或预算超限为`policy`，整批停止。缺draft/CLI INPUT继续按准备失败而非DSL编译失败处理，helper timeout/无正常退出结果仍fatal。不会将未知子进程结果伪装为可继续的参数错误。

成功plan含adapter版本、variant(direct/owned-cwd-prefix)、固定cwd、规范argv及check/surfaceId信息；不含原始可执行shell。沿用Pi现有bash工具：用每参数POSIX单引号安全转义生成唯一Node+helper+合法参数的命令，并保持工具cwd为owned project；**底层仍有bash，不能声称shell:false**。模型原串从不交给shell，`cd &&`不执行；不新增进程管理器/通用shell权限。包含空格、中文、单引号及引号内特殊字符的固定路径需实际进程边界测试，证明重建没有二次注入。

## 隔离与最小接入

新实验ID `helper-invocation-offline-1`、owned base `.local/helper-adapter/`、独立marker/日志；它永远不被现有pure live guards接受。CLI `scripts/helper-adapter.mjs`只有默认dry-run、--help、--offline和少量离线canary；--execute/--grant/导入式live API/直接worker live都须在Pi SDK/配置/workspace之前拒绝。不存在新真实grant格式或live开关。

新policy继承paired的同包动态factory/skill/helper/compiler/validator、native wire与工具/worker限额，仅在该policy选择parser并使用同一条C/G安全说明，承认上述冗余cwd前缀；老PAIR/SMOKE/OLD仍选择原helperCall/原说明。不改旧profile、预算、oracle/报告/CLI语义。必要变更：policy.ts注册新ID/运行输入，episode.ts按policy选择及离线fixture，authority.ts的四个归档/capture只读函数增加默认PAIR的experiment参数（只允许PAIR与新offline policy），授权函数不放宽。新增tests/helper-adapter/{profile,invocation,process-witness}.ts、profile/fixtures.json与独立CLI/测试；不扩为任意用户配置的实验平台。

独立synthetic fixture HX01（与实际新付费场景无关）：3空字符串必填text、精确keys offlineName/offlineZone/offlineTag、提交caption“提交信息”、FormValidation guarded IDs；C/G两个独立session，共用请求/路径/工具/安全说明，实际加载各自固定归档，metadata不强载SKILL。C/G归档沿用已固定c7d451.../c96125...与76path/7diff，初始context差异仍仅实际descriptor/snippet；原body不改写。

synthetic预算：两行各≤6、全≤12 transport回合（不是付费额度），tool≤12/check≤1/render≤1；request30s、active150s、worker总180s含清理/TERM/fallback、batch420s，下一行须留足180s。默认路径read skill→example→write→check→render为5 synthetic回合，example和check覆盖prefix。direct对照同样输出；本轮不输出“模型成功率”。provider POST=0、真实配置read=0，原有early guard/allowModelNetwork=false/synthetic fetch保留；真实DOM只读，不点击提交。

## 可观察结果与 AC → 测试

| AC | 优先级 | 必须证明 / 测试意图 |
| --- | --- | --- |
| AC-001 | P0 | HAG01全部live入口提前拒绝、正常默认/离线配置与provider0；永久offline policy不可用旧grant/剩余21翻开 |
| AC-002 | P0 | HAP01纯parser全串验证、quote-aware有限prefix；Node/helper/cwd固定、所有opcode参数；C/G同样准入 |
| AC-003 | P0 | HAX01正例执行到实际同臂helper/owned cwd/Node24，direct与prefix argv/结果等价；注入/外部/未知串无子进程/文件副作用；quoted固定路径真实执行边界 |
| AC-004 | P1 | HAE01 usage/INPUT普通、policy/unknown/timeout fatal；raw意图、accepted plan、实际tool result分层，未执行不能叫查询成功/DSL提交 |
| AC-005 | P1 | HAS01实际SDK synthetic读skill/示例/check/首source/真实DOM两臂闭合、prefix/direct；safe error后下一行继续，policy后not_run；source/variant记录不能改model正文 |
| AC-006 | P0 | HAI01新policy限额/预算/parser版本/源输入贯穿journal/parent；固定source完整本地Node/type/四组browser/strict union、正常zero CLI、独立代码/隐私/边界GO；76/lock/归档/历史hash保持 |

Gate2分阶段RED：先既有policy对合法新offline ID拒绝（只证明该准入缺口，不冒称后续断言已执行）；最小profile/接入打通但仍用原helperCall时，实际SDK prefix查询应失败而direct成功，这是parser功能的有效RED；缺模块/编译/fixture设置失败不算RED。随后纯parser与进程边界/SDK反例GREEN。避免复制被测实现生成期望；手写argv、病例、sentinel及独立实际helper结果。

## 门槛、风险、回退

严格draft→walkthrough-approved→tdd-approved→in-progress→review-ready→complete；用户已明确独立设计GO后继续本有限实现/零推理，不再申请相同范围确认。Gate1与Gate2必须分别给结论（可以同份独立报告）；代码/零推理另审，任一NO-GO纠正并重新绑定新source。下一轮场景和预算只在zero验收后设计；真实调用仍0，另行用户授权且另立源/模型/上下文绑定，不继承旧grant。

主要风险：quote语义错误导致注入或正常命令误拒；共享接入误改旧policy；synthetic被误当模型效果；重建argv与实际cwd不一致。分别用实际进程sentinel、旧policy回归/guard、分层报告和真实helper/cwd观测约束。回退只撤新policy/入口/parser及接入分支；保留所有失败raw和旧锁，不返额度、不回写旧grade。产品内核与两包无变更。

验证见证补充（AC-003）：只在新offline policy安装透明Node child_process.spawn观测，限定owned cwd，记录实际spawn尝试/返回PID及命令hash至run下持久0600文件，finally恢复；不改变参数或新增命令权限。合法direct/prefix命中同一见证，非法命令为0；受控child正例写run绝对sentinel且模拟workspace清理后仍存在。模型恶意替换/重定向canary也指向run绝对sentinel，避免被cleanup抹去。该审计文件是预期owned写入，不能当模型指令的副作用。

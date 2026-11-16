# Check118：双场景3+1实现与单次授权批次

用户在Check117设计GO后明确授权：先适配及零推理验收/独立代码GO，再执行一次新批次，SM02-B≤1且通过后SM01-B≤3、总≤4；全程Node24，仅Ark AgentPlan glm-5.3-flash。没有模型重试/续跑、冻结基线重跑/重算、合并/发布/全局更新授权。原设计稿/回执保持原字节，当前源码基点174d668。

## Gate2 / 测试意图

采用Plan023的小入口+两个已知policy适配，复用实际SDK/正式extension/diagnostics/清理。旧pilot live不开放；只在独立代码GO后，操作人依据本次用户授权写入固定source/profile/capture/归档/Node/SDK/guard的4请求票据。CLI本身不制造用户授权。新增prepare只做synthetic实际SDK捕获，不读真实配置。

必测：1/3/4同步用于journal准入/解析与parent receipt，未知/torn不返额度；B原样canonical、旧句不能被normalize放过；negative exact收到/无tool，任何tool先观察后禁止执行；positive准备到cap、首失败或render结果后无后续请求；两行而非旧paired报告。

P0控制还包括：同grant重复/并发执行只一赢家、lock后首POST前失败仍消耗一次执行机会；worker脚本/导入API缺/错parent票据及episode重放在配置/工作区前拒绝；positive缺/坏/非pass negative回执或cleanup错误不得开始；每次请求检查source/profile/capture/endpoint/native policy；42/102/180为包含TERM2与fallback清理的硬总量，不能实际执行成102+2。父进程在总量内预留TERM/KILL/ps/PID核验时间，剩余不足不启动case；offline较短deadline故障控制验证真实owned进程终止，不放宽live上限。

所有行为改动先保留RED，设置/导入失败不算行为RED。独立[Gate2 GO](trigger-smoke-implementation/gate2-review.md)绑定b80ba844，原始budget-red.log两条有效RED（合法SM02被旧guard拒绝、旧36账本被接受为新policy）；首个失败之后的限额断言不曾触达，后续GREEN另验证1/3/4/torn边界。旧句测试早期因未知ID已被拒而通过，不冒称该能力RED。

实现复用同一R2增量流观察器，不改产品。初轮actualSDK控制12pass/1fail：表单DOM有三标签，但getByLabel未匹配到三个输入，判定器误报；检查改为实际snapshot中3个唯一绑定输入与对应DOM文字/原生输入/提交按钮交叉核对，合法与缺字段两个控制随后通过。最初TypeScript的deadline可空报错属于类型设置问题，不算行为RED；修正后typecheck通过。原日志留`.local/trigger-smoke-implementation`。

59项窄范围控制通过，包含旧pilot回归。另一个429控制暴露过早abort只留下Request aborted：现在先停止所有后续发送，但允许当前SDK完成错误解析。错误JSON依既有隐私规则可能整段省略，测试要求SDK error/fingerprint而非原始供应商文本；原始失败、测试口径修正与GREEN均保留。没有放宽diagnostics脱敏规则或对真实故障根因作推断。

当前只做synthetic，尚未读取真实配置/发模型请求。固定源码完整检查、独立代码/隐私/成本评审、实际新批次及原始结局将在后续各自补录；历史505Node/90browser不替代新适配验收。一次性grant由操作人依据用户授权在代码GO后写入，CLI不会自动自批；旧pilot live仍禁用。

## 代码R1与纠正

第一固定候选2b76e516完整531Node和typecheck通过，但独立代码[R1 NO-GO](trigger-smoke-implementation/code-review-r1.md)指出3P1/1P2：原始SDK thinking被写入新回执；表单oracle只看任意按钮，取消或无context也会误判；P0真实入口拒绝证据不足；negative未知被聚合为普通fail。该通过记录不能豁免四项。

新增实际SDK反例先RED：thinking/signature回执泄漏、三字段取消-only/无绑定确认误判、unknown汇总。纠正为只投影assistant text/toolCall（不变更SDK内存历史）、独立三个field/path匹配与承载全部三path的非取消提交/确认按钮且真实DOM可见、未知/协议错误单列。旧原始回执保持原字节；不删除或“修复”旧思考内容。

P0采用完整owned git fixture/假授权/真实guard入口与fs/fetch/spawn见证器：合法negative/positive均先证明能到达工作区前见证点，之后缺/伪造ticket、源码/profile/capture漂移、错误negative及cleanup失败等逐项拒绝。最初fixture缺payload索引文件是设置失败，不算RED；将该实际被读取的索引加入受保护input集合后，closed-receipt重放真正触达workspace见证点并RED，补入口已关闭回执检查后GREEN。并发两个真实CLI只一方到达被拦截的worker spawn，重放不再到达；整个fixture配置/网络计数0，永不生成真实授权。

第二固定候选01fcd8a7完整536Node/typecheck通过，但独立[R2仍NO-GO](trigger-smoke-implementation/code-review-r2.md)：F-01隐私、F-03未知分类、F-04授权入口证据关闭；F-02还可能以无关可见输入和同caption按钮替代隐藏的目标字段/按钮。536通过不是执行豁免。R2原件SHA256为3053a65fecf434786a237d21227fe937d3f8951efe56bc33564bb4a22bb69f95。

## R2残余F-02 / 组件身份绑定

新增closed Details内正确三字段/绑定确认、外部static标签+三个无关输入+同caption取消按钮，以及三字段都使用共享歧义label的实际SDK/compiler/server/DOM控制。旧oracle均误报render_committed，两个断言RED保留于dom-binding-red.log；不是编译/设置故障。修正仅在private harness：候选保留各field及button组件ID；label须恰好命中应用/环境/版本其中一类，每个按钮context各类恰好一个唯一path字段；DOM按实际SDK host.context.componentModel.id跨shadowRoot定位，再分别核查所选host内的可见非禁用可填写控件及同一绑定按钮。隐藏/关闭Details、inert、disabled/readOnly、被活动modal排除的控件不通过；无关控件不参与计数，不点击、不POST。

首轮修正遇到tsx给嵌套函数插入__name导致browser_error，是序列化设置错误，不算新的行为RED。改为自包含DOM对象方法使浏览器序列化不依赖模块closure；原dom-binding-green.log失败原样保留，后续针对性GREEN另录。没有修改产品host/控件、文案、预算、模型、endpoint或SDK历史。

最终固定候选完整本地检查/新R3仍待完成，至本段尚无新付费请求。


## 固定候选收口与真实批次

固定候选05e1517fd266238d4f062aab5bb9cd152f6a50aa（tree51cc4016e09adf13ea8c3738161581a0b33c6205）在Node24.18.1/Pi1.5.0上完整538Node、typecheck、四组90browser、同身份strict golden68（45正/23负）、默认dry-run、正常公开offline和2capture prepare均通过。原始报告/日志SHA见[r3-offline-evidence.json](trigger-smoke-implementation/r3-offline-evidence.json)。Chromium158.0.8127.18/revision1254；BM3平台pixel仍为advisory，不宣称像素发布门禁通过。

独立[R3代码/隐私/成本GO](trigger-smoke-implementation/code-review-r3.md) SHA628ac61b73ef7b9358f96126a819a36711d852392b30e6fce16f9a12c1f8d634，开放P0/P1/P2为0；随后才记录既有用户授权，创建精确source/tree/profile/preflight/capture/归档绑定的一次性grant。独立[精确命令GO](trigger-smoke-implementation/live-command-binding-r1.md) SHA53b474650e4e31e8fdf3a63edcd381deeb50a502796329eed35423da6947b925后原命令只执行一次。既有0字节0600日志是私有权限占位，不是先前调用，未删票/换票/补额度。

真实结果：SM02-B 1请求pass；SM01-B 1请求主动选择并实际尝试render，但FormValidation内按钮为orphan、编译拒绝，未提交/未产生DOM。实际2/4请求、剩余2不再使用，无重试/续跑。完整结论、usage、保护/保全检查见[Check119](119-trigger-smoke-live-result.md)；协议验收与正例UI效果分开。这里的代码GO不替代效果成功；发布包/用户安装/旧失败与冻结基线不改。本段后的文档checkpoint不替换真实运行来源05e1517。


独立[post-run协议/预算/隐私/证据收口GO](trigger-smoke-implementation/post-run-review-r1.md) SHA b42110ba06950ad2ab4df12aafc116952502b4ef21cc50cb64c9acb3b8d4f012，确认实际2请求、负例pass/正例compile RED、用量known/货币费unknown、清理/保护/保全边界均成立。Spec023以该限定协议范围complete，正例UI效果仍未通过；没有新调用、修复实施、合并或发布授权。

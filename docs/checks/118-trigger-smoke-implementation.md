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

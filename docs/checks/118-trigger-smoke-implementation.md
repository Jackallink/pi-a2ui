# Check118：双场景3+1实现与单次授权批次

用户在Check117设计GO后明确授权：先适配及零推理验收/独立代码GO，再执行一次新批次，SM02-B≤1且通过后SM01-B≤3、总≤4；全程Node24，仅Ark AgentPlan glm-5.3-flash。没有模型重试/续跑、冻结基线重跑/重算、合并/发布/全局更新授权。原设计稿/回执保持原字节，当前源码基点174d668。

## Gate2 / 测试意图

采用Plan023的小入口+两个已知policy适配，复用实际SDK/正式extension/diagnostics/清理。旧pilot live不开放；只在独立代码GO后，操作人依据本次用户授权写入固定source/profile/capture/归档/Node/SDK/guard的4请求票据。CLI本身不制造用户授权。新增prepare只做synthetic实际SDK捕获，不读真实配置。

必测：1/3/4同步用于journal准入/解析与parent receipt，未知/torn不返额度；B原样canonical、旧句不能被normalize放过；negative exact收到/无tool，任何tool先观察后禁止执行；positive准备到cap、首失败或render结果后无后续请求；两行而非旧paired报告。

P0控制还包括：同grant重复/并发执行只一赢家、lock后首POST前失败仍消耗一次执行机会；worker脚本/导入API缺/错parent票据及episode重放在配置/工作区前拒绝；positive缺/坏/非pass negative回执或cleanup错误不得开始；每次请求检查source/profile/capture/endpoint/native policy；42/102/180为包含TERM2与fallback清理的硬总量，不能实际执行成102+2。父进程在总量内预留TERM/KILL/ps/PID核验时间，剩余不足不启动case；offline较短deadline故障控制验证真实owned进程终止，不放宽live上限。

所有行为改动先保留RED，设置/导入失败不算行为RED。当前待独立Gate2 kickoff；未写运行实现、未读取真实配置、未发模型请求。后续固定源码验证、评审、实际批次与结果各以自己的回执补录，不能把历史505Node/90browser当成当前验收。

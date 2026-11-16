# Check117：双场景3+1冒烟设计准入

用户2026-11-16授权先完成两个场景/最多4请求的设计与独立评审，GO后再申请真实调用授权。当前真实预算0；没有读取真实配置、运行模型或实施适配。原Spec022停止结果/冻结BM4不变。

## 设计与静态检查

[Spec023](../specs/023-v0110-trigger-smoke.md)、[Plan023](../plans/023-v0110-trigger-smoke.md)、三轮walkthrough和文档profile为本轮设计交付。先SM02-B确认≤1，通过后SM01-B表单≤3，合计≤4，均用0.1.10新文案，无A/B改善比较。任何额外provider请求（warming、摘要、probe、retry、judge）均不得绕过上限或另行发生。

沿用既有隔离worktree，开始时源码c8224a3干净；运行实现仍为已验收的1984c328及文档收口。检查了当前入口/预算/worker/capture/汇总：它们固定12会话/3/36并禁用live，未实现本设计。单独翻转旧flag或截断旧报告都不合规。后续1/3/4政策、B原样签名、两行汇总、负例tool前停止、授权guard及deadline适配是实际执行的前置门槛。

本轮Node24.18.1只做JSON预算/消息/参数与文件哈希静态断言，未加载SDK、无真实配置读取/HTTP。[静态回执](trigger-smoke-design/static-preflight.json)核对两例自然消息与原T01/N02一致、拟定4上限/6144配置输出上限、现有live=false；87个既有guarded输入（含76产品文件）、旧五份live回执/公开结果/冻结profile及Check099、正式归档均匹配原指纹。三轮walkthrough结构检查通过；git diff whitespace检查通过。

这些不是新适配的行为测试，也不是本批次live结果；Check116的505Node/90browser/68union只能作为历史基点，不能替代未来适配完整验收。本轮是纯新增设计文档，不重复运行该完整CI或冻结入口。

## 独立审查

设计稿待独立Gate1评审。必须检查3+1/总4不可互借、先负后正/失败停止、完整意图先计数、usage与结果未知分开、3请求准备瓶颈、旧normalizedBody不能签B、新执行所需适配和授权边界。设计GO后仅申请预算，不能宣称当前代码live-ready或直接执行。

本记录将在独立结论后补齐精确设计commit/hash及问题闭合；不因状态元数据变更改写原始评审稿。未授权的后续实现/真实调用/合并/发布/全局安装不包含在本轮。

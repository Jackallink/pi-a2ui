# Helper调用适配 · Round2

Canonical：Spec026。以下为拟实施边界，未声称测试完成。

## P-001：解析与执行

| 用户/模型操作 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应 / UI |
| --- | --- | --- | --- | --- |
| 传direct或prefix命令 | 新invocation.ts纯parser | 全串字节/词法→可信Node/helper/cwd/op/args→plan | 不执行shell/不读文件；错误带usage/policy安全code | 尚无查询或UI |
| 已知新policy选择plan | episode.ts tool_call | 记录raw hash、variant、规范argv；old模式仍原helperCall | owned路径/文件校验，安全单参数引用重建单Node命令，Pi bash cwd=project | 不把accept当执行成功 |
| 实际readonly helper退出 | 既有tool_result/diagnostic | 正常stdout/exit记录或INPUT/timeout分流 | 原helper/同臂Node24；不执行原cd&&串 | helper不发布UI |

## P-002：zero准备/提交/报告

| 用户操作 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应 / UI |
| --- | --- | --- | --- | --- |
| CLI --offline | 新known policy/owned run | 两归档76path/7diff→两个SDK capture→fixed2行 | synthetic transport、字面fakecredential、模型网络关闭、真实配置FS guard | 仍无UI |
| 固定fixture适配/首check/render | 同臂factory/compiler/helper，复用case oracle | read→example→write→check→render；6/12 transport与12tool限额 | exact checked source、真实DOM目标绑定；无业务POST | 实际可见/可用才标UI成功 |
| usage或policy/unknown | worker/parent | 普通继续下一行；fatal停后续not_run | 180/420含cleanup，账本/诊断不反写 | 只报告synthetic流程，不报模型效果 |

## P-003：准入与保全

| 操作 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应 / UI |
| --- | --- | --- | --- | --- |
| 新policy请求live | pure CLI/worker/API guards | 在SDK与owned setup前拒绝 | 无grant格式、无provider/config入口 | 明确未授权，不能翻flag |
| 固定source完整检查 | local CI/Check记录 | TDD→独立code GO→zero完成 | Node24全部本地、四组browser/strictunion、历史hash | 设计后续模型题/预算，真实仍另授权 |

归档函数只增加默认PAIR的已知experiment参数；readPairGrant等付费authority不放宽。prefix允许说明只在新模式且C/G一致；旧body/规则/结果不改。不存在本轮悬空的付费API。

# 首次表单编写 · Round3 · 2026-11-16

Canonical：Spec024。以下表格保留设计时的测试意图；实际实施与完整验收见Check121（受测source0954590），不代表模型改善证据。

## E2E / AC映射

| ID | 路径 / AC | 期望 |
| --- | --- | --- |
| IT-001 / AF01 | P-001 / AC-001 | 独立检查实际descriptor前置步骤与原skip/异步语义，无强载skill/动态shell；不以字符串镜像单测冒充模型遵从 |
| IT-002 / AF02 | P-001 / AC-002 | 实际prebuilt component查询保持JSON/参数required/reference/examples，并审查Button ID字符串及fieldId说明 |
| IT-003 / AF03 | P-002 / AC-003 | 执行新增子文档三字段正例；结构绑定/guard/Event/key类型按独立AC断言；不同cwd/空格路径/文件sentinel/源字节不变 |
| IT-004 / AF04 | P-003 / AC-004 | 内嵌Button、未入root、fieldId路径、漏Event路径等负例失败；负例有标识；通用orphan不能被都解释为FormValidation |
| IT-005 / AF05 | P-002 / AC-005 | helper输出原样→真实候选extension/compiler/session/owned DOM合成闭环；直接合法API仍兼容，无provider/真实部署 |
| IT-006 / AF06 | P-003 / AC-006 | 历史raw/锁/冻结SHA保全，旧grant不变；受限环境无伪预检/权限扩大/自动续跑 |
| IT-007 / AF07 | 全部 / AC-007 | build后真实helper/notes对齐、32/19/8不变；全Node/type/四组browser/strict union和pack/owned正常发现，只有synthetic provider |

## 错误矩阵

| 条件 | 用户可见结果 | 系统/模型指引边界 |
| --- | --- | --- |
| skill已展开 | 免重复read | 不是系统自动强载 |
| CLI/read/bash不可用 | 说明限制、文字替代 | 不虚构成功，不放宽沙箱；指引不等于强制 |
| check失败/输入UTF8/超32KiB/未知组件 | 原错误code/hint/reference | 不混淆输入/编译，不重写source/发布 |
| FormValidation引用错或orphan | 实际first error | named IDs+root树+直绑路径；不保证修一处即整体合法 |
| 初始空必填值 | 允许渲染草稿；非法提交现有阻止 | 不误把业务校验当编译器失败，不执行发布 |
| preflight成功但live预算/资源失效 | 现有render错误 | CLI不证明live条件；不改execute或重试 |
| SMG07 fixture候选与旧归档不同 | 测试fixture需隔离发布payload | 不改真实archive validator/冻结profile，缺归档是setup失败 |
| 本轮无新模型授权 | 设计/合成检查model0 | 不复用旧剩余额度，旧基线不重跑 |

## 准入与开放项

技术设计无需要新公共API的未决项；模型遵从率/成本是明确非承诺，归档fixture修复方案已定义。Gate1设计GO来源af6d559/Check120；续接与Gate2/TDD、固定候选完整验收和独立代码GO均已按Check121记录完成。相关检查与同候选完整本地门槛已完成，来源Check121；无hosted CI/发布/安装授权。未来若想测模型，应单独设计新预算，当前为0。

漂移：实现保持既定范围，证据见Check121；设计阶段仅helper正例能编译的观察不替代后续完整验收。风险：额外提示/准备可能增加tokens/请求；回退只撤销当前slice，保留旧证据/锁。

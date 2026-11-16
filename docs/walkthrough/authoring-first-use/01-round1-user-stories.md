# 首次表单编写 · Round1 · 2026-11-16

Canonical：[Spec024](../../specs/024-authoring-first-use.md)。当前仅设计，真实预算0。

## 范围与用户故事

| ID | 故事 | 优先级 |
| --- | --- | --- |
| US-001 | Pi模型在决定画布有帮助后知道先从工作模板适配和预检，用户少遇到首轮编译失败 | P1 |
| US-002 | 用户能区分字段ID、value路径和提交键，收集三个必填值而不执行发布 | P1 |
| US-003 | 老API、helper只读性、预算/权限与历史失败不因引导改进被放宽 | P0 |

IN：既有工具/skill/CLI notes的有限引导与可执行正反例。OUT：新命令/模板文件/运行时门禁/自动修复、模型调用/版本发布/全局更新。

路径：P-001 首次选择画布后的读取/模板路径；P-002 三字段适配、check并原样render；P-003 错误/不可用/取消与旧契约保全。

## AC（Given / When / Then）

| ID | Given | When | Then | 优先级 |
| --- | --- | --- | --- | --- |
| AC-001 | UI已确定有价值 | 读工具入口 | catalog前能看到skill→模板→预检路径；简单确认仍skip，无强制预载 | P1 |
| AC-002 | FormValidation参数不明确 | component NAME | ID字符串/fieldId/value路径分清；JSON接口不变 | P1 |
| AC-003 | 原validated-form与三文本字段需求 | 适配及check | 三字段/三绑定/三rule/同一可达submit覆盖；stdout原样参数 | P1 |
| AC-004 | 内嵌Button/不可达/fieldId误用 | check | 当前编译器拒绝，保留第一错误，无stdout、无自动发布 | P1 |
| AC-005 | 合法直接API或helper运行 | 执行 | runtime兼容、helper只读；缺skill/CLI不伪称预检成功 | P0 |
| AC-006 | 旧结果/授权与新设计 | 所有步骤 | Node24/真实预算0，旧raw/锁/冻结结果不改、不续跑 | P0 |
| AC-007 | 未来实现与生成资产 | 包/CI/consumer检查 | 同候选helper/notes、32types/19templates/8patterns和现有契约一致 | P1 |

边界：初始空值是可渲染的业务草稿；不要求另添Checkbox。取消不提交/不部署。CLI/skill不可用时指引说明限制退回文字；这是模型侧建议，不声称运行时技术强制。模型遵从率与成本变化未知。

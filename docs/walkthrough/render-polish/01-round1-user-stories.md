# Render polish · Round1

Canonical：Spec028；issue67。IN：token/局部视觉、现有line/bar/table/form与组合skill、固定真实renderer样张；OUT：内核/协议/预算/新组件/真实模型/发布。当前仅设计和preview，实施交接用户自行触发Pi。

| ID | 用户故事 | 优先级 |
| --- | --- | --- |
| US-001 | 用户同一合法Express得到一致视觉，不反复补美化prompt | P1 |
| US-002 | 用户在窄屏和键盘下能看清内容、正确输入且不丢草稿 | P0 |
| US-003 | 用户看到的图表/表格可核对原始值与来源，样张不冒充实测 | P0 |
| US-004 | 作者使用已支持组件和按需skill例子，维护者不改内核 | P0 |

路径P-001主题呈现，P-002表格/图表与动态展示，P-003表单/本地交互/状态，P-004作者指引与交接。

| AC | Given | When | Then | 优先级 |
| --- | --- | --- | --- | --- |
| AC-001,002 | 相同source/固定6场景 | 真实renderer前后 | 同数据、可定位computed style与截图，不误称product | P1 |
| AC-003,004 | 3宽度/实际zoom/键盘 | 重排/聚焦 | 无遮挡、原草稿、对比/非颜色状态，不能借等效reflow冒充zoom | P0 |
| AC-005,006 | 原始表值/Chart corpus | 格式/排序/patch | 类型/数值/table/legend/ticks一致，revision/epoch不变 | P0 |
| AC-007 | 空或valid表单、本地控件 | 点击/暂停 | invalid0/valid1动作，本地控件0、焦点原合同 | P0 |
| AC-008,009,010 | 真实现有组件/固定候选 | helper与本地CI/交接 | 可执行例、Node24、独立GO、0模型/无内核与发布越界 | P0 |

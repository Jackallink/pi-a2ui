# 首次表单编写 · Round2 · 2026-11-16

Canonical：Spec024。状态为设计，所有Handler/API以现有源码为准。

## 路径 P-001：选择与读取

| 步骤 | 用户操作/模型决策 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应后UI |
| --- | --- | --- | --- | --- | --- |
| 1 | 多字段收集有交互价值；简单确认skip | extension.ts registerTool description/promptSnippet | 仅指引，无服务端authoring状态 | Pi发给模型的tool metadata；后端无新增请求/skill自动注入 | 尚无canvas |
| 2 | skill正文未在context则按Pi supplied path读；已加载跳过 | 既有read/skill展开、SKILL.md | 模型获得已有模板路径 | 既有read API，无新endpoint/权限 | 尚无canvas |
| 3 | 已知模板直接example；参数不明才component | skills scripts/a2ui.mjs→dist assistant-cli→src/assistant-guidance.ts | raw模板或notes只读返回 | CLI example validated-form / component FormValidation；后端compile/probe现有catalog | 不启动浏览器 |

## 路径 P-002：适配、预检、提交

| 步骤 | 用户操作/模型决策 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应后UI |
| --- | --- | --- | --- | --- | --- |
| 1 | 适配三字段/ID/路径/Event键 | 既有write/edit或获准shell的新owned文件 | 只修改新source，不覆盖旧文件 | 既有file工具，helper不写文件 | 无canvas |
| 2 | 最终source检查 | a2ui.mjs check→src/assistant-cli.ts→compiler.ts | 无UiSession变化 | check --surface-id ID FILE或stdin；compile同一catalog | stdout仅{surfaceId,source}；不发布 |
| 3 | 原样传check结果 | unchanged a2ui_render execute→controller/session | 校验成功后提交surface/revision | 既有compiler、预算和正式渲染API，未读check receipt | 现有owned server/browser显示三个字段与确认入口 |
| 4 | 之后真实用户填写/确认 | 既有FormValidation/事件链 | 空草稿submit本地阻止；合法数据按原事件接收 | 现有/api/actions与Pi user data，不执行发布，不在本轮发模型请求 | 原生错误反馈/后续消息保留原语义 |

图结构：root Column→三个TextField、FormValidation、submit Button→Text。FormValidation.buttons=["submit"]不是children；rules.fieldId使用三个TextField变量ID；每个rule路径在submit Event.context直接绑定。

## 路径 P-003：错误、缺能力与保全

| 步骤 | 用户操作/模型决策 | Handler / 位置 | 状态变化 | API / 后端处理 | 响应后UI |
| --- | --- | --- | --- | --- | --- |
| 1 | orphan/错误fieldId/漏绑定 | compiler与CLI现有错误 | 当前UI不变 | stderr code=COMPILE / stdout空；后端不自动修复或render | 模型解释实际首错，不能称UI成功 |
| 2 | read/bash/helper不可用或取消 | authoring指引及已有Pi权限 | 不生成预检成功事实 | 无新API，无权限降级或工具替代执行 | 文字说明/现有canvas不变；模型遵从不作零推理保证 |
| 3 | 历史固定发布payload与新candidate不相同 | 私有SMG07 owned fixture维护，actual archive validator不动 | fake fixture身份按实际字节重签 | 从已有受检0.1.10归档提取76payload+当前guard；后端由witness在配置/HTTP前拒绝 | 无浏览器/模型；不冒称候选产品通过 |

闭环说明：本spec只改指导层/CLI notes和文档；所有会话状态、网络/事件后端、UI组件及其错误路径仍由已有实现负责。未新增CLI/API shape或授权状态。缺失归档是setup失败，禁止外部下载与放宽校验。

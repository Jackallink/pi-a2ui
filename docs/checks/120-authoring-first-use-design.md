# Check120：首次表单编写引导的设计审计

本轮依据用户“同意”继续聚焦skill模板/CLI预检，先设计与独立评审。基点fc558daf252126ee91362f07bab7874d74684d69，隔离branch codex/authoring-first-use-design；未改生产代码、skill、dist、模型配置或已完成Spec023。当前真实模型预算0。

来源：Check119的真实第一次生成失败；extension.ts工具description/promptSnippet；src/assistant-guidance.ts/FormValidation、src/assistant-cli.ts、skills/pi-a2ui/SKILL.md和validated-form/相关references；tests/authoring-cli/skill-docs/trigger-smoke-authority及原Spec011/021。

发现：现有skill已有完整路径/正确ID/预检，helper功能可用；入口和component notes仍可更明确。不能把旧失败归为缺CLI功能或缺校验器。本轮选前置指引+现有notes+子文档正反例，不做新CLI或runtime receipt。

当前Node24.18.1零推理只读观察：实际helper component FormValidation成功返回原JSON/参数required/reference/validated-form，notes未直接写明buttons字符串列表；实际example validated-form管入check --surface-id design-probe -，exit0，输出只有surfaceId/source。上述依据本轮工具命令返回记录，无另造raw执行日志；这是现有helper能用，不是新引导实施或模型遵从证明。

交付：[Spec024](../specs/024-authoring-first-use.md)、[Plan024](../plans/024-authoring-first-use.md)及三轮walkthrough。设计正例/引用/结构检查和独立评审将分别记录，当前未借旧538Node/90browser作为新实现验收。代码/consumer/模型改善仍未验证。

已识别必要后续测试维护：SMG07目前把候选生产字节与固定0.1.10归档对比；新helper/extension修改会使合法fixture停在archive层。只在owned fixture提取固定发布payload并保留当前guard，按实际fixture重签synthetic identity；不放宽真实校验/重签旧真实grant/修改冻结profile。该边界必须在实施Gate2审查，缺归档不能冒称GREEN。

独立设计评审待完成。当前只有设计文件；没有新模型请求、实现、合并/推送/发布/全局更新。

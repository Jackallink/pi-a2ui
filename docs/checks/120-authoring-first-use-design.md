# Check120：首次表单编写引导的设计审计

本轮依据用户“同意”继续聚焦skill模板/CLI预检，先设计与独立评审。基点fc558daf252126ee91362f07bab7874d74684d69，隔离branch codex/authoring-first-use-design；未改生产代码、skill、dist、模型配置或已完成Spec023。当前真实模型预算0。

来源：Check119的真实第一次生成失败；extension.ts工具description/promptSnippet；src/assistant-guidance.ts/FormValidation、src/assistant-cli.ts、skills/pi-a2ui/SKILL.md和validated-form/相关references；tests/authoring-cli/skill-docs/trigger-smoke-authority及原Spec011/021。

发现：现有skill已有完整路径/正确ID/预检，helper功能可用；入口和component notes仍可更明确。不能把旧失败归为缺CLI功能或缺校验器。本轮选前置指引+现有notes+子文档正反例，不做新CLI或runtime receipt。

当前Node24.18.1零推理只读观察：实际helper component FormValidation成功返回原JSON/参数required/reference/validated-form，notes未直接写明buttons字符串列表；实际example validated-form管入check --surface-id design-probe -，exit0，输出只有surfaceId/source。上述依据本轮工具命令返回记录，无另造raw执行日志；这是现有helper能用，不是新引导实施或模型遵从证明。

交付：[Spec024](../specs/024-authoring-first-use.md)、[Plan024](../plans/024-authoring-first-use.md)及三轮walkthrough。设计正例/引用/结构检查和独立评审见下文，当前未借旧538Node/90browser作为新实现验收。代码/consumer/模型改善仍未验证。

已识别必要后续测试维护：SMG07目前把候选生产字节与固定0.1.10归档对比；新helper/extension修改会使合法fixture停在archive层。只在owned fixture提取固定发布payload并保留当前guard，按实际fixture重签synthetic identity；不放宽真实校验/重签旧真实grant/修改冻结profile。该边界必须在实施Gate2审查，缺归档不能冒称GREEN。

## 本轮检查与独立Gate1

Node24.18.1实际helper对Spec024三字段设计正例check成功，stdout与原source逐字节一致；单独的最小synthetic内嵌Button反例exit1/no stdout/orphan错误，证明原compiler已有拒绝能力，不冒称新增校验或模型改善。结果见[design-probes.json](authoring-first-use-design/design-probes.json)，SHA256 `6c5c9d4a11fabf57ffe1ece571795327b4fcb0f6dabdf601b0bd08c6017f8bd6`。其六份文档输入hash绑定初稿，完整初稿由af6d559提交保留；当前新增状态和此检查文字不回写初始回执。helper只读入口不含模型或Pi配置操作；realModelRequests/realConfigReads=0来自所执行入口与源码审计，不冒称另装了系统级fs/网络计数器。

skill自带三轮结构validator通过，所有本地文档链接可解析、diff whitespace通过。92运行输入/76产品文件、14新批次raw、旧8份raw/冻结/导出按既有指纹保持，独立审查也作了核对。没有为docs-only设计重跑完整Node/browser或冻结真实模型。

独立[Gate1 DESIGN GO](authoring-first-use-design/design-review-r1.md)，报告SHA256 `8e72f375a1485ff00fdd4f7fe5d2c39b0ea386782ddd833b82f7dea4e41aaa44`，绑定受审设计source `af6d5593980a496140653c9e912d402b89e53228`、tree `2d9be40d834a96d0b8cfa37ca4c602afe0989784`，0项开放P0/P1/P2。正例source/输出/CLI现有可用性、494byte新增引导块、32types/19templates/8patterns不变、soft-guidance与runtime区别和SMG07 fixture边界成立。reviewer只读源码/文档/回执及hash，未执行JS/SDK/helper/配置/网络。不是未来候选完整CI、模型遵从或可用UI效果GO。

## 收口与下一道门

设计交付完成，Spec024为walkthrough-approved。还需用户确认这份具体书面设计及Gate2/TDD准入才实施，后续固定代码候选完整本地检查、包/owned consumer与独立代码门禁不能省略。模型预算仍0，旧Spec023未用2次不可续用；任何真实验证要新的预算设计和明确授权。

当前只有设计文件；没有新模型请求、实现、合并/推送/发布/全局更新。

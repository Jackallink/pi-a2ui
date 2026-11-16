# 双场景3+1冒烟实施准入计划

**Goal:** 在一条简单确认和一条发布信息收集任务上，以一次新批次≤4请求观察正式0.1.10新文案的有限行为。
**Spec:** docs/specs/023-v0110-trigger-smoke.md；精确消息/1与3上限/失败口径只以spec和其文档profile为准。
**Architecture:** 新受限入口/profile，复用既有私有SDK worker、发送前durable预算、诊断/renderer/清理。所有边界按同一个已校验policy工作；旧pilot live仍禁用。
**Tech:** Node24、Pi1.5.0、锁定Chromium；仅拟用Ark AgentPlan glm-5.3-flash。无新依赖或产品文件。

本计划定义后续工作，不是执行授权。当前只有设计/独立评审获授权，预算0；用户授权新批次后仍需适配与离线代码门禁，不执行当前旧12会话CLI。

## 1. 设计关口（本轮）

- Spec023/三轮走查/文档profile：两例同新文案，SM02-B→SM01-B，1+3≤4，消息原样，SM02失败即停。
- 检查当前脚本与拟议行为差异、AC→测试意图；Node24仅静态检查JSON/身份，不加载SDK或凭据、不运行冻结入口。
- 独立Gate1设计评审；若NO-GO，修文档并重审、保留原记录。GO后只向用户申请新预算，不将GO当成live-ready。

## 2. 授权后最小适配（本轮不实施）

预计新入口 `scripts/trigger-smoke.mjs`、政策/用例 `tests/trigger-smoke/`，必要私有适配位于 `tests/trigger-pilot/{contracts,control,worker,offline-read-guard}.ts`。R2 `diagnostics.ts`行为保持，除非必需缺陷修正；产品extension/src/skills/dist/package、tests/benchmark-model及其冻结证据不改。不引入通用实验平台或复制新的renderer内核。

1. Gate2：按AC001–007落实测试，先记录有意义的行为RED；import/fixture/compiler设置错误不算RED。重点是旧36/每例3会放过新负例第2/正例第4及全批第5、B被旧normalize误签、2行report/负例停在tool前。
2. 受限policy显式区分旧offline与新smoke；从CLI到预算/journal/parser/worker/receipt/summary使用同一身份/限额。旧模式默认/live guard不放宽；新模式LIVE三入口均验证明确授权票据后才可读真实配置/创建工作区。适配实施获准后，dry-run/synthetic offline不需要付费grant，可用owned测试资源，但只用synthetic凭据且不读真实配置/不调外部provider。
3. 复用actualSDK自然skill发现；新B首context原样canonical，禁止旧新句互换归一化；wrong model/old clause/context/source/hash漂移在发送前拒绝。
4. 新父驱动固定两个独立session、1/3额度与180s全批；SM02在任何tool前判断，失败后第二行not_run。SM01保持首次失败/结果即停，末次tool结束后不再请求。完整两行/unknown与脱敏诊断报告，独立新run/journal/一次性锁。
5. 最小GREEN覆盖合法表单、准备耗尽、正常收到及负例工具选择、错误文本/usage缺失、预算/超时/清理故障；不补提示或改写模型source。

## 3. 真实执行前的固定源码门槛

- 窄范围→完整Node/type/全部四组browser/strict golden union，均在Node24同一固定候选本地串行，禁止hosted Actions；正常公开smoke --offline及默认dry-run无付费grant可用，未授权LIVE三个入口拒绝；两类均0真实配置/0外部provider计数。
- 非配对两例capture/body、1/3/4 durable边界、未知不退款、42/102/180硬截止与cleanup canary、所有真实SDK事件顺序需要实际合成控制；原Check116通过不能替代新适配验收。
- 独立代码/隐私/成本评审GO，产品76文件/旧五份live回执/公开结果/冻结profile与Check099不变；记录新source/tree/lock/SDK/browser/profile/case/context/guard/归档哈希。
- 记录用户授予的≤4预算与一次性新grant，精确命令由新实现产生并审核后固定；本计划不虚构一条当前可执行命令。新grant不继承旧Spec022剩余额度。

## 4. 一次新批次与报告（只有另行授权且所有门槛通过后）

唯一glm-5.3-flash，SM02≤1且通过后SM01≤3，任何异常按spec停批；无重试/回退/health probe/付费judge。原始回执/失败/not_run、准入/usage/unknown、预备/选择/提交/内容分开；无A/B改善率。保持用户安装/config/进程与原锁，清理只限新owned资源。回退不复活旧授权。无需发布新插件版本才能完成该评测。

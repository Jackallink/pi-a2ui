# Pi Agent 实施交接提示词（#67）

当前独立设计评审尚待GO；若Check130没有明确GO/source/报告指纹，**不要开始产品实现**。本文件仅交接文本，Codex不触发Pi。

复制下段给用户自己启动的Pi会话；具体设计commit/最终GO以Check130及Codex交付的固定指纹为准，不使用更早草案：

```text
你负责实施 Jackallink/pi-a2ui issue #67：统一渲染视觉、现有组件可读性与按需skill指引。

先读取仓库AGENTS.md、docs/specs/028-render-polish.md、docs/plans/028-render-polish.md、docs/checks/130-render-polish-design.md、docs/walkthrough/render-polish三轮与docs/designs/028-render-polish/README.md、gallery.html、component-coverage.json。工作基于用户给出的独立设计GO固定commit；原main基线为0c1fe67649b3f61d520ca0318f7dd977a208b3b5（0.1.11），设计分支codex/67-render-polish-design。若代码或基线前进，先列差异，不覆盖用户dirty工作或当作同一已审源。

只在独立实施分支/owned worktree工作。先source ~/.nvm/nvm.sh，再nvm use24，确认node主版本24；所有npm/Pi及子进程全程Node24。不切Node22、不改用户模型/全局配置。使用既有lock，依赖缺失时只在隔离目录npm ci；不升级依赖。

独立设计GO不是产品已经完成。先按Plan028把P0/P1测试意图写成真实可执行RED并留Gate2记录，再依次T1主题与局部组件、T2表格/Chart展示、T3 skill与可执行例子、T4集成/包验收。每步改源后build、窄GREEN，再提交源和生成资产。信息是同一组真实fixture，不用假截图替代实际DOM/交互。当前48张只是设计参照，不充当产品行为/性能/全部无障碍证明。

允许client.css的语义token、现有组件局部static styles和纯展示DOM。SDK0.15.0已有adoptLightDomStyles，不改createRenderRoot或注入机制；不重构compiler/session/protocol/server/认证/事件/预算/资源/SDK版本。不得新增Catalog组件、样式props、主题切换器、React/CopilotKit/Tailwind依赖或远程字体。不手改dist，不借美化清理无关代码。

表格原始number/boolean/null/string与stable sort/filter保持，数字右对齐只派生内部视觉标记；Chart继续只有line/bar，legend/ticks用原series与同一数值域，空/zero去重/负值/4series/长标签需真实测试，保留原表与原始值。不得自动缩写源值、聚合others、平滑、虚构目标/进度/实测结果。FormValidation原草稿/aria/本地invalid0POST、valid原事件路径、Modal/复制/筛选/pause/inert合同不变。

skill只加按需子文档/索引和可执行组合，现有helper example/check，不增CLI命令。Text只允许caption/body；标题用现有受限MarkdownView，不写h2 variant、任意HTML/CSS或虚构MetricCard/Donut/formatter API。

本地CI：先相关窄检查，再固定source跑完整Node/type/四组browser+新测试/strict golden union，build资产一致性、pack与owned正常skill/tool discovery零推理验收。保存source/tree/Node/browser/lock、原始日志与hash。实际desktop200%缩放独立验证；640×450截图不是actual zoom。像素保持平台边界，不能直接覆盖旧BM3或冻结基线修绿。

禁止真实模型评测/任何provider健康探针/读取或打印凭据、复用旧grant与剩余21、重跑冻结真实baseline。Pi工作会话只允许用户已有的Ark AgentPlan路由与glm-5.3-flash，不切CodePlan、其它endpoint或其它付费模型；若当前会话不能确认该route/model则停并报告，不自行改配置或发provider探针，不读取/打印凭据。Pi工作会话由用户自行启动授权，本交接不允许另开真实模型评测调用。保留所有历史raw、失败、STOP、锁、个人文件和全局安装。

每个T任务单独可回退提交并记录Check。遇到确需内核变化/真实调用/设计外API，停该扩张并报告具体缺口，不自行修宽权限。不把setup/编译环境错误说成行为RED。

实施完成停在review-ready，给用户差异、AC→测试、固定source验证、风险/回退和待独立代码审查项；没有独立评审能力就请求用户送审，不能自写GO。未另获用户明确授权，不push/merge/tag/release/npm publish、全局更新或关闭issue。此提示词不授权发布。
```

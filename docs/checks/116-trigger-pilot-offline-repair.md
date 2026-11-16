# Check116：trigger pilot 离线诊断修复

用户同意在 Check115 后修正脚本。范围为 Spec022 当前 repair/AC007–010；真实模型预算0，不发起新批次、不恢复原批次，也不修改产品/依赖/安装或发布。全程Node24，本地CI。旧效果结论仍为不足。

## 设计与TDD准入

[设计/增量走查](../specs/022-v0110-trigger-pilot.md)、[计划](../plans/022-v0110-trigger-pilot.md)固定稿提交a27fb6b；[独立Gate1/Gate2 GO](trigger-pilot-repair/design-review.md)只准入离线修复。走查结构校验先报告P004缺追踪字段，补齐表格后通过；该结构错误不是行为RED。

- contracts-red.log：针对原代码，TPD02严格思考参数guard、TPD07实际SDK请求参数两条行为RED成立。TPD01最初只在泛化CLI报错文字上失败，不算配置/网络隔离RED；其最终控制增加持久访问计数和工作区目录前后断言。
- stream-red.log：新observer安全passthrough基线的5个行为RED，展示缺少usage/终止/错误记录，不冒称是原live流的重放。随后同一合成ReadableStream控制通过。
- diagnostic-edge-red.log：发现JSON token错误文本未充分遮盖，以及第4个请求被拒时SDK aborted覆写了第3条成功read诊断；两条RED后修正。SDK每次调用开始清空当前诊断，只有成功journal准入才绑定新条目；嵌入credential/payload标记整段省略，仅留安全占位和指纹。两条针对性控制GREEN。

原始日志存ignored `.local/trigger-pilot-repair`。历史中间检查包括窄范围33项及typecheck、后续边界修正的2个针对控制；它们不替代下方最终固定源码回归或独立代码评审。

## 变化与边界

新增private diagnostics helper；synthetic/live Response均走同一reader，usage在转发chunk前更新，取消不排空；逐请求记录journal/body指纹、status、finish/DONE、usage、SDK结果和有界脱敏错误。usage缺失/部分不记零；硬杀前尚未写回执的诊断仍可能丢失，journal保守unknown路径不变。

SDK reasoning=true/low，受保护body明确enabled/low/max_completion_tokens1536；guard禁止max_tokens混用及缺少usage请求。新profile为offline id、liveEnabled=false；CLI和直接worker在真实配置/工作区创建前拒绝。这里验证的是线级契约，不是AgentPlan alias映射、服务端实际策略或触发效果。原预算/超时不增大。

回退只涉及新脚本/测试/设计切片，不改正式0.1.10包；即使回退也不能重新使用旧授权。原run-LUrFUb五份live回执、公开脱敏结果、冻结profile/Check099和76生产文件已在实施阶段重算匹配；完整结束时再次校验并记录清单。

## 独立代码审查纠正

第一候选74948d5完整505项Node测试通过，但独立审查发现两个未覆盖缺口：exported episode API可绕过argv层的live禁用，在配置读取前仍会创建工作区；错误脱敏只覆盖HTTP(S)，不满足所有URL的约定。新增动态导入调用控制先出现status0而非拒绝的行为RED；ws/wss/file/ftp/mailto/data/custom URI控制同样先RED。函数最前端补同一liveEnabled guard，错误文本按URI scheme遮盖；这些修正仍是原AC007/009，不扩大预算/产品范围。74948d5的通过记录保留为中间证据；最终检查须绑定修正后的source。

## 最终固定源码验收

运行源码 `1984c3287774965cc4d7d9ebdb5bf55048740c19`，tree `d7456458272f0cf641d698bf9a60a1b8039c163a`，Node `24.18.1`、Pi `1.5.0`；完整浏览器为 Chromium `158.0.8127.18`。本文件后续完成记录属于文档提交，不冒称为当时执行源码。详见[完整证据及指纹](trigger-pilot-repair/offline-evidence.json)。

| AC | 证据 | 结果 |
| --- | --- | --- |
| AC-007 | TPD01 CLI / worker script / imported episode 三入口，sync/async fs与fetch持久计数；TPD02严格body；TPS01六对实际SDK首请求 | 三入口拒绝、config/network计数0、无新工作区/journal/live回执；enabled/low/总输出1536，A/B只差文案 |
| AC-008 | TPD03–06实际ReadableStream取消/UTF8/CRLF/EOF/错误、timeout形状错误、1MiB；missing/partial/invalid/repeated usage | 取消不排空、先保存metadata、缺失不补0；12个正常offline SDK会话usage均保留 |
| AC-009 | TPD08实际SDK read→第二请求流错误；TPD09错误隐私/UTF8字节；TPS02 budget的未准入第四次请求 | 两次诊断分别归属、没有第三次请求/渲染；嵌入payload及URI遮盖，拒绝的新请求不覆写旧条目 |
| AC-010 | 全套Node/type/browser/golden/publicCLI、87个输入哈希、原始证据/产品与冻结指纹、独立复审 | 通过，真实模型请求0，最终无开放审查问题 |

- Node：505/505，fail/cancel/skip均0，文件并行度1；TypeScript：通过。先窄后全，不增加任何时间上限。
- 完整浏览器runner：90/90；strict golden union：68（45正/23负），同一1984c328身份。包内`npm run test:browser`的46项先通过但覆盖不足，因此另跑全部四组runner；两份记录独立保存，完整验收只采用90项结果。
- 正常公开CLI `--offline`：owned `run-TqnIaC`，12/12 synthetic实际SDK会话、harnessAccepted/batchCompleted均true、actualModelRequests=0。每例1条diagnostic/status200/SDK toolUse、usageKnown=true、实际owned DOM、actionPosts=0、server关闭、cleanupErrors空、operator read guard active/denied0。其模拟render不代表自然任务主动选择，不计算模型效果或真实费用。
- 默认CLI：固定源码clean、providerRequests=0、credentialReads=0、liveEnabled=false。最终TPD01访问计数回执时间落在完整Node运行窗口，三入口由同一测试逐个断言；所有check原始日志/回执有SHA256。
- root与独立评审均核对21份原始日志/设计审查、87个受保护输入、原5份live回执、冻结profile/Check099及旧公开结果。76个生产payload不变，正式归档仍为 `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`；无产品/BM4/依赖/安装变更。原run-LUrFUb仍为2准入、0配对，未重试或重算；既有完整回归中的BM4控制仅synthetic transport。

## 完成状态与剩余边界

[R1 NO-GO](trigger-pilot-repair/code-review-r1.md)及原失败字节保留；[R2 GO](trigger-pilot-repair/code-review-r2.md)只接受最终1984c328的AC007–010离线修复。修复切片按draft→walkthrough-approved→tdd-approved→in-progress→review-ready→complete收口；旧主动触发效果仍未验收，原pilot的效果Gate4没有改为通过。

诊断先在内存更新，正常/可清理的错误路径写私有回执；硬杀前未落盘的内容不能恢复。timeout形状合成错误证明观察器处理，不能说明旧服务端中断的根因。`providerStatus`兼容单值仍指最后收到的HTTP响应，逐请求归属只能使用requestDiagnostics；没有把后续未知请求假定为HTTP200。新GLM线级策略仅做离线验证，未证明AgentPlan alias映射/服务端支持、1536窗口足够完成authoring或0.1.10触发效果。

真实调用预算保持0、profile/三个入口继续禁用live；本地checkpoint保留，不merge/push/release或升级全局安装。下一次真实评测须另行明确授权并重新准入，不恢复旧批次、不复用剩余额度。

# DX34/35/38 最终独立源码评审 R1

日期：2026-11-14。**GO：限固定候选的 DX34→35→38 源码交付。** P0 = 0，P1/Major = 0，P2 = 0。D1/D2独立GO在本最终候选保持有效，D3和集成未发现阻断缺陷。

本GO不是合并、issue closure、0.1.6发布、tag/npm publication、真实用户安装升级或public production readiness许可；没有证明模型可靠性/成本改善。已知上游依赖风险仍在，不是audit-clean或风险豁免。

## 固定身份与层次

- 仓库：`/Users/jakeliu/.codex/worktrees/pi-a2ui-dx/pi-a2ui`，branch `codex/dx-34-35-38`。
- 唯一最终候选：`64b95b30938c8a86e251c79a18bfb27675fe7889`。
- 本轮D3比较：`3955dad8ff2ccb4a91b566dfaceb14c6ab5cd49d`→候选；整条DX分支比较：PR44固定`570b67afe7cec90e37177ac656abef78374ea75f`→候选。
- D1固定`6355ffaade452ead777edba77aa313d11346ce64`、D2固定`3955dad8ff2ccb4a91b566dfaceb14c6ab5cd49d`已由本reviewer分别审查，报告见Check063/064关联的不可变历史报告。本轮未把旧测试数称为当前重新执行。
- 写报告前，将相对PR44变化的全部33文件与最终提交Git blob比较，全部一致。D3对src/extension/dist/scripts/package.json/package-lock.json的diff为空，运行时/构建输入不再漂移。只写本报告，未修改source/tests/docs输入、dist、index或HEAD。

## 本轮独立执行的证据

环境通过 `bash /Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-evidence/node24.sh`，Node **v24.18.1**。

1. `node --import tsx --test tests/dx-skill.test.ts tests/skill.test.ts tests/skill-patterns.test.ts tests/package.test.ts tests/authoring-cli.test.ts tests/dx-budget.test.ts tests/dx-diagnostics.test.ts`：**44/44 passed，0failed/cancelled/skipped，exit0**。包含D3四例、D1/D2跨片回归、实际helper输出/bytes/exits、19示例和8routes以及实际SDK skill发现测试。
2. `npm run check`：tsc exit0。
3. D3改变的skill文件相对Markdown链接静态解析均存在。
4. 外部production artifact独立复核：读取tar而不解包写入，比较archive entries、外部consumer、当前固定source与原consumer receipt。**74/74文件逐字节及SHA256一致**，tar entry集合与pack manifest一致。
5. 在repo外consumer cwd，通过生产包自带helper再次运行两份新增doc修复源，验证精确`{surfaceId,source}`输出；reserved path变体以typed forbiddenKey和file修复提示拒绝，无泛化FormValidation误导。consumer无法resolve typescript/tsx/esbuild/可选Pi host，以上运行后74payload hashes仍全部不变。未重新安装依赖、未依赖dev loader运行该helper。

没有重跑已收敛的全套221或Chromium45，也没有重新跑完整production32queries/19examples/8patterns；它们是Check065与原日志/receipt提供的主任务证据。独立源码检查确认Chromium45所用D2 runtime/client与最终候选相同，D3仅文档/测试变化。

没有调用模型或真实Pi会话、读写真实用户全局配置/凭据、访问远端网络或更换真实安装。必要extension测试为本地loopback和host doubles。

## Artifact和receipt身份

外部consumer根由`.local/dx-evidence/consumer-root.txt`指出；production package位于其`package/`，tar位于其`pi-a2ui-0.1.6.tgz`。实际evidence文件是同audit目录的`production-pack.json`、`production-consumer.json`、`production-discovery.json`、`verify-production.mjs`和`verify-discovery.mjs`。

| Artifact | 独立重新计算的SHA256 |
|---|---|
| pi-a2ui-0.1.6.tgz | 69e84f185c82c5655884ed7138cf6f7c00f94723c079dd6f27d786832792eada |
| production-consumer.json | 0c8833eec5094513652e29e63adc88498d64754cffbaf783fe3cf8a899a32925 |
| production-discovery.json | 36a824c9f4f37dad0ed231973d1ba35fe23bbeddc9904ddc5d76b76bc2a7e9d0 |
| production-pack.json | 15abe995ccc9b65d4b29f2f923c1dd6fc3b7ec83be1c21110a9b253e3009e8e0 |
| dist/client.js | 78922a871bf029c0c69362243596784149a04aa9888648f930a36197895de1c2 |
| dist/assistant-cli.mjs | e89e6603600fa78d65796e50fdf1398ae2a1a9f0a113fda7c6c8c31aebce0533 |

两个dist hashes与本reviewer D2时按原esbuild参数`write:false`独立内存重建一致；最终D3没有改这些bundle或任何runtime/build输入，因此没有为了重复同一证明再覆盖构建产物。

production discovery receipt及脚本明确调用开发checkout的Pi1.5.0 SDK `loadSkills`，defaults disabled、private agentDir、指向production pi.skills，结果一项pi-a2ui/零diagnostics。这仅证明packaged skill发现；不能升级为production Pi启动或模型执行证明。当前44例中还独立运行了repo内实际SDK发现测试，二者范围不混淆。

## D3与整条分支的核对结果

- `skills/pi-a2ui/examples/review.express:1–2`只新增真实全surface约束comment；原illustrative skipped记录与源语义保持。`references/coding-and-live.md:8,12`和`syntax-and-errors.md:22,46–57`明确所有声明Button（包括无关/隐藏）须带当前已有record类型的literal IDs；native copy/sort/close不是声明Button。没有改成“只要邻近按钮”，也没有发明缺席record ID。
- `syntax-and-errors.md:21,37–44`同时保留legacy错误和current forbidden-key引导，将Event literal filename的path→file修复与artifact tool的path参数分开，不把普通字面值改成input binding或表单校验。`tests/dx-skill.test.ts:18–49`实际编译完整来源并断言固定ID/file语义和未执行provenance。
- `syntax-and-errors.md:23`、`coding-and-live.md:8`准确保持最多128visible cases且summary逐项等于可见行计数；`tests/dx-skill.test.ts:52–58`实际验证128接受、隐藏总数/166/129拒绝。没有暗改#36，也没有把改一个max说成全套结果语义已支持。
- `syntax-and-errors.md:26–27,59–65`与D1/D2实现一致：64flat components/4surfaces、隐含Text计数、committed/attempted/current分别有据；同名替换释放组件但不释放slot；字节/native/identity配额仍独立；artifact root使用活动cwd。明确不存在public per-surface archive/delete，reload不是归档承诺，full replacement会清掉未提交draft。
- `syntax-and-errors.md:35`和helper参考保留unknown/global/SDK定位的诚实限制。主skill只增进渐进式参考链接，没有新template/type/route、CLI command、权限或SDK依赖。
- D1/D2行为代码和dist未在D3改变；整条分支仅实现批准的诊断、预算反馈与相关guidance。#36/#37、BM1及BM2–BM4、benchmark CI与模型评测没有实现混入。package version仍是PR44继承身份0.1.6；这不是将后续DX加入0.1.6 release的许可。

## RED与风险证据的准确边界

D3原2/4失败是缺少reference可执行样例，Check065明确归reference-gap，未冒充runtime behavioral RED；原有coding/summary边界在文档前已经成立。D1/D2各自的真实行为反馈RED保留在独立Check/历史报告中，不被D3文档测试重新命名。

`package.json`和`package-lock.json`已独立比对PR44，字节未变。`README.md:116`已有pinned Zod/A2UI GHSA-mrhx-c7xc-m3w5风险披露；production-install.log仍记录4 high，Check065记录baseline同样4 high。这里没有独立在线刷新advisory，也没有改依赖或消除风险的证据。额外lockfile-free consumer的npm audit返回ENOLOCK是setup失败，不能当成audit-clean、行为RED或发布豁免。

## 交付边界

本固定源码切片没有未决阻断项，可记录DX34/35/38的scoped源码交付GO。后续仅补评审报告/交付Check而不改变74项pack payload时，可核对payload身份，无需重复全套测试；若生产源码/包内容变更，则重新固定相关artifact并针对变化验证/复审。

整合PR、merge、issue closure、tag/npm发布、真实用户升级与public production readiness均仍是独立范围和门禁；本报告没有执行或授予这些动作。模型效果改善需要后续明确设计的独立评测，不能由当前确定性tests/packaged helper/skill发现推断。

# D2 / #35 独立代码评审 R1

日期：2026-11-14。**GO（仅 D2 固定源码切片）**。P0 = 0，P1/Major = 0，P2 = 0。可按既有授权进入 D3 测试/文档实施流程；不代表 D3、BM1、整版验收、merge、issue closure、发布或安装升级 GO。

## 固定身份和范围

仓库 `/Users/jakeliu/.codex/worktrees/pi-a2ui-dx/pi-a2ui`，branch `codex/dx-34-35-38`。候选 `3955dad8ff2ccb4a91b566dfaceb14c6ab5cd49d`，比较基线 D1 `6355ffaade452ead777edba77aa313d11346ce64`。合同为 Spec013 D2与AC-005/006/008。审查全部十文件差异及实际 session/compiler/extension/helper调用链；写报告前再次将十文件与候选Git blob比较，全部一致。未改被评审source/tests/docs/dist、index或HEAD。

## 独立检查

使用 `bash /Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-evidence/node24.sh`，实际 Node `v24.18.1`。

- `node --import tsx --test tests/dx-budget.test.ts tests/session.test.ts tests/extension.test.ts tests/authoring-cli.test.ts`：**60/60 passed，0failed/cancelled/skipped，exit0**。覆盖六个预算用例、结构/恢复/取消/原子性、真实注册工具executor/auto-open/分支恢复及真实helper字节/exit/SDK过滤兼容。
- `npm run check`：tsc exit0。
- 使用 scripts/build.mjs 中两组原始esbuild参数和原entry/outfile、加`write:false`内存重建；client.js和assistant-cli.mjs均与候选逐字节一致，未写回dist：
  - `dist/client.js` SHA256 `78922a871bf029c0c69362243596784149a04aa9888648f930a36197895de1c2`。
  - `dist/assistant-cli.mjs` SHA256 `e89e6603600fa78d65796e50fdf1398ae2a1a9f0a113fda7c6c8c31aebce0533`。

未独立重跑全套217条、Chromium、pack/真实安装消费者；Check064的217/217与build是主任务证据，不是本reviewer重跑。仅执行离线本地测试（必要服务为loopback），未运行模型/Pi、访问远端网络或读写真实用户全局配置/凭据。本报告是唯一写入产物。

## 关键审查结果

### 实际snapshot计数与固定限制

`src/protocol.ts:38–47` 的纯 snapshotUsage 从实际flat components长度相加，surface数取数组长度；结果只含新数字对象，没有cached counter或source对象别名。limits来自同一LIMITS，仍为64/4。`src/session.ts:49–55`和`extension.ts:57–60`共用该函数，不各写不同口径。

`src/compiler.ts:81`只为既有单surface413补充已知local count/64，无假称current/global usage。`tests/dx-budget.test.ts:46–54`验证64可编译、65拒绝且不虚构session数量。

### 替换、attempted/current 与原子性

`src/session.ts:84–99`没有改变原顺序：创建同名replacement并替换旧项→checkCapacity(next)→admitIdentities→availability复核→identity赋值/移除pending→publish。当前错误计数取this.state，attempted取next，因而同名更新不会双算。

`src/session.ts:49–72`只替换原component/surface数量判断和错误文案；413、64/4、后续boundedJson、native/log/headroom配额和先后关系保持。reset、setEnabled、commitData依然走同一guard，没有新delete/archive/reset能力或权限变化。

`tests/dx-budget.test.ts:15–43,56–66`使用独立字面数字预期：37+30→attempt67/current37且snapshot完全不变；37→30后加34→64；更新至65保持revision/payload；缩小同名surface仍占slot，第5个拒绝。隐藏identity不是只靠snapshot推断：aggregate拒绝的proposal ID后续以不同内容成功admit，验证失败没有预留ledger。

### 成功工具结果与helper兼容

`extension.ts:57–75`从本次render返回的snapshot计数，保留a2uiSnapshot并添加合同精确形状 `{components:{used,limit},surfaces:{used,limit},surface:{surfaceId,components}}`，text包含global与selected count。没有拿offline compiler结果冒充在线usage。`tests/dx-budget.test.ts:69–92`经实际工具注册executor，固定Button+SDK生成Text=2、增surface与替换后的字面total/shape；snapshot revision和首次auto-open/后续不重复open一起通过。

原helper source/arguments/exit路径未改；独立authoring-cli回归验证成功source bytes与旧错误分类。D1诊断、SDKcause过滤、forbidden predicates、typed inputs/coding/media策略没有被本slice改动。附加usage不被宣称覆盖byte/native/identity等其他配额。

## 历史RED证据的边界

已读取 `.local/dx-evidence/d2-red.log`，SHA256 `3c88bcd30873333115f3f137ff858d2115a34a97abe8d29a6dccb703025b29e4`。六个case都到达已有UiSession/compiler/registered executor后因缺attempted/current、local65/64或a2uiUsage断言失败，非缺fixture/module/环境失败。

该日志是主任务保存的历史receipt，reviewer未独立在D1重新执行或证明其checkout来源。六RED证明观测反馈缺失；它们不能被解读为旧实现原子性或ledger已经有六个缺陷。当前独立运行验证了新反馈及原子性保护均通过。

## 下一阶段

固定D2无未决Major。记录本报告后，按计划进入D3的可执行修复例/真实参考文档测试，取得对应行为或文档契约RED，再更新文档；保留19examples/8routes/32components与示例未执行provenance，运行时规则不改。完成相关consumer/Chromium/pack等最终必需检查后固定最终候选另行独立评审。#36/#37、BM1及BM2–BM4、模型、merge/发布均不由本GO授予。

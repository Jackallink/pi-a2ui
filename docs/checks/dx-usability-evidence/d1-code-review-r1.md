# D1 / #34 独立代码评审 R1

日期：2026-11-14。**GO（仅 D1 固定源码切片）**。P0 = 0，P1/Major = 0，P2 = 0。未发现阻断缺陷；可以进入已授权的 D2 测试/实施流程。本结论不代表 D2/D3、BM1、整版生产验收、merge、issue closure、安装升级或发布 GO。

## 固定源码与审查范围

- 位置：`/Users/jakeliu/.codex/worktrees/pi-a2ui-dx/pi-a2ui`，branch `codex/dx-34-35-38`。
- 候选：`6355ffaade452ead777edba77aa313d11346ce64`。
- 比较基线：设计提交 `e43da13db1422c39bae7c7166170c15d4ec2d758`；生产基线是其父 PR44 `570b67afe7cec90e37177ac656abef78374ea75f`。
- 审查该范围全部源码/测试/spec/Check差异，阅读必要原始调用链；报告写入前再次将范围内17个文件与候选 Git blob 比较，全部字节一致。本 reviewer 未修改被评审 source、tests、docs、dist、index 或 HEAD。

## 独立执行证据

环境：通过 `bash /Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-evidence/node24.sh`，实际 Node `v24.18.1`。最初直接执行同 wrapper 因文件无执行位返回126，属于调用方式/setup问题；改为 bash 后通过，未 chmod 或改配置。这不是行为 RED。

1. 相关离线 node:test：**115/115 passed，0failed/cancelled/skipped**，exit0。命令为 wrapper 后 `node --import tsx --test tests/dx-diagnostics.test.ts tests/authoring-cli.test.ts tests/session.test.ts tests/forms.test.ts tests/coding.test.ts tests/artifacts.test.ts tests/live.test.ts tests/workbench.test.ts tests/interactions-validation.test.ts`。包含新 D1 的12例、真实 helper subprocess/SDK cause过滤，以及资源/typed input/coding/media/权限/原子性相关旧回归。测试服务仅 loopback，没有模型调用。
2. wrapper 后 `npm run check`：tsc exit0。
3. 使用 scripts/build.mjs 的同一两组 esbuild 参数、原 entry/outfile 路径，加 `write:false` 内存重建。两个改动 bundle 均与候选逐字节一致，未覆盖 dist：
   - `dist/client.js` SHA256 `78922a871bf029c0c69362243596784149a04aa9888648f930a36197895de1c2`。
   - `dist/assistant-cli.mjs` SHA256 `2371cd5049ee067614ccb0e1056477cb83907db757e2880ccaf4a6d87baa0510`。
4. 独立内存诊断探针 **7/7 passed**，exit0：dataModel内fake id不产生组件归属；malformed @path拒绝且有真实root/property；JSON-pointer键的 `/`/`~` 正确转义；shared-input冲突报后一个输入；重复LogView报超额的后一个；普通Error转400且保留cause；unknown SDK组件保留原name/cause而无伪造componentId。这些是审查时补充探针，没有写入生产或测试文件，不计入115条仓库测试。

未独立重复全套211条、Chromium、pack/安装消费者或旧基线执行；主任务 Check063 的全套211/211与build记录是主任务证据，不能归为本 reviewer 重跑。未调用模型/Pi、访问网络或读取/修改真实用户全局配置/凭据。

## 关键核对结论

### status / reason / cause 与合并

`src/protocol.ts:47–73` 将 presentation suffix 与不带 suffix 的 reason 分开；旧构造器无 diagnostic 时 message不变。locateUiError优先保留已有诊断、沿用UiError.status/reason，并通过cause保存原错误；上下文无新增值时返回同实例，避免多层归属导致重复后缀。`tests/dx-diagnostics.test.ts:56–59` 验证413/cause/更具体owner/幂等；补充探针验证非UiError的400/cause。

没有为了统一格式把已有UiError413/409/503降为400。新project-schema Error会在真实组件边界转400并保留cause，与原拒绝status一致；上游SDK parse/schema在compiler原catch/authoring-policy过滤链中保持证据。

### forbidden predicate、真实 owner/property 与未知 scope

`src/compiler.ts:41–53` 保留原 banned key谓词及每键检查/递归顺序。owner只在路径恰为`components/<entry>`时建立，嵌套Event用户数据不能改变它；property路径按真实遍历路径生成，仅发生拒绝时拼接/转义，未把任意context值打印出来。正常`file`及合法`@path`仍通过，非法`@path`继续拒绝。

`src/compiler.ts:69–161,203–235` 保留校验先后与compilation路径，额外catch只加已知surface/owner。global/parse/unknown SDK错误不从名字猜ID。project loops在inputs/coding/live/workbench/interactions的原边界内增加catch，原cross-component计数、遍历、schema和Object.assign顺序保留；inputs实际后冲突者、每surface超额者均能诚实定位。

`src/coding.ts:35–67` 仍先收集records再校验所有声明Button；新的mismatched数组等价于原proposal/result OR条件，包含“某record不存在但Button宣称其ID”时的原拒绝。错误只列字段名与真实Button，不dump提交内容。没有放宽literal IDs、typed input、native输出或media规则。

### active artifact root 与权限/IO

`src/artifact-store.ts:24–30` 唯一行为附加是在同一个词法invalid-path分支中附`resolve(root)`，其前后status/顺序不变，未新增realpath/open/read。`extension.ts:84`仍传`ctx.cwd`，store不借constructor旧root替代本次override。symlink/ordinary-file/containment/signature/cancel/quota/immutable-copy原路径未改，相关独立旧测试通过。

### helper/tool兼容和 dist

`src/assistant-guidance.ts:45–63` 从typed forbiddenKey选修复提示；path引导file并区分artifact参数，checks才给FormValidation，其他reserved key不套用表单提示。原SDK expressCause/component/allowedProperties过滤仍执行，实际helper回归通过。`src/assistant-cli.ts`未改；精确success envelope/source bytes和旧0/1/2分类仍由真实subprocess验证。

`extension.ts:49`只补充reserved-key契约文字，没有新增工具、权限或归档行为。两个改动dist的独立内存重建逐字节通过；D2的a2uiUsage只写入spec形状，未混入当前生产实现。

### RED身份与旧资源断言调整

已读取历史 `.local/dx-evidence/d1-red-all.log`，SHA256 `23a62556811e646ea0e899f7b267cf9afe9b479ea56940297b7273c45d3a5cce`。12失败均是已实际到达旧compiler/helper/constructor后的断言差异：legacy文案、缺诊断/owner/root或缺metadata；最后helper测试先在既有UiError构造器metadata断言失败，没有把缺新locateUiError函数充当RED。该日志是主任务保存的历史receipt，reviewer未重跑或独立证明其运行时checkout来源；其失败内容与固定旧源码/当前测试一致。

`tests/session.test.ts:141–150` 的两处修改由精确message改为同一status+同一未格式化reason；preflight nesting/unmatched delimiter输入与拒绝规则未改，新诊断suffix按批准合同单独测试。独立session回归通过，未用宽松“任意抛错”掩盖资源拒绝。

## 后续边界

D1无未决Major。记录本固定源码GO和独立证据后，可按现有授权推进D2：先真实UiSession/注册工具executor的预算行为RED，再最小实现；按spec验证attempted/committed、同名替换、隐藏identity ledger不被失败预留，并再次固定源码独立评审。D3文档、BM1 profile、#36/#37、模型、merge/发布各按各自范围与门禁，不由本报告扩大授权。

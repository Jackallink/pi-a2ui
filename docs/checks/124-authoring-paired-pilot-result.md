# Check124：首次候选配对小批次的 STOP 结果

## 结论与事实边界

本轮不能判断skill/CLI引导是否提高首次生成成功率：4计划行仅运行2行，实际候选只有C臂1个，完整可判配对0/2。G臂观察到一次成功SKILL读取及匹配示例查询意图，但查询未执行、候选未提交；这只能说明观察到准备流程选择，不能算生成成功、UI成功或总体改善。工程验证与单次执行收口，不等于效果验收通过。

固定执行代码source `7c88a9fd9731e029ee5e8b9241ef84f4f11e0613`，tree `8c9cbb5c1e8c9b472ebdf68be549f1c4d5825cc0`，Node24.18.1，Pi1.5.0，唯一Ark AgentPlan `glm-5.3-flash`。C为正式0.1.10 archive `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`；G为Spec024未发布引导候选 archive `c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8`。两包均标0.1.10，只按hash区分；与旧A/B主动触发文案试验无关。

## 实际四行

| 行 | 已准入请求 | 首候选 | 观察结果 |
| --- | ---: | --- | --- |
| FP01-C | 1 | 已提交，编译false，semantic未运行 | `render_compile`普通关case；工具实际报line9:11 `':' expecting {',', ')'}` |
| FP01-G | 2 | 未提交，正确性N/A | 第1请求成功read SKILL；第2请求拟用`cd <owned-project> && node "<packaged-helper>" example validated-form`，被本批禁止shell操作符的sandbox挡住，helper未执行；`tool_policy` fatal停批 |
| FP02-G | 0（not_run） | 未运行 | 既定fatal后停止，不补样本 |
| FP02-C | 0（not_run） | 未运行 | 同上 |

命令形状以占位符展示；原始完整工具意图保留在private raw，未改写。`cd`目标确为owned project，helper意图为只读示例查询；不能把此意图写成危险业务操作，也不能把被拒绝的查询记为已成功执行。插件正常Pi环境不施加本轮私有评测的这条shell白名单，因此该STOP首先暴露评测调用形状衔接问题，不单独证明产品CLI失效。

C观察候选分母0/1；G无候选为N/A；两臂计划交付分母仍各2，但不能把not_run或G未提交改判为DSL错误。无usable UI；没有browser resource ledger或截图，actionPosts原值未建立观测，不冒称实测0 POST。没有执行表单点击、源目录读取或任务/归档业务操作。

## 预算、费用与保全

原命令仅执行1次，CLI因既定fatal策略exit1，总20.810s。durable journal为3个准入记录，全部HTTP200、DONE、SDKtoolUse、唯一tool_calls、errors为空；请求记账和结果已知。native usage合计prompt24464、completion414、total24878；reasoning77包含在completion内，不重复相加。货币费用unknown，不能写免费。

一次grant `spec025-20261116-quQyaW`、claim lock、terminal和全部失败raw保留，3/24已用；剩21不复用，不另起替代grant、不修规则后重评原行。两个已执行worker cleanupErrors为空、userConfigUnchanged=true，workspace清理完毕。原产品76、锁/冻结材料、22历史条目及2归档共103核对条目hash保持（两个冻结文件在历史与源码清单重复列出，共101个唯一文件）；旧失败回执与旧授权不动。未合并、推送、发布或全局部署。

## 执行前验收与追踪

独立Gate2 GO后先RED再实施；代码R1/R2 NO-GO及真实反例均保留，R3代码/隐私/成本GO后完成精确命令绑定。固定新source完整本地CI：Node581/581、TypeScript0、四组browser91/91、strict golden union68（45正/23负），normal offline四行真实SDK/DOM均完成且模型0，4份真实SDK初始capture和C/G差异审核通过。冻结真实模型基线未重跑，Hosted Actions未运行。

- 设计和实施：[Spec025](../specs/025-authoring-paired-pilot.md)、[Check123](123-authoring-paired-pilot-implementation.md)。
- `.local/authoring-pilot-implementation/validation-7c88a9f.json` SHA `7a30d03cddc520acdfbd110166f6344dcf58ba78f8339472198e835741e9a063`。
- `code-review-r3-final.md` SHA `43be5af49ec70fc472effba1956b7d09bdb3c0f6094cb884568497e842ce5de9`；`code-go.json` SHA `c70fadd9182d9477e7e4e2f9f6769f5f5f5e2b7daf10128343be238d720b1c55`。
- 唯一grant SHA `cd4007304b1057ce13c39e985bb1f12371decf348e3754542bef178da0a0a497`；`live-command-binding-r1.md` SHA `e1ee6cbbb762f858fd40ffbcb19b36ef40a8c3652afb782b59fad446f27c89d5`。
- 原始run `.local/authoring-pilot/run-quQyaW/`，report SHA `ed71062e1ebd976b330d86e42dff290ece2620af206860a40893ae66d70fc5fa`，journal SHA `8b2b55da514a60cbec31c13d93fa08638a0f03a07ff603248f12953b5979b536`。
- `.local/authoring-pilot-implementation/live-stopped-receipt.json` SHA `64884a5de67b63cf846b1505354bff84c429d83de2eb911f2d0d92f2015c8ce7`，含原始文件/锁/terminal等hash及费用/未知边界。

独立执行后收口：`post-run-review-r1.md` SHA `9f2074a34fe49cd15354bc7771b4e22cce7df40c7490b931fac08cdb32e3b2af`，限定GO仅确认执行/STOP回执完整，UI与配对效果验收未通过。原始progress是两条已执行行prefix，最终report为完整四行；未将not_run伪造为执行raw。

最终文档checkpoint只改Spec025/Check123/本Check；执行代码仍固定7c88a9f，99运行输入按preflight逐条复核不变。没有重跑付费样本或为文档变化借用/重写旧结果。

## 后续决策

先设计受限环境的只读helper调用适配：只识别固定owned cwd、固定Node/helper及既定只读opcode，解析成直接调用，拒绝其它shell组合；先用零推理反例与独立评审证明边界。是否采用该方案与任何新的真实验证需要单独确认设计和预算。本次规则、raw和grade保持冻结，不用21剩余额度补齐或宣布改善。

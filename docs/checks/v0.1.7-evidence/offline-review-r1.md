# v0.1.7 offline/code/package 独立评审 R1

2026-11-15。**GO：限固定017离线候选门，可进入Spec015 AC005已授权的最多一次GLM story。P0/P1/P2均为0。** 原设计P2的observer实现/离线canary条件已闭合；真实模型与实际tuple receipt仍未验收。

## 固定身份

候选 `cc17bf5ae252da94e90b041267841f4363291f82`，base main `67bcb7db5b2d202defb3a3ad52a677c18a23e03b`；75文件payload来源 `9531e47dce7f68368ecc88ad848bc70c5ff23586`。写报告前63个分支变更文件与候选Git blob一致。

独立核对src/extension/dist/scripts与已reviewed PR46 `b653cf2`无diff；单次集成来源及PR45祖先关系成立。016 Spec011、release guide、Checks067–069保持main字节；metadata与lock除root017version外结构无变化。README明确candidate017与published016安装/移除，changelog保留016记录，未加入benchmark或新runtime策略。

## 独立验证

- Node **v24.18.1**：package+DX相关 **36/36**、tsc通过。
- 私有observer SHA256 **e0b3d5f6bf85937001ca4f84cdfff41c64c8006fb36f85e32385b856e6d9ebf9**已重新计算；静态审查及`--self-test` **9/9**通过。它要求一个真实successful render、一个实际forwarded user message，从render snapshot独立取epoch/surface/revision并严格比较，保留精确typed context；缺失/错误epoch或revision/类型/surface/context/duplicate均拒绝，positive防always-fail。canaries明确synthetic，不是runtime RED或模型pass。
- observer将实际RPC SHA和自身SHA写独立`acceptedTupleVerified`收据，能补足冻结runner只检查context的缺口。其通过不能替代runner其他story/POST/ACK/cleanup验收；仍须绑定同一实际run及准入payload。
- 归档/外部consumer/cc17bf5/9531e47/receipt **75/75文件字节与hash匹配**；tar SHA256 **564138a681520b3d37983c693203cc73f0f18884e7594f7c739cb9d6a3d5cb2c**，package receipt **0ecc6372aa6104632a1b113dad46dc993d51f01040f6580446662cb8ce0c032c**。
- 独立运行repo外production helper：017catalog/32types、19examples/8patterns列表、reported166/2样例/max拒绝、CRLF/Unicode精确bytes通过。无devtools/optional host，执行后75文件不变。并非独立重跑32条逐组件查询。
- 已核actual startup result SHA256 **1cb7234d01bc3905321349249a28a2d0f318229352d22566b20d61317faf2148**及normal-registration/0agent/0model/一skill三commands/5个Node24 owned-cwd/退出清理和payload/operator保留结果；这是主任务frozen startup receipt，本reviewer未重复启动Pi。主任务full230/Chromium45/build及历史2version RED也不冒称独立重跑。

本reviewer只写本报告，未改source/index/HEAD，未运行模型或Pi、未读写真实用户配置/凭据、未作网络写操作。原4high上游风险保留，非audit-clean或production waiver。

## 下一阶段限制

可在**上述同一75-file payload及上述observer hash**上进入最多一次fresh guarded-form skill story：提示前精确核验`volcengine-ark/glm-5.3-flash`和Ark AgentPlan端点，natural language/no supplied DSL；保留invalid0POST/0newagent、valid1POST202、精确typed context/ACK、实际LF双hash、runtime/cwd/preservation/cleanup证据。observer必须读取该run原始RPC并产生真实tuple收据；缺失或失败保持未验收，不用旧context flag或synthetic canary替代，不自动重跑或fallback。

之后仍需固定实际consumer/model receipts做最终独立评审。本GO不授予main merge、release/tag/npm、真实用户015替换、issue closure、其他模型/额外story或43/BM1实现权限；任何payload/observer变更须重新固定并复核。

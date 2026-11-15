# Issue56 code/profile R3 metadata delta — scoped GO

固定对象：`dd41ca40c70529095e5433da0e2ebca7d722c456`，限定相对08f9e5b的7文件delta。**0 P0 / 0 P1 / 0 P2；code/profile scoped GO延续。** 未重复fullsuite，未跑模型/浏览器、读取真实配置或修改源码。

- current package/changelog断言切至0.1.9，同时保留0.1.8/0.1.7及更早history。README/current-release guide和BM4文档消除018当前版本/benchmark仍待实现等陈旧表述，并明确publication状态由Check/Release证明、真实v2未运行、local-only CI与global不自动替换；没有改写v1评分。
- handoff、worker、entry与08f9完全同字节；v2profile唯一delta为archiveSHA。新pin **`6a2dd059571c5f1fb56c16cbfbd650d2cb79979694a9eea7845ddb92af70c5eb`** 与r2 manifest一致，独立read-only核75/75声明payload hashes等于当前files。初始e340作为Check103历史保留，Check104标明为当前候选superseded；未悄悄覆盖v1。Model/caps/profile行为不变，无hash自引用。
- frozen v1profile SHA `dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`、原365 report SHA `cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b`均未变。真实v2仍not-run，新archivepin不是模型分数/推理授权。

SHA256：handoff=`402433b8cd74290be7adf552211d16477d4160b5d3b76e78cd11ad99597dcada`；worker=`881fb8aa1be32347656d90423c1ad9af05ceb03ab28598578b44453fb067db14`；entry=`83f3d42fbfec619e8af10501849d30778e086f905c0e2f66eff7dbeb29f05a65`；profile-v2=`0e1b3fb7e5cbb1a525e4c2fbfb23092fb832e77d85f3744376a29bb4b8ce405b`；r2manifest=`d6c0160e1e8b434b65b6b184ae8acba1f0056adb7ac793552b38d74d4fbd115b`。

本轮只读确认 full-node-r2.log为457pass/0fail/skip/cancel，types日志为tsc完成；未独立重跑。root正在补足owned locked1254路径重跑89browser，旧setup失败仍保留，本报告不提前记新browser绿。仍须实际publicdryrun/offline、strictunion、owned安装/包/真实integration-main验收及对应独立release gate；本codeGO不等于integration/release/issue closure GO。Actions保持disabled，不追加真实模型预算或用户global/config操作。

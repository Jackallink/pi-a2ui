# Check127：全新单对试运行的场景与预算提案

前置Spec026已独立零推理GO，zero-final-review-r1.md SHA f77a7e1a989fa4103afcdb50a1718cae146e9e53fc8af3e0790795b2e2d5255e；这不是模型效果/真实授权。用户本轮同意此后确定新场景/预算，实际调用必须另授权。

Spec027及document-only profile、三轮walkthrough为本轮新设计；推荐FC01资产登记一新题×G/C两session、各≤6/总≤12，native输出cap18432，G先C后固定顺序。当前paid0、live=false、executionSource=null、runner未实施，没有实际grant或model/config访问。准备capture是独立0-provider，不能计作实付或借旧21。

static-preflight.json只读核对旧BM4/trigger/smoke/paired题的ID与完整request hash未重复；新labels/keys与旧FP01/FP02不同。不是新场景效果证据，不宣称总体成功率或因果。所有quote/执行/metric/两行新summary/授权准入见Spec027；旧四行结果不重算，永久offline入口不改成付费。

独立设计/拟成本审查待GO；这是提案，不是TDD或真实执行准入。新paid profile/guards的最小实施、零推理完整验收和代码GO须等用户明确新条件授权之后。当前没有假可执行命令。

## 独立设计R1：NO-GO与定义纠正

固定74d7501e911200ba8ba5c3707773ea9ecc31ea55/treeb294def71d1fac6fd3fd33158d7d132b283706e9，R1报告`.local/helper-adapter-implementation/fresh-design-review-r1.md` SHA 07bd264409a1ee3e5f50326604d70acb69eb065bbbf3070483fd9565bf1a96c3。Spec026文档收口GO；Spec027预算申请NO-GO（0P0/P1、1P2）：完整引导链路的成功读取先于首候选、成功check先于render和源码兼容要求不够明确。原profileSHA 2a28850e5e60fb9c7367d8f683aa26c6e8aaab30182d6b49d750cc89dfb096d9留在R1/历史commit，不覆盖历史。

本轮仅补Spec027/proposed metrics与三轮的必要条件、相应truth-table意图，并重绑定static-preflight的profileSHA；题/顺序/预算/归档/所有runtime和sealedzero不改。失败读取、首候选后读取、只有plan接纳、失败/过晚check、sourceMismatch/unchecked/no-render、隐藏DOM、fatal或unknown均不得称完整链路成功。当前仍待新固定docs source的R2，真实请求/新授权/grant/paid实现均0。

# BM4 design / cost / TDD-intent review R2 — GO

固定 canonical design：`0a2114d15de2697bf7802d7b168c9a9ec77bc4f3`，位于新隔离tree `pi-a2ui-bm4/pi-a2ui`。限定复核原草案R1唯一P1的配置/凭据修正及total预算消歧；**0 P0 / 0 P1 / 0 P2，P1关闭，正式设计/成本/TDD意图准入 GO。**

Spec018:42 已明确在任何SDK config resolver之前，由benchmark自有只读窄JSON adapter扫描selected provider/model/auth，拒绝命令型配置、非api_key凭据、非string/CRLF headers；只解析literal/env引用。真实config/auth路径不交ModelRuntime，owned minimal model不含key，literal-return CredentialStore避免AuthStorage二次插值；resolvedheaders仅在guardedfetch内使用。key/header的`$`/`!`均按opaque bytes保持，并要求actualSDK synthetic transport回归。需要命令型配置时fail admission，不执行命令、不改配置/模型。synthetic !command sentinel须证明零spawn/fetch/write。此约束精确切断R1指出的fetch guard前shell旁路，无新通用平台。

同条款消歧为每case **5 total HTTP attempts，包含产生render的请求**，不是5+1；12cases最多60HTTP attempts、184320输出token选项上限，明确非账单保证。8tools、3072/request、45srequest、90scase、10scleanup、20min串行batch和first-preflight/first-render终止等其余合同未扩大。

独立只读核对canonical commit、Spec相对R1原草案的完整delta（仅第42行预算/配置条款），并确认Plan018/三walkthrough存在且保留offline与独立codeGO后才live的顺序。HEAD=上述固定提交、git status空。未跑代码/测试/probe/browser/model，未读取真实auth/models/settings，未实施任何guard；因此不将设计承诺记作实现证明。原R1报告NO-GO原样保留，SHA256 `dc3b3c83f59874db37f0f40e09a354491b0ce56a26889129ca0521ab9f7da52b`。

文件SHA256：Spec018=`6e40a06127db81f1f4be7073c85ba4af9c0063ca7abf2bd42d09c9831b2c78cf`；Plan018=`c28152267eb6c2acb3236a4eb75251dd462b1e2a22e38f75e6e788b3ff98ae71`；Round1=`f91c541bee6b47f63fc89a25479b082b6fe2355d00d676c26965ce318198a52a`；Round2=`809279e7b72030fe74270d80cea2f1f83566f9e8895850b56bce73bcfcf6bb9e`；Round3=`58644f81e2a5714642199a93d09957ec10d80a9db7924cfe1d80e458f26857a7`。

可进入root已授权的测试/最小driver实现：真实constructed-guard behavioral RED→GREEN、12独立positive/wrong-intent控制、actualSDK/extension/skill/helper/browser/queue synthetic pipeline、成本/路径/配置/cleanup/redaction的offline验证及独立code/cost GO。只有后续门槛通过后，才进入用户已授权的单次12场景GLM baseline；当前仍0实际推理。本设计GO不表示可立即调用模型，不授权fallback/retry/merge/release/global升级或issue closure。

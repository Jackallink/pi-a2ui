# BM4 design / cost / TDD-intent review R1 — NO-GO

审查工件为原始 `.local/bm4-design/draft/spec.md`（SHA256 `0f6de0b4b54776eadba5ffaa89b670fa2d86a002b68f7514f4dba95e205144bb`），不是后续修订稿。派发source `8f557455d02525ef53c8e4d2badf30ab7f05e4e9`；实际HEAD `07d6f164b19781870de84c968c7b9c159fcae5a7`。独立diff确认之间仅4份BM3 hosted证据文档，无source/SDK/runtime变化；root已确认。追加只读了BM4新隔离tree的对应初始Spec/Plan/三walkthrough。**0 P0 / 1 P1 / 0 P2；当前原始设计不准入实现/推理，最小修订后做限定R2。**

## P1 — “只读配置”尚未排除 fetch guard 前的命令执行

原spec:34,42,54及admission-notes:5允许实际modelsPath和ReadOnlyAuthStorage交给SDK解析，依赖readonly/hash保证无全局改变。但SDK `provider-composer.js:293–307` 会解析models provider apiKey/headers；`resolve-config-value.js:123–161` 对`!command`实际spawnSync/execSync，在provider fetch guard之前发生。ReadOnlyAuthStorage只禁止写auth文件，并不证明无命令/其他网络/全局副作用；其`:214–223`返回值仍参与runtime解析。before/after文件SHA不覆盖此旁路。

最小关闭条件（root已接受，尚未作为本报告原设计通过）：execute后、接触SDK resolver前，以自有只读JSON窄adapter检查selected provider/model/auth/headers，拒绝命令型配置；只支持明确literal/env引用，限定api_key及string/无CRLF headers。创建owned无真实key/command的minimalmodels，仅在内存传递已解析凭据/headers，不把原真实config交SDK。**已解析key和header均按opaque bytes保留**：AuthStorage.read `:376–383`也会再次resolveConfigValue，直接inMemory(raw key)仍可能二次`$VAR`插值，需literal-return adapter或正确literal escaping。synthetic `!command` sentinel须证明零spawn/零fetch/零真实配置写；包含`$`/`!`的key/header测试须字节不变。遇不支持配置应fail admission，不执行命令、不改用户配置、不换模型。无需新通用凭据平台。

## 预算、测量与TDD其余结论

- 12个不同NL意图覆盖literal/binding/guard/localtable/markdown/slots/picker/chart/coding/native-tools/artifact；string-array输入、所有coding Button的current IDs、native-only TaskProgress/ActivityTimeline和真实PNG边界正确。独立语义/tree/native判据与compiler合法性分离；合法wrong-intent不能当成功。最终prompts/12positive与wrong-data/slot/context/artifact controls仍须在live前冻结并经offline/code review。
- 数值上限可接受为**每case最多5 total provider HTTP attempts（含产生render的请求），8tools，3072 maxoutput/request，45srequest/90scase/10scleanup；12case串行、20minbatch**。合计最多60 HTTP attempts、184320输出token选项上限；不是账单/实际输出或隐藏token保证。请求发送前计数、exact model/provider/URL、redirect:error、SDK与provider retry=0、无fallback、401/403/429停batch、usage未知不算0、remaining notrun显式，均符合first-attempt测量。不得把5解释成5 preparatory加第6 final request。
- 实际工具/skill/helper profile是明确实验变量：只读contained nonsymlink文本、仅draft写/edit、严格helper-only bash、一次真实check后锁定source、一次unchanged render；失败后不修复。active tools/多tool batch拒绝和post-render fetch拒绝必须以实际SDK synthetic路径证明，不能只测脱离driver的predicate。
- queue-mechanics probe:16–31及其receipt诚实区分synthetic SSE与modelquality；SDK `sdk.js:261–271`确调用runtime.streamSimple，`agent-session.js:1980–1999`确有实际followUp queue且abort在await idle前同步发起。tool_result持有期间观察真实queue，再hook内调用abort、hook外await方向可行；不能把queue当执行。extension.ts:10–11,33,55–75及live-tools.ts:28–43支持真实dispatch/shutdown/native工具观测合同。dispose不替代shutdown。
- 零成本默认入口、config/auth trap、constructed permissive-request guard的真实第二请求RED→guard GREEN、actual SDK/extension/CLI/browser/queue synthetic full pipeline、typed阶段/cleanup/redaction/path canaries和独立code/cost GO仍是live前硬门槛。当前未取得这些实现证据。无第二项独立阻断问题。

只读评审，未读取真实auth/models/settings内容，未运行probe、model、浏览器或测试；actualmodel calls仍0。支撑SHA256：notes=`b0a34ff145b3de9e9c1213aa96d04d6f601fa2ca6addb1fe1c496ae0d0f5c82b`；mechanical probe=`53bc1a7ef8d246b655d210929df5930a4aea8247d138c17dbef17550f7aa1a87`；receipt=`d1426fda7ac6025d78423aab20aa965e9ae61cd0160218df5fd35242fadb8608`。SDK1.5.0源码SHA：sdk.js=`c43e4e1d49ac3ec4b9f48465bf2081bc5980b55f23d44040d02e9046dea45725`；agent-session.js=`1941d9608c98a3638825a8d10b5443ff7c06f96b3ae370bb37269f3a574ede65`；resolve-config-value.js=`01fdb1673990635bb419c7418eefa298b6a1c6fbb3c6193d3b05a4902e51992d`。

本结论不撤销用户12场景后续实施授权；仅要求先闭合该明确安全/成本边界，再按既定独立门槛推进。不授权推理、远端修改、merge/release/global升级或issue closure。

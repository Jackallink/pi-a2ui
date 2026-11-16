# 0.1.10 主动触发pilot：仅设计验收

2026-11-16。用户要求先设计新场景和调用预算；本轮没有模型预算执行授权，不实施live harness、不调用真实模型、不读取真实凭据、不改安装或冻结基线。

[Spec022 draft](../specs/022-v0110-trigger-pilot.md) 提议六个新场景（四个可能受益的正例、两个应跳过的负例），同一0.1.10包下仅替换触发句的A/B配对。十二个episode，每个至多三次请求，整批至多三十六次；max_tokens1536，串行、首次尝试、无自动重试。不是whole-v0.1.9比较，也不是原BM4重跑/重计分。该预算仍待用户确认。

只读Node24.18.1预检：实际发布归档SHA256匹配c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55；v0.1.9→0.1.10完整extension静态差异仅触发句、多362 UTF-8字节。冻结v1 profile与Check099字节仍分别匹配dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685和015de150cee7c5c53bff89a2dc8f36dbf4f6c99bd5426be10cacd29d3c895539。未运行原benchmark入口。以上不是实际SDK请求A/B差异检查通过；该离线canary尚待harness实施。

三轮走查使用skill自带结构校验器通过；只证明结构完整，不证明live路径或harness边界已经执行。完整草案指纹、预检边界和报告指纹见 [preflight.json](trigger-pilot-design/preflight.json)。

独立 [R1 NO-GO](trigger-pilot-design/independent-review-r1.md) 保留：P1指出Pi先校验tool参数，再发extension tool_call，原计数会漏掉非法参数的模型render选择；P2指出选择次数不能宣称UI可用。设计已改为完整assistant toolCall的requested、校验后attempted、实际committed三层，schema拒绝仍计选择/误触发，加入缺source/错误surfaceId类型及拒绝后不续请求的离线控制要求；不再用选择数声称可用UI。另将完整结果仅缺usage与未知请求结果分开记账。

独立 [R2 Gate1 scoped GO](trigger-pilot-design/independent-review-r2.md)：设计问题闭合，四份草案哈希固定。该GO不等于用户确认预算、TDD完成、离线guard通过、实施或live-ready。全部文件保持draft；无源代码/依赖/模型配置/用户数据改动，未提交或推送。

下一门槛：用户确认场景/预算后，才可编写独立默认零推理的harness；离线TDD、真实SDK synthetic控制与独立评审通过后，按批准上限执行一次新pilot。原有7/12真实结果和v2未执行状态不因设计或新pilot而改写。

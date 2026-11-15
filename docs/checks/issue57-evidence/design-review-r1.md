# Issue57 Spec020 design / TDD-intent R1 — GO

固定设计：`c56402d348073599e908bcdfc39d326b87f72c65`；base main `c5089d8934f0db1ec6cb04febf4d8d3e819ead81`。**0 P0 / 0 P1 / 0 P2；bounded design/TDD意图准入 GO。** 仅5份canonical spec/plan/walkthrough新增，尚无新功能实现；允许root先取得既定behavioral RED，再最小实现。原cf8分支只是参考，不整体准入，也不纳入15e7109主动模型prompt。

## 必要合同已闭合

- **同步/零新增动作：** Spec020:28–30 settled一次性消费endedRun并核currentlive，仅用已存在served UiSession.render；无controller.render/ensureServer/await。成功后立即记录owned revision，再flush实际native数据、取得post-flush snapshot并官方appendEntry。失败全部非fatal：render失败不flush/append；flush失败不append、保留已创建ownership；append失败不回滚UI或声称durability。没有新server/opener/POST/user-message/provider/retry；原timer/refresh仅复用同步publish逻辑。
- **ownership兼容与恢复：** :26,32–34保持模型run-summary ID合法。成功同ID render才撤owner，失败保留；其他render/chart只携带匹配当前card revision的可选details元数据。恢复只选当前branch最新有效successful tool或strict exact custom记录，经原UiSession.reset验证，返回该selected snapshot的matching owner；旧history无meta恢复UI但不认领，不回扫旧owner/猜结构/把模型文本伪造为custom。wrapper exact2keys/positive safe-int，snapshot本身仍用原reset的byte/depth/entry/capacity预算，不多包一层snapshot限制。
- **预算/故障：** fixed Card/Column/Text/StatusBadge/TaskProgress/ActivityTimeline为6flat nodes。pure gate按实际total减matching-owned旧面实际count再加6，同时核4slots；现有session.render是全byte/native reserve/identity/atomic admission终裁。满budget不预删/evict或改其他revision；断开/paused/closed/prose/only-A2UI/duplicate路径静默。flush/append的post-commit best-effort失败与render-admission原子失败已分层，不靠reset回滚用户状态。
- **正确状态：** :24把badge定义为agent终止原因，aborted优先；最终正常终止但工具曾error时badge completed、TaskProgress.failed=1和errored timeline row均保留。不用工具聚合error冒充agent任务失败；明确native流在下一run继续更新，badge为last eligible settled outcome，不宣称不可变历史日志或业务正确性。

## AC→test / TDD可证伪性

Plan020 Task1:21–37覆盖真实extension+authenticated SSE/browser正控与old-adapter RED、官方SessionManager custom entry/non-LLM roundtrip、latest valid branch/reload/newEpoch/ownership、preexisting碰撞/成功接管/失败不撤owner、58+6/59+6/4full/owned替换、深比较atomic413、render/flush/append故障、三outcome含recovered error、零新增消息/开窗。原有效工具receipt/编译/auth成功必须先作正控，目标失败应为缺card/缺custom恢复，不是导入/fixture/setup。纯mock orchestrator不替代真实positive。Task2映射AC008到76payload/newv2pin/完整本地CI+68union/publicoffline/normal Git/local消费者及actual-main后验收；新v2真实模型仍not-run，旧365/7of12和旧6a2候选保留。

SDK源核验沿用本轮只读检查：Pi1.5.0 extensions/types.d.ts:1294–1295提供非LLM appendEntry；agent-session.js:2801–2806同步appendCustomEntry；session-manager.js:913–923保存type=custom/customType/data，:1074–1083按当前branch路径顺序返回；session-manager.d.ts:76–84明确custom不入LLM context。UiSession.reset:101–129仍校验全部snapshot、保留structural revisions而重建epoch/撤销artifacts；设计未绕过它。

## 独立证据与边界

指定wrapper **Node24.18.1** 仅做现有compiler/session只读characterization：三preset outcome实际编译各6节点；58+6=64可提交；59+6=65实际413且snapshot深相等。它证明既有原语可支持此设计，**不是新功能GREEN/TDD/浏览器证明**。未跑fullsuite、SDK/model或读真实auth；未改source/index/HEAD，HEAD固定c564/status空。root所述baseline33pass未冒称本轮独立重跑。

SHA256：Spec020=`079ba9623836b601d280ad3ef41aa467e9dce8f251513f4205f78c4226b23c51`；Plan020=`db51edd20e4a958d6770311f6d160c1a1023656f94195ffb35ec23ab97583be3`；Round1=`4f7c0b5846007343b27ae3ab657fb1e515c41bbdff082cb285ab04d70b5a94fa`；Round2=`f187fbaaff84959764ae5b5695309192ecc11dd93ea0040bb188eb6f00b28f56`；Round3=`8469c68a466bb6df7e9fe26e47df51e90fd0e6fde131f559167b6a6155588f0e`。

后续必须实际RED/GREEN、独立runtime/ownership/restore/code审查、76file包与本地完整/消费者/actual-main验收后才关闭57；此前019 readiness仅历史，不复用为新runtime验收。Actions保持disabled，无新增推理预算/全局升级；tag/publication另行GO。

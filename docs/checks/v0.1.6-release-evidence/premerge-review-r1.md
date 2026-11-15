# v0.1.6 premerge release/package independent review

**GO：固定来源的发布准备/生产分发与私有 Git 消费者方案可继续既有授权流程；P0=0、P1=0、P2=0。** 这不是已发布或发布验证完成的结论。本评审未 merge、发布、运行模型、改源码/index/HEAD 或用户安装；仅写此报告。

**身份。** 固定 source `27161a6ab3d1264f7212ff4524ad48f88a69b513`；受审基线 `570b67afe7cec90e37177ac656abef78374ea75f`；最终 payload 来源 `75d18bc7eb3a7b00cd08a3503744b9dcc1f5619f`。74文件 TAR SHA256 `7208611764bc4d75c26b435c68108511d701275f8787974ea45dc34e923813be`；package-receipt.json SHA256 `37ac5719fc6a4d5c7f1e3be87af66e9f751a648079eb69aac0a458dc46aa61a0`。两者均独立重算一致；逐个比较74文件 archive/current source/外部系统tmp production安装/receipt文件hash，全部一致。相对570仅 README、CHANGELOG 两个打包文件变化；src/dist/extension/skills/scripts/package/lock/依赖/legal/.nvmrc 均零差异。271相对75仅新增包外Check067。

**关键检查。** Manifest/lock仍0.1.6，Node>=24<25，Pi extension+skill声明和optional host peers不变；生产树无TS/tsx/esbuild/Playwright/hostPi/TypeBox及开发脚本。独立Node24.18.1执行已安装helper：0.1.6/32types、TextField真实受限参数和validated-form→exact check参数通过。生产verifier和receipt记录32queries/19examples/8routes/CRLF+Unicode/error恢复及payload未变；root新199/199 Node、45/45 Chromium、tsc/build、prose后19/19相关检查日志已读，未冒称独立重跑全套。预备SHA256SUMS内容与TAR一致。现有4high依赖风险仍披露，未宣称修复/audit-clean。

README/guide/notes对Node24、Git/local生产依赖准备、project-local信任/scope、pinned升级、extension+skill一起发现、同scope移除/回退immutable015与保留会话凭据说明一致。严格范围为PR44/issues39–42；PR45/46、34–38/43明确后置，无npm发布/真实global替换或新权限。候选实际GLM/旧失败历史与尚待发布后验证分开，未挪用candidatec641为release720861。

**私有 Git 消费者方案。** 审查 `.local/release-v016-evidence/git-consumer.mjs`，SHA256 `a8cea96d5f601f690488662383c0ffdb68072fd675d276b542cf67a6410e41e0`。在调用方新建0700 owned run的前提下，脚本仅创建其agent/project与dummy模型元数据，设置私有PI_CODING_AGENT_DIR/Node fetch-denial，Git@tag以-l注册到ownedproject。无-e/--skill覆盖的normalRPC要求四个唯一命令/skill，skill origin=package/scope=project、clone realpath处于ownedrun、HEAD精确expectedCommit、version0.1.6及74文件hash一致；只运行status并要求0agent_start。Node children的实际runtime/cwd有断言；finally以有界stdin/TERM/KILL关闭自己的Pi，不接触用户进程或复制credentials。

此脚本不承担真实模型证明：dummy tuple/status0agent与Git/npm获取网络不等同实际模型调用。成功后**刻意保留ownedproject注册和clone供审查**，不能声称已完成注册清理；安装/断言失败时保留的owned状态也应由root记录处理。payloadhash在发现后/status前检查，后续模型模式的包/操作者preservation及最终独立byte核对仍须保留。发布后的实际模型只可由未改动live-acceptance显式skill/allow-model执行，先核exact Ark AgentPlan GLM tuple，再观察完整browser/POST/RPC/typed ACK与cleanup；此处仅审查方案，未执行。

**待覆盖边界。** Root须把包外审查记录归档后，核最终远端head与受审payload身份，再exact-head merge；核mergedtree/74payload、immutable annotatedtag、stable GitHub资产、下载hash/bytes、新Git@tag normal discovery/helper及单个既定GLM完整链路。发布后独立GO之前不得关闭39–42/milestone6；45/46等后续范围保持开放。仅包外回执元数据可按既有流程追加；任何74payload或脚本行为变化须重新固定身份/复核。旧tag/assets不移动替换，待审clone在postreview之后才由root清理自己的注册。没有新增权限确认门。

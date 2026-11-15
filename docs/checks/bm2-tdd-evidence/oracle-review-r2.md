# BM2 oracle / intent review R2 — GO

固定对象：`40746f73f4d24ed57eac3881114be7110e3eb266`，仅复核 rejected `9e475ee97eab79e3b10cc8d614a506fedbce07e4` 的 R1 oracle 修正。**0 P0 / 0 P1 / 0 P2；R1 三项 P1、一项 P2 全部关闭。** GO 仅覆盖本轮意图、输入独立性和反例判据；不替代另一评审负责的 child hash / CLI lifetime / cleanup / CI / pack 门槛。

- **C22 slot 闭合：** `tests/golden/oracles.ts:13–24` 检查直接 slot/child 的类型与字面值；C22 不再靠扁平 Text 顺序。Card/Details/List/Row/Tabs 同根因的直接子节点约束同步收口，未冻结整份 message 或生成 ID。独立执行正常 C22 通过；R1 合法 Icon-trigger + Column(Open,Body)-content 先经真实 compiler accepted，再由真实 CLI/新 evaluator 判为 semantic 失败。`tests/golden.test.ts:112–117` 留有该控制 canary；历史 slot-red.log 明确记录旧 checker 的1fail，而非018产品缺陷。
- **计数独立闭合：** `oracles.ts:41–45` 独立读 raw snapshot arrays，已移除生产 snapshotUsage 调用。真实 S03 的64组件/2surface通过；其证据副本加入第65组件被拒绝，未写真实 fixture。
- **S04/S07 不变量闭合：** `session.ts:50–53` 核 typed413、手写 attempted65/current37、surfaces2/current1 和 snapshot 原子性；`session.ts:61–72` 以真实 pre-snapshot 比较立即/flush 后状态，限定 series/dataSequence delta，并对 actual batch 的 epoch/revision/series/其余组件做深比较。独立执行 S04/S07 控制通过；wrong-capacity-facts、额外 epoch mutation、错误 batch revision 的内存证据均被新 helper 拒绝（`oracles.ts:47–59`）。
- **输入消费闭合：** `session.ts:85–86,105,110–116` 实际使用 S09 filename/kind、S12 submittedRevision、S13 第二 eventId 和 reorderKeys；expected 不参与构造操作。`browser.spec.ts:62–87` 使用 accept、selection、hideSourceComponent；B03 input 是实际 accessible label “B · b”，expected typed context 仍独立为 `["b"]`。S09/S12/S13 独立实际 session 控制通过；浏览器改动仅做定点静态复核，本轮未重跑浏览器。

独立验证环境：指定 bash wrapper，Node **v24.18.1**；固定 registry 加载68、23negative（其余45positive）。本轮仅上述 C22 控制/反例、6条 session 控制（S03/S04/S07/S09/S12/S13）及4个内存证据反例。开始/结束 HEAD 均为40746f7，git status空；未改 source/index/HEAD，未跑全套/模型/真实CI。Check085 对应 PDCA 与观察边界一致；R1 原报告 SHA256 `1d668f80ec8abc072830387c8da7110c702767ec874ff2581e8d60ff8a2e6f0b` 保持不变。

审查文件 SHA256：oracles=`011d0155a13c458e663a1a5ab799b2ecac5a73ab001b1654ea0efe2501547ad7`；session=`37a47d4ea60364eca3018f54316c3f6c28a83ea26a41f61daaf9ba1a6862b629`；browser.spec=`2982ef97eec28d223b752fb178dbd5757b30ec8be5deb86bc73f16c296df797b`；历史 slot-red.log=`70f863e67ef7f9d8404b56d23c44ce0a199640a3fcecfe30fe46048ba3b88a11`。

可进入其余已授权 BM2 验证/独立评审门槛。fresh全套、浏览器完整性、source-bound exact68 union、真实 PR CI 仍需各自证据；本 GO 不表示 hosted CI 通过、整体交付完成、merge/release/issue closure 或 BM3/BM4/模型调用准入。

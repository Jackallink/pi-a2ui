# BM2 v2 concrete fixture / TDD kickoff 独立评审 R2

2026-11-15。**GO：本次v2 TDD kickoff准入，R1三项P1及一项P2均关闭；剩余P0/P1/P2为0。** 最终固定 `1aefd439a910f8355f00ed75f0260c802cf767a4`，仅对照R1输入 `86c22fc5323c4cee21201a1fe2a74ce27375a6ed`确认修复及未解blocker。R1 NO-GO/hash `9557d4fb574191ad0913f2e339e4fc87fd5cc50346c9adb7b20a7167b2cbbfcd`保留，不覆写历史。

**修复确认：**

- S01–S06已以独立input.renders/attempt/replacement/addition完整source序列冻结操作；expected仅人工counts/status/revision/atomic。其他S/B交互参数相应分离，禁止从expected构造步骤。输入与oracle的循环自证问题关闭。
- B05增加可见Row列，其唯一标签与原row IDs对应；升降序可从实际DOM该列观察，保留Score排序、UTF-16码元/类型rank与双向stable ties的正确字面预期，无须读取内部props或重算生产comparator。
- 当前Spec AC与Plan统一68、46C/15S/7B、45+/23−及Node61+browser7，CI unionexact68；原v1仅留明确历史语境。
- C02/C03/C18/C21与canonical literal对齐；C04 Go、C11的63Text顺序、相关options等expected补齐；C46明确inspect/Button及/action/event/context定位，语义/locator不再漏冻。

**独立证据边界：** 修复delta与Git固定对象一致；68唯一ID/contractKey、32+/14− compiler、8+/7− session、5+/2− browser已静态核对。registry SHA256 `6c458aa923be3d900c0c0e96ece7a82287a64a3eaefcd40047003e683037b878`；manifest中83fixture/media hash全部与文件及Git一致，无runtime/dependency/workflow改动。

Node24.18.1只读characterization确认8项修订compiler声明与expected一致、S01–S06独立输入得到所声明counts/status/revision/atomic行为，B05可见标签唯一完整。此前R1的32positive/14control及14negative的018source characterization继续适用未变输入；这些**不是BM2 evaluator测试通过、harness RED/GREEN或browser排序执行证明**。未重跑265/browser大回归，未写evaluator或调用模型；本reviewer仅写报告，未改source/index/HEAD。

**准入与后继门：** 结合用户当前实施授权，root可开始最小test-local evaluator/异步owned worker及tests：先在完整runnable输入上固定新compile-only adapter的可证伪semantic RED，再实现独立oracles；保留setup/negative/semantic/cleanup分类、真实parent watchdog、common dataset/oracle-set身份与case实际input hash。68draft不等于68pass，部分61/7不得伪报complete。实现/资源/真实browser/CI尚需其各自实测和固定源码独立评审；发现新runtime缺陷先停到独立spec/review，不fix-forward。

本GO只覆盖BM2 v2 fixture/TDD admission，**不覆盖实现GREEN、BM3/BM4、任何模型调用、merge/release/global升级或issue43/51/52关闭**。#51/#52采用已审的正确018行为characterization与文档澄清，不声称修复了不存在的runtime错误。

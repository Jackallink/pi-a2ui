# BM3 design / TDD-intent review R2 — GO

固定对象：`8b77e8bf2e7b50ae9f8894807cea022226ffc56a`，限定对 `ab7219fc7111f93ceb9a53d5ecb9c9c7c8d68d2b` 的两份文档 delta。**0 P0 / 0 P1 / 0 P2；R1 唯一 P2 已关闭，设计/TDD意图准入 GO。**

Spec017:83 与 Round3 IT-009 已在消费者实现前固定：filter `src/example.ts`→只见example文件，clear→example/other；File、Status各两次native click验证升/降序及aria-sort，以不同可见首列文件文本辨行；最后切回File升序再capture。全过程POST/dispatch停留在Search后的1，Back后才为2。该字面量操作/预期可识别原来首click行序不变时遗漏的no-op sort；不增加几何主体。Spec017:9也已明确2主流程fixture+1Modal正控。

独立验证仅查看该固定commit的完整delta及hash；确认只改Spec017和Round3（7新增/1删除），无产品/fixture/detector/CI变化，HEAD一致、git status空。未跑Node/browser/model或整套回归。R1报告原样保留，SHA256 `c42fbb8ec979fbaca01a92e4b923029328bcc63a48e197c89a8eca26657f3012`。

修订文件SHA256：Spec017=`37f57915d2f3d66fbc773f77564a07099092aa4e1636a640245b8cd783fc8145`；Round3=`a08ddca07ff8e1a37fb02b2808944ae8ab18340efb6149a49b1451a6e94cf4b6`。

本 GO 允许 root 进入已授权的真实CSS前置观测→可运行no-op detector behavioral RED→最小detector阶段。R1其余合同/边界延续；实现、capture-only三PNG独立视觉检查及手工baseline、代码/workflow/pack复审、实际PR CI仍各自待证。不是实现/CI通过、merge/release/closure或BM4推理准入。

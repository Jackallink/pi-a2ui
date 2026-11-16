# Fresh helper pair · Round3

Canonical：Spec027；后续测试意图，不充当已有paid验收。

| ID | 路径/AC | 后续验证 |
| --- | --- | --- |
| IT-001 | P-001 / AC-001,002 | 新2行grant/capture/source/包漂移、旧grant与永久offline拒绝、无授权早guard0 |
| IT-002 | P-002 / AC-003,004 | native12cap、最后response bundle、首source三keys/required/plain语义、无额外长度、DOM未提交不可算通过 |
| IT-003 | P-002,003 / AC-005 | 真实helper/actual witness/命令hash/Node24/cwd，INPUT/usage与timeout/audit失败；ordinary继续/fatal stop、清理总时限 |
| IT-004 | P-003 / AC-006 | planned1/actual0或1或unknown；2真实candidate和known才描述此题差异，缺候选不填失败；无UI不写实测0actionPosts，usage不假填金额 |

错误矩阵：未授权/源或capture漂移→配置前拒绝；compile/static/schema/prepare→本case关；HTTP/stream/SDK未知/截断/越权/audit/timeout/cleanup→整批stop、余行not_run。锁/账本/raw保留，不补原样本。closed空aborted不能改已知provider终态。

准入门槛：本设计独立GO→提交新12上限条件授权申请→收到用户授权后最小paid适配/Gate2/固定完整zero+code GO→新唯一grant/精确命令审核→单次执行。当前paid0、runner未实现、无实际grant。

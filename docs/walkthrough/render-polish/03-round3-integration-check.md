# Render polish · Round3

Canonical：Spec028。以下为设计/实施测试意图；当前样张证明范围以Check130为准。

| ID | 路径/AC | 测试意图 |
| --- | --- | --- |
| IT-001 | P-001 / AC-001,002,004 | 真实CSS消费与scope，6scene/3宽度前后，contrast有效背景；SDK Light DOM样式已生效，不迁移root |
| IT-002 | P-002 / AC-005,006 | 数值/类型/稳定sort、scalar原子单行与横向可达、raw table一致，chart-corpus的11类边界（含微量/极大/subnormal）与动态patch，legend与tick同域、数据不变 |
| IT-003 | P-003 / AC-003,007 | invalid0/valid1POST，本地控件无POST，保留草稿/焦点/aria/Modal/inert/pause；实际zoom独立记录 |
| IT-004 | P-004 / AC-008,009,010 | helper正例可编译、不支持props显式负例，Node24本地完整CI与包，0真实模型、grant/frozen保全 |

错误矩阵：未加载/缺fixture/编译失败→设计setup失败，不能标美化RED；无数据→保留empty，不补0；权限/旧revision/invalid表单→原错误通路；色值或布局错→本地断言失败，不能改数据或覆盖基线；新增内核需求→停该扩张并单独设计。数据更新/重复通知沿旧revision/epoch与pending路径，不新增重试或RPC。

风险/准入：普通caption/body之外Text variant非法；原型snapshot比较要等fixture log的原生data flush后建立baseline（已经确认变化仅dataSequence0→1、message/epoch不变）；不通过忽略全部revision/sequence解决测试。全局theme、实际zoom、所有组件/媒体/键盘的完整验收留实施Gate4，不能拿设计48图替代。独立Gate1和测试意图评审GO后仅交接Pi，不由本chat自动实施/merge/release。

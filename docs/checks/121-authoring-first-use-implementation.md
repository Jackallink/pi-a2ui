# Check121：首次表单编写引导的实施

用户已同意聚焦skill/CLI，在完整Spec024设计及独立Gate1 GO交付后以“然后呢”要求继续。本轮按继续推进已收敛的有限设计处理，明确继续Gate2/TDD后实施；不是扩大模型/权限/发布范围的授权。基点b569203acb84575fdfecd5fbf2a503f62b37a46d，既有隔离worktree/branch codex/authoring-first-use-design，初始clean。当前Gate2待独立准入，生产代码尚未改动；真实模型预算0。

## Gate2：测试意图与RED口径

| AC | 准入的验证 | 有效失败 / 边界 |
| --- | --- | --- |
| AC-001 / AF01 | 独立检查真实注册descriptor，前置已审494byteauthoring块；保留NEW触发句/skip及异步发布原语义，≤1200byte。合成SDK/extension现有回归 | 不做新文案整段字符串镜像测试，不声称模型遵从或新增行为RED |
| AC-002 / AF02 | 既有authoring-cli32组件shape/required flags/reference/examples；实际prebuilt component FormValidation供独立语义审查IDstrings、fieldId/路径说明 | 不增JSON字段/命令或参数类型推断API；TS与dist必须一致 |
| AC-003 / AF03 | 新tests/authoring-first-use.test.ts执行子文档完整三字段recipe，从不同cwd/空格路径/已有sentinel运行；检查output原字节、三string路径、三rule与same reachable submit直接context覆盖；空草稿校验失败/真实字符串值通过现有validateSubmission | 文档recipe尚不存在时的断言是文档可执行合同RED，不是编译器或模型修复RED；imports/fixture错误不算 |
| AC-004 / AF04 | 同一测试执行明确标记invalid-express的内嵌Button负例，以及把正例的fieldId替换成路径、移除submit root、删除一个context绑定 | helper exit1/COMPILE/no stdout；原compiler本来拒绝，属于回归/负例，不编造新RED |
| AC-005 / AF05 | tests/browser.spec.ts新增真实helper→原样工具参数→实际extension.execute/controller/session/server→认证owned DOM闭环。按componentModel.id核查三个选定字段和绑定button可见/可用，user/action POST0；关page/shutdown | 确定性示例consumer，不声称模型主动生成；不点确认、不做业务发布。旧合法直接render仍由现有extension测试证明无需receipt |
| AC-006 / AF06 | 旧真实raw/锁/terminal、冻结文件hash保持，所有CLI/children Node24，测试只synthetic/owned；0真实配置/provider | 不改旧profile/捕获/已消费grant/真实archive guard；不借旧2次余量 |
| AC-007 / AF07 | 原build产生helper；相关测试后固定source全Node/type/四组browser/strict68union、pack和owned正常注册/skill discovery启动0inference | 不改版本/依赖、32types/19templates/8patterns；browser dist资产不可无关漂移；代码评审GO后才complete |

SMG07必要维护的先RED：仅在owned fixture复制出的extension.ts添加无行为comment，fake preflight用其实际hash签名，复现固定旧归档造成race winner在archive层停掉（worker spawn0，不是权限拒绝）。合法negative/positive workspace witness仍需先到达；修正仅将固定受检归档76payload写回owned fixture，保留当前guard/entry/profile代码，按实际fixture字节签synthetic identity。固定archive SHA+完整path列表必须先验证；不使用通用tar解包到任意路径，按allowlist逐文件读取写owned目的。原guard/validateArchive及真实旧状态均不改。修正后保留两个合法witness、全部拒绝计数、单racewinner和replay拒绝，配置/provider0。此fixture证明授权入口，不证明新candidate产品；后者由AF03/AF05/AF07负责。

## 顺序与证据边界

独立Gate2 GO→先记录文档合同/fixture RED→最小修改入口文字/现有notes/既有子文档→原build→对应GREEN→固定候选全本地验证/pack/startup与独立代码GO→本地checkpoint。root实施，reviewer只读。不将写skill的通用压力测试建议当成新模型预算，效果仍未知。没有合并/推送/发布/本机安装授权。

原始RED/错误/产物置于.local/authoring-first-use-implementation，原始模型收据和历史设计稿保持。当前仅Gate2测试意图，没有新增实际测试结果；后续记录会固定source/tree/Node/SDK/lock/assets并保留所有失败。

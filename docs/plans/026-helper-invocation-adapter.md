# Plan026：有限helper适配实施

Canonical：[Spec026](../specs/026-helper-invocation-adapter.md)。本计划定义目标/依赖/门槛；状态及测试结果归Check125/后续Check，不维护执行进度。

目标：让固定owned cwd冗余prefix的已知只读helper调用，在新offline policy中形成可证明的单一Node调用；不改变产品或旧policy。技术栈：Node24/Pi1.5、当前锁定SDK与Playwright；无新依赖。用户授权独立设计GO后有限实施/zero验证；真实调用另授权。

1. Gate1/Gate2：三轮AC和安全/预算/保全测试意图独立审查固定source。明确拒绝一般shell/扩展/外部文件，默认与所有live入口0授权。
2. RED0：新known offline policy准入在旧policy上真实失败；仅证明准入缺口。最小注册新profile（HX01-C/G、12synthetic/0paid）/fixtures/归档参数与source inputs；此时仍用原helperCall。写SDK prefix/direct对照，观察prefix的实际tool_policy RED，不以缺模块或setup异常作RED。
3. parser：tests/helper-adapter/invocation.ts纯全串parse→plan/usage/policy，手写合法/非法argv及真实进程sentinel测试；RED1后最小实现。episode.ts仅按新policy调用，并重建单Node命令、分层记录、保留原helperCall。扩展actual SDK synthetic mode及新的独立CLI。
4. narrow GREEN：parser/op/quoted-path/executable/cwd/draft/注入、真实helper两臂/正确cwd、usage/INPUT/timeout、source与DOM闭合、new CLI/default/live三入口拒绝及配置/provider witness0；新预算/输入集、旧policy/原失败保持。回到任何NO-GO对应有效状态修正。
5. 固定实现source独立代码审查与完整本地Node/type/四组browser/strict golden union、正常新CLI offline、preservation/identity receipt；全部零真实推理，不生成实际grant。闭合Spec026的有限工程验收。
6. 以上GO后才设计新真实场景与调用预算（建议从≤旧24的更小起点考虑），新profile只作document-only、模型glm-5.3-flash、当前approved0；独立预算/设计评审后向用户提交具体申请，本轮不调用。

文件：新增tests/helper-adapter/{profile.ts,profile.json,fixtures.json,invocation.ts,process-witness.ts}、scripts/helper-adapter.mjs及聚焦Node测试；最小改tests/trigger-smoke/policy.ts、tests/trigger-pilot/episode.ts、tests/authoring-pilot/authority.ts。公开76payload与lock/版本不改。测试期望来自独立literal fixture、实际同臂helper/compiler/DOM，source/profile/archives/raw hash绑定Check。

回退：移除新offline入口/新policy/parser及其条件接入；旧profiles/真实raw/锁不动，不复活21余量。未来paid runtime不在本计划实施范围。

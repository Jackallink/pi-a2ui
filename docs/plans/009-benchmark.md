# Benchmark roadmap and BM1 implementation plan

> Execute inline in the existing isolated worktree using executing-plans; independent reviewers review design/code, not delegated implementation. Canonical [spec012](../specs/012-benchmark-diagnostics.md); user agreed current BM1 scope2026-11-15. Plans define scope/steps; tracker owns progress, Checks own measurements.0.1.8 tentative, no merge/publication/global upgrade.

**Goal:** Actual diagnostics → uniquely located shipped repair → real compilation and independent intended-data checks for exactly two families.
**Architecture:** Existing compile/UiError + small test-local registry/fixtures/oracles/scanner; existing skill sections gain markers. No runtime validator or generic framework.
**Tech Stack:** Node24.x, existing node:test/tsx/TypeScript, read-only GitHub Actions. Zero model calls/dependency changes.
**Spec:**012 current profile v0.1.7-dx-v1 supersedes legacy-policy-v1. Base46f04c6 includes released017/closedDX34–38; original eight primary draft files and historicalCheck062/reports preserved.

## Global constraints / file responsibilities

Exactly2registered families, unknown all-error coverage. Runtime/src/extension/dist/dependencies/package/lock/scripts unchanged; package remains017 until separately reviewed018release step. Only shippedsyntax-and-errors markers change packedbytes; tests/fixtures/workflow excluded. No SDK/CLI/permissions/budget/queue/branch-protection changes, no model/config access or auto-baseline updates.

|Path|Responsibility|
|---|---|
|tests/benchmark/diagnostics.json|Typed fixed-profile2family input and declared expected errors/doc/oracle routes|
|tests/benchmark/diagnostics/*.express|Four full positive/negative fixtures; codingrecords explicitly illustrative|
|tests/benchmark/diagnostics.ts|Test-only strict registry, typed stage errors, real compile fixture/doc check, narrow fence-aware extraction, two static positive oracles|
|tests/benchmark-diagnostics.test.ts|Bothpairs/docs, same-checker failure canaries/setup/negative classification; npmtest auto-discovery|
|skills/pi-a2ui/references/syntax-and-errors.md|Two markers in existing repair sections, keep current complete examples|
|.github/workflows/benchmark.yml|Read-only offline Node24/npmci/test/check on PR/manual event|
|docs/checks/076+|Actual source-bound design/RED/GREEN/review/CI receipts|

## Task BM1-A — runnable detector and real binding RED

Consumes existingcompile(surfaceId,source)/UiError and spec012 facts. Produces exported Family/Registry and verifyFixturePair/documentSource/verifyDocumentation with BenchmarkFailure.stage setup/negative/doc-contract/compile/semantic.

- [ ] Freeze base/Node/catalog/SDK/lock/originaldraft/action identities inCheck076; structure-check walkthrough; independent design/TDD-intentGO before implementation.
- [ ] Create schemaVersion1/profilev0.1.7-dx-v1 registry with exactspec fields, four complete fixtures and minimal test-local helper. Reserved positive source below; negative changes only file key. Coding uses current existing review doc's CodeDiff/TestResults and two named review/inspect Buttons; negative removes only inspect context IDs.

```text
inspect = Button(child=Text(text="Inspect"),action=Event("inspect_file",{file:"src/example.ts"}))
root = Column(children=[inspect])
```

- [ ] Add root-discovered tests with real fixture success preceding document validation; run narrow Node24 command and retain exitcode/log/source hash. Expect exactly missing-marker document-contract failures on otherwise valid017repairs, not missingprose/runtime/setup failure.

```ts
for (const family of loadRegistry().families) {
  test(`BM1 ${family.id}: actual fixture pair`, () => verifyFixturePair(family));
  test(`BM1 ${family.id}: shipped executable repair`, () => {
    verifyFixturePair(family);
    verifyDocumentation(family, readFileSync(family.doc.path, 'utf8'));
  });
}
```

Run `node --import tsx --test tests/benchmark-diagnostics.test.ts` underNode24. If fixture/setup fails, fix that first and preserve failedreceipt; do not labelit targetRED. Commit runnabletests/fixtures/helper/REDreceipt at fixedsource.

## Task BM1-B — minimal markers and detector GREEN

Consumes BM1-A checker and existing reference. Produces same doc examples with discoverable bindings plus adversarial checker coverage.

- [ ] Add only standalone marker `<!-- benchmark-diagnostic:reserved-event-key -->` under Repair a literal filename and coding-record-context marker under Extend a review surface, before existing example blocks.
- [ ] Run normal pair/doc tests. Add in-memory canaries for spec012's structural/compile/semantic cases; missingfixture injection and malformedregistry are setup, not successful rejectedproductcases. For each semantic canary first prove modified source is compile-valid, then require semanticstage from samechecker:

```ts
const source = documentSource(family, guide).replace('src/example.ts','src/other.ts');
assert.doesNotThrow(() => compile('diagnostic', source));
assert.throws(() => verifyDocumentation(family, guide.replace(documentSource(family,guide),source)),
  error => error instanceof BenchmarkFailure && error.stage === 'semantic');
```

- [ ] Run targeted then fullnpmtest/check/build. Check diff has no runtime/dist/scripts/deps/other skill changes; npm pack --dry-run --ignore-scripts --json must keep75files and exclude tests/CI/fixtures. Recordonly actualresults inCheck077; independent offlinecodeGO at fixedsource before workflowcreation.

## Task BM1-C — offline workflow and real CI/PR delivery

Consumes offlineGO and reverified officialNode24action pins fromspec012. Produces minimalworkflow and review-ready PR with actualjob evidence, not mergedrelease.

- [ ] Add exact bounded workflow, then final independent code/workflow review before push:

```yaml
name: BM1 offline
on:
  pull_request:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  node24:
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1
        with:
          node-version: '24'
      - name: Record runtime and checkout identity
        run: |
          node -e 'if (process.versions.node.split(".")[0] !== "24") process.exit(1); console.log(process.version)'
          git rev-parse HEAD
          printf 'event_sha=%s\n' "$GITHUB_SHA"
      - run: npm ci
      - run: npm test
      - run: npm run check
```

- [ ] Guardremote/main baseline; push codex branch/create PR withspec/ACs/REDGREEN/reviews/riskrollback links and no closingkeywords. Record PRhead and realCIrun/job/event/head/checkedoutsyntheticmerge SHA, Nodepatch/conclusion. Setup/auth/transport failure is distinct; no fakeCI success or retry withoutnewcause.
- [ ] Readback successfuljob/unchangedpayloadscope; updateChecks/spec review-ready/trackerBM1child and parent43scope. Parent43 remainsOPEN; do notmark unimplementedBM2–BM4 or merged/released018. Request separate merge/release GO on the concretePR after checks. Rollbackreverts this slice includingCI/marker/test references together.

## Roadmap

|Slice|Admission and boundary|
|---|---|
|BM1|Currenttwofamily spec012/profile017, independent design/codeGO + offlinePRCI; onlythisslice authorized|
|BM2|≥60unique layeredpositive/negative scenarios, ownspec/coverage/oracles beforeimplementation|
|BM3|Deterministiclayout/interaction checks+detectorcanary; screenshotsadvisory, ownspec/environment|
|BM4|Manualopt-in glm-5.3-flash-only evaluation, separatecost/control admission; noCI/releasegate|

## BM2–BM4 后续设计准入条件

**BM2：** 场景 schema 至少含 id、contractVersion、intent、layer、fixture、initialState、steps、expected、reference；compiler 用于单树合法性，真实 UiSession 用于跨 surface 预算/atomicity/epochs/updates，browser 用于控件/动作，独立不变式检查请求键和类型。60场景要有覆盖矩阵，正负比例与去重规则；64/65、4/5surface、失败不改变 committed snapshot、工件生命周期、图表 revision 都有独立用例。summary>128 的预期绑定 #36 最终合同，不能把现有耦合当永恒正确性。

**BM3：** 选用确定性布局/可见性/交互断言作首片主判据，截图与 diff 固定为 advisory；因此不能称像素级保真已保证。未来像素门禁是新 policy，不能测出失败后自动降级。先固定具体 DSL/步骤、viewport/DPR/fonts/Chromium/theme、待比较的无关 sibling/control pairs、合法嵌套与 modal overlay；正常/合法重叠应过，真实 CSS 注入的非预期重叠应报，detector 自身失败要 fail closed。baseline 更新单独审查，不自动写回。

**BM4：** 只读使用现有 Pi 凭据；provider/id/baseUrl 固定 `volcengine-ark/glm-5.3-flash/https://ark.cn-beijing.volces.com/api/plan/v3`，每次实际推理前核验；其他模型不在本计划授权内。默认使用真实 Pi 与实际装载的 skill/tool profile，user input 只有自然语言意图，不注入期望 DSL/答案；tool-only 对照臂另立实验。默认 dry-run，实际调用需显式 opt-in 与冻结案例数、回合/尝试、时间与 token 观察预算；成本规则未独立审定前不得实现付费路径。使用新私有 run，保存原始失败和阶段、先清理后退出；不修改真实项目/包/全局配置。

Pi1.5 的 `set_auto_retry` 写全局 settings，禁止拿它作隔离开关；`before_provider_request` handler 异常会被捕获，也不能用 throw 假设硬拦截。后续 spec 须验证私有项目 retry 配置、超时/取消及计数边界；区分观察到的 hook/agent runs 与真实 HTTP/billed request，不承诺未实现的硬金额上限。

BM4 分别报告 planned/started/transport-completed/compile-valid/intent-correct/interaction-completed；首试定义首次完整 a2ui_render 尝试，缺少尝试独立报告，不让自动修复后的成功覆盖首试失败。无效提交0POST与有效提交1POST/typed ACK属交互层，setup/429/timeout 不伪装 DSL RED。错误分布不能单独证明 DX 改善；如要评价修复效率，另审有界 repair trial，不混入 first-pass。比较需冻结 dataset/model/oracle/预算/环境控制条件；产品源码、skill、tool 的改动是明确记录 hash 的实验变量，不能把混杂差异归因给某一个改动。控制条件变化时分组或标不可比。

## 回退与检查

回退具体切片 commit，同时恢复 npm test/browser/CI 接线及 registry/doc anchors，再移除无引用的测试/fixture；不能只删文件留下 broken imports/workflow。不动已发布 tag、用户配置、生产权限。真实测试数量与执行结果只写 Check，不作为此计划的实时状态。

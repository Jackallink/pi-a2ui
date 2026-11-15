# BM4 manual first-attempt model baseline

Use Node24.x (`nvm use 24`). Canonical [Spec018](../specs/018-bm4-model-benchmark.md), [plan](../plans/018-bm4-model-benchmark.md). Actual model execution is manual, outside CI/release gates. Default performs no inference and reads no user credentials/configuration:

```sh
node scripts/benchmark-model.mjs
```

The twelve scenarios cover literal source intent, guarded/typed forms, numeric DataTable behavior, code/Markdown, disclosure/modal, searchable choices, signed Chart, illustrative Diff/TestResults, real native progress/timeline and a registered PNG preview plus Image. Prompts/independent oracles are frozen before live. Static/local cases have no Pi dispatch; interactive cases require actual HTTP202 and actual Pi follow-up queue data. Queue acceptance does not prove later model interpretation/application execution.

Zero-provider integration uses actual Pi1.5.0, packed skill/helper bytes, extension/server/renderer and headlessChromium with synthetic providerSSE; it never measures model quality:

```sh
node scripts/benchmark-model.mjs --offline
```

Live execution requires clean reviewedsource, exact inspected018archive, real readonly literal/env Arkconfiguration and explicitopt-in:

```sh
node scripts/benchmark-model.mjs --execute --archive /absolute/path/to/pi-a2ui-0.1.8.tgz
```

This fixedprofile supports macOS/Linux. It permits only volcengine-ark's `glm-5.3-flash` on exact ArkAgentPlan `https://ark.cn-beijing.volces.com/api/plan/v3`, no alternate endpoint/model/fallback. Twelve serial episodes, firstcandidate check/render once, no automatic repair/retry. Max5totalproviderHTTPattempts/episode including renderresponse,8executedtools,3072outputtokens/request,45srequest/90scase/10scleanup/20minbatch. These are transport/options bounds, not invoice guarantees. Providerusage is observed from actual SSE; missingusage unknown. A durable pre-dispatch admission journal survives worker loss. Missing/invalid final receipts keep started/request outcomes null/unknown and stop the batch; known admitted requests are a lower bound, never a zero-cost inference. No extra model continuation after render: actual queued message is observed while tool_result holds, then actualPiabort.

Profile intentionally constrains tools to actual read/bash/write/edit/render/registerartifact: read only shippedpackage/ownedprojecttext; write/edit owned draft only; shell only exact trusted helperqueries/check. No shell file creation, scripts, userfiles, external commands, MCP or otherextensions. Actualskill is expanded, but mktemp/redirection workflow is adapted to write/edit; record this experimental variable when interpreting failure. Command-based credential/header configuration is rejected before SDK resolver. Only literal/env values resolve in memory via literal-return credentials and fetch-onlyheaders; no credential copies or globalconfig updates. Do not replace unsupportedcommandconfig automatically.

Reports/images reside under owned `.local/bm4/`; negative/synthetic control runs are separate `.local/bm4-offline/`. Preserve firstfailures; no rerun-to-improve score. Report planned/started/notrun, providerattempts, preflight/compile/render/intent, applicableHTTP/Piqueue,staticN/A and harness failures separately. Cases can fail while being valid measurements; setup/cleanup failure blocks harness acceptance. No billing cost is inferred from zero SDK cost fields. Parent hardstop cleans registeredownedbrowser and knownworkspace only; SIGKILL of the parent itself is outside recovery guarantees. Screenshot evidence is synthetic/model-generated taskdata, never browserchrome/tokenURL/userfiles. No pixel-quality score.

BM2/3 predecessorPRs, merge/release/globalinstall/issue43closure remain separate. Rollback only incrementalbenchmarkfiles; retain failedreceipts. No runtime, CSS, dependency or productpackageversion change.

# BM4 manual first-attempt profiles

Use Node24.x (`nvm use 24`). Canonical [Spec018](../specs/018-bm4-model-benchmark.md), [plan](../plans/018-bm4-model-benchmark.md). Actual model execution is manual, outside CI/release gates. Default performs no inference and reads no user credentials/configuration:

```sh
node scripts/benchmark-model.mjs
```

Contributor setup: select Node24, run `npm ci`, then `node node_modules/playwright/cli.js install chromium-headless-shell`. These developer scripts/tests are excluded from the production npm payload; the packaged skill helper uses prebuilt JavaScript as documented in its own reference.

The twelve scenarios cover literal source intent, guarded/typed forms, numeric DataTable behavior, code/Markdown, disclosure/modal, searchable choices, signed Chart, illustrative Diff/TestResults, real native progress/timeline and a registered PNG preview plus Image. Prompts/independent oracles are frozen before live. Static/local cases have no Pi dispatch; interactive cases require actual HTTP202 and actual Pi follow-up queue data. Queue acceptance does not prove later model interpretation/application execution.

Zero-provider integration uses actual Pi1.5.0, packed skill/helper bytes, extension/server/renderer and headlessChromium with synthetic providerSSE; it never measures model quality:

```sh
node scripts/benchmark-model.mjs --offline
```

Live execution requires clean reviewedsource, exact inspected0.1.9candidate archive, real readonly literal/env Arkconfiguration and explicitopt-in:

```sh
node scripts/benchmark-model.mjs --execute --archive /absolute/path/to/pi-a2ui-0.1.9.tgz
```

This fixedprofile supports macOS/Linux. It permits only volcengine-ark's `glm-5.3-flash` on exact ArkAgentPlan `https://ark.cn-beijing.volces.com/api/plan/v3`, no alternate endpoint/model/fallback. Twelve serial episodes, firstcandidate check/render once, no automatic repair/retry. Max5totalproviderHTTPattempts/episode including renderresponse,8executedtools,3072outputtokens/request,45srequest/90scase/10scleanup/20minbatch. These are transport/options bounds, not invoice guarantees. Providerusage is observed from actual SSE; missingusage unknown. A durable pre-dispatch admission journal survives worker loss. Missing/invalid final receipts keep started/request outcomes null/unknown and stop the batch; known admitted requests are a lower bound, never a zero-cost inference. No extra model continuation after render: actual queued message is observed while tool_result holds, then actualPiabort.

Profile intentionally constrains tools to actual read/bash/write/edit/render/registerartifact: read only shippedpackage/ownedprojecttext; write/edit owned draft only; shell only exact trusted helperqueries/check. No shell file creation, scripts, userfiles, external commands, MCP or otherextensions. Actualskill is expanded, but mktemp/redirection workflow is adapted to write/edit; record this experimental variable when interpreting failure. Command-based credential/header configuration is rejected before SDK resolver. Only literal/env values resolve in memory via literal-return credentials and fetch-onlyheaders; no credential copies or globalconfig updates. Do not replace unsupportedcommandconfig automatically.

Reports/images reside under owned `.local/bm4/`; negative/synthetic control runs are separate `.local/bm4-offline/`. Preserve firstfailures; no rerun-to-improve score. Report planned/started/notrun, providerattempts, preflight/compile/render/intent, applicableHTTP/Piqueue,staticN/A and harness failures separately. Cases can fail while being valid measurements; setup/cleanup failure blocks harness acceptance. No billing cost is inferred from zero SDK cost fields. Parent hardstop cleans registeredownedbrowser and knownworkspace only; SIGKILL of the parent itself is outside recovery guarantees. Screenshot evidence is synthetic/model-generated taskdata, never browserchrome/tokenURL/userfiles. No pixel-quality score.

BM2/3 predecessorPRs, merge/release/globalinstall/issue43closure remain separate. Rollback only incrementalbenchmarkfiles; retain failedreceipts. The evaluator does not change production runtime/CSS/dependencies; the0.1.9release updates normal package/version/documentation metadata. The expanded0.1.9 candidate separately adds Spec020 automatic run summaries and their production module; its current manifest is76files and v2 archive pin is resealed. This does not alter the frozen v1 measurement or create a v2 model score.

## v2 checked-source handoff (issue56)

The current entry uses `profile-v2.json`, profile `v0.1.9-glm-first-v2`. It records source-byte fidelity separately from attempted-source legality and complete compiled-surface identity. The actual compiler compiles both the successful preflight source A and the first attempted render source B; only object-key ordering is canonicalized. Array order, component IDs, surface/catalog, events/context, initialized data/bindings and opaque artifact references remain exact. Only equal complete compiled messages allow the original B to reach the real tool. No trimming, rewriting, repair, second preflight/render attempt or model judge is involved. Unknown compiler/canonicalization failures are harness/setup failures with null candidate judgments, not invented model errors.

Executable zero-model developer example:

```sh
nvm use 24
node --import tsx --input-type=module <<'JS'
import {compareHandoff,requireHandoff} from './tests/benchmark-model/handoff.ts';
const checked={surfaceId:'example',source:'root = Text("A")\n'};
const attempted={surfaceId:'example',source:'root = Text("A")'};
const observation=compareHandoff(checked,attempted);
requireHandoff(observation);
console.log(observation); // byteIdentical:false, attemptedCompileValid:true, compiledSurfaceEqual:true
JS
```

Offline SDK controls retain byte/source hashes and prove actual native render→HTTP202→typed Pi queue for terminal-LF variation. Compiler-legal changes to event/context/binding/data/IDs/artifact references remain negative controls. Reports expose checked compilation, attempted compilation, byte identity, compiled identity, actual render, intent and queue separately. Hashes diagnose provenance; acceptance compares full canonical compiled content, not just digests.

Frozen history is unchanged: `profile.json` describes v1, reproduced at source365b783214a961b900e7fc3afc38296f318d3cf3; Check099 retains the single actual GLM v1 run (12scenarios/43requests/7of12 strict workflow, three terminal-LF handoff failures and two timeouts). The new v2 controls are zero-model results, not a v2 first-attempt model score or a re-score to10of12. **Real v2 baseline: not run; no new budget has been granted.** Any future live run must use an explicitly approved budget and the finalized v2 archive fingerprint; default/dry-run/offline do not read real credentials or infer.

GitHub Actions remains disabled under the user's local-CI constraint. Run all release checks locally on the exact candidate/integration commit and retain the source/runtime/browser/lock/report/log fingerprints; old hosted receipts are historical, not evidence for a new local tree.

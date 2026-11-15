# Repository agent rules

## Scope
All files in this repository, including developer tooling, benchmarks and release preparation.

## Inheritance
Inherit the user's global AGENTS.md and direct conversation instructions. The strict SDD/TDD states, independent review, source-bound validation, preservation and release gates remain in force.

## Override
Direct user instructions take precedence. Effective2026-11-15, GitHub Actions quota is exhausted and the user requires **local CI only**. This replaces future hosted execution evidence with local execution evidence; it does not waive tests, review, package or consumer acceptance. Do not dispatch/rerun/re-enable hosted workflows or change required-check/permission policy to bypass a failure. Workflow418909498 stays manually disabled until the user requests otherwise.

## Evidence Path
Record audit decisions, validation and release evidence under `docs/checks/`; canonical behavior specifications and implementation plans under `docs/specs/` and `docs/plans/`. Store full owned raw logs/screenshots under ignored `.local/`, with exact source/tree/runtime/lock/browser/artifact fingerprints in Check records. Keep issue status and execution progress in GitHub issues, not these standing rules.

## Local CI and inference
- Use **Node24.x** for every JS/npm/Pi process, including child processes. Use the lockfile and the locked Playwright browser. Production distribution is Git/local paths, not npm publication.
- Validate the actual candidate/integration source: relevant tests first, then full Node tests, TypeScript, complete browser runner and compatible golden-report union; release acceptance also requires prepack/payload and owned normal package installation/skill/tool discovery. Keep local results distinct from historical hosted runs and platform-specific advisory pixels.
- Benchmarks in CI use synthetic provider transport only. Real model validation requires an explicit current budget and uses only Ark AgentPlan `glm-5.3-flash` unless the user authorizes another model. Default tools remain zero-inference; never retry or rescore a frozen real baseline to improve its grade.
- Preserve existing user/global installations, configuration, credentials, dirty drafts, branches and failed receipts. Local acceptance is not authorization for a global upgrade or unrelated cleanup. Integrate, publish and close issues only within the user's reviewed scope and after the corresponding acceptance evidence.

Reason/effective date: user-directed local-CI transition2026-11-15 after Actions quota exhaustion. Audit/design evidence: `docs/checks/101-v019-handoff-design.md`, Spec019; historical hosted receipts remain Checks087/093/100.

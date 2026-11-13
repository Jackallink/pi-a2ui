# Changelog

## 0.1.0 — 2026-11-13

Initial MVP checkpoint for local Pi/browser interaction.

### Added

- `a2ui_render` tool using the official A2UI Express compiler and Lit renderer.
- Text, Column, Row, Card, Button and TextField components.
- `/a2ui`, `/a2ui-status`, `/a2ui-toggle` commands.
- Atomic full-surface publication: invalid generation preserves the previous UI.
- Browser form events returned as structured user data to the same Pi conversation, using followUp delivery.
- Current-branch snapshot restoration, browser reconnection and lifecycle cleanup.
- Loopback HTTP SSE/POST, credential bootstrap, Host/Origin checks, event deduplication and bounded resources.
- Bundled browser assets in an installable package; no user build or CDN required.
- Complete third-party redistribution license/notice texts generated from actual browser bundle inputs and included in the archive.

### Validation

- 44 Node checks and 5 real Chromium cases passed.
- Actual Agent Plan `glm-5.3-flash` completed model -> tool -> browser -> submitted context -> subsequent model reply.
- Actual Pi reload, snapshot recovery, exit and listener cleanup verified.
- Independent design/code reviews and scoped repairs recorded under docs/checks.

### Limits and known issue

- Local trusted-process use only; no remote service deployment or production security certification.
- No Diff, charts, data tables or live logs in this version. No token-streaming preview, general RPC or arbitrary HTML/JS.
- HTTP202 means one local dispatch attempt, not model success.
- Upstream Zod advisory GHSA-mrhx-c7xc-m3w5 remains in the pinned SDK dependency tree. Input budgets are mitigations, not a patched dependency or clean audit.

Future scope is defined in ROADMAP.md and versioned specs, not shipped here.

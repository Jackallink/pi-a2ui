# Skill authoring walkthrough

Canonical spec009. S1/S6: user invokes /skill:pi-a2ui; Pi loads short entry from same package; model selects reference/example based on visible tool signatures. If package skills filtered/old tag pinned, /reload cannot manufacture missing resources; inspect configuration/source first.

S2/S5: create two initialized string bindings, TextField(label,value), Button(Text,Event), one root tree. SDK forward references compile: declaration order alone is not the screenshot cause. Missing comma reproduces mismatched Button; Card(string) means a component ID and dangles. Full failing screenshot DSL is truncated, so the exact second Text-as-function parse cannot be claimed reproduced. Prefer named props and minimal known-good template.

S3/S4: helper in skill/scripts imports checked-in JS, reports own package catalog, selects allowlisted fixture, compiles through same source compiler. 16-type baseline and29-type candidate are explicit. Invalid input produces error/nonzero and no tool payload; valid output still requires a2ui_render session admission. File/stdin byte ceiling, no network/model/file writes or renderer bypass. Media references never grant file access.

SDD admission audit: draft -> walkthrough-approved -> tdd-approved for companion scope under direct user request. No new authority or unrelated runtime changes. Execute S1 discovery RED before resource additions, then examples/helper/production checks and actual GLM forward story; record precise evidence in Check033.

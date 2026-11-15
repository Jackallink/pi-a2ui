# BM3 real layout detector RED→GREEN

Spec017,strict,in-progress; independent design/TDD GO at8b77e8b (Check088). Constructed initial no-op detector source **15de2b655f7413e95bb381ef85547868dfa9c944** with a complete actual compiled Search fixture, real server/renderer/authenticated lockedChromium and actual DOM measurements.

Baseline RED: normal Query center hit/native trial-click succeeds. Test-only style places actual Search button over observed Query box; independent rectangle intersections each>10CSSpx, Query center hit=false and native trial-click fails specifically because Search intercepts pointer events. Those preconditions pass. The no-op evaluator then fails `detector must report actual overlap` (1test/1failure, exit1). This is behavioral RED for the new detector, not missing-module/setup failure or an018renderer defect. Public log redacts only absolute workspace path; raw original is private.

Minimum detector checks nonempty/finite positive geometry, declared subjects/pairs, visibility/viewport/deep-hit observations and explicit unrelated pair intersection>1CSSpx in both dimensions. Same real fault reports overlap:query/search andoccluded:query; restoring exact original style returns normal geometry and actual trial-click success,0dispatch. Narrow1test passes after implementation (private detector-green.log). Node24.18.1,Playwright1.65.0,Chromium158.0.8127.18 revision1254.

Remaining: actual3state/controller/table/modal paths, font/profile/source fingerprints, explicit nonacceptance capture-only and independently inspected3baselinePNGs/manifest, source-bound full checks/code/baseline/workflow review and realCI. No BM3 baseline/completeCI/model/release/issueclosure claim yet. Preserve15deRED and rollback visual slice only.

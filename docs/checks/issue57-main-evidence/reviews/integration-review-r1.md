# Issue57 / PR60 pre-integration gate — scoped GO

固定head：`7565750791e493dc40859425039a3b7d08d6915b`；base main：`c5089d8934f0db1ec6cb04febf4d8d3e819ead81`。**0 P0 / 0 P1 / 0 P2；可用--merge集成exact head7565750。** 仅合并准入，不授权publication/tag/global升级或新模型调用。

## 当前远端 / merge关系

本轮只读GitHub GET确认PR60 open/non-draft、head/base如上、mergeable=true/clean；repo allow_merge_commit=true，main仍c5089d8，workflow418909498仍disabled_manually，57仍open。独立本地祖先检查通过；`git merge-tree --write-tree c508... 756...`无冲突，结果tree **`28fa5c51b2a7a37e65107c1d01ca3edc9cfc395d`**，等于fixed head tree。预测tree不是已合并main证据。

合并前重新读回main/base/head并绑定完整head（--match-head-commit）；若head/runtime/payload变化、main有外来delta或冲突则暂停必要复核。使用merge commit，保留分支及失败/候选证据，不squash/rebase/force-push或触发/恢复Actions。合并后readback PR merged/mergeCommit/actual-main/tree。

## 两个独立GO及证据一致性

- Runtime/restore/visual R1固定32588：0P0/P1/P2，报告SHA **133b5b009e67b5d9cebdf1ddda9bcf2ff03eb44109f5ae16725fa5c361cf842f**。四runtime文件extension/controller/live-tools/run-card从325到756完全无diff。之后仅Task2 docs/ref、76manifest/worker count/v2pin、额外empty-canvas/真实4-slot-owned replacement/独立capture路径及Check/evidence。未引入15e7109 proactive prompt、公共ID限制或其他feature。
- Candidate package/localCI R2固定cb89bc61d1632c7032c339483a8554e71938d010：0new/unresolvedP0/P1/P2，报告SHA **af073b2befc2b0c1105b8d8bcb1284b8e182c77ee02bd170b0e0cbbbfaf17617**。旧P2容量措辞已纠正，新card需要free slot/+6；matching-owned替换复用slot/实际旧count，4slot正控保留其他face。新archive **34e522c97202c6f1379fd8efcd7cc52ea707aa8857f99afe13d6e3a9c6c58812 /275205bytes/76files**；独立核public manifest的76个payload SHA与当前756文件全部匹配，v2pin一致。package reviewer另核实际tar、fresh normal local/Git@cb89全部76bytes及startup/skill/tool唯一性、0agent/model/owned cleanup。
- 独立核**13份raw log/report+1份offline receipt SHA全部一致**，cb89 tree与manifest一致；日志实得472Node/90lockedChromium1254/types成功，golden同clean identity61+7全pass=68/45positive23negative。public offline12started/37synthetic/0actualmodels/12success/6queue6static，defaultdry-run0credential/model；未把synthetic当真实模型分数。当前756相对cb89仅docs/evidence/lifecycle，不重标cb89full结果。
- v1profile和Check099与c508逐字节相同；原365report SHA **cf44a0be28c51652086c4bef24b86fbb135ef971f42aabd31b350ae972ef098b**未变，7/12不重算；real v2仍not-run/无预算。既有4high依赖baseline保留披露，没有新修复/零漏洞或风险waiver声明。原6a2/3fc档案及失败保持历史。

## 后续门槛

Root取得actual-main后，按新源执行全部既定Node24本地接受：fullnode/types/完整browser/strict same-source68union、publicdryrun/offline、prepack/76payload与normal owned Git/local消费者/skill+tool ownership、版本/指纹/日志；再经对应独立actual-main gate后关闭**57**。不能复用cb89标签称main已运行；已完成43/51/52/56不重开。Publication/tag/global upgrade仍另行GO，不能从本合并结论推导。

本轮只读源码diff/hash、既有报告/日志和GitHub状态；未跑suite/model/SDK consumer、读取真实auth/config、改source/index/HEAD或远端。Check109 SHA=`09576f0de76a4dc614394976f4640e501ec216f18f523b3a59db3695d807aa53`；manifest=`871a5a56d0833e1df52be88246e4dbd0930a77443a2353607845f2d147f05daa`；consumers=`c8a83a21144f6acbaad66622f3d00f5fce7e4f9d90136408275ae979fa5fcf87`。Check109中R2 follows是旧chronology，本轮已单独读核实际完成的R2，不篡改旧时点。

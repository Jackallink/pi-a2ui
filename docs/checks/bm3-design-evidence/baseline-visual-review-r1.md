# BM3 Mac advisory baseline visual admission — GO

固定 capture source：`8c1d35d422f382c5e924ac91ea26cf9a464824f9`。精确输入：`.local/bm3-layout/run-1794740802046-38334/` 下 search/audit/return PNG、report.json、baseline-proposal.json；指针为 `.local/bm3-design/capture-review-path.json`。

**0 P0 / 0 P1 / 0 P2；仅这3张图的视觉及来源准入 GO。** 可由 root 将下列原始字节人工复制至 proposal 声明的 Mac advisory baseline 路径，并记录人工 inspected=true；本评审没有复制图片、修改proposal或建立正常acceptance。

|图|实际视觉检查|SHA256|
|---|---|---|
|search|Search workspace、Query=example、Search按钮完整可读；无明显重叠/遮挡/裁切|`cd77a5640570390eac9b3dd9b83605228058eb78640d2b86410549adf9b13239`|
|audit|Audit results、空filter、两行src/example.ts/Illustrative finding与src/other.ts/Not executed，文件升序已恢复；File/Status/Back完整可见|`18cd56454e304fa3f272d690f0a2524e2a6695b93b411791b6fe35b745a3b323`|
|return|Search workspace恢复，Query空，Search完整可见，布局与首态一致|`a345ea497a50743ef96d548f740db9c96038b95f26c83bee98c1ad54038d76d2`|

独立使用view_image逐张查看原图。三图均为1280×900 PNG，无browser chrome、token/凭据或可识别用户内容；仅已声明synthetic示例文本。原页面Connected/Sent to Pi文案不是本评审对Pi/model执行的证明。

来源核对：raw PNG hash及IHDR尺寸与report/proposal逐一一致；report.identity与proposal.captureIdentity相同，source如上、dirty=false；mode=capture-only、accepted=false、proposal.inspected=false、baseline pending-inspection均符合此阶段，未将其误判为正常验收。三态revision1/2/3、同epoch；action记录为search(query example)/back({})的旧版本tuple。额外只读Node24 wrapper调用重算当前source/lock/fixtures/assets/oracle identity及3个environmentHash，全部匹配。HEAD始终固定、git status空；未运行浏览器/模型或重拍图片。

环境记录：Node24.18.1，darwin-arm64/osRelease24.6.0，Playwright1.65.0，Chromium158.0.8127.18/revision1254，1280×900、DPR1、light/en-US/UTC/reducedMotion。三态CDP字体记录相同：h1=.SF NS/.SFNS-Regular_wdth_opsz300000_GRAD_wght1F40000；.brand=.SF NS/.SFNS-Bold；Find-actions原生button=Arial/ArialMT，均non-custom。已核capture实现使用CSS.getPlatformFontsForNode（tests/visual/evidence.ts:51–65），未以fonts.check代替实际观测；此证据只覆盖声明样本文字，不是系统字体文件身份保证。环境hash=`f545c88d1cb6644432c703536e6e2a169cc64e4e46e14e4a45efb24b07cfd005`。

收据SHA256：report.json=`273a533fde25cb78ed00dfeb9830f6a41d80e5d98cd9b3cca4fe78610840aa5e`；baseline-proposal.json=`a3fde6a82b9100c5fab92accc3e794b7e4214ff6914ff1ae35da275c7b534b4b`。

后续仍须人工入库后的baseline完整性/失败canaries、完整code/workflow/pack独立审查与真实CI。本 GO 不代表pixel gate、全组件/a11y/其他OS保证、Pi/model、正常baseline acceptance、merge/release/issue closure。Linux仍按Spec017明确noncomparable，几何与交互另行硬门槛。

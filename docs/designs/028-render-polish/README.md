# #67 视觉设计与固定场景样张

候选方向：中性浅底、靛蓝强调、统一卡片/控件/数据层级。推荐先把现有组件做好，不迁移React/CopilotKit，不新增Catalog或样式参数。Canonical：[Spec028](../../specs/028-render-polish.md)，测试/范围见[Plan028](../../plans/028-render-polish.md)。当前是design preview，产品尚未实现。

打开[前后对照画廊](gallery.html)。每个场景可选desktop1280、tablet768、mobile360、640×450等效reflow，均有before/after。after=真实现有renderer＋本地候选CSS/Chart展示标记/数字单元格派生标记，不是产品候选包；before不注入样式。所有数据与快照逐对保持，不执行模型或业务动作。图片位于samples/，48张，共约4.4MiB，不进入产品包files。

| 场景 | 固定内容 | 提案关注点 |
| --- | --- | --- |
| RP01 | 四摘要＋2series line＋明细 | 信息层级、间距、legend/ticks、原始值表 |
| RP02 | 长中文/长路径＋number/boolean表 | 系统字体、控件、局部滚动、原始数值右对齐 |
| RP03 | 三必填空草稿＋本地错误 | 错误可读、蓝色主按钮白字、焦点与无业务POST |
| RP04 | readonly Diff＋固定Log＋命令展示 | 等宽、diff语义与日志密度，不冒充实际测试 |
| RP05 | 空/加载/错误、Details/Modal入口 | 状态不只靠颜色、未获取不冒充0 |
| RP06 | 多卡片＋固定输入草稿 | 窄屏堆叠、长标题/说明、样式切换不清草稿 |

所有fixture已由真实UiSession/同一compiler接纳（组件32/7/12/10/14/25）；Node24.18.1、Chromium158.0.8127.18，DPR1/zh-CN/Asia-Shanghai/light/reduced-motion。3宽度＋等效reflow共48图无body横向溢出，provider/action/dispatch均0。manifest绑定source与CSS/图片/fixture哈希和产品保全；每对server snapshotSHA相同。

640×450仅模拟1280×900在200%时的CSS可用空间，**不是实际桌面浏览器缩放验证**。当前截图只覆盖列明状态：动态patch、bar/空/负/4series、真正Modal打开、所有32类与键盘链路仍需实施后验证。contrast-pairs仅验证11组候选配色，不等于整页WCAG认证；geometry检查仅body overflow，不等于已通过全部遮挡/点击/焦点验收。旧BM3像素/frozen真实模型基线未重跑或覆盖。

## 样式事实与已纠正的设计探针问题

- SDK的adoptLightDomStyles已给Light DOM static styles按tag作用域化；style-audit.json可见table padding/Chart max-height已生效，不迁移root。
- 初始探针误写Text.variant=h2，当前Catalog只支持caption/body；这是fixture错误，未启动model，不是compiler缺陷或行为RED。标题用既有MarkdownView。
- capture首版有字符串转义setup错误；修复后遇到固定Log初始data flush让dataSequence0→1。独立小探针确认message/epoch未变；改成订阅并等待该fixture的真实一次flush完成后再建立snapshot基线，不忽略revision/sequence。
- 第一版主按钮子Text覆盖了on-accent颜色；视觉检查发现后增加按钮内继承约束与实际computed white断言，重新生成最终48图。失败/中间图保留在忽略的.local/render-polish-design/，不伪称产品行为RED。

## 重现（仅本地设计工具）

先在shell执行nvm use24并确认Node主版本。仓库依赖按现有lock安装；不更新SDK。运行：

```sh
node --import tsx docs/designs/028-render-polish/capture.mts
```

该工具只使用UiSession/startServer与headless Chromium，拦截所有非本地页面请求和业务POST；不导入Pi模型会话、不读用户凭据/真实provider配置。capture输出到忽略目录，不能直接当发布门禁或重写已审samples；重生成后先核source/fixture/CSS/环境与设计delta再评审。当前不提供任何付费执行命令。

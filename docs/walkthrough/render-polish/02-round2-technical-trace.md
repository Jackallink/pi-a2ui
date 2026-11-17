# Render polish · Round2

Canonical：Spec028。均为现有通路，不增加HTTP/RPC/存储。

## P-001：主题呈现

| 用户动作 | Handler | 状态 | API | 后端 | UI/响应后UI |
| --- | --- | --- | --- | --- | --- |
| 打开canvas | client.css、SDK adoptLightDomStyles | token继承；surface state不变 | 原GET assets/SSE | 原server资源/UiSession snapshot | 所有surface同主题、scope按组件；按真实computed style验证 |

## P-002：数据阅读与更新

| 用户动作 | Handler | 状态 | API | 后端 | UI/响应后UI |
| --- | --- | --- | --- | --- | --- |
| 看表/排序/图表 | table-elements、live-elements的既有render | sort/filter仍local；展示类型标记仅派生 | 原a2ui_update_chart与SSE data | 原validateSeries/identity，不改data | legend/刻度/表原值对齐，zero去重/empty无伪数据，窄屏局部滚动 |

## P-003：输入、错误与本地控件

| 用户动作 | Handler | 状态 | API | 后端 | UI/响应后UI |
| --- | --- | --- | --- | --- | --- |
| 空提交/填valid、Details/Modal/复制 | 原BrowserValidation/原组件handler，仅样式 | 草稿/aria/focus/inert不改 | invalid/local无POST；valid原/api/actions | 原校验、revision/epoch与dispatch | 错误可读/焦点返回、发送中/暂停不变；不能用CSS代替行为修复 |

## P-004：作者与实施交接

| 用户动作 | Handler | 状态 | API | 后端 | UI/响应后UI |
| --- | --- | --- | --- | --- | --- |
| 按需读skill/例子，用户手动启动Pi | SKILL索引/原helper/交接提示词 | 设计GO≠实现完成，Gate2先真实RED | 原example/check，不增props/命令或provider调用 | 原compiler/CI；kernel只读边界 | 可执行表达与边界清楚，零模型；本轮只交设计与样张 |

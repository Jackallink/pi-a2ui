# Helper调用适配 · Round3

Canonical：Spec026。以下均为测试意图。

## E2E / AC映射

| ID | 路径/AC | 必须验证 |
| --- | --- | --- |
| IT-001 / HAG01 | P-003 / AC-001 | default/help/execute/grant/import API/direct live之前SDK evaluation/config/workspace/provider均0；fake旧授权不能开启 |
| IT-002 / HAP01 | P-001 / AC-002 | quote-aware两种形式、op/NAME/ID/draft边界；单/双引号、spaces/中文、quoted &&不作运算符、错cwd/同名路径/扩展/后缀与空输入 |
| IT-003 / HAX01 | P-001 / AC-003 | direct/prefix实际argv+helper输出相同、真实Node24/cwd；quoted固定路径特殊字符安全；非法串无子进程/sentinel变更 |
| IT-004 / HAE01 | P-001,002 / AC-004 | usage/缺draft/真实INPUT与编译失败分开；timeout/无退出结果/注入fatal；raw/accepted/executed分层 |
| IT-005 / HAS01 | P-002 / AC-005 | 实际SDK两臂新HX01 synthetic，prefix example/check到真实helper与DOM；direct对照；safe error继续、policy stop不补行 |
| IT-006 / HAI01 | 全部 / AC-006 | 新ID仅offline、6/12/12/180/420贯穿、old模式不变、输入集完整、新固定source完整本地CI/strict union/独立GO，原档/产品/旧STOP hash不变 |

## 错误矩阵

| 条件 | 可观察结果 | 下一步 |
| --- | --- | --- |
| 已知只读参数usage/缺draft/INPUT | preparation_error，无伪造候选/查询成功 | 关本case、继续下一行 |
| 非法shell/program/helper/cwd/file/op/扩展 | tool_policy及安全reason code，无执行 | fatal、后续not_run |
| helper timeout/未知结果/请求协议/cleanup错 | fatal unknown或明确helper_unknown | 不退款、不重试、不补样本 |
| early live/未审新profile | SDK/setup/config/provider前拒绝 | 真调用授权0保持 |
| 先check compile错/语义错 | 分层firstCandidate失败 | 不自动修复；synthetic反例不是新模型质量样本 |
| 已收终态的空local aborted | 保留原known诊断 | 不反写toolUse/usage/UI；inflight仍fatal |
| batch剩余不足完整180s | 不启动下一行，not_run | 不压缩最后一臂窗口 |

Gate1/Gate2须独立明确GO后实施；缺模块/fixture失败不是RED。原policy仍拒绝prefix，新policy只接受已审有限形式。无开放技术定义；所有实际结果/bug/drift只在Check更新。风险与回退见Spec026，不回滚/重判旧付费行。零推理通过后方设计新真实场景/预算，实际授权仍0。

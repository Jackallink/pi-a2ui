# Plan024：首次表单编写的有限优化准入

Canonical：Spec024；本计划只定义目标/范围/依赖/关口，不记录实时执行进度。执行状态/准入记录只见Check120/121；计划本身不是模型调用或发布许可。

目标：让模型在决定使用画布后更容易找到现成模板、正确使用FormValidation ID并预检最终source。边界：既有工具入口文字、CLI notes、现有skill子文档；无新命令、模板文件、组件/内核/执行契约。

依赖：现有validated-form/helper/read-only compiler、Pi supplied skill path、Node24和本地CI；测试用既有受检0.1.10归档，仅供私有旧授权fixture，不作为新candidate发布包。真实模型预算0。

1. Gate1：Spec024三轮走查、AC与来源审计、独立设计GO及用户书面确认。任何改变execute/schema/权限/冻结结果的方案退回设计。
2. Gate2：AC-001/002指引语义独立审查；AC-003/004/005可执行recipe/负例/真实CLI→tool→DOM测试意图；AC-006/007保全/生成资产/完整集成。明确引导合同RED、已存在编译拒绝与setup失败的区别，再准入实施。
3. 最小修改：前置引导、现有FormValidation notes、现有SKILL与3份子文档，沿用validated-form并加标识正/反例；修改源码后用原build生成dist/assistant-cli.mjs。仅必要维护SMG07 owned fixture，使其校验固定发布payload而非变化candidate。不得为修测试弱化真实guard。
4. Gate3/4：相关窄检查→固定source全Node/type/四组browser/strict golden union→pack及owned正常加载/skill/helper发现零推理→独立代码/契约GO。记录source/tree/lock/SDK/browser/asset identity及raw。无模型率/成本改善结论。
5. 若后续要模型验证：另行提出候选、预算和stop规则，等新明确授权；唯一glm-5.3-flash/Node24。旧Spec023余量/授权不可复用；旧模型raw和冻结基线不动。版本/合并/发布/全局安装另过对应门槛。

回退：用版本控制撤销这一个引导slice及生成helper，不恢复旧grant，不改用户文件或会话。没有新的通用框架/抽象/认证状态。

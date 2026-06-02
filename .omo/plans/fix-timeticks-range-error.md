# 修复分镜预览时间线 RangeError

## TL;DR

> **Quick Summary**: 修复 `timeTicks` 计算属性在 `totalDuration` 为 0 时的无限循环 bug
> 
> **Deliverables**:
> - `src/views/storyboard/preview/index.vue` — 修复 `timeTicks` 计算属性
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - 1 task
> **Critical Path**: Task 1

---

## Context

### Original Request
分镜预览中点击时间线报错：`RangeError: Invalid array length`

### Root Cause
`timeTicks` 计算属性中，当 `totalDuration.value` 为 0 时：
- `Math.ceil(0 / 10)` 返回 0
- `step` 为 0
- 循环 `for (let i = 0; i <= 0; i += 0)` 永远不递增
- 无限调用 `ticks.push(i)` 导致数组长度溢出

---

## Work Objectives

### Core Objective
修复 `timeTicks` 计算属性的边界情况处理

### Must Have
- 当 `totalDuration` 为 0 时返回 `[0]` 而不是进入无限循环
- 当 `step` 计算为 0 时使用 `Math.max(1, ...)` 保护

### Must NOT Have
- 不修改其他逻辑
- 不修改模板结构

---

## TODOs

- [ ] 1. 修复 timeTicks 计算属性

  **What to do**:
  - 在 `timeTicks` 计算属性开头添加边界检查：`if (totalDuration.value <= 0) return [0]`
  - 将 `step` 计算改为 `Math.max(1, Math.ceil(totalDuration.value / 10))` 防止 step 为 0

  **Must NOT do**:
  - 不修改其他计算属性
  - 不修改模板

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/views/storyboard/preview/index.vue:600-607` — timeTicks 计算属性

  **Acceptance Criteria**:
  - [ ] 当 filteredShotList 为空时，timeTicks 返回 `[0]`
  - [ ] 当 totalDuration > 0 时，timeTicks 正常生成时间刻度
  - [ ] 不再出现 RangeError: Invalid array length

  **Commit**: YES
  - Message: `fix(storyboard): prevent infinite loop in timeTicks when totalDuration is 0`
  - Files: `src/views/storyboard/preview/index.vue`

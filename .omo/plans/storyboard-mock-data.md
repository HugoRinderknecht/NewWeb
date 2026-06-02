# 分镜管理模块 - 模拟数据补充

## TL;DR

> **Quick Summary**: 为分镜预览页面添加 ShotItem 模拟数据（≥15条），扩充场景编排页面的 SceneItem 数据（≥10条），确保所有视图模式正常渲染。
> 
> **Deliverables**:
> - `preview/index.vue` — 新增 `mockShotData` 数组 + loadShotList 回退逻辑
> - `scene/index.vue` — 扩充 `mockSceneData` 新增 ≥3 条场景
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 2 tasks in 1 wave
> **Critical Path**: Task 1 & Task 2 (独立并行)

---

## Context

### Original Request
为分镜管理模块中的分镜预览和场景编排功能添加模拟数据。

### Interview Summary
**Key Discussions**:
- 场景编排页面已有7条模拟数据，需要扩充数据量覆盖所有分镜
- 分镜预览页面 shotList 为空，需要添加 ShotItem 模拟数据
- 两个页面都需要补充/修改

**Research Findings**:
- preview/index.vue 的 `loadShotList()` 调用 `fetchGetStoryboardList` API，失败时 shotList 为空
- API 返回类型 `StoryboardListItem` 与组件使用的 `ShotItem` 接口不一致（缺少 transition/cameraPosition/movements 等字段）
- scene/index.vue 现有7条数据分布不均：SB-001/002 各2条，SB-003/004/005 各1条
- shotOptions 共8个镜头名称供场景引用

### Metis Review
**Identified Gaps** (addressed):
- API 类型与组件类型不匹配 → 模拟数据直接使用 ShotItem 类型，绕过 API
- 场景数据分布不均 → 扩充 SB-003/004/005 的场景数据
- shotOptions 与 shotList 镜头名称需保持一致 → 使用 shotOptions 中的名称作为参考
- 时间线视图 totalDuration 为0时的边界情况 → 已有 Math.max(1,...) 保护

---

## Work Objectives

### Core Objective
为分镜预览和场景编排页面提供完整的模拟数据，使所有视图模式（故事板/幻灯片/时间线）和交互功能（拖拽/批量编辑）正常展示。

### Concrete Deliverables
- `src/views/storyboard/preview/index.vue` — 包含 mockShotData 数组（≥15条，覆盖5个分镜）
- `src/views/storyboard/scene/index.vue` — mockSceneData 扩充至 ≥10 条

### Definition of Done
- [ ] 分镜预览页面三个视图模式均有内容展示
- [ ] 场景编排页面每个分镜至少有1条场景数据
- [ ] 所有 ShotType 和 TransitionType 值至少出现一次

### Must Have
- mockShotData 覆盖所有5个分镜 ID (1-5)，每个分镜 ≥3 条镜头
- mockSceneData 新增 ≥3 条场景，覆盖 SB-003/004/005
- 所有 mock 条目包含完整的接口字段（无遗漏）
- loadShotList 失败时回退使用 mockShotData

### Must NOT Have (Guardrails)
- 不修改 `ShotItem`、`SceneItem` 等接口定义
- 不修改 API 层 (`src/api/storyboard.ts`)
- 不修改 `design/index.vue` 或 `batch-edit/index.vue`
- 不删除现有的7条 mockSceneData
- 不新增 ShotType 或 TransitionType 枚举值
- 不修改模板结构，只添加数据

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: N/A（纯数据添加，无逻辑变更）
- **Automated tests**: None
- **Framework**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, verify cards render, switch storyboards
- **Data Verification**: Use grep — Check field coverage completeness

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 2 parallel tasks):
├── Task 1: 分镜预览 mockShotData 添加 [quick]
└── Task 2: 场景编排 mockSceneData 扩充 [quick]

Wave FINAL (After ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | None | F1-F4 |
| 2 | None | F1-F4 |
| F1-F4 | 1, 2 | User okay |

### Agent Dispatch Summary

- **Wave 1**: **2 tasks** — T1 → `quick`, T2 → `quick`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. 分镜预览 — 添加 mockShotData 模拟数据

  **What to do**:
  - 在 `preview/index.vue` 的 `<script setup>` 中（`shotList` 声明之后），添加 `mockShotData: ShotItem[]` 数组
  - 包含 ≥15 条 ShotItem 记录，覆盖所有5个分镜 ID (1-5)，每个分镜 ≥3 条
  - 使用所有6种 ShotType：`closeup`, `medium`, `long`, `full`, `extreme_closeup`, `over_shoulder`
  - 使用所有7种 TransitionType：`cut`, `fade`, `dissolve`, `wipe`, `slide`, `zoom`, `none`
  - 焦距范围：14mm ~ 200mm，时长范围：2s ~ 10s
  - 至少1条 shot 的 `movements` 为空数组（测试 `'无'` 回退路径）
  - `thumbnail` 字段使用空字符串 `''`（测试占位符渲染路径）
  - 修改 `loadShotList()` 函数：在 catch 块中使用 `mockShotData` 作为回退（替代空数组）

  **Must NOT do**:
  - 不修改 ShotItem 接口定义
  - 不修改 API 层 fetchGetStoryboardList
  - 不修改模板结构
  - 不新增 ShotType 或 TransitionType 枚举值

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯数据添加，无复杂逻辑
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/views/storyboard/scene/index.vue:363-462` — mockSceneData 数据结构参考，字段组织方式
  - `src/views/storyboard/preview/index.vue:317-323` — storyboardOptions 的 ID/编码映射

  **API/Type References**:
  - `src/views/storyboard/preview/index.vue:294-307` — ShotItem 接口定义（所有必填字段）
  - `src/views/storyboard/preview/index.vue:283-286` — ShotType/TransitionType 类型定义
  - `src/views/storyboard/preview/index.vue:325-351` — shotTypeTagMap/shotTypeLabelMap/transitionLabelMap 键值参考

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 数据完整性验证
    Tool: Bash (grep)
    Steps:
      1. grep -c "storyboardId:" src/views/storyboard/preview/index.vue — 验证总数 ≥15
      2. grep "storyboardId: 1" | wc -l — 验证 SB-001 ≥3 条
      3. grep "storyboardId: 2" | wc -l — 验证 SB-002 ≥3 条
      4. grep "storyboardId: 3" | wc -l — 验证 SB-003 ≥3 条
      5. grep "storyboardId: 4" | wc -l — 验证 SB-004 ≥3 条
      6. grep "storyboardId: 5" | wc -l — 验证 SB-005 ≥3 条
    Expected Result: 总数 ≥15，每个分镜 ≥3 条
    Evidence: .omo/evidence/task-1-data-completeness.txt

  Scenario: 类型覆盖验证
    Tool: Bash (grep)
    Steps:
      1. 检查 mockShotData 中包含所有6种 type 值
      2. 检查 mockShotData 中包含所有7种 transition 值
    Expected Result: 6种 ShotType + 7种 TransitionType 全部覆盖
    Evidence: .omo/evidence/task-1-type-coverage.txt

  Scenario: loadShotList 回退逻辑验证
    Tool: Bash (grep)
    Steps:
      1. grep "mockShotData" src/views/storyboard/preview/index.vue — 验证在 loadShotList 中被引用
      2. 检查 catch 块中 shotList.value = mockShotData（而非空数组）
    Expected Result: loadShotList 失败时使用 mockShotData
    Evidence: .omo/evidence/task-1-fallback-logic.txt
  ```

  **Commit**: YES (groups with 2)
  - Message: `feat(storyboard): add mock data for preview and scene pages`
  - Files: `src/views/storyboard/preview/index.vue`

- [x] 2. 场景编排 — 扩充 mockSceneData 数据量

  **What to do**:
  - 在 `scene/index.vue` 的 `mockSceneData` 数组中新增 ≥3 条 SceneItem 记录
  - 新增记录覆盖 SB-003（对话·寻药之旅）、SB-004（昆仑仙境）、SB-005（白泽授业）
  - 使用所有4种 SceneType：`interior`, `exterior`, `mixed`, `studio`
  - `shots[]` 字段引用现有 `shotOptions` 中的镜头名称（山巅全景/主角面部特写/山腰近景/九尾狐全景/对话过肩/竹林远景/战斗场面/日出特写）
  - 保持现有7条数据不变，只追加新数据
  - 目标总数 ≥10 条

  **Must NOT do**:
  - 不删除或修改现有的7条 mockSceneData
  - 不修改 SceneItem 接口定义
  - 不修改 shotOptions 数组
  - 不修改模板结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯数据追加，无复杂逻辑
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/views/storyboard/scene/index.vue:363-462` — 现有 mockSceneData 完整数据（遵循相同结构）

  **API/Type References**:
  - `src/views/storyboard/scene/index.vue:267-280` — SceneItem 接口定义（所有必填字段）
  - `src/views/storyboard/scene/index.vue:259` — SceneType 类型定义
  - `src/views/storyboard/scene/index.vue:326-335` — shotOptions 镜头名称列表

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 数据量验证
    Tool: Bash (grep)
    Steps:
      1. grep -c "id:" 在 mockSceneData 区域 — 验证总数 ≥10
      2. 检查新增数据的 storyboardId 覆盖 3, 4, 5
    Expected Result: 总数 ≥10，SB-003/004/005 各有 ≥1 条新场景
    Evidence: .omo/evidence/task-2-data-volume.txt

  Scenario: 字段完整性验证
    Tool: Bash (grep)
    Steps:
      1. 检查新增条目包含所有 SceneItem 字段：id, storyboardId, name, type, background, time, mood, description, shots, aperture, iso, colorTemp
    Expected Result: 无遗漏字段
    Evidence: .omo/evidence/task-2-field-completeness.txt

  Scenario: shotOptions 引用一致性
    Tool: Bash (grep)
    Steps:
      1. 提取新增场景的 shots[] 值
      2. 对照 shotOptions 数组验证每个引用值都存在
    Expected Result: 所有 shots 引用值均在 shotOptions 中
    Evidence: .omo/evidence/task-2-shot-references.txt
  ```

  **Commit**: YES (groups with 1)
  - Message: `feat(storyboard): add mock data for preview and scene pages`
  - Files: `src/views/storyboard/scene/index.vue`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Review all changed files for: missing fields, type errors, duplicate IDs, inconsistent data. Check that all mock entries have complete ShotItem/SceneItem fields. Verify no API/type definitions were modified.
  Output: `Data Integrity [PASS/FAIL] | Field Coverage [PASS/FAIL] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Navigate to `/storyboard/preview`. Verify cards render. Switch between all 5 storyboards. Test all 3 view modes. Navigate to `/storyboard/scene`. Verify expanded scene list. Test drag-and-drop.
  Output: `Scenarios [N/N pass] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify nothing beyond scope was built. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `feat(storyboard): add mock data for preview and scene pages` - preview/index.vue, scene/index.vue

---

## Success Criteria

### Final Checklist
- [ ] preview/index.vue 包含 ≥15 条 mockShotData
- [ ] scene/index.vue 包含 ≥10 条 mockSceneData
- [ ] 所有5个分镜 ID 在 mockShotData 中有覆盖
- [ ] 所有6种 ShotType 至少出现一次
- [ ] 所有7种 TransitionType 至少出现一次
- [ ] 所有4种 SceneType 至少出现一次
- [ ] 分镜预览页面三个视图模式正常渲染
- [ ] 场景编排页面拖拽和批量编辑功能正常

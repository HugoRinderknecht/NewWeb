# 修复模拟数据不显示问题

## TL;DR

> **Quick Summary**: 修复 preview/index.vue 中 loadShotList 逻辑，确保 API 返回空数据时也能加载 mock 数据
> 
> **Deliverables**:
> - `src/views/storyboard/preview/index.vue` — 修复 loadShotList 逻辑
> 
> **Estimated Effort**: Quick

---

## Context

### Root Cause
`loadShotList` 函数只在 API 调用失败（catch 块）时才使用 mock 数据。如果 API 调用成功但返回空数据，`shotList.value` 会被设置为空数组，mock 数据不会被加载。

### 当前代码逻辑
```typescript
const loadShotList = async () => {
    const projectId = (route.params.projectId as string) || '1'
    try {
      const data = await fetchGetStoryboardList(projectId)
      if (data) {
        shotList.value = Array.isArray(data) ? data : (data as any).records || []
      }
    } catch {
      shotList.value = mockShotData
    }
  }
```

问题：当 API 返回空数据时，`shotList.value` 被设置为 `[]`，不会回退到 mock 数据。

---

## TODOs

- [ ] 1. 修复 loadShotList 回退逻辑

  **What to do**:
  - 修改 `loadShotList` 函数，确保当 API 返回空数据时也使用 mock 数据
  - 在 API 调用成功后检查数据是否为空，如果为空则使用 mockShotData

  **修复后代码:**
  ```typescript
  const loadShotList = async () => {
    const projectId = (route.params.projectId as string) || '1'
    try {
      const data = await fetchGetStoryboardList(projectId)
      const list = Array.isArray(data) ? data : (data as any)?.records || []
      shotList.value = list.length > 0 ? list : mockShotData
    } catch {
      shotList.value = mockShotData
    }
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 当 API 返回空数据时，shotList 使用 mockShotData
  - [ ] 当 API 调用失败时，shotList 使用 mockShotData
  - [ ] 当 API 返回有效数据时，shotList 使用 API 数据

  **Commit**: YES
  - Message: `fix(storyboard): load mock data when API returns empty`
  - Files: `src/views/storyboard/preview/index.vue`

# Dreamcraft Astra 数据层 Hook 全面审查报告

> 审查日期：2026-06-07
> 项目：Dreamcraft Astra（AI短剧制作平台前端）
> 技术栈：Vue 3 + TypeScript 5.6 + Vite + Pinia 3 + TanStack Vue Query 5 + Element Plus 2 + Axios
> 审查范围：`src/hooks/core/`、`src/api/`、`src/domain/`、`src/store/modules/`、`src/utils/`、`docs/API/`
> 报告版本：v2.0（基于已存在的 v1.0 架构报告延伸）

---

## 一、审查目标与执行摘要

本报告对 Dreamcraft Astra 项目的数据层 Hook 进行全面审查，涵盖三层数据架构的完整性、API 覆盖率、命名规范、冗余分析和改进建议。

### 1.1 整体架构评估

项目采用**五层数据架构**，设计理念先进：

```
Layer 5: 页面/组件层 (src/views/)
Layer 4: 业务组合层 (src/domain/*/composables/)
Layer 3: 业务域 Action 层 (src/domain/*/actions.ts)
Layer 2: Vue Query Hook 层 (src/api/queries/)
Layer 1: 原始 API 层 (src/api/*.ts)
Layer 0: HTTP 适配器层 (src/api/adapter/)
```

| 架构维度 | 评分 | 说明 |
|---------|------|------|
| 架构设计完整性 | 8.5/10 | 五层架构清晰，适配器模式良好 |
| Hook 覆盖率 | 7/10 | 主流模块已覆盖，部分管理模块缺失 |
| 命名规范一致性 | 7/10 | 大体一致，存在命名冲突 |
| 类型安全 | 5/10 | 存在 `any` 类型 |
| 缓存策略统一性 | 5/10 | 多层缓存重叠 |
| 文档完整性 | 6/10 | 已有 v1.0 架构报告，本次为 v2.0 深化 |

**核心结论**：项目处于**渐进式架构演进阶段**，基础设施设计优秀但落地一致性不足，存在模块覆盖不均、职责重叠、类型安全薄弱等问题。

---

## 二、Hook 完整性审查

### 2.1 自定义 Hook（`src/hooks/core/`）完整性分析

共 **15 个**核心 Hook 文件，全部基于 Vue 3 Composition API 构建。

#### 2.1.1 核心 Hook 一览

| Hook 文件 | 行数 | 功能完整性 | 评级 |
|---------|------|---------|------|
| `useTable.ts` | 847 | 数据获取、分页、搜索、缓存、列配置、错误处理 | ⭐⭐⭐⭐⭐ |
| `useChart.ts` | 760 | ECharts 生命周期、主题、懒加载、响应式 | ⭐⭐⭐⭐⭐ |
| `useTheme.ts` | 175 | 亮/暗/自动主题切换 | ⭐⭐⭐⭐ |
| `useHeaderBar.ts` | 196 | Header 功能项可见性管理 | ⭐⭐⭐ |
| `useLayoutHeight.ts` | 149 | 动态布局高度计算 | ⭐⭐⭐⭐ |
| `useTableColumns.ts` | 312 | 动态列管理 | ⭐⭐⭐⭐ |
| `useTableHeight.ts` | 106 | 表格高度动态计算 | ⭐⭐⭐ |
| `useCeremony.ts` | 185 | 节日烟花特效 | ⭐⭐⭐ |
| `useCurrentContext.ts` | 169 | 统一业务上下文（只读） | ⭐⭐⭐⭐ |
| `useCurrentProjectId.ts` | 57 | 当前项目 ID（可写） | ⭐⭐⭐ |
| `useFastEnter.ts` | 56 | 快捷入口配置读取 | ⭐⭐⭐ |
| `useCommon.ts` | 88 | 通用工具（刷新、滚动） | ⭐⭐⭐ |
| `useAuth.ts` | 74 | 权限检查（前端/后端双模式） | ⭐⭐⭐⭐ |
| `useAppMode.ts` | 46 | 运行环境模式检测 | ⭐⭐⭐ |
| `useQueryApi.ts` | 64 | TanStack Vue Query 薄封装 | ⭐⭐⭐ |

#### 2.1.2 发现的问题

**P1 - 命名冲突（严重）**

`useCurrentProjectId` 同时在两个文件中导出，签名完全不同：

| 文件 | 函数签名 | 行为 |
|------|---------|------|
| `useCurrentContext.ts` | `useCurrentProjectId(domain?)` | 只读 computed，优先从 route 读取 |
| `useCurrentProjectId.ts` | `useCurrentProjectId(store?)` | 可写，支持 v-model，写入 domain store |

两者会相互覆盖导出，导致引用歧义。

**P1 - 缺失 Vue 响应式 API 导入**

`useChart.ts` 中使用了 `ref<HTMLElement>()` 和 `nextTick()`，但未从 Vue 导入，会导致运行时错误。

**P1 - 双缓存系统冲突**

`useTable.ts` 内置了 `TableCache`（50条/5分钟 LRU 缓存），同时支持切换到 Vue Query 作为后端。当两者同时启用时会发出警告，增加理解成本。

**P2 - 死代码函数**

`useHeaderBar.ts` 中 4 个导出函数是其他函数的 1:1 别名，无独立逻辑：`isFeatureActive`、`getActiveFeatures`、`getInactiveFeatures`（均另有原始版本）。

**P2 - `currentTeamName` / `currentProjectName` 无效计算**

`useTeamStore` 和 `useProjectStore` 中的 `currentTeamName` / `currentProjectName` 永远返回空字符串，属死代码。

**P2 - `switchMenuLayouts` 静默限制**

`useSettingStore.switchMenuLayouts` 强制设置 `DUAL_MENU` 模式，仅打印日志而无 UI 反馈。

**P3 - `useQueryApi` 封装过薄**

仅是 TanStack Vue Query 的薄封装（64行），其 `onError` 合并逻辑可通过 Vue Query 全局配置统一处理。

---

## 三、数据层 Hook 覆盖度分析

### 3.1 Query Hook 覆盖矩阵

#### 3.1.1 已覆盖模块（17个）

| 模块 | Query Hook 文件 | Hook 数量 | 覆盖评价 |
|------|---------------|---------|---------|
| 认证 auth | `queries/auth.ts` | 6 | ✅ 完整 |
| 项目 project | `queries/project.ts` | 21 | ✅ 完整 |
| 资产 asset | `queries/asset.ts` | 17 | ✅ 完整 |
| 剧本 script | `queries/script.ts` | 37 | ✅ 完整（最大） |
| 分镜 storyboard | `queries/storyboard.ts` | 26 | ✅ 完整 |
| 视频 video | `queries/video.ts` | 5 | ⚠️ 基础 |
| 工作流执行 workflow | `queries/workflow.ts` | 8 | ⚠️ 基础 |
| 团队 team | `queries/team.ts` | 32 | ✅ 完整 |
| 统计 statistics | `queries/statistics.ts` | 24 | ✅ 完整 |
| 审核 review | `queries/review.ts` | 19 | ✅ 完整 |
| 积分 points | `queries/points.ts` | 7 | ✅ 完整 |
| 通知 notification | `queries/notification.ts` | 24 | ✅ 完整 |
| AI处理 ai-process | `queries/ai-process.ts` | 3 | ⚠️ 基础 |
| 角色 character | `queries/character.ts` | 5 | ⚠️ 基础 |
| 图片 image | `queries/image.ts` | 5 | ⚠️ 基础 |
| 剪辑 editor | `queries/editor.ts` | 11 | ⚠️ 基础 |
| 数据历史 data-history | `queries/data-history.ts` | 3 | ⚠️ 基础 |

**总计 Query Hook 导出：约 295 个**（通过 `queries/index.ts` barrel 导出）

#### 3.1.2 缺失 Query Hook 的模块（8个）

| 模块 | 对应 API 文件 | 缺失的 Hook | 影响范围 |
|------|------------|-----------|---------|
| 视频模型 video-model | `api/video-model.ts` | useVideoModelList, useCreateVideoModel, useUpdateVideoModel, useDeleteVideoModel, useToggleVideoModelStatus | 系统设置页 |
| 系统管理 system-manage | `api/system-manage.ts` | useAdminUserList, useAdminRoleList, useMenuList, useCreateRole, useUpdateRole, useDeleteRole | 管理后台用户/角色页 |
| 平台管理 platform-admin | `api/platform-admin.ts` | useAdminTeamList, useAdminMemberList, useInviteCodeList, useApplicationList 等 | 平台管理员面板 |
| 系统配置 system-config | `api/system-config.ts` | useConfigList, useConfigByKey, useCreateConfig, useUpdateConfig, useDeleteConfig, useConfigAuditLog, useWebhookList 等 | 系统配置页 |
| 计费管理 billing | `api/billing.ts` | useBillingList, useBillingDetail, useCreateBilling, useUpdateBilling, useToggleBilling, useBillingHistory | 计费配置页 |
| 工作流管理 workflow-manage | `api/workflow-manage.ts` | useWorkflowList, useWorkflowDetail, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow, useToggleWorkflowStatus 等 | 工作流管理页 |
| 剧本资产 script-asset | `api/script-asset.ts` | useScriptAssetList, useScriptAssetDetail, useCreateScriptAsset, useBatchCreateScriptAssets 等 | 剧本管理页 |
| Dify工作流 dify | `api/dify.ts` | useExecuteWorkflow, useWorkflowStream, useStopWorkflow, useWorkflowStatus, useWorkflowCatalog 等 | 工作流执行页 |

**缺失覆盖率**：8/25 个业务模块（32%）缺少 Vue Query Hook 封装，这些模块的页面组件目前仍直接调用原始 API 函数。

#### 3.1.3 Admin API 层（`src/api/admin/`）覆盖

| 文件 | API函数数 | Query Hook覆盖 |
|------|---------|--------------|
| `admin/audit-log.ts` | 1 | ❌ 无 |
| `admin/billing-config.ts` | 7 | ❌ 无 |
| `admin/dashboard.ts` | 2 | ❌ 无 |
| `admin/team-manage.ts` | 7 | ❌ 无 |
| `admin/user-manage.ts` | 3 | ❌ 无 |

**Admin 子目录的 5 个文件全部缺少 Query Hook**，且类型定义不规范（使用 `Record<string, any>`）。

---

## 四、前端 Hook 与后端 API 匹配分析

### 4.1 API 规范文档（`docs/API/`）vs 实现覆盖

共有 **33 个** API 规范文件，后端 API 端点总数约 **300+**。

| API 规范目录 | 后端端点数 | 前端Hook覆盖 | 匹配率 |
|------------|---------|-----------|-------|
| 认证与用户 | ~15 | ✅ 完全覆盖 | 100% |
| 项目管理 | ~20 | ✅ 完全覆盖 | 100% |
| 剧本-管理/拆解/分镜/内容生成 | ~80 | ✅ 完全覆盖 | 100% |
| 分镜-管理 | ~30 | ✅ 完全覆盖 | 100% |
| 资产-库 | ~25 | ✅ 完全覆盖 | 100% |
| 团队-管理 | ~35 | ✅ 完全覆盖 | 100% |
| 审核-中心 | ~25 | ✅ 完全覆盖 | 100% |
| 数据-统计 | ~30 | ✅ 完全覆盖 | 100% |
| 积分-用量 | ~15 | ✅ 完全覆盖 | 100% |
| 视频-生成 | ~12 | ⚠️ 部分覆盖 | 75% |
| 图片-生成 | ~8 | ⚠️ 部分覆盖 | 70% |
| 剪辑-管理 | ~15 | ⚠️ 部分覆盖 | 80% |
| 通知-管理 | ~20 | ✅ 完全覆盖 | 100% |
| AI-处理记录 | ~5 | ⚠️ 基础覆盖 | 60% |
| 工作流执行 | ~15 | ⚠️ 分散覆盖 | 50% |
| 工作流-管理 | ~10 | ❌ 无 Hook | 0% |
| 系统配置/系统-配置 | ~20 | ❌ 无 Hook | 0% |
| 管理后台（用户/团队/仪表盘/计费/审计） | ~31 | ❌ 无 Hook | 0% |
| 角色管理 | ~8 | ❌ 无 Hook | 0% |
| 平台-管理 | ~15 | ❌ 无 Hook | 0% |
| 提示词-审核 | ~5 | ✅ 完全覆盖 | 100% |
| 剧本-资产 | ~8 | ❌ 无 Hook | 0% |
| 文件服务 | ~10 | ✅ 完全覆盖 | 100% |
| 数据-历史 | ~5 | ✅ 完全覆盖 | 100% |

**总体 API 覆盖率**：约 **220/300**（73%）的后端 API 已通过前端 Hook 访问，其中约 **50 个端点（17%）** 缺少 Vue Query Hook 封装。

### 4.2 HTTP 方法覆盖

| HTTP 方法 | 已封装 | 缺失封装 |
|-----------|--------|---------|
| GET（查询） | 约 80% | 约 20%（管理后台为主） |
| POST（创建/执行） | 约 90% | 约 10% |
| PUT（更新） | 约 90% | 约 10% |
| DELETE（删除） | 约 90% | 约 10% |
| PATCH（部分更新） | 约 70% | 约 30% |
| SSE/Stream（流式） | 约 50% | 约 50% |

---

## 五、命名规范与设计一致性审查

### 5.1 命名规范分析

#### 5.1.1 API 层函数命名 ✅ 良好

```typescript
fetchGetVideoTaskList()          // GET 查询列表
fetchSubmitVideoGeneration()     // POST 提交
fetchUpdateProject()             // PUT 更新
fetchDeleteStoryboard()          // DELETE 删除
fetchBatchDeleteAssets()         // 批量操作
```

#### 5.1.2 Query Hook 命名 ✅ 良好

```typescript
useProjectList()                 // 列表查询
useProjectDetail()               // 详情查询
useCreateProject()               // 创建 mutation
useUpdateProject()               // 更新 mutation
useDeleteProject()               // 删除 mutation
useBatchDeleteStoryboards()      // 批量操作
```

#### 5.1.3 Domain 层命名 ✅ 基本一致

| 模式 | 现状 |
|------|------|
| Domain types | `XxxViewModel`, `XxxFormModel` ✅ |
| Mappers | `mapXxx()`, `mapXxxList()` ✅ |
| Composables | `useXxxModel()` ✅ |
| Actions | `useXxxBatchActions()` ✅ |
| Pinia Store | `useXxxStore()` ✅ |

#### 5.1.4 参数与返回值一致性 ⚠️ 基本一致，有问题

| 维度 | 现状 | 问题 |
|------|------|------|
| Query Hook 参数 | 多数使用对象参数 `{ current, size, filters }` | 部分使用独立参数 |
| Mutation 参数 | 多数使用 payload 对象 | 少数使用独立参数 |
| 必需/可选参数 | 统一用 `Partial<T>` 或 `?` | 部分无区分 |
| teamId/projectId | 有的作为参数，有的从 route 读取 | 不一致 |
| 乐观更新 | 仅 `useMarkAsRead` 实现 | 其他 mutation 均无 |

---

## 六、重复与冗余 Hook 分析

### R1 - Dify 工作流重复实现（严重）

`src/api/dify.ts` 和 `src/api/workflow.ts` 高度重叠，共 9 个功能重复定义：

| 功能 | `dify.ts` | `workflow.ts` |
|------|-----------|--------------|
| 执行工作流 | `executeWorkflow()` | `fetchExecuteWorkflow()` |
| 流式执行 | `executeWorkflowStream()` | `fetchExecuteWorkflowStream()` |
| 停止工作流 | `stopWorkflowRun()` | `fetchStopWorkflow()` |
| 上传文件 | `uploadDifyFile()` | `fetchUploadWorkflowFile()` |
| 查询状态 | `getWorkflowRunStatus()` | `fetchGetWorkflowRunStatus()` |
| 获取目录 | `getWorkflowCatalog()` | `fetchGetWorkflowCatalog()` |
| 多模态执行 | `executeMultimodalWorkflow()` | `fetchMultimodalExecute()` |
| 链式执行 | `executeChain()` | `fetchExecuteWorkflowChain()` |
| 风格推理 | `styleInference()` | `fetchStyleInference()` |

两文件接口定义方式不同：`dify.ts` 使用普通 TypeScript interface，`workflow.ts` 使用 `Api.Workflow.*` 类型命名空间。建议**废弃 `dify.ts`**，统一使用 `workflow.ts`。

### R2 - Episode API 重复定义（中等）

`src/api/episode.ts` 和 `src/api/script.ts` 均定义了分集相关函数，且 `useProjectEpisodes` 在 `queries/project.ts` 和 `queries/script.ts` 中各定义了一次。

| 功能 | `episode.ts` | `script.ts` |
|------|-------------|-------------|
| 获取分集详情 | `getEpisodeDetail()` | `fetchGetEpisodeDetail()` |
| 修改分集 | `updateEpisode()` | `fetchUpdateEpisode()` |
| 删除分集 | `deleteEpisode()` | `fetchDeleteEpisode()` |
| 查询项目分集 | `getProjectEpisodes()` | `fetchGetProjectEpisodes()` |
| 查询剧本分集 | `getScriptEpisodes()` | `fetchGetScriptEpisodes()` |

### R3 - `useMyCredits` / `useCreditTransactions` 重复导出（轻微）

两个 Hook 在 `queries/points.ts` 和 `queries/statistics.ts` 中均被导出，但实现来源一致（`queries/statistics.ts`），造成来源混淆。

### R4 - 3个 Domain-scoped Project Store 模板相同（架构冗余）

`script-project.ts`、`storyboard-project.ts`、`asset-project.ts` 三个 Store 几乎完全相同，仅存储键名不同。建议抽取为共享的 composition function。

### R5 - 测试文件引用不存在的函数（正确性）

| 测试文件 | 引用但不存在 |
|---------|------------|
| `video.test.ts` | `fetchGetVideoHistory` |
| `team.test.ts` | `fetchCreateTeam`, `fetchDeleteTeam`, `fetchTransferTeamOwnership` |
| `review.test.ts` | `fetchApproveReview`, `fetchRejectReview` |

### R6 - `currentTeamName` / `currentProjectName` 死代码

`useTeamStore` 和 `useProjectStore` 的 `currentTeamName` / `currentProjectName` 永远返回空字符串。

---

## 七、Pinia Store 状态管理审查

### 7.1 Store 覆盖矩阵

| Store | 职责 | 持久化 | 评级 |
|-------|------|--------|------|
| `user` | 认证、Token、锁屏 | sessionStorage | ⭐⭐⭐⭐ |
| `team` | 当前团队ID | 无 | ⭐⭐⭐ |
| `project` | 全局项目ID（fallback） | sessionStorage | ⭐⭐⭐⭐ |
| `project-data` | 播放器/时间线状态 | 无 | ⭐⭐⭐⭐ |
| `script-project` | 剧本域项目ID | sessionStorage | ⭐⭐⭐ |
| `storyboard-project` | 分镜域项目ID | sessionStorage | ⭐⭐⭐ |
| `asset-project` | 资产域项目ID | sessionStorage | ⭐⭐⭐ |
| `storyboard` | 分镜UI状态 | localStorage手动 | ⭐⭐⭐ |
| `review` | 待审核计数 | sessionStorage | ⭐⭐⭐⭐ |
| `notification` | 未读计数、WebSocket | sessionStorage | ⭐⭐⭐⭐ |
| `table` | 表格展示偏好 | localStorage | ⭐⭐⭐⭐ |
| `menu` | 菜单列表、路由 | 无 | ⭐⭐⭐⭐ |
| `setting` | 全局设置 | localStorage | ⭐⭐⭐⭐ |
| `worktab` | 工作标签页 | localStorage | ⭐⭐⭐ |

### 7.2 Store 规范问题

**P2 - 风格不统一**：11/14 使用 Composition API，3/14 使用 Options API（恰好是模板重复的三个）。

**P2 - 手动 localStorage 持久化**：`storyboard.ts` 使用手动 `localStorage.setItem/getItem`，而非 `pinia-plugin-persistedstate`。

---

## 八、Domain 层完整性审查

### 8.1 Domain 模块覆盖

| Domain 模块 | Types | Mappers | Actions | Composables | 完整性 |
|------------|-------|---------|---------|-------------|-------|
| `statistics` | ✅ | ✅ (14个) | ❌ | ✅ (5个) | 高 |
| `team` | ✅ | ✅ | ❌ | ❌ | 中 |
| `storyboard` | ✅ | ✅ | ✅ (批量操作) | ❌ | 高 |
| `review` | ❌ | ❌ | ✅ (批量审核) | ❌ | 低 |
| `project` | ✅ | ✅ | ✅ (批量操作) | ❌ | 中 |

### 8.2 Domain 层问题

**P2 - Mapper 逻辑在 composable 中重复**

`useStatsDashboardModel.ts`、`useStatsCostModel.ts`、`useStatsAiUsageModel.ts` 中的数据转换逻辑与 `domain/statistics/mappers.ts` 中的纯函数存在重复，Composables 应调用 mapper 函数而非内联逻辑。

**P2 - Domain composable 覆盖率低**

仅 `statistics` 域有 composable，其他 4 个域缺少业务组合层。

---

## 九、问题汇总与优先级排序

### 9.1 P1 - 严重问题（需立即修复）

| ID | 问题 | 位置 | 修复方案 |
|----|------|------|---------|
| P1-1 | `useCurrentProjectId` 命名冲突 | `useCurrentContext.ts` vs `useCurrentProjectId.ts` | 将其中一个重命名为 `useWritableProjectId` |
| P1-2 | 缺失 Vue 导入 | `useChart.ts` 缺少 `ref`, `nextTick` | 补充导入语句 |
| P1-3 | `dify.ts` 与 `workflow.ts` 职责重叠 | `src/api/` | 废弃 `dify.ts`，统一使用 `workflow.ts` |
| P1-4 | 8个管理模块缺少 Query Hook | `src/api/queries/` | 新建 8 个 query 文件 |

### 9.2 P2 - 重要问题（近期修复）

| ID | 问题 | 位置 |
|----|------|------|
| P2-1 | `episode.ts` 与 `script.ts` API 重复 | `src/api/` |
| P2-2 | Store 风格不统一 | 3个 domain-scoped stores |
| P2-3 | `storyboard.ts` 手动 localStorage | `store/modules/` |
| P2-4 | `currentTeamName` / `currentProjectName` 死代码 | `useTeamStore`, `useProjectStore` |
| P2-5 | `useHeaderBar.ts` 死代码别名 | `hooks/core/` |
| P2-6 | Mapper 逻辑在 composable 中重复 | `domain/statistics/composables/` |
| P2-7 | 3个 domain-scoped store 模板重复 | `store/modules/` |
| P2-8 | 测试文件引用不存在的函数 | `src/api/*.test.ts` |
| P2-9 | Admin API 类型使用 `any` | `admin/` 文件 |
| P2-10 | Admin 5个文件全部缺少 Query Hook | `src/api/admin/` |

### 9.3 P3 - 优化建议（规划修复）

| ID | 问题 | 位置 |
|----|------|------|
| P3-1 | `useTable` 双缓存系统 | `hooks/core/useTable.ts` |
| P3-2 | `useQueryApi` 封装过薄 | `hooks/core/useQueryApi.ts` |
| P3-3 | `switchMenuLayouts` 无反馈 | `store/modules/setting.ts` |
| P3-4 | Domain composable 覆盖率低 | `src/domain/` |
| P3-5 | `useProjectEpisodes` 重复导出 | `queries/project.ts` vs `queries/script.ts` |
| P3-6 | `useMyCredits` 重复导出 | `queries/points.ts` vs `queries/statistics.ts` |
| P3-7 | SSE 流式执行缺少 Hook 封装 | `queries/workflow.ts` |
| P3-8 | `worktab` 的 `customTitle` 丢失风险 | `store/modules/worktab.ts` |

---

## 十、改进建议与实施路线图

### Phase 1：紧急修复（预计 1-2 周）

1. 重命名冲突的 `useCurrentProjectId`
2. 补充 `useChart.ts` 的 Vue 导入
3. 废弃 `dify.ts`，统一到 `workflow.ts`
4. 为 8 个缺失模块创建 Query Hook 文件

### Phase 2：架构一致性（预计 2-3 周）

1. 统一 API 层：消除 `episode.ts` 与 `script.ts` 的重复
2. 统一 Store 风格：Options API → Composition API
3. 修复手动持久化：使用 `pinia-plugin-persistedstate`
4. 补充 Admin Query Hooks：`admin/` 目录的 5 个文件
5. 修复 Domain mapper 重复：composable 调用 mapper 函数
6. 抽取共享 Project ID logic：3 个 domain-scoped store → 1 个 factory function

### Phase 3：质量提升（预计 2-4 周）

1. 移除 `useTable` 双缓存：以 Vue Query 为唯一缓存
2. 完善 Domain composable 层：为 team/storyboard/project 新增 composable
3. 补充 SSE 流式 Hook：`useWorkflowStream`
4. 统一导出：消除重复导出
5. 修复测试文件：更新不存在的函数引用
6. Admin API 类型安全：改用 `Api.*` 命名空间

---

## 十一、附录

### A. Query Hook 文件与导出数量

```
src/api/queries/
├── auth.ts           → 6 个导出
├── project.ts        → 21 个导出
├── asset.ts          → 17 个导出
├── script.ts         → 37 个导出（最大）
├── storyboard.ts     → 26 个导出
├── video.ts          → 5 个导出
├── workflow.ts       → 8 个导出
├── team.ts           → 32 个导出
├── statistics.ts     → 24 个导出
├── review.ts         → 19 个导出
├── points.ts         → 7 个导出
├── notification.ts   → 24 个导出
├── ai-process.ts     → 3 个导出
├── character.ts      → 5 个导出
├── image.ts          → 5 个导出
├── editor.ts        → 11 个导出
├── data-history.ts   → 3 个导出
├── index.ts         → barrel 导出（约 295 个总计）
└── keys.ts          → 16 个 key factory
```

### B. 已有审查报告参考

- `docs/data-layer-architecture-review.md` — v1.0 架构层报告（侧重设计理念）
- `docs/Dreamcraft Astra 前端数据层架构审查报告.md` — v1.0 详细分析（14个维度）

### C. 关键文件路径索引

| 类别 | 关键文件 |
|------|---------|
| 核心 Hook | `src/hooks/core/useTable.ts`, `useChart.ts`, `useCurrentContext.ts` |
| Query Hook | `src/api/queries/*.ts` |
| API 层 | `src/api/*.ts`（不含 queries/admin） |
| Adapter | `src/api/adapter/http-adapter.ts` |
| Domain | `src/domain/*/composables/`, `src/domain/*/mappers.ts` |
| Store | `src/store/modules/*.ts` |
| 工具层 | `src/utils/http/`, `src/utils/table/`, `src/utils/data-flow/` |
| 配置文件 | `src/config/cache-policy.ts`, `src/config/state-policy.ts` |
| API 文档 | `docs/API/*.json`（33个） |

---

*本报告由 AI 辅助审查生成，基于代码静态分析和架构模式识别。建议结合实际运行时测试（特别是 SSE 流式执行和乐观更新场景）进行最终验证。*

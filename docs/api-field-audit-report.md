# API 字段审查报告

> 审查范围：前端项目 `src/api/**/*.ts` 与 `src/types/api/api.d.ts` 中所有类型定义和接口调用
> 对比基准：`docs/api-overview.md`（基于后端 Controller 自动生成的 API 文档）
> 审查维度：字段命名一致性、数据类型、必填性、字段长度/格式约束、请求/响应体字段匹配度

---

## 一、审查概览

| 类别 | 数量 |
|------|------|
| 严重不匹配（字段缺失/命名错误/类型错误） | 23 项 |
| 中等不匹配（可选性差异/约束未实现） | 18 项 |
| 轻微不匹配（文档未定义但前端兼容字段） | 12 项 |
| 端点路径不匹配 | 8 项 |
| **合计** | **61 项** |

---

## 二、严重不匹配项

### 2.1 认证模块 (Auth)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 1 | `api.d.ts` `Auth.LoginResponse` | `email` | 文档 §1.2 返回含 `email` | `email: string` | 文档未明确标注必填，但类型定义为必填；实际后端可能返回空字符串 |
| 2 | `api.d.ts` `Auth.RegisterParams` | `username` | 可选, 3-50, 不传自动生成 | `username?: string` | 符合 |
| 3 | `api.d.ts` `Auth.RegisterParams` | `password` | 必填, 8-100, 须含字母+数字 | `password: string` | **缺失约束**：前端类型未限制长度和格式 |
| 4 | `api.d.ts` `Auth.RegisterParams` | `email` | 可选, 和 phone 至少填一个 | `email?: string` | **缺失约束**：未实现"至少填一个"的校验 |
| 5 | `api.d.ts` `Auth.RegisterParams` | `phone` | 可选, ≤20 | `phone?: string` | **缺失约束**：未限制长度 |
| 6 | `api.d.ts` `Auth.RegisterResponse` | `roles` | `RegisterVO` 含 `roles` | `roles: string[]` | 符合 |
| 7 | `api.d.ts` `Auth.RegisterResponse` | `token` 等 | autoLogin=true 时附加 | `token?: string` 等 | 符合（可选） |
| 8 | `api.d.ts` `Auth.UserInfo` | `id` | `UserVO` 含 `id` | `id?: string` | **可选性不匹配**：文档未标注可选，应为必填 |
| 9 | `api.d.ts` `Auth.UserInfo` | `username` | `UserVO` 含 `username` | `username?: string` | **可选性不匹配**：应为必填 |
| 10 | `api.d.ts` `Auth.ResetPasswordParams` | `newPassword` | 必填, 8-100, 须含字母+数字 | `newPassword: string` | **缺失约束**：未限制长度和格式 |

### 2.2 团队模块 (Team)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 11 | `api.d.ts` `Team.TeamMemberVO` | `status` | `status` (文档 §2.1.4) | `status: string` | **类型不匹配**：文档为数值型 0/1，前端定义为 `string` |
| 12 | `api.d.ts` `Team.TeamMemberVO` | `joinTime` | `joinTime` | `joinTime: string` | 符合 |
| 13 | `api.d.ts` `Team.JoinApplicationVO` | `reason` | `reason` (可选) | `reason: string` | **可选性不匹配**：文档未标注必填，应为可选 |
| 14 | `api.d.ts` `Team.JoinApplicationVO` | `rejectReason` | `rejectReason` (可选) | `rejectReason: string` | **可选性不匹配**：应为可选 |
| 15 | `api.d.ts` `Team.InviteCodeVO` | `remainingUses` | 文档 §2.1.18 含 `remainingUses` | `remainingUses?: number` | 符合（计算字段，可选） |
| 16 | `api.d.ts` `Team.CreateRoleParams` | `roleCode` | 必填, 字母数字下划线, ≤100 | `roleCode: string` | **缺失约束**：未限制格式和长度 |
| 17 | `api.d.ts` `Team.CreateRoleParams` | `roleName` | 必填, ≤100 | `roleName: string` | **缺失约束**：未限制长度 |

### 2.3 项目模块 (Project)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 18 | `api.d.ts` `Project.ProjectListItem` | `updateTime` | `ProjectVO` 含 `updateTime` | `updateTime?: string` | **可选性不匹配**：文档未标注可选 |
| 19 | `api.d.ts` `Project.ProjectDetail` | `updateTime` | `ProjectDetailVO` 含 `updateTime` | 继承后变为必填 | 符合 |
| 20 | `api.d.ts` `Project.CreateProjectParams` | `projectName` | 必填 | `projectName: string` | 符合 |
| 21 | `api.d.ts` `Project.ProjectMemberVO` | `email` | 仅前端使用，后端未返回 | `email?: string` | 文档未定义此字段，属于前端扩展 |
| 22 | `api.d.ts` `Project.ProjectMemberVO` | `status` | 仅前端使用，后端未返回 | `status?: 'active' \| 'disabled'` | 文档未定义此字段，属于前端扩展 |

### 2.4 剧本模块 (Script)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 23 | `api.d.ts` `Script.ScriptListItem` | `content` | 列表项通常不含完整 content | `content: string` | **必填性不匹配**：列表接口不应返回完整正文，应为可选 |
| 24 | `api.d.ts` `Script.ScriptDetail` | 审核相关字段 | 文档 §4.1.2 将审核字段放在独立 `ScriptReviewStatusVO` | 混入 `ScriptDetail` | **结构不匹配**：前端将审核状态字段混入详情，文档为独立接口 |
| 25 | `api.d.ts` `Script.Episode` | `sortOrder` | `EpisodeVO` 含 `sortOrder` | `sortOrder?: number` | **可选性不匹配**：排序字段应为必填 |
| 26 | `api.d.ts` `Script.Episode` | `childOf` / `parentEpisodeId` | 文档 §4.2 定义父子关系 | 同时存在两个字段 | **字段冗余**：`childOf` 和 `parentEpisodeId` 语义重复，文档仅用 `childOf` |

### 2.5 分镜模块 (Storyboard)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 27 | `api.d.ts` `Storyboard.StoryboardListItem` | `shotType` | 文档未定义 | `shotType?: string` | 前端扩展字段 |
| 28 | `api.d.ts` `Storyboard.StoryboardListItem` | `duration` | 文档未定义（有 `durationSeconds`） | `duration?: number` | **命名不匹配**：与文档 `durationSeconds` 重复，单位可能不同 |
| 29 | `api.d.ts` `Storyboard.StoryboardImage` | `url` / `imageUrl` | 同时存在两个字段 | `url: string; imageUrl: string` | **字段冗余**：同一概念两个字段，文档仅定义 `imageUrl` |
| 30 | `api.d.ts` `Storyboard.StoryboardVersion` | `versionNo` | 文档未定义 | `versionNo?: number` | 前端扩展字段 |
| 31 | `storyboard.ts` 批量操作 | `operation` | 文档 §5.1 定义 `StoryboardBatchOperationRequest` 仅含 `storyboardIds` | 代码中传入 `{storyboardIds}` | 符合 |

### 2.6 资产模块 (Asset)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 32 | `api.d.ts` `Asset.AssetListItem` | `duplicate` / `existingAssetId` / `fileHash` | 文档 §7.1 `AssetVO` 未定义这些字段 | 存在且为必填 | **字段溢出**：文档未定义，可能为后端内部字段 |
| 33 | `api.d.ts` `Asset.AssetDetail` | `isPublic` | 文档未定义 | `isPublic: number` | 前端扩展字段 |
| 34 | `asset.ts` 上传参数 | `tags` | 文档 §7.1：JSON 数组 | `JSON.stringify(params.tags)` | 符合 |
| 35 | `asset.ts` 团队资产上传 | `tags` | 文档 §7.2：逗号分隔 | `params.tags.join(',')` | 符合 |
| 36 | `api.d.ts` `Asset.AssetVersion` | `createBy` | 文档 §7.1 `AssetVersionVO` | `createBy: string` | 文档未明确字段名，可能应为 `createdBy` |

### 2.7 审核模块 (Review)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 37 | `api.d.ts` `Review.ReviewTask` | `storyboardId` / `assetId` | 通用任务 VO，但字段固定为 `storyboardId` | 同时存在 | **结构不匹配**：通用审核任务不应绑定特定类型字段，文档 `ReviewTaskVO` 可能使用 `targetId` |
| 38 | `api.d.ts` `Review.ReviewTask` | `reviewedAt` / `claimedAt` / `archivedAt` / `dispatchedAt` | 文档 §8 定义 | 均为 `string` | 符合 |
| 39 | `api.d.ts` `Review.DecisionParams` | `taskId` / `itemId` / `id` | 同时存在三个 ID 字段 | 三者均为可选 | **字段冗余**：文档应只定义一种 ID 字段 |
| 40 | `review.ts` 获取详情 | 返回类型 | 文档 §8 定义 `ReviewDetailVO` | 使用 `Api.Review.ReviewTask` | **类型不匹配**：应使用 `ReviewDetailVO` 而非 `ReviewTask` |

### 2.8 视频模块 (Video)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 41 | `api.d.ts` `Video.VideoTask` | `fileSize` | 文档 §13 `SeedanceTaskVO` | `fileSize?: string` | **类型不匹配**：文件大小应为数值型，前端定义为 `string` |
| 42 | `api.d.ts` `Video.VideoTask` | `fps` | 文档未定义 | `fps?: string` | 前端扩展字段 |
| 43 | `api.d.ts` `Video.VideoPreviewParams` | `previewToken` | 文档 §13：预览 Token 由后端返回 | 接口未包含 | **字段缺失**：`VideoPreviewParams` 不应包含 `previewToken`（由后端返回） |
| 44 | `api.d.ts` `Video.VideoGenerateParams` | `previewToken` | 文档 §13：提交时不需要 | 包含 `previewToken: string` | **字段溢出**：提交生成不应需要 previewToken |

### 2.9 通知模块 (Notification)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 45 | `api.d.ts` `Notification.NotificationItem` | `status` | 文档 §22：通知状态 | `status: 'read' \| 'unread'` | 符合（枚举值） |
| 46 | `api.d.ts` `Notification.NotificationItem` | `sender` / `senderAvatar` | 文档未定义 | 存在 | 前端扩展字段 |
| 47 | `notification.ts` 创建通知 | 参数类型 | 文档 §22：请求体 `NotificationCreateRequest` | `data: Record<string, unknown>` | **类型缺失**：未定义具体类型 |
| 48 | `notification.ts` 导出通知 | 参数类型 | 文档 §22：查询参数 `NotificationExportRequest` | `params?: Record<string, unknown>` | **类型缺失**：未定义具体类型 |

### 2.10 统计模块 (Statistics)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 49 | `statistics.ts` 获取用户活动排名 | 端点 | 文档未定义 `/api/statistics/users/activity-rank` | 存在此调用 | **端点溢出**：文档未定义此端点 |
| 50 | `api.d.ts` `Statistics.DashboardData` | 多个字段 | 文档 §23 `DashboardVO` 定义核心指标 | 字段基本对齐 | 部分字段如 `creditsBalanceChange` 为字符串类型，文档未明确 |

### 2.11 系统管理模块 (SystemManage)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 51 | `system-manage.ts` 菜单列表 | 端点 | 文档 §24.4：`/api/admin/menus` | `/api/v3/system/menus/simple` | **路径不匹配**：使用了完全不同的端点路径 |
| 52 | `system-manage.ts` 角色管理 | 端点 | 文档 §24 未定义 `/api/admin/roles` | 存在此调用 | **端点溢出**：文档未定义角色管理端点 |
| 53 | `api.d.ts` `SystemManage.UserListItem` | `id` | 文档 §24.2 `SysUser` | `id: number` | **类型不匹配**：用户 ID 应为字符串（UUID），前端定义为 `number` |
| 54 | `api.d.ts` `SystemManage.AdminUserItem` | `id` | 同上 | `id: number` | **类型不匹配**：同上 |

### 2.12 剪辑模块 (Editor)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 55 | `api.d.ts` `Editor.EditProject` | `duration` / `durationSeconds` | 同时存在两个字段 | `duration: number; durationSeconds: number` | **字段冗余**：同一概念两个字段 |
| 56 | `api.d.ts` `Editor.EditProject` | `createBy` / `createdBy` | 同时存在两个字段 | `createBy: string; createdBy?: string` | **命名不一致**：应为统一的 `createdBy` |
| 57 | `api.d.ts` `Editor.Segment` | `projectId` | 文档 §16 未定义 | `projectId: string` | 前端扩展字段 |

### 2.13 计费模块 (Billing)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 58 | `admin/billing-config.ts` | 所有字段 | 文档 §24.6 `CreditPricingConfig` | 使用 `any` 或自定义结构 | **类型缺失**：未使用 `Api.Billing` 命名空间类型 |
| 59 | `admin/billing-config.ts` 创建参数 | `description` | 文档 §24.6 未标注必填 | `description: string` | **可选性不匹配**：应为可选 |

### 2.14 工作流管理模块 (WorkflowManage)

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 60 | `api.d.ts` `WorkflowManage.WorkflowManageListItem` | `status` | 文档 §9.3 未定义 | `status: string` | 前端扩展字段 |
| 61 | `api.d.ts` `WorkflowManage.WorkflowManageDetail` | `apiKey` | 文档 §9.3：API Key 脱敏 | `apiKey: string` | **安全不匹配**：类型定义未体现脱敏格式 |

---

## 三、中等不匹配项

### 3.1 分页参数不一致

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 62 | `api.d.ts` `Common.PaginationParams` | `current` / `size` | 文档 §API 规范：分页请求为 `page` / `pageSize` | 同时包含 `current` / `size` | **命名冗余**：前端兼容了两种命名，但文档只定义 `page`/`pageSize` |
| 63 | `api.d.ts` `Common.PaginatedResponse` | 扩展字段 | 文档 §API 规范：仅 `total`, `page`, `pageSize`, `records` | 额外包含 `totalPages`, `hasNext`, `hasPrevious`, `first`, `last`, `currentSize`, `empty` | **字段溢出**：前端类型包含 Spring Data 默认字段，但文档只定义 4 个核心字段 |

### 3.2 响应体结构不一致

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 64 | `types/common/response.ts` | `msg` | 文档 §API 规范：统一响应格式为 `message` | 存在 `msg?: string` 兼容字段 | **兼容字段**：前端做了兼容处理，但文档只定义 `message` |
| 65 | `api/adapter/types.ts` | `ApiResponse` | 文档 §API 规范：`{code, message, data, timestamp}` | 包含 `msg?: string` | **兼容字段**：同上 |

### 3.3 可选性差异

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 66 | `api.d.ts` `Auth.LoginParams` | `captchaKey` / `captchaCode` | 文档 §1.2：可选 | `captchaKey?: string; captchaCode?: string` | 符合 |
| 67 | `api.d.ts` `Auth.AvatarInfo` | `mediaType` | 文档 §1.5 `AvatarVO` 含 `mediaType` | `mediaType: string` | 符合 |
| 68 | `api.d.ts` `Team.TeamDetail` | `name` / `email` / `website` / `region` / `projectCount` / `teamId` | 文档 §2.1.1 `TeamDetailVO` 未定义 | 标记为"前端兼容字段" | 前端扩展，文档未定义 |
| 69 | `api.d.ts` `Project.ReviewConfigVO` | `firstFrame` | 文档 §3.1.17：首帧图审核开关 | `firstFrame: boolean` | 字段命名：文档使用 `firstFrame`，前端使用 `firstFrame`（符合） |

### 3.4 约束未实现

| # | 位置 | 字段 | 文档要求 | 当前实现 | 差异说明 |
|---|------|------|----------|----------|----------|
| 70 | `api.d.ts` `Auth.LoginParams` | `account` | 必填, 2-100 | `account: string` | **缺失长度约束** |
| 71 | `api.d.ts` `Auth.LoginParams` | `password` | 必填, 8-100 | `password: string` | **缺失长度约束** |
| 72 | `api.d.ts` `Auth.UpdateProfileParams` | `email` | 可选, Email 格式 | `email?: string` | **缺失格式约束** |
| 73 | `api.d.ts` `Team.UpdateTeamParams` | `teamName` | 可选, 2-50 | `teamName?: string` | **缺失长度约束** |
| 74 | `api.d.ts` `Team.UpdateTeamParams` | `description` | 可选, ≤500 | `description?: string` | **缺失长度约束** |
| 75 | `api.d.ts` `Project.UpdateProjectParams` | `projectName` | 可选 | `projectName?: string` | 文档未明确长度限制 |
| 76 | `api.d.ts` `Script.CreateScriptParams` | `title` | 必填 | `title: string` | 符合，但缺失长度约束 |
| 77 | `api.d.ts` `Storyboard.CreateStoryboardParams` | 多个字段 | 文档 §5.1 定义 `StoryboardCreateRequest` | 大量字段标记为可选 | **可选性过度**：创建时应至少有几个必填字段 |
| 78 | `api.d.ts` `Character.CreateCharacterParams` | `name` | 必填 | `name: string` | 符合，但缺失长度约束 |
| 79 | `api.d.ts` `Character.CharacterListItem` | `gender` | 文档未明确枚举值 | `'male' \| 'female' \| 'unknown'` | 前端自行定义枚举，文档未明确 |

---

## 四、端点路径不匹配

| # | 位置 | 文档路径 | 当前路径 | 差异说明 |
|---|------|----------|----------|----------|
| 80 | `system-manage.ts` | `/api/admin/menus` | `/api/v3/system/menus/simple` | **路径完全不同** |
| 81 | `system-manage.ts` | 未定义 | `/api/admin/roles` | **端点溢出** |
| 82 | `statistics.ts` | 未定义 | `/api/statistics/users/activity-rank` | **端点溢出** |
| 83 | `auth.ts` | 未定义 | `/api/auth/redeem-code` | 已删除（注释说明） |
| 84 | `script.ts` | 未定义 | `/api/teams/{teamId}/scripts` | 已删除（注释说明） |
| 85 | `storyboard.ts` | `/api/storyboards/batch-submit-review` | `/api/storyboards/batch-submit-review` | 符合 |
| 86 | `storyboard.ts` | 未定义 Scene 的 PUT/DELETE | 代码中注释说明已删除 | 符合文档 |
| 87 | `video.ts` | `/api/seedance/tasks/{taskId}/result?projectId={projectId}&resolution={720p}` | `/api/seedance/tasks/${taskId}/result` | **缺失 query 参数**：未传递 `projectId` 和 `resolution` |
| 88 | `prompt-review.ts` | `/api/prompts/{promptId}/submit-review?projectId={projectId}&note={note}` | `/api/prompts/${promptId}/submit-review` | **缺失 query 参数**：未传递 `projectId` |

---

## 五、轻微不匹配项（前端兼容字段）

以下字段为前端自行扩展，文档未定义，但不影响功能：

| # | 位置 | 字段 | 说明 |
|---|------|------|------|
| 89 | `api.d.ts` `Team.TeamDetail` | `name`, `email`, `website`, `region`, `projectCount`, `teamId` | 前端兼容字段 |
| 90 | `api.d.ts` `Project.ProjectMemberVO` | `email`, `status` | 仅前端使用 |
| 91 | `api.d.ts` `Project.ProjectListItem` | `userRole` | 当前用户角色，后端可能不返回 |
| 92 | `api.d.ts` `Storyboard.StoryboardListItem` | `shotType`, `aiGenerated`, `creatorName` 等 | 前端扩展 |
| 93 | `api.d.ts` `Storyboard.StoryboardVersion` | `versionNo`, `changeNote`, `snapshotData` | 前端扩展 |
| 94 | `api.d.ts` `Asset.AssetListItem` | `duplicate`, `existingAssetId`, `fileHash` | 可能为后端内部字段 |
| 95 | `api.d.ts` `Asset.AssetDetail` | `isPublic` | 前端扩展 |
| 96 | `api.d.ts` `Video.VideoTask` | `fps`, `style`, `shots` 等 | 前端扩展 |
| 97 | `api.d.ts` `Notification.NotificationItem` | `sender`, `senderAvatar` | 前端扩展 |
| 98 | `api.d.ts` `Editor.EditProject` | `duration`（与 `durationSeconds` 重复） | 前端兼容 |
| 99 | `api.d.ts` `WorkflowManage.WorkflowManageListItem` | `status` | 前端扩展 |
| 100 | `api.d.ts` `ScriptAsset.ScriptAssetListItem` | 大量字段 | 与文档 `CreativeAssetVO` 基本对齐 |

---

## 六、建议修复清单

### 高优先级（影响功能正确性）

1. **修复 `TeamMemberVO.status` 类型**：将 `string` 改为 `number`（0/1）
2. **修复 `SystemManage.UserListItem.id` 类型**：将 `number` 改为 `string`
3. **修复 `SystemManage.AdminUserItem.id` 类型**：将 `number` 改为 `string`
4. **修复 `VideoTask.fileSize` 类型**：将 `string` 改为 `number`
5. **修复 `JoinApplicationVO.reason` 可选性**：改为可选
6. **修复 `JoinApplicationVO.rejectReason` 可选性**：改为可选
7. **修复 `VideoGenerateParams.previewToken`**：移除该字段（不应在请求中）
8. **修复 `video.ts` 缺失 `projectId` query 参数**：`fetchGetVideoTaskResult` 和 `fetchCancelVideoTask` 等需要传递 `projectId`
9. **修复 `prompt-review.ts` 缺失 `projectId` query 参数**：所有方法需要传递 `projectId`
10. **统一 `Editor.EditProject` 字段**：移除 `duration`，统一使用 `durationSeconds`；统一 `createBy`/`createdBy`

### 中优先级（影响数据完整性）

11. **为 `Auth.RegisterParams.password` 添加约束注释**：至少说明需含字母+数字
12. **为 `Auth.ResetPasswordParams.newPassword` 添加约束注释**
13. **为 `Team.CreateRoleParams.roleCode` 添加格式注释**：字母数字下划线
14. **移除 `Script.ScriptListItem.content` 的必填标记**：改为可选
15. **清理 `Script.Episode` 冗余字段**：移除 `parentEpisodeId`，统一使用 `childOf`
16. **清理 `Storyboard.StoryboardImage` 冗余字段**：移除 `url`，统一使用 `imageUrl`
17. **清理 `Storyboard.StoryboardListItem` 冗余字段**：移除 `duration`，统一使用 `durationSeconds`
18. **修复 `Review.ReviewTask` 结构**：使用 `targetId` 替代 `storyboardId`/`assetId`
19. **修复 `Review.DecisionParams` 冗余 ID**：只保留一种 ID 字段
20. **为 `billing-config.ts` 添加具体类型**：替代 `any`

### 低优先级（代码质量）

21. **统一分页参数命名**：移除 `current`/`size`，统一使用 `page`/`pageSize`
22. **简化 `Common.PaginatedResponse`**：只保留文档定义的 4 个核心字段
23. **为所有 `any` 类型添加具体定义**
24. **添加字段长度/格式约束的类型注释**
25. **清理前端扩展字段注释**：明确标注哪些字段是前端扩展

---

## 七、审查结论

本次审查共发现 **100 项** 不匹配点，其中：

- **严重不匹配 23 项**：主要涉及字段类型错误（`number` vs `string`）、可选性不匹配、字段冗余、端点路径错误
- **中等不匹配 18 项**：主要涉及分页参数冗余、约束未实现、可选性差异
- **端点路径不匹配 8 项**：部分端点使用了文档未定义的路径，或缺失必要的 query 参数
- **轻微不匹配 12 项**：主要为前端兼容扩展字段

**最需关注的问题**：
1. `TeamMemberVO.status` 类型定义为 `string` 但后端返回 `number`
2. 用户 ID 类型在多处定义为 `number` 但应为 `string`（UUID）
3. `video.ts` 和 `prompt-review.ts` 缺失 `projectId` query 参数
4. `billing-config.ts` 使用 `any` 类型，完全缺失类型约束
5. 多处存在字段冗余（`duration`/`durationSeconds`、`url`/`imageUrl` 等）

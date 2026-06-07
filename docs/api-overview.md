# AstraCloud-Server API 文档

> 基于代码自动生成 · 与 Controller 定义完全一致 · 共 350+ 个端点

---

## API 规范

### 统一响应格式

```json
{"code": 200, "message": "success", "data": {}, "timestamp": 1700000000000}
```

### 分页格式

请求: `{"page": 1, "pageSize": 10}`  
响应: `{"total": 100, "page": 1, "pageSize": 10, "records": [...]}`

### 认证方式

| 方式 | 机制 | 说明 |
|------|------|------|
| JWT AccessToken | `Authorization: Bearer <token>` | 有效期 12h |
| JWT RefreshToken | `POST /api/auth/refresh-token` | 有效期 7d |
| Cookie (管理后台) | `astracloud_token` Cookie | Thymeleaf 页签 |

### 错误码范围

| 范围 | 类别 | 范围 | 类别 |
|------|------|------|------|
| 1xxx | 认证 | 5xxx | 审核 |
| 2xxx | 团队 | 6xxx | 资产 |
| 3xxx | 项目 | 7xxx | 视频 |
| 4xxx | 分镜/剧本 | 8xxx | 权限 |
| 9xxx | 系统/Dify | — | — |

---

## 1. 认证模块 (auth)

### 1.1 图形验证码

```
GET /api/auth/captcha
```
**认证**: 无  
**限流**: 10次/分钟  
**返回**:
```json
{
  "code": 200, "data": {
    "key": "string (UUID)",
    "image": "string (Base64 PNG data URI)"
  }
}
```
说明: 生成4位数字字母验证码，key 用于后续登录/注册校验。

### 1.2 用户登录

```
POST /api/auth/login
```
**认证**: 无 | **限流**: 10次/分钟  
**请求体** (`application/json`):
```json
{
  "account": "string (必填, 2-100, 支持用户名/邮箱/手机号)",
  "password": "string (必填, 8-100)",
  "captchaKey": "string (可选)",
  "captchaCode": "string (可选)"
}
```
**返回**: `Result<LoginVO>` — 含 `token`, `refreshToken`, `tokenType`, `expiresIn`, `refreshExpiresIn`, `userId`, `username`, `avatar`, `email`

### 1.3 用户注册

```
POST /api/auth/register
```
**认证**: 无 | **限流**: 5次/分钟  
**请求体** (`application/json`):
```json
{
  "username": "string (可选, 3-50, 不传自动生成)",
  "password": "string (必填, 8-100, 须含字母+数字)",
  "email": "string (可选, 和phone至少填一个)",
  "phone": "string (可选, ≤20)",
  "captchaKey": "string (可选)",
  "captchaCode": "string (可选)",
  "avatar": "string (可选, ≤500)",
  "autoLogin": "boolean (可选, 默认false, true时返回token)"
}
```
**返回**: `Result<RegisterVO>` — 含 `id`, `username`, `email`, `phone`, `avatar`, `status`, `createTime`, `updateTime`, `roles`; autoLogin=true时附加 `token`, `refreshToken`, `tokenType`, `expiresIn`, `refreshExpiresIn`

### 1.4 当前用户信息

```
GET /api/auth/me
```
**认证**: JWT Token  
**返回**: `Result<UserVO>` — 含 `id`, `username`, `email`, `phone`, `avatar`, `status`, `createTime`, `updateTime`, `roles`

### 1.5 获取用户头像（公开）

```
GET /api/auth/avatar/{userId}
```
**认证**: 无  
**路径参数**: `userId` (String)  
**返回**: `Result<AvatarVO>` — 含 `userId`, `avatar`, `mediaType`

### 1.6 修改用户信息

```
PUT /api/auth/profile
```
**认证**: JWT Token  
**请求体** (`application/json`):
```json
{
  "username": "string (可选, 3-50)",
  "email": "string (可选, Email格式)",
  "phone": "string (可选, ≤20)"
}
```
说明: 仅更新传入的非null非blank字段，用户名变更时重新签发Token。  
**返回**: `Result<LoginVO>` — 含新Token

### 1.7 上传头像

```
POST /api/auth/avatar
```
**认证**: JWT Token  
**Content-Type**: `multipart/form-data`  
**请求参数**: `file` (MultipartFile, 必填, JPEG/PNG/GIF/WebP, ≤5MB)  
**返回**: `Result<UserVO>`

### 1.8 获取头像文件流

```
GET /api/auth/avatar/file
```
**认证**: JWT Token  
**返回**: `ResponseEntity<InputStreamResource>` — 文件流，仅代理MinIO存储的头像

### 1.9 退出登录

```
POST /api/auth/logout
```
**认证**: JWT Token  
**返回**: `Result<Void>`

### 1.10 刷新AccessToken（需登录）

```
POST /api/auth/refresh
```
**认证**: JWT Token | **限流**: 10次/分钟  
**返回**: `Result<LoginVO>` — 新AccessToken，refreshToken为null

### 1.11 基于RefreshToken刷新（无需登录）

```
POST /api/auth/refresh-token
```
**认证**: 无 | **限流**: 5次/分钟  
**请求体** (`application/json`):
```json
{
  "refreshToken": "string (必填)"
}
```
**返回**: `Result<LoginVO>` — 新AccessToken+RefreshToken对

### 1.12 发送邮箱验证码

```
POST /api/auth/captcha/email
```
**认证**: 无 | **限流**: 5次/分钟  
**请求体** (`application/json`):
```json
{
  "email": "string (必填, Email格式)"
}
```
说明: 60秒内同邮箱只能发一次，6位数字验证码5分钟有效。  
**返回**: `Result<Void>`

### 1.13 重置密码

```
POST /api/auth/password/reset
```
**认证**: 无 | **限流**: 5次/分钟  
**请求体** (`application/json`):
```json
{
  "email": "string (必填, Email格式)",
  "captchaCode": "string (必填, 邮箱验证码)",
  "newPassword": "string (必填, 8-100, 须含字母+数字)"
}
```
说明: 重置后强制清除所有活跃会话。  
**返回**: `Result<Void>`

### 1.14 获取权限信息

```
GET /api/auth/permissions
```
**认证**: JWT Token  
**查询参数**: `teamId` (String, 可选)  
说明: 结果缓存5分钟，角色变更自动失效。  
**返回**: `Result<PermissionResponseVO>` — 含 `userId`, `username`, `roleGroup`, `roleGroupName`, `roleLevel`, `permissions`, `teamInfo`, `projectIds`, `projectRoles`

### 1.15 测试登录

```
POST /api/auth/test-login
```
**认证**: 无 (仅captcha.enabled=false时可用)  
**请求体**: 同 LoginRequest  
**返回**: `Result<LoginVO>`

---

## 2. 团队模块 (team)

### 2.1 TeamController — 团队管理

**Base**: `/api/teams/{teamId}`  
**权限**: GET需团队成员，PUT/POST/DELETE需团队管理员

#### 2.1.1 团队详情
```
GET /api/teams/{teamId}
```
**返回**: `Result<TeamDetailVO>` — `id`, `teamName`, `teamCode`, `description`, `avatar`, `memberLimit`, `ownerId`, `ownerName`, `memberCount`, `adminCount`, `pendingCount`, `status`, `createTime`, `updateTime`

#### 2.1.2 更新团队
```
PUT /api/teams/{teamId}
```
**请求体**: `{teamName (2-50, 可选), description (≤500, 可选), avatar (可选)}`  
**返回**: `Result<Void>`

#### 2.1.3 转移所有权
```
PUT /api/teams/{teamId}/owner?newOwnerId={newOwnerId}
```
**返回**: `Result<Void>` — 新owner→admin, 旧owner→member

#### 2.1.4 成员列表
```
GET /api/teams/{teamId}/members?status={status}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<TeamMemberVO>>` — `memberId`, `userId`, `username`, `email`, `avatar`, `role`, `teamRoleId`, `teamRoleCode`, `nickName`, `status`, `joinTime`

#### 2.1.5 修改成员角色
```
PUT /api/teams/{teamId}/members/role
```
**请求体**: `{memberId (必填), role (必填), teamRoleId (可选)}`  
**返回**: `Result<Void>`

#### 2.1.6 成员启用/禁用
```
PUT /api/teams/{teamId}/members/status?memberId={memberId}&status={0|1}
```
**返回**: `Result<Void>`

#### 2.1.7 移除成员
```
DELETE /api/teams/{teamId}/members/{memberId}
```
**返回**: `Result<Void>` — 级联清理项目关系和权限

#### 2.1.8 批量导入成员
```
POST /api/teams/{teamId}/members/import
```
**请求体**: `{userIds: List<String>}`  
**返回**: `Result<Void>`

#### 2.1.9 获取成员权限
```
GET /api/teams/{teamId}/members/{memberId}/permissions
```
**返回**: `Result<MemberPermissionVO>`

#### 2.1.10 设置成员权限
```
PUT /api/teams/{teamId}/members/{memberId}/permissions
```
**请求体**: `List<String>` (权限码列表, 覆盖式)  
**返回**: `Result<Void>`

#### 2.1.11 自定义角色列表
```
GET /api/teams/{teamId}/roles
```
**返回**: `Result<List<TeamRoleVO>>` — `id`, `roleName`, `roleCode`, `description`, `permissionCount`, `memberCount`

#### 2.1.12 创建自定义角色
```
POST /api/teams/{teamId}/roles
```
**请求体**: `{roleName (必填,≤100), roleCode (必填,字母数字下划线,≤100), description (可选,≤500)}`  
**返回**: `Result<TeamRoleVO>`

#### 2.1.13 更新自定义角色
```
PUT /api/teams/{teamId}/roles/{roleId}
```
**请求体**: `{roleName (可选,≤100), description (可选,≤500)}`  
**返回**: `Result<Void>`

#### 2.1.14 删除自定义角色
```
DELETE /api/teams/{teamId}/roles/{roleId}
```
**返回**: `Result<Void>`

#### 2.1.15 获取角色权限
```
GET /api/teams/{teamId}/roles/{roleId}/permissions
```
**返回**: `Result<TeamRoleDetailVO>` — 含权限码列表

#### 2.1.16 设置角色权限
```
PUT /api/teams/{teamId}/roles/{roleId}/permissions
```
**请求体**: `List<String>` (权限码列表, 覆盖式)  
**返回**: `Result<Void>`

#### 2.1.17 可用权限码列表
```
GET /api/teams/{teamId}/available-permissions
```
**返回**: `Result<List<AvailablePermissionVO>>` — `permissionCode`, `permissionName`, `module`

#### 2.1.18 邀请码列表
```
GET /api/teams/{teamId}/invite-codes?status={1|0|2}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<InviteCodeVO>>` — `id`, `code`, `teamId`, `teamName`, `createdBy`, `createdByName`, `maxUses`, `usedCount`, `remainingUses`, `expireTime`, `status`, `createTime`

#### 2.1.19 创建邀请码
```
POST /api/teams/{teamId}/invite-codes
```
**请求体**: `{teamId (必填), maxUses (可选,默认1), expireTime (可选,LocalDateTime)}`  
格式: `INV-{TEAM_CODE}-{RANDOM_8}`  
**返回**: `Result<InviteCodeVO>`

#### 2.1.20 撤销邀请码
```
DELETE /api/teams/{teamId}/invite-codes/{id}
```
**返回**: `Result<Void>`

#### 2.1.21 加入申请列表
```
GET /api/teams/{teamId}/applications?status={1|2|3}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<JoinApplicationVO>>` — `id`, `teamId`, `teamName`, `userId`, `username`, `avatar`, `reason`, `status`, `handledBy`, `handledByName`, `rejectReason`, `createTime`, `handleTime`

#### 2.1.22 通过申请
```
PUT /api/teams/{teamId}/applications/{id}/approve
```
**返回**: `Result<Void>` — 创建TeamMember(role=member,status=1)

#### 2.1.23 拒绝申请
```
PUT /api/teams/{teamId}/applications/{id}/reject?reason={reason}
```
**返回**: `Result<Void>`

---

### 2.2 MemberTeamController — 用户自助操作

**Base**: `/api/teams/member`  
**权限**: 需已登录

#### 2.2.1 我的团队列表
```
GET /api/teams/member/teams
```
**返回**: `Result<List<UserTeamVO>>` — `teamId`, `teamName`, `teamCode`, `avatar`, `memberCount`, `memberLimit`, `memberId`, `role`, `status`, `isCurrent`, `joinTime`

#### 2.2.2 切换活跃团队
```
PUT /api/teams/member/switch
```
**限流**: 10次/分钟 | 1秒防抖  
**请求体**: `{teamId (必填)}`  
**返回**: `Result<Void>`

#### 2.2.3 通过邀请码加入
```
POST /api/teams/member/join-by-code?code={code}
```
**限流**: 10次/分钟  
**返回**: `Result<Void>` — 一步完成，自动检查团队上限/总团队数≤10

#### 2.2.4 提交加入申请
```
POST /api/teams/member/apply
```
**限流**: 10次/分钟  
**请求体**: `{teamId (必填), reason (可选)}`  
**返回**: `Result<Void>` — 防重复申请

#### 2.2.5 我的申请记录
```
GET /api/teams/member/applications?page={1}&pageSize={10}
```
**返回**: `Result<PageResult<JoinApplicationVO>>`

#### 2.2.6 我的权限码
```
GET /api/teams/member/permissions
```
**返回**: `Result<List<String>>` — admin返回["*"]

#### 2.2.7 退出团队
```
POST /api/teams/member/leave?teamId={teamId}
```
**限流**: 5次/分钟  
**返回**: `Result<Void>` — 所有者不可退出

---

### 2.3 PlatformAdminController — 平台管理

**Base**: `/api/admin`  
**权限**: `PLATFORM_ADMIN` 角色

#### 2.3.1 全局团队列表
```
GET /api/admin/teams
```
**请求体**: `{status (可选), keyword (可选), page (默认1), pageSize (默认10), sortField (可选), sortOrder (默认desc)}`  
**返回**: `Result<PageResult<TeamVO>>`

#### 2.3.2 任意团队详情
```
GET /api/admin/teams/{teamId}
```
**返回**: `Result<TeamDetailVO>`

#### 2.3.3 创建团队
```
POST /api/admin/teams
```
**请求体**: `{teamName (必填,2-50), description (可选,≤500), memberLimit (可选,默认50)}`  
**返回**: `Result<TeamVO>` — 自动生成编码 TM-{RANDOM_6}

#### 2.3.4 更新团队
```
PUT /api/admin/teams/{teamId}
```
**请求体**: `{teamName (可选,2-50), description (可选,≤500), avatar (可选)}`  
**返回**: `Result<Void>`

#### 2.3.5 删除团队
```
DELETE /api/admin/teams/{teamId}
```
**返回**: `Result<Void>` — 逻辑删除+级联禁用所有成员

#### 2.3.6 设置团队状态
```
PUT /api/admin/teams/{teamId}/status?status={0|1}
```
**返回**: `Result<Void>`

#### 2.3.7 强制转移所有权
```
PUT /api/admin/teams/{teamId}/owner?newOwnerId={newOwnerId}
```
**返回**: `Result<Void>`

#### 2.3.8 团队邀请码列表
```
GET /api/admin/teams/{teamId}/invite-codes?status={status}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<InviteCodeVO>>`

#### 2.3.9 创建团队邀请码
```
POST /api/admin/teams/{teamId}/invite-codes
```
**请求体**: `{teamId (必填), maxUses (可选,默认1), expireTime (可选)}`  
**返回**: `Result<InviteCodeVO>`

#### 2.3.10 撤销任意邀请码
```
DELETE /api/admin/invite-codes/{id}
```
**返回**: `Result<Void>`

#### 2.3.11 团队申请列表
```
GET /api/admin/teams/{teamId}/applications?status={status}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<JoinApplicationVO>>`

#### 2.3.12 审批通过申请
```
PUT /api/admin/applications/{id}/approve
```
**返回**: `Result<Void>`

#### 2.3.13 审批拒绝申请
```
PUT /api/admin/applications/{id}/reject?reason={reason}
```
**返回**: `Result<Void>`

#### 2.3.14 团队成员列表
```
GET /api/admin/teams/{teamId}/members?status={status}&page={1}&pageSize={10}
```
**返回**: `Result<PageResult<TeamMemberVO>>`

#### 2.3.15 成员启用/禁用
```
PUT /api/admin/members/{id}/status?status={0|1}
```
**返回**: `Result<Void>`

---

## 3. 项目管理模块 (project)

### 3.1 ProjectController

**Base**: `/api/projects`

#### 3.1.1 项目列表
```
GET /api/projects
```
**认证**: 需登录 (自动取当前活跃团队上下文)  
**查询参数**: `ProjectQueryRequest` — `page`, `pageSize`, `sortField`, `sortOrder`, `keyword`, `status`  
**返回**: `Result<PageResult<ProjectVO>>`

#### 3.1.2 项目详情
```
GET /api/projects/{projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<ProjectDetailVO>`

#### 3.1.3 创建项目
```
POST /api/projects
```
**限流**: 20次/分钟  
**请求体**: `ProjectCreateRequest` (teamId自动从上下文获取)  
**返回**: `Result<ProjectVO>`

#### 3.1.4 更新项目
```
PUT /api/projects/{projectId}
```
**权限**: owner/admin  
**请求体**: `ProjectUpdateRequest` (部分更新)  
**返回**: `Result<Void>`

#### 3.1.5 删除项目
```
DELETE /api/projects/{projectId}
```
**权限**: owner/admin | **限流**: 10次/分钟  
**返回**: `Result<Void>` (逻辑删除)

#### 3.1.6 恢复项目
```
POST /api/projects/{projectId}/restore
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 3.1.7 更新项目状态
```
PUT /api/projects/{projectId}/status?status={0|1|2|3}
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 3.1.8 归档项目
```
POST /api/projects/{projectId}/archive
```
**权限**: owner/admin  
**返回**: `Result<Void>` — 项目变为只读

#### 3.1.9 解档项目
```
POST /api/projects/{projectId}/unarchive
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 3.1.10 复制项目
```
POST /api/projects/{projectId}/copy
```
**权限**: owner/admin  
**请求体**: `ProjectCopyRequest`  
**返回**: `Result<ProjectVO>`

#### 3.1.11 成员列表
```
GET /api/projects/{projectId}/members?keyword={keyword}&page={1}&pageSize={10}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<PageResult<ProjectMemberVO>>`

#### 3.1.12 添加成员
```
POST /api/projects/{projectId}/members
```
**权限**: owner/admin | **限流**: 20次/分钟  
**请求体**: `{userId (必填), role (必填)}`  
**返回**: `Result<Void>`

#### 3.1.13 更新成员角色
```
PUT /api/projects/{projectId}/members/role?memberId={memberId}&role={role}
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 3.1.14 移除成员
```
DELETE /api/projects/{projectId}/members/{memberId}
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 3.1.15 获取项目配置
```
GET /api/projects/{projectId}/config
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<ProjectConfigVO>`

#### 3.1.16 更新项目配置
```
PUT /api/projects/{projectId}/config
```
**权限**: owner/admin  
**请求体**: `Map<String, String>`  
**返回**: `Result<Void>`

#### 3.1.17 获取审核门禁配置
```
GET /api/projects/{projectId}/review-config
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<ProjectReviewConfigVO>`

#### 3.1.18 更新审核门禁配置
```
PUT /api/projects/{projectId}/review-config
```
**权限**: owner/admin  
**请求体**: `ProjectReviewConfigUpdateRequest` (Merge语义)  
**返回**: `Result<Void>`

#### 3.1.19 上传项目封面
```
POST /api/projects/{projectId}/cover
```
**权限**: owner/admin | **限流**: 10次/分钟  
**请求参数**: `file` (MultipartFile) 或 `url` (String) — 二选一  
**返回**: `Result<CoverUploadResponse>`

#### 3.1.20 项目统计
```
GET /api/projects/{projectId}/statistics
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<Map<String, Object>>`

---

## 4. 剧本模块 (script) — 43个端点

### 4.1 ScriptController — 剧本管理 (22个)

#### 4.1.1 分页剧本列表
```
GET /api/projects/{projectId}/scripts
```
**查询参数**: `ScriptQueryRequest` — 支持关键词/状态筛选  
**返回**: `Result<PageResult<ScriptVO>>`

#### 4.1.2 剧本详情
```
GET /api/scripts/{scriptId}
```
**返回**: `Result<ScriptDetailVO>` — 含正文、审核状态

#### 4.1.3 创建剧本
```
POST /api/projects/{projectId}/scripts
```
**请求体**: `ScriptCreateRequest` (默认状态草稿=1)  
**返回**: `Result<ScriptVO>`

#### 4.1.4 更新剧本
```
PUT /api/scripts/{scriptId}
```
**请求体**: `ScriptUpdateRequest` — 标题/描述/正文/状态  
**返回**: `Result<Void>`

#### 4.1.5 删除剧本
```
DELETE /api/scripts/{scriptId}
```
**返回**: `Result<Void>` (软删除)

#### 4.1.6 提交审核
```
POST /api/scripts/{scriptId}/submit-review?note={note}
```
**返回**: `Result<Void>` — 草稿(1)/驳回(4)→待审核(2)

#### 4.1.7 撤回审核
```
POST /api/scripts/{scriptId}/withdraw-review?reason={reason}
```
**返回**: `Result<Void>` — 待审核(2)→草稿(1)

#### 4.1.8 审核状态
```
GET /api/scripts/{scriptId}/review-status
```
**返回**: `Result<ScriptReviewStatusVO>`

#### 4.1.9 查询AI风格配置
```
GET /api/scripts/{scriptId}/style-config
```
**返回**: `Result<Object>` — 优先新表style_config，回退旧表

#### 4.1.10 查询项目参考图分析
```
GET /api/projects/{projectId}/ref-analysis
```
**返回**: `Result<RefAnalysisResultVO>`

#### 4.1.11 查询剧本参考图分析
```
GET /api/scripts/{scriptId}/ref-analysis
```
**返回**: `Result<RefAnalysisResultVO>` — 自动查找所属项目

#### 4.1.12 参考图风格反推
```
POST /api/projects/{projectId}/ref-analysis
```
**请求体**: `RefAnalysisRequest` (qwen视觉模型, 扣减积分)  
**返回**: `Result<AiProcessResultVO<RefAnalysisResultVO>>`

#### 4.1.13 资产生成进度
```
GET /api/scripts/{scriptId}/post-approval-status
```
**返回**: `Result<ScriptPostApprovalStatusVO>` — 0空闲/1处理中/2已完成/3失败

#### 4.1.14 人物小传结果
```
GET /api/scripts/{scriptId}/character-profiles
```
**返回**: `Result<Object>` — JSON数组

#### 4.1.15 资产提取结果
```
GET /api/scripts/{scriptId}/extracted-assets
```
**返回**: `Result<Object>` — 按 characters/scenes/props/costumes 分组

#### 4.1.16 音色提示词结果
```
GET /api/scripts/{scriptId}/voice-prompts
```
**返回**: `Result<Object>`

#### 4.1.17 资产图片提示词结果
```
GET /api/scripts/{scriptId}/asset-prompts
```
**返回**: `Result<Object>` — 四类: 人物/场景/道具/服装

#### 4.1.18 资产图片列表
```
GET /api/scripts/{scriptId}/asset-images
```
**返回**: `Result<List<AssetImageVO>>` — assetId/assetType/promptText/imageUrl/status

#### 4.1.19 视频提示词结果
```
GET /api/episodes/{episodeId}/video-prompts
```
**返回**: `Result<Object>`

#### 4.1.20 导出剧集
```
GET /api/projects/{projectId}/episodes/export?episodeIds={ids}&format={csv|xlsx}
```
**权限**: owner/admin/member/viewer  
**返回**: `ResponseEntity<byte[]>` (文件下载)

#### 4.1.21 导出资产数据
```
GET /api/scripts/{scriptId}/extracted-assets/export?format={csv|xlsx}
```
**返回**: `ResponseEntity<byte[]>` (文件下载)

#### 4.1.22 推送到美术团队
```
POST /api/projects/{projectId}/scripts/{scriptId}/push-to-art
```
**权限**: owner/admin/member  
**请求体**: `PushToArtRequest`  
**返回**: `Result<Map<String, Object>>` — `{success, notifiedCount}`

---

### 4.2 ScriptDecomposeController — 剧本拆解 (8个)

#### 4.2.1 AI拆解剧本
```
POST /api/projects/{projectId}/scripts/{scriptId}/decompose
```
**权限**: owner/admin/member  
**请求体**: `{force (boolean, 强制重处理)}`  
说明: 调用Dify `script_decompose` 工作流，支持幂等。  
**返回**: `Result<AiProcessResultVO<ScriptDecomposeResultVO>>`

#### 4.2.2 项目剧集列表
```
GET /api/projects/{projectId}/episodes
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<List<EpisodeVO>>` — 按sort_order排序

#### 4.2.3 剧本分集列表
```
GET /api/projects/{projectId}/scripts/{scriptId}/episodes
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<List<EpisodeVO>>`

#### 4.2.4 分集详情
```
GET /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<EpisodeVO>`

#### 4.2.5 手动创建剧集
```
POST /api/projects/{projectId}/episodes
```
**权限**: owner/admin/member  
**请求体**: `EpisodeUpdateRequest`  
**返回**: `Result<EpisodeVO>`

#### 4.2.6 更新剧集
```
PUT /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}
```
**权限**: owner/admin/member  
**请求体**: `EpisodeUpdateRequest`  
**返回**: `Result<EpisodeVO>`

#### 4.2.7 删除分集
```
DELETE /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>` (逻辑删除)

#### 4.2.8 设置父子关系
```
PATCH /api/projects/{projectId}/episodes/{episodeId}/child-of?childOf={childOf}
```
**权限**: owner/admin/member  
**返回**: `Result<EpisodeVO>`

---

### 4.3 ScriptContentController — 内容生成 (3个)

**Base**: `/api/projects/{projectId}/scripts/{scriptId}`

#### 4.3.1 生成人物小传
```
POST /api/projects/{projectId}/scripts/{scriptId}/character-profiles
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
说明: 调用Dify `character_profiles`，含姓名/身份/外貌/性格/背景/音色/关系。  
**返回**: `Result<AiProcessResultVO<CharacterProfileResultVO>>`

#### 4.3.2 提取资产表
```
POST /api/projects/{projectId}/scripts/{scriptId}/extract-assets
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
说明: 调用Dify `asset_extract`，提取人物(含等级/别名)、场景(含类型)、道具(含分类/归属)、服装(含关联)。  
**返回**: `Result<AiProcessResultVO<AssetExtractResultVO>>`

#### 4.3.3 剧本违规审核
```
POST /api/projects/{projectId}/scripts/{scriptId}/review-content
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
说明: 调用Dify `script_review`，三层检测(文字敏感词/Seedance禁词/画面违禁内容)。  
**返回**: `Result<AiProcessResultVO<ScriptReviewResultVO>>`

---

### 4.4 ScriptAssetController — 创意资产CRUD (7个)

#### 4.4.1 分页查询
```
GET /api/projects/{projectId}/script-assets
```
**权限**: owner/admin/member/viewer  
**查询参数**: `CreativeAssetQueryRequest` — 剧本/分类/子类型/来源/审核状态/关键词  
**返回**: `Result<PageResult<CreativeAssetVO>>`

#### 4.4.2 资产详情
```
GET /api/script-assets/{assetId}?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<CreativeAssetVO>` — 含创建者/来源剧本/完整谱系链

#### 4.4.3 创建资产
```
POST /api/projects/{projectId}/script-assets
```
**权限**: owner/admin/member  
**请求体**: `CreativeAssetCreateRequest` (assetType默认other)  
**返回**: `Result<CreativeAssetVO>`

#### 4.4.4 更新资产
```
PUT /api/script-assets/{assetId}?projectId={projectId}
```
**权限**: owner/admin/member  
**请求体**: `CreativeAssetUpdateRequest` — 名称/分类/描述/参考图/标签/审核状态/扩展数据/排序  
**返回**: `Result<Void>`

#### 4.4.5 上传参考图
```
POST /api/script-assets/{assetId}/upload-image?projectId={projectId}
```
**权限**: owner/admin/member  
**Content-Type**: `multipart/form-data`  
**请求参数**: `file` (MultipartFile)  
**返回**: `Result<String>` (图片URL)

#### 4.4.6 删除资产
```
DELETE /api/script-assets/{assetId}?projectId={projectId}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>` (软删除)

#### 4.4.7 批量创建
```
POST /api/projects/{projectId}/script-assets/batch
```
**权限**: owner/admin/member  
**请求体**: `CreativeAssetBatchRequest` (单次≤100条)  
**返回**: `Result<List<CreativeAssetVO>>`

---

### 4.5 ScriptAssetGenController — 资产生成 (3个)

**Base**: `/api/projects/{projectId}/scripts/{scriptId}`

#### 4.5.1 生成资产提示词
```
POST /api/projects/{projectId}/scripts/{scriptId}/assets/prompts
```
**请求体**: `AssetPromptRequest`  
说明: 根据已提取资产表生成图片提示词(人物4视角/场景广角/道具5视角)，扣减积分。  
**返回**: `Result<AiProcessResultVO<AssetPromptResultVO>>`

#### 4.5.2 生成资产图片
```
POST /api/projects/{projectId}/scripts/{scriptId}/assets/images/generate
```
**请求体**: `{sync (boolean, true=同步轮询最长120s, false=异步)}`  
说明: 调用GPT-Image-2生成，下载CDN图片到MinIO，扣减积分。  
**返回**: `Result<AssetImageResultVO>`

#### 4.5.3 资产图片审核
```
POST /api/projects/{projectId}/scripts/{scriptId}/assets/images/review
```
**请求体**: `ImageReviewRequest`  
说明: Seedance内容安全合规审核，Dify不可用时降级标记。  
**返回**: `Result<AiProcessResultVO<ImageReviewResultVO>>`

---

### 4.6 ScriptFullDescController — 全量描述 (5个)

**Base**: `/api/projects/{projectId}/scripts/{scriptId}`

```
POST /api/projects/{projectId}/scripts/{scriptId}/character-full-descriptions
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
调用Dify `character_full_desc`，基于角色+服装+风格+剧本生成。  
**返回**: `Result<AiProcessResultVO<CharFullDescResultVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/scene-full-descriptions
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
调用Dify `scene_full_desc`，基于场景+剧本+风格+人物生成。  
**返回**: `Result<AiProcessResultVO<SceneFullDescResultVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/prop-full-descriptions
```
**请求体**: `{episodeIds (可选), force (boolean)}`  
调用Dify `prop_full_desc`，基于道具+剧本+风格+人物生成。  
**返回**: `Result<AiProcessResultVO<PropFullDescResultVO>>`

```
GET /api/projects/{projectId}/scripts/{scriptId}/scene-full-descriptions
```
**返回**: `Result<List<SceneFullDescriptionVO>>`

```
GET /api/projects/{projectId}/scripts/{scriptId}/prop-full-descriptions
```
**返回**: `Result<List<PropFullDescriptionVO>>`

---

### 4.7 ScriptVoiceController — 音色提示词 (1个)

```
POST /api/projects/{projectId}/scripts/{scriptId}/voice-prompts
```
**请求体**: `{characterProfileId (小传批次), force (boolean)}`  
说明: 三步处理—①生理匹配度校验 ②角色一致性检查 ③高频角色区分度检测。  
**返回**: `Result<AiProcessResultVO<VoicePromptResultVO>>`

---

### 4.8 ScriptStyleController — 风格配置 (1个)

```
POST /api/projects/{projectId}/scripts/{scriptId}/style-config
```
**请求体**: `{keywords (必填), refAnalysisId (可选)}`  
说明: 生成六维度风格配置—①艺术风格 ②风格叙事 ③材质偏好 ④配色方案 ⑤灯光配方 ⑥避免特征。  
**返回**: `Result<AiProcessResultVO<StyleConfigResultVO>>`

---

### 4.9 ScriptStoryboardController — 分镜管理 (3个)

```
GET /api/projects/{projectId}/scripts/{scriptId}/storyboards
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<List<ScriptStoryboardVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/storyboard/decompose
```
**权限**: owner/admin/member  
**请求体**: `StoryboardDecomposeRequest`  
说明: 对指定分集AI分镜拆解，含景别/运镜/镜头类型，每4个narrative自动插1个breath。  
**返回**: `Result<AiProcessResultVO<StoryboardDecomposeResultVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/storyboard/rebuild
```
**权限**: owner/admin/member  
**请求体**: `StoryboardRebuildRequest`  
说明: 根据用户修改说明重建分镜，AI仅重建受影响段落(>30%改动全量重建)。  
**返回**: `Result<AiProcessResultVO<StoryboardRebuildResultVO>>`

---

### 4.10 ScriptVideoPromptController — 视频提示词 (4个)

```
POST /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts
```
**权限**: owner/admin/member  
**请求体**: `VideoPromptRequest`  
说明: 将分镜拆解+风格配置转为Seedance兼容JSON，自动校验P0规则。  
**返回**: `Result<AiProcessResultVO<VideoPromptResultVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/violation-check
```
**权限**: owner/admin/member  
**请求体**: `ViolationCheckRequest`  
说明: 三层违规检测—文字敏感词/Seedance禁词/画面违禁内容。  
**返回**: `Result<AiProcessResultVO<ViolationCheckResultVO>>`

```
POST /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/fix
```
**权限**: owner/admin/member  
**请求体**: `PromptFixRequest`  
说明: 根据违规检测结果最小改动替换。  
**返回**: `Result<AiProcessResultVO<PromptFixResultVO>>`

```
PUT /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/{promptId}
```
**权限**: owner/admin/member  
**请求体**: `VideoPromptUpdateRequest`  
**返回**: `Result<Void>`

---

## 5. 分镜模块 (storyboard) — 22个端点

### 5.1 StoryboardController — 分镜管理 (20个)

#### 分镜CRUD

```
GET /api/projects/{projectId}/storyboards
```
**查询参数**: `StoryboardQueryRequest` — 镜头/剧本/状态/关键词筛选  
**返回**: `Result<PageResult<StoryboardVO>>`

```
GET /api/projects/{projectId}/storyboard-boards
```
**返回**: `Result<List<StoryboardBoardVO>>` — 含分镜帧、角色参考、场景参考

```
POST /api/projects/{projectId}/storyboards
```
**限流**: 30次/秒  
**请求体**: `StoryboardCreateRequest`  
**返回**: `Result<StoryboardDetailVO>`

```
GET /api/storyboards/{storyboardId}
```
**返回**: `Result<StoryboardDetailVO>` — 含关联资产、配图、最近10条版本历史

```
PUT /api/storyboards/{storyboardId}
```
**请求体**: `StoryboardUpdateRequest` (部分更新，更新前自动创建版本快照)  
**返回**: `Result<StoryboardDetailVO>`

```
DELETE /api/storyboards/{storyboardId}
```
**返回**: `Result<Void>` (软删除)

#### 审核流程

```
POST /api/storyboards/{storyboardId}/submit-review?note={note}
```
**返回**: `Result<Void>` — 草稿(1)/驳回(4)→待审核(2)

```
POST /api/storyboards/{storyboardId}/withdraw-review?reason={reason}
```
**返回**: `Result<Void>` — 待审核(2)→草稿(1)

```
GET /api/storyboards/{storyboardId}/review-status
```
**返回**: `Result<StoryboardReviewStatusVO>` — 审核任务ID/审核人/意见/时间

```
POST /api/storyboards/batch-submit-review
```
**限流**: 10次/秒  
**请求体**: `StoryboardBatchOperationRequest` (≤100条)  
**返回**: `Result<Void>`

```
POST /api/storyboards/batch-delete
```
**限流**: 10次/秒  
**请求体**: `StoryboardBatchOperationRequest` (≤100条)  
**返回**: `Result<Void>`

#### 排序

```
PUT /api/scenes/{sceneId}/storyboards/reorder
```
**请求体**: `StoryboardReorderRequest`  
**返回**: `Result<Void>`

#### 版本管理

```
GET /api/storyboards/{storyboardId}/versions
```
**返回**: `Result<List<StoryboardVersionVO>>` — 最多10条，按版本号降序

```
POST /api/storyboards/{storyboardId}/versions/{versionId}/rollback
```
**返回**: `Result<StoryboardDetailVO>` — 回滚前自动创建当前版本快照

#### 资产关联

```
GET /api/storyboards/{storyboardId}/assets
```
**返回**: `Result<List<StoryboardAssetVO>>`

```
POST /api/storyboards/{storyboardId}/assets?assetId={assetId}&assetType={character|scene|prop|clothes|audio}
```
**返回**: `Result<Void>` — 不可重复关联

```
DELETE /api/storyboards/{storyboardId}/assets/{assetId}
```
**返回**: `Result<Void>`

#### 配图管理

```
GET /api/storyboards/{storyboardId}/images
```
**返回**: `Result<List<StoryboardImageVO>>` — 按创建时间降序

```
POST /api/storyboards/{storyboardId}/images?imageUrl={url}&imageType={main|reference|thumbnail}
```
**返回**: `Result<StoryboardImageVO>` — imageType默认main

```
DELETE /api/storyboards/images/{imageId}
```
**返回**: `Result<Void>` (软删除)

---

### 5.2 SceneController — 镜头管理 (2个)

```
GET /api/episodes/{episodeId}/scenes
```
**返回**: `Result<List<SceneVO>>` — 按scene_number升序

```
POST /api/scenes
```
**请求体**: `SceneCreateRequest` — scene_number自动递增  
**返回**: `Result<SceneVO>`

---

## 6. 角色模块 (character) — 8个端点

**Base**: `/api/projects/{projectId}/characters`

#### CRUD

```
GET /api/projects/{projectId}/characters?page={1}&pageSize={20}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<PageResult<CharacterVO>>`

```
GET /api/projects/{projectId}/characters/{characterId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<CharacterVO>`

```
POST /api/projects/{projectId}/characters
```
**权限**: owner/admin/member  
**请求体**: `CharacterCreateRequest`  
**返回**: `Result<CharacterVO>`

```
PUT /api/projects/{projectId}/characters/{characterId}
```
**权限**: owner/admin/member  
**请求体**: `CharacterUpdateRequest`  
**返回**: `Result<CharacterVO>`

```
DELETE /api/projects/{projectId}/characters/{characterId}
```
**权限**: owner/admin  
**返回**: `Result<Void>`

#### 分镜角色关联

```
GET /api/projects/{projectId}/characters/by-storyboard/{storyboardId}
```
**返回**: `Result<List<CharacterVO>>`

```
POST /api/projects/{projectId}/characters/{characterId}/link/{storyboardId}
```
**返回**: `Result<Void>`

```
DELETE /api/projects/{projectId}/characters/{characterId}/unlink/{storyboardId}
```
**返回**: `Result<Void>`

---

## 7. 资产模块 (asset) — 28个端点

### 7.1 AssetProjectController — 项目资产库 (24个)

**Base**: `/api/projects/{projectId}/assets`

#### 资产CRUD

```
GET /api/projects/{projectId}/assets
```
**查询参数**: `AssetQueryRequest` — 关键词/类型/分类/标签筛选  
**返回**: `Result<PageResult<AssetVO>>`

```
POST /api/projects/{projectId}/assets
```
**Content-Type**: `multipart/form-data`  
**请求参数**: `file` (MultipartFile), `assetName`, `assetType`(可选), `categoryId`(可选), `description`(可选), `tags`(可选,JSON数组), `allowDuplicate`(bool,默认false)  
**返回**: `Result<AssetVO>`

```
GET /api/projects/{projectId}/assets/{assetId}
```
**返回**: `Result<AssetDetailVO>` — 含版本/分类/标签

```
PUT /api/projects/{projectId}/assets/{assetId}
```
**请求体**: `AssetUpdateRequest`  
**返回**: `Result<Void>`

```
DELETE /api/projects/{projectId}/assets/{assetId}
```
**权限**: owner/admin  
**返回**: `Result<Void>` (逻辑删除)

```
GET /api/projects/{projectId}/assets/{assetId}/download
```
**返回**: `ResponseEntity<byte[]>` — Content-Type: application/octet-stream

#### 批量上传

```
POST /api/projects/{projectId}/assets/batch
```
**Content-Type**: `multipart/form-data`  
**请求参数**: `files` (List\<MultipartFile\>), `metadataJson` (String, 可选)  
**返回**: `Result<BatchUploadResultVO>`

#### 分片上传

```
POST /api/projects/{projectId}/assets/chunk-init
```
**请求体**: `AssetChunkInitRequest`  
**返回**: `Result<AssetChunkVO>` — 含uploadId

```
POST /api/projects/{projectId}/assets/chunk-upload
```
**Content-Type**: `multipart/form-data`  
**请求参数**: `uploadId`, `chunkIndex` (Integer), `file` (MultipartFile)  
**返回**: `Result<Void>`

```
POST /api/projects/{projectId}/assets/chunk-complete
```
**请求体**: `AssetChunkCompleteRequest`  
**返回**: `Result<AssetVO>`

```
DELETE /api/projects/{projectId}/assets/chunk-cancel?uploadId={uploadId}
```
**返回**: `Result<Void>`

#### 批量操作

```
POST /api/projects/{projectId}/assets/batch-delete
```
**权限**: owner/admin  
**请求体**: `AssetBatchOperationRequest`  
**返回**: `Result<Void>`

```
POST /api/projects/{projectId}/assets/batch-move
```
**请求体**: `AssetBatchOperationRequest`  
**返回**: `Result<Void>`

```
POST /api/projects/{projectId}/assets/batch-tags
```
**请求体**: `AssetBatchOperationRequest`  
**返回**: `Result<Void>`

```
DELETE /api/projects/{projectId}/assets/batch-tags
```
**请求体**: `AssetBatchOperationRequest`  
**返回**: `Result<Void>`

```
POST /api/projects/{projectId}/assets/batch-download
```
**请求体**: `AssetBatchOperationRequest`  
**返回**: `ResponseEntity<StreamingResponseBody>` — ZIP流式输出

#### 版本管理

```
GET /api/projects/{projectId}/assets/{assetId}/versions
```
**返回**: `Result<List<AssetVersionVO>>`

```
POST /api/projects/{projectId}/assets/{assetId}/rollback
```
**请求体**: `{targetVersion (Integer, ≥1)}`  
**返回**: `Result<Void>`

#### 跨库转移

```
POST /api/projects/{projectId}/assets/import-from-team
```
**请求体**: `AssetTransferRequest`  
**返回**: `Result<Void>` — 从团队参考库导入

```
POST /api/projects/{projectId}/assets/import-from-project
```
**请求体**: `AssetImportFromProjectRequest` — 禁止自身导入  
**返回**: `Result<Map<String,Object>>` — `{importedCount: int}`

#### AI生成

```
POST /api/projects/{projectId}/assets/ai-generate
```
**请求体**: `AssetAiGenerateRequest`  
**返回**: `Result<List<AssetVO>>`

#### 参考图管理

```
GET /api/projects/{projectId}/assets/reference-images?page={1}&pageSize={20}
```
**返回**: `Result<PageResult<AssetVO>>`

```
POST /api/projects/{projectId}/assets/reference-images?imageUrl={url}&imageType={reference}
```
**返回**: `Result<AssetVO>`

```
DELETE /api/projects/{projectId}/assets/reference-images/{assetId}
```
**返回**: `Result<Void>`

---

### 7.2 TeamAssetController — 团队资产库 (4个)

**Base**: `/api/teams/{teamId}`

```
GET /api/teams/{teamId}/assets
```
**查询参数**: `AssetQueryRequest`  
**返回**: `Result<PageResult<AssetVO>>`

```
GET /api/teams/{teamId}/asset-categories
```
**返回**: `Result<List<String>>` — 已使用的资产类型(去重)

```
POST /api/teams/{teamId}/assets
```
**权限**: 团队管理员  
**Content-Type**: `multipart/form-data`  
**请求参数**: `file`, `assetName`, `assetType`(必填), `categoryId`(可选), `description`(可选), `tags`(可选,逗号分隔), `allowDuplicate`(bool,默认false)  
**返回**: `Result<AssetVO>`

```
GET /api/teams/{teamId}/assets/{assetId}
```
**返回**: `Result<AssetDetailVO>`

---

## 8. 审核模块 (review) — 20个端点

**Base**: `/api/review`

#### 审核任务

```
POST /api/review/create
```
**权限**: 需项目成员(owner/admin/member)  
**请求体**: `ReviewCreateRequest`  
**返回**: `Result<ReviewTaskVO>`

```
POST /api/review/decision
```
**权限**: 仅限指定审核人  
**请求体**: `ReviewDecisionRequest`  
**返回**: `Result<Void>`

```
GET /api/review/list
```
**查询参数**: `ReviewQueryRequest` — projectId/reviewerId/status  
**返回**: `Result<PageResult<ReviewTaskVO>>`

```
GET /api/review/items
```
**查询参数**: `ReviewQueryRequest`  
**返回**: `Result<PageResult<ReviewItemVO>>` — 含目标内容

```
GET /api/review/detail/{id}
```
**返回**: `Result<ReviewDetailVO>`

```
GET /api/review/pending-count
```
**返回**: `Result<Long>`

```
POST /api/review/batch-decision
```
**请求体**: `ReviewBatchDecisionRequest` (≤100条)  
**返回**: `Result<Map<String, Integer>>` — 逐条校验权限

```
POST /api/review/{id}/withdraw
```
**权限**: 仅提交者本人  
**返回**: `Result<Void>` — 撤回→草稿

```
POST /api/review/{id}/claim
```
**返回**: `Result<Void>` — pending→reviewing，不能认领自己提交的

```
POST /api/review/{id}/archive
```
**权限**: director/admin | **返回**: `Result<Void>` — approved→archived

```
POST /api/review/{id}/dispatch?target={art|video|edit|audio}
```
**权限**: director/admin | **返回**: `Result<Void>`

```
GET /api/review/my-submissions
```
**查询参数**: `ReviewMySubmissionQueryRequest`  
**返回**: `Result<PageResult<ReviewTaskVO>>`

#### 驳回原因

```
GET /api/review/projects/{projectId}/reject-reasons
```
**返回**: `Result<List<ReviewRejectReasonVO>>`

```
POST /api/review/projects/{projectId}/reject-reasons
```
**权限**: 项目管理员  
**请求体**: `ReviewRejectReasonRequest`  
**返回**: `Result<ReviewRejectReasonVO>`

```
DELETE /api/review/projects/{projectId}/reject-reasons/{reasonId}
```
**权限**: 项目管理员  
**返回**: `Result<Void>`

#### 路由配置

```
GET /api/review/projects/{projectId}/route-config
```
**返回**: `Result<ReviewRouteConfigVO>`

```
PUT /api/review/projects/{projectId}/route-config
```
**权限**: 项目管理员  
**请求体**: `ReviewRouteConfigRequest`  
**返回**: `Result<ReviewRouteConfigVO>`

#### 通用审核状态

```
GET /api/review/status/{reviewType}/{targetId}
```
支持类型: storyboard/video/first_frame/script/image/prompt/asset  
**返回**: `Result<ReviewDetailVO>`

#### 统计与导出

```
GET /api/review/projects/{projectId}/statistics?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
```
**返回**: `Result<ReviewStatisticsVO>`

```
POST /api/review/projects/{projectId}/export?reviewType={type}&startDate={date}&endDate={date}&format={xlsx}
```
**权限**: 项目管理员  
**返回**: `Result<String>`

---

## 9. Dify AI 模块 (dify) — 17个端点

### 9.1 DifyWorkflowController — 工作流执行 (6个)

**Base**: `/api/dify-workflows` | **权限**: JWT认证

```
GET /api/dify-workflows/catalog
```
**返回**: `Result<List<DifyWorkflowCatalogVO>>` — 所有已启用工作流的输入输出定义

```
POST /api/dify-workflows/{workflowCode}/execute
```
**限流**: 30次/60秒  
**请求体**: `DifyWorkflowExecuteRequest`  
**返回**: `Result<DifyWorkflowExecuteResultVO>` (阻塞模式)

```
POST /api/dify-workflows/{workflowCode}/execute-stream
```
**限流**: 30次/60秒  
**请求体**: `DifyWorkflowExecuteRequest`  
**返回**: `SseEmitter` (text/event-stream) — 超时从配置读取(最低60s)

```
POST /api/dify-workflows/{workflowCode}/upload-file
```
**Content-Type**: `multipart/form-data`  
**请求参数**: `file` (MultipartFile) — 白名单校验(图片/视频/音频/文档)  
**返回**: `Result<DifyFileUploadVO>`

```
GET /api/dify-workflows/runs/{workflowCode}/{runId}
```
**返回**: `Result<DifyWorkflowRunStatusVO>` — 进度/输出/耗时

```
POST /api/dify-workflows/runs/{workflowCode}/{taskId}/stop
```
**返回**: `Result<Void>`

---

### 9.2 AdaptiveWorkflowController — 自适应多模态 (3个)

**Base**: `/api/dify-workflows/multimodal` | **权限**: JWT认证

```
POST /api/dify-workflows/multimodal/execute
```
**限流**: 30次/60秒  
**请求体**: `AdaptiveWorkflowRequest` — 文件自动上传+类型检测+工作流调用  
**返回**: `Result<AdaptiveWorkflowResultVO>` (阻塞模式)

```
POST /api/dify-workflows/multimodal/execute-chain
```
**限流**: 30次/60秒  
**请求体**: `AdaptiveWorkflowRequest` — 最多10步串行执行  
**返回**: `Result<ChainExecutionResultVO>` (不支持SSE)

```
POST /api/dify-workflows/multimodal/execute-stream
```
**限流**: 30次/60秒  
**请求体**: `AdaptiveWorkflowRequest` — 链式调用返回错误  
**返回**: `SseEmitter` — 超时从配置读取(最低60s)

---

### 9.3 DifyWorkflowAdminController — 工作流管理 (8个)

**Base**: `/api/admin/dify-workflows` | **权限**: PLATFORM_ADMIN

```
GET /api/admin/dify-workflows?keyword={kw}&category={cat}&type={type}&enabled={bool}&page={1}&pageSize={20}
```
**返回**: `Result<PageResult<DifyWorkflowVO>>`

```
GET /api/admin/dify-workflows/{id}
```
**返回**: `Result<DifyWorkflowDetailVO>` — API Key脱敏(app-****xxxx)

```
POST /api/admin/dify-workflows
```
**请求体**: `DifyWorkflowCreateRequest` (API Key AES-256-GCM加密存储)  
**返回**: `Result<DifyWorkflowVO>`

```
PUT /api/admin/dify-workflows/{id}
```
**请求体**: `DifyWorkflowUpdateRequest` (仅更新非null字段)  
**返回**: `Result<DifyWorkflowVO>`

```
DELETE /api/admin/dify-workflows/{id}
```
**返回**: `Result<Void>` (软删除)

```
PATCH /api/admin/dify-workflows/{id}/status
```
**请求体**: `DifyWorkflowStatusRequest`  
**返回**: `Result<Void>` — 禁用后执行接口返回9403

```
POST /api/admin/dify-workflows/test-connection?workflowCode={code}
```
**返回**: `Result<DifyWorkflowTestConnectionResultVO>`

```
POST /api/admin/dify-workflows/test-all-connections
```
**返回**: `Result<DifyWorkflowTestAllResultVO>`

---

### 9.4 DifyTestController — 开发调试 (4个)

**Base**: `/api/test/dify` | **权限**: dev环境 + PLATFORM_ADMIN

```
POST /api/test/dify/direct-call
```
**请求体**: `Map<String, Object>` (可选)  
**返回**: `Object` — 硬编码直连Dify

```
POST /api/test/dify/db-call?workflowCode={code}
```
**请求体**: `Map<String, Object>` (可选)  
**返回**: `Object` — 从数据库读配置发请求

```
GET /api/test/dify/compare?workflowCode={code}
```
**返回**: `Object` — 逐项对比参考配置与数据库配置

```
GET /api/test/dify/reference-config
```
**返回**: `Object` — 参考脚本完整配置(脱敏)

---

## 10. AI视频模块 (aivideo) — 3个端点

```
POST /api/prompts/{promptId}/submit-review?projectId={projectId}&note={note}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>`

```
POST /api/prompts/{promptId}/withdraw-review?projectId={projectId}&reason={reason}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>`

```
GET /api/prompts/{promptId}/review-status?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<PromptReviewStatusVO>`

---

## 11. AI处理记录模块 (aiprocess) — 3个端点

```
GET /api/ai-process/history?projectId={projectId}&type={type}&businessId={businessId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<List<AiProcessHistoryVO>>`

```
GET /api/ai-process/history/{recordId}?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<AiProcessRecord>`

```
GET /api/ai-process/status?projectId={projectId}&type={type}&businessId={businessId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<AiProcessRecord>`

---

## 12. AI基础设施 (AiController) — 1个端点

```
POST /api/ai/style-inference
```
**请求体**: `StyleInferenceRequest`  
**返回**: `Result<StyleInferenceResponse>`

---

## 13. Seedance视频生成 — 7个端点

```
POST /api/seedance/generations/preview?projectId={projectId}
```
**权限**: owner/admin/member  
**请求体**: `SeedanceGenerateRequest`  
**返回**: `Result<SeedancePreviewVO>`

```
POST /api/seedance/generations?projectId={projectId}
```
**权限**: owner/admin/member  
**请求体**: `SeedanceGenerateRequest`  
**返回**: `Result<SeedanceSubmitVO>`

```
GET /api/seedance/tasks?projectId={projectId}&page={1}&pageSize={10}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<PageResult<SeedanceTaskVO>>`

```
GET /api/seedance/tasks/{taskId}?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<SeedanceTaskVO>`

```
GET /api/seedance/tasks/{taskId}/result?projectId={projectId}&resolution={720p}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<SeedanceResultVO>`

```
POST /api/seedance/tasks/{taskId}/cancel?projectId={projectId}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>`

```
GET /api/seedance/tasks/export?projectId={projectId}&status={status}&from={yyyy-MM-dd}&to={yyyy-MM-dd}&format={csv}
```
**权限**: owner/admin/member/viewer  
**返回**: `ResponseEntity<byte[]>` (文件下载)

---

## 14. GPT-Image模块 — 7个端点

```
POST /api/gpt-image/generations?projectId={projectId}
```
**权限**: owner/admin/member  
**请求体**: `GptImageGenerateRequest`  
**返回**: `Result<GptImageSubmitVO>`

```
GET /api/gpt-image/tasks/{taskId}?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<GptImageTaskVO>`

```
POST /api/gpt-image/tasks/{taskId}/cancel?projectId={projectId}
```
**权限**: owner/admin/member  
**返回**: `Result<Void>`

```
GET /api/gpt-image/tasks/{taskId}/result?projectId={projectId}&resolution={1k}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<GptImageResultVO>`

```
GET /api/gpt-image/tasks/{taskId}/review-status?projectId={projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<ReviewDetailVO>`

```
GET /api/gpt-image/models
```
**返回**: `Result<List<GptImageModelVO>>` (无需权限)

```
GET /api/gpt-image/models/{modelCode}
```
**返回**: `Result<GptImageModelVO>` (无需权限)

---

## 15. 视频模型管理 (video) — 5个端点

**权限**: PLATFORM_ADMIN

```
GET /api/admin/videos/models
```
**返回**: `Result<List<VideoModelVO>>`

```
POST /api/admin/videos/models
```
**请求体**: `VideoModelCreateRequest`  
**返回**: `Result<VideoModelVO>`

```
PUT /api/admin/videos/models/{modelId}
```
**请求体**: `Map<String, Object>`  
**返回**: `Result<VideoModelVO>`

```
DELETE /api/admin/videos/models/{modelId}
```
**返回**: `Result<Void>`

```
PATCH /api/admin/videos/models/{modelId}/status?enable={bool}
```
**返回**: `Result<Void>`

---

## 16. 剪辑模块 (edit) — 11个端点

**Base**: `/api/edit`

#### 项目CRUD

```
POST /api/edit/projects
```
**请求体**: `EditProjectCreateRequest`  
**返回**: `Result<EditProjectVO>`

```
GET /api/edit/projects?teamId={teamId}&page={1}&pageSize={20}
```
**返回**: `Result<PageResult<EditProjectVO>>`

```
GET /api/edit/projects/{projectId}
```
**返回**: `Result<EditProjectVO>`

```
PUT /api/edit/projects/{projectId}
```
**请求体**: `EditProjectCreateRequest`  
**返回**: `Result<EditProjectVO>`

```
DELETE /api/edit/projects/{projectId}
```
**返回**: `Result<Void>`

#### 片段管理

```
POST /api/edit/projects/{projectId}/segments
```
**请求体**: `EditSegmentCreateRequest`  
**返回**: `Result<EditSegmentVO>`

```
PUT /api/edit/projects/{projectId}/segments/{segmentId}
```
**请求体**: `EditSegmentCreateRequest`  
**返回**: `Result<Void>`

```
DELETE /api/edit/projects/{projectId}/segments/{segmentId}
```
**返回**: `Result<Void>`

```
PUT /api/edit/projects/{projectId}/segments/reorder
```
**请求体**: `EditSegmentReorderRequest`  
**返回**: `Result<Void>`

#### 导出

```
POST /api/edit/projects/{projectId}/export
```
**请求体**: `EditExportRequest`  
**返回**: `Result<EditExportTaskVO>`

```
GET /api/edit/exports/{exportId}
```
**返回**: `Result<EditExportTaskVO>`

---

## 17. Webhook模块 — 5个端点

**Base**: `/api/projects/{projectId}/webhooks`

```
POST /api/projects/{projectId}/webhooks
```
**权限**: owner/admin  
**请求体**: `WebhookConfigRequest`  
**返回**: `Result<WebhookConfig>`

```
PUT /api/projects/{projectId}/webhooks/{id}
```
**权限**: owner/admin  
**请求体**: `WebhookConfigRequest`  
**返回**: `Result<WebhookConfig>`

```
DELETE /api/projects/{projectId}/webhooks/{id}
```
**权限**: owner/admin  
**返回**: `Result<Void>`

```
GET /api/projects/{projectId}/webhooks
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<List<WebhookConfig>>`

```
POST /api/projects/{projectId}/webhooks/{id}/test
```
**权限**: owner/admin  
**返回**: `Result<Void>`

---

## 18. 数据历史模块 (datahistory) — 3个端点

```
GET /api/data-history?entityType={type}&entityId={id}
```
**返回**: `Result<List<DataHistoryVO>>`

```
GET /api/data-history/{historyId}
```
**返回**: `Result<DataHistoryDetailVO>`

```
POST /api/data-history/rollback
```
**权限**: owner/admin  
**请求体**: `{entityType, entityId, targetVersion}`  
**返回**: `Result<DataHistoryVO>`

---

## 19. 系统配置模块 (config) — 8个端点

**Base**: `/api/admin/config` | **权限**: PLATFORM_ADMIN

```
GET /api/admin/config?page={1}&pageSize={20}
```
**返回**: `Result<PageResult<ConfigVO>>`

```
GET /api/admin/config/{key}
```
**返回**: `Result<ConfigVO>`

```
GET /api/admin/config/group/{groupName}
```
**返回**: `Result<List<ConfigVO>>`

```
POST /api/admin/config
```
**请求体**: `{configKey, configValue, valueType, isEncrypted, isSensitive, groupName, description}`  
**返回**: `Result<Void>`

```
PUT /api/admin/config/{key}
```
**请求体**: `{configValue}`  
**返回**: `Result<Void>`

```
DELETE /api/admin/config/{key}
```
**返回**: `Result<Void>`

```
POST /api/admin/config/refresh
```
**返回**: `Result<Void>` — 刷新缓存

```
GET /api/admin/config/audit?page={1}&pageSize={20}
```
**返回**: `Result<PageResult<ConfigAuditVO>>`

---

## 20. 通用文件服务 — 1个端点

```
GET /api/file/**
```
**认证**: 无(公开)  
说明: 通配路径，剩余部分作为MinIO存储路径读取文件，优先302重定向预签名URL。  
**返回**: `ResponseEntity<?>`

---

## 21. 积分模块 (token)

### 21.1 CreditController — 积分管理 (6个)

```
GET /api/credits/me
```
**返回**: `Result<CreditBalanceVO>` — 个人积分余额

```
GET /api/credits/project/{projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<CreditBalanceVO>` — 项目积分余额

```
GET /api/credits/transactions?page={1}&pageSize={20}
```
**返回**: `Result<List<CreditTransactionVO>>` — 个人积分流水

```
PUT /api/credits/alert-threshold
```
**请求体**: `CreditAlertThresholdRequest`  
**返回**: `Result<CreditAlertThresholdVO>`

```
GET /api/credits/transactions/export?projectId={id}&type={type}&from={date}&to={date}&format={csv|xlsx}
```
**返回**: `ResponseEntity<byte[]>` (文件下载)

```
GET /api/credits/pricing
```
**返回**: `Result<List<CreditPricingConfig>>` — 模型定价列表

---

### 21.2 TokenUsageController — Token用量 (4个)

```
GET /api/token-usage/me
```
**返回**: `Result<TokenUsageStatsVO>` — 个人Token用量统计

```
GET /api/token-usage/records?page={1}&pageSize={20}
```
**返回**: `Result<List<TokenUsageVO>>` — 个人Token用量记录

```
GET /api/token-usage/project/{projectId}
```
**权限**: owner/admin/member/viewer  
**返回**: `Result<TokenUsageStatsVO>` — 项目Token用量

```
GET /api/token-usage/team/{teamId}
```
**权限**: 团队成员  
**返回**: `Result<TokenUsageStatsVO>` — 团队Token用量

---

## 22. 通知模块 (notification) — 23个端点

**Base**: `/api/notifications`

### 通知接收

```
GET /api/notifications
```
**查询参数**: `NotificationQueryRequest` — 类型/分类/时间筛选  
**返回**: `Result<PageResult<NotificationVO>>`

```
GET /api/notifications/{id}
```
**返回**: `Result<NotificationDetailVO>` — 自动标记已读

```
GET /api/notifications/unread-count
```
**返回**: `Result<Integer>`

```
POST /api/notifications
```
**请求体**: `NotificationCreateRequest`  
**返回**: `Result<NotificationVO>` — 普通用户仅能给自己创建

```
GET /api/notifications/search?keyword={kw}
```
**查询参数**: `keyword` + `NotificationQueryRequest`  
**返回**: `Result<PageResult<NotificationVO>>`

### 标记操作

```
POST /api/notifications/{id}/read
```
**返回**: `Result<Void>`

```
POST /api/notifications/{id}/unread
```
**返回**: `Result<Void>`

```
POST /api/notifications/batch-read
```
**请求体**: `List<String>` (≤100条)  
**返回**: `Result<Void>`

```
POST /api/notifications/read-all
```
**返回**: `Result<Void>`

### 收藏

```
POST /api/notifications/{id}/star
```
**返回**: `Result<Void>` — 收藏/取消切换

```
GET /api/notifications/starred
```
**查询参数**: `NotificationQueryRequest`  
**返回**: `Result<PageResult<NotificationVO>>`

### 删除

```
DELETE /api/notifications/{id}
```
**返回**: `Result<Void>`

```
POST /api/notifications/batch-delete
```
**请求体**: `List<String>` (≤100条)  
**返回**: `Result<Void>`

```
POST /api/notifications/clear-read
```
**返回**: `Result<Void>` — 清空所有已读

### 导出

```
GET /api/notifications/export
```
**查询参数**: `NotificationExportRequest`  
**返回**: `ResponseEntity<byte[]>` (CSV下载)

### 偏好设置

```
GET /api/notifications/preference
```
**返回**: `Result<NotificationPreferenceVO>`

```
PUT /api/notifications/preference
```
**请求体**: `NotificationPreferenceRequest`  
**返回**: `Result<Void>`

### 免打扰

```
GET /api/notifications/dnd
```
**返回**: `Result<NotificationDndVO>`

```
PUT /api/notifications/dnd
```
**请求体**: `NotificationDndRequest`  
**返回**: `Result<Void>`

### 订阅管理

```
GET /api/notifications/subscribe
```
**返回**: `Result<List<NotificationSubscribeVO>>`

```
POST /api/notifications/subscribe
```
**请求体**: `NotificationSubscribeRequest`  
**返回**: `Result<Void>`

```
DELETE /api/notifications/subscribe/{id}
```
**返回**: `Result<Void>`

### WebSocket

```
POST /api/notifications/ws-token
```
**返回**: `Result<Map<String,String>>` — `{token, expiresIn}` (5分钟有效)

---

## 23. 统计模块 (statistics) — 23个端点

### 平台级统计 (6个)

```
GET /api/statistics/dashboard?teamId={teamId}
```
**返回**: `Result<DashboardVO>` — 核心指标看板

```
GET /api/statistics/trends?eventType={type}
```
**查询参数**: `StatisticsQueryRequest`  
**返回**: `Result<TrendVO>`

```
GET /api/statistics/teams/{teamId}/trends?eventType={type}
```
**权限**: 团队成员  
**查询参数**: `StatisticsQueryRequest`  
**返回**: `Result<TrendVO>`

```
GET /api/statistics/realtime
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Map<String,Object>>` — 在线用户/进行中任务

```
GET /api/statistics/alerts
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<List<AlertVO>>`

```
GET /api/statistics/teams/ranking
```
**返回**: `Result<List<Map<String,Object>>>` — 管理员全量/普通用户仅自己团队

### 团队级统计 (3个)

```
GET /api/statistics/teams/{teamId}/projects/completion
```
**权限**: 团队成员  
**查询参数**: `StatisticsQueryRequest`  
**返回**: `Result<ProjectStatisticsVO>`

```
GET /api/statistics/teams/{teamId}/users/activity
```
**权限**: 团队管理员  
**查询参数**: `StatisticsQueryRequest`  
**返回**: `Result<UserStatisticsVO>`

```
GET /api/statistics/teams/{teamId}/users/contribution
```
**权限**: 团队管理员  
**返回**: `Result<List<UserStatisticsVO.RankingItem>>`

### 项目级统计 (3个)

```
GET /api/statistics/projects/{projectId}/storyboards
```
**权限**: 项目成员  
**返回**: `Result<Map<String,Object>>`

```
GET /api/statistics/projects/{projectId}/videos
```
**权限**: 项目成员  
**返回**: `Result<Map<String,Object>>`

```
GET /api/statistics/projects/{projectId}/resources
```
**权限**: 项目成员  
**返回**: `Result<Map<String,Object>>` — AI/存储资源消耗

### 报表管理 (6个)

```
POST /api/statistics/teams/{teamId}/reports/custom
```
**权限**: 团队管理员  
**请求体**: `ReportCreateRequest`  
**返回**: `Result<Map<String,Object>>`

```
POST /api/statistics/teams/{teamId}/reports/scheduled
```
**权限**: 团队管理员  
**请求体**: `ReportCreateRequest`  
**返回**: `Result<StatisticsReportVO>`

```
PUT /api/statistics/teams/{teamId}/reports/scheduled/{id}
```
**权限**: 团队管理员  
**请求体**: `ReportUpdateRequest`  
**返回**: `Result<StatisticsReportVO>`

```
DELETE /api/statistics/teams/{teamId}/reports/scheduled/{id}
```
**权限**: 团队管理员  
**返回**: `Result<Void>`

```
GET /api/statistics/teams/{teamId}/reports/scheduled
```
**权限**: 团队成员  
**返回**: `Result<List<StatisticsReportVO>>`

```
POST /api/statistics/teams/{teamId}/export
```
**权限**: 团队成员  
**请求体**: `ReportExportRequest`  
**返回**: `ResponseEntity<byte[]>` (Excel/CSV下载)

### 用量追踪 (4个)

```
GET /api/statistics/projects/{projectId}/usage
```
**权限**: 团队成员  
**返回**: `Result<UsageStatisticsVO>`

```
GET /api/statistics/projects/{projectId}/usage/detail
```
**权限**: 团队成员  
**查询参数**: `UsageQueryRequest`  
**返回**: `Result<PageResult<UsageRecord>>`

```
GET /api/statistics/projects/{projectId}/ai-usage
```
**权限**: owner/admin  
**返回**: `Result<Map<String,Object>>`

```
GET /api/statistics/teams/{teamId}/workload
```
**权限**: 团队管理员  
**返回**: `Result<Map<String,Object>>`

```
GET /api/statistics/credits
```
**返回**: `Result<Map<String,Object>>` — 当前用户积分余额和使用历史

---

## 24. 管理后台 REST API

### 24.1 仪表盘 (2个)

```
GET /api/admin/dashboard/stats
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Map<String, Object>>` — 用户/团队/项目总数, 今日AI调用次数

```
GET /api/admin/dashboard/storage
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Map<String, Object>>` — 文件总数和总存储大小

### 24.2 用户管理 (3个)

```
GET /api/admin/users?page={1}&pageSize={20}&keyword={kw}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<PageResult<SysUser>>`

```
GET /api/admin/users/{id}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<SysUser>`

```
PUT /api/admin/users/{id}/status?status={0|1}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Void>`

### 24.3 团队管理 (2个)

```
GET /api/admin/manage/teams?page={1}&pageSize={20}&keyword={kw}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<PageResult<Map<String, Object>>>`

```
GET /api/admin/manage/teams/{id}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Map<String, Object>>` — id, teamName, teamCode, description, ownerId, ownerName, memberCount, projectCount, memberLimit, status, createTime, updateTime

### 24.4 菜单管理 (6个)

```
GET /api/admin/menus
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<List<SysMenuVO>>` — 树形结构含children

```
POST /api/admin/menus
```
**权限**: PLATFORM_ADMIN  
**请求体**: `SysMenuCreateRequest`  
**返回**: `Result<SysMenuVO>`

```
PUT /api/admin/menus/{menuId}
```
**权限**: PLATFORM_ADMIN  
**请求体**: `SysMenuUpdateRequest`  
**返回**: `Result<SysMenuVO>`

```
DELETE /api/admin/menus/{menuId}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Void>` — 有子菜单则拒绝

```
PATCH /api/admin/menus/{menuId}/status
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Void>` — 切换启用/禁用

```
PUT /api/admin/menus/reorder
```
**权限**: PLATFORM_ADMIN  
**请求体**: `SysMenuReorderRequest`  
**返回**: `Result<Void>`

### 24.5 审计日志 (2个)

```
GET /api/admin/audit-logs?page={1}&pageSize={20}&operation={type}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<PageResult<AuditLog>>`

```
GET /api/admin/audit-logs/export?userId={id}&actionType={type}&from={date}&to={date}&format={csv|xlsx}
```
**权限**: PLATFORM_ADMIN  
**返回**: `ResponseEntity<byte[]>` (文件下载)

### 24.6 计费配置 (6个)

```
GET /api/admin/billing
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<List<CreditPricingConfig>>`

```
GET /api/admin/billing/{id}
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<CreditPricingConfig>`

```
POST /api/admin/billing
```
**权限**: PLATFORM_ADMIN  
**请求体**: `PricingCreateRequest`  
**返回**: `Result<CreditPricingConfig>`

```
PUT /api/admin/billing/{id}
```
**权限**: PLATFORM_ADMIN  
**请求体**: `PricingUpdateRequest`  
**返回**: `Result<CreditPricingConfig>` — 自动记录调价历史

```
PUT /api/admin/billing/{id}/toggle
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<Void>`

```
GET /api/admin/billing/{id}/history
```
**权限**: PLATFORM_ADMIN  
**返回**: `Result<List<PricingHistory>>`

---

## 25. 管理后台页面 (Thymeleaf)

**权限**: Cookie认证 (astracloud_token)

```
GET /admin/login          — 登录页 (支持 ?error=invalid)
POST /admin/login         — 处理登录
GET /admin/logout         — 退出
GET /admin/ 或 /admin/dashboard  — 仪表盘
GET /admin/users          — 用户管理
GET /admin/billing        — 计费配置
GET /admin/teams          — 团队管理
GET /admin/audit          — 审计日志
GET /admin/menus          — 菜单管理
```

---

## 模块端点统计

| 模块 | 端点数 | 模块 | 端点数 |
|------|:------:|------|:------:|
| 认证 (auth) | 15 | 团队 (team) | 45 |
| 项目 (project) | 20 | 剧本 (script) | 43 |
| 分镜 (storyboard) | 22 | 角色 (character) | 8 |
| 资产 (asset) | 28 | 审核 (review) | 20 |
| Dify AI | 17 | AI视频 (aivideo) | 3 |
| AI处理记录 (aiprocess) | 3 | AI基础设施 | 1 |
| Seedance | 7 | GPT-Image | 7 |
| 视频模型 (video) | 5 | 剪辑 (edit) | 11 |
| Webhook | 5 | 数据历史 (datahistory) | 3 |
| 系统配置 (config) | 8 | 文件服务 (common) | 1 |
| 积分 (token) | 10 | 通知 (notification) | 23 |
| 统计 (statistics) | 23 | 管理后台REST | 19 |
| 管理后台页面 | 9 | **合计** | **~360** |

> 文档生成时间: 2026-06-07 · 基于 47 个 Controller 代码自动生成
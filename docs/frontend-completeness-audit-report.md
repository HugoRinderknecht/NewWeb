# AstraCloud 前端系统全面功能完整性检查报告

> 检查日期：2026-05-30
> 检查范围：前端所有页面、API封装层、Store层与后端API文档的对比分析
> 后端API文档：`docs/Api.json`（AstraCloud API 文档 v1.0.0）

---

## 一、总体评估

| 指标 | 数值 |
|------|------|
| 后端 API 端点总数 | **336** |
| 前端 API 封装函数总数 | **~330** |
| 前端 API 封装覆盖率 | **97%**（326/336） |
| API 函数实际被页面调用率 | **~36%**（~120/330） |
| 页面总数 | **111 个 .vue 文件** |
| 完全无 API 调用的功能页面 | **48 个** |
| 完全未使用的 API 文件 | **5 个**（49个函数） |
| 整体功能完整度估算 | **约 35–40%** |

**核心结论**：项目 API 封装层非常完善（97%覆盖率），但**页面层与 API 的对接率极低**。大量页面停留在"UI 原型"阶段——有完整的界面布局和交互逻辑，但数据来源是硬编码 Mock，操作反馈是 `ElMessage.success` 假成功提示，实际未调用任何后端 API。

---

## 二、API 封装层缺失（后端有接口，前端完全没封装）

共 **10 个**后端接口在前端没有任何 API 封装函数：

| 模块 | 接口 | 说明 |
|------|------|------|
| 提示词-审核 | `POST /api/prompts/{promptId}/submit-review` | 提交提示词审核 |
| 提示词-审核 | `POST /api/prompts/{promptId}/withdraw-review` | 撤回提示词审核 |
| 提示词-审核 | `GET /api/prompts/{promptId}/review-status` | 获取提示词审核状态 |
| 文件服务 | `GET /api/file/**` | 获取存储文件(代理) |
| 管理后台-仪表盘 | `GET /api/admin/dashboard/storage` | 存储统计 |
| 管理后台-仪表盘 | `GET /api/admin/dashboard/stats` | 核心统计数据 |
| 管理后台-团队管理 | `GET /api/admin/manage/teams` | 团队列表 |
| 管理后台-团队管理 | `GET /api/admin/manage/teams/{id}` | 团队详情 |
| 管理后台-审计日志 | `GET /api/admin/audit-logs` | 审计日志列表 |
| 认证与用户 | `GET /api/auth/avatar/file` | 获取头像文件流(代理) |

> ⚠️ **"提示词-审核"** 是一个完整的后端模块，前端完全没有对应封装，属于**模块级缺失**。

---

## 三、各模块功能完整性详细检查

### 3.1 认证模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `auth/login` | ✅ 登录、验证码 | ❌ 退出登录(`fetchLogout`)未实现 | 🔴 P0 |
| 全局 | — | ❌ Token 自动刷新(`fetchRefresh`/`fetchRefreshToken`)未实现 | 🔴 P0 |
| `auth/forget-password` | UI已搭建 | ❌ 未调用`fetchResetPassword`，页面为空壳 | 🔴 P0 |
| `auth/join-team` | UI已搭建 | ❌ 未调用`fetchApplyJoinTeam`/`fetchJoinByCode` | 🔴 P0 |
| 全局 | — | ❌ `fetchUpdateProfile`/`fetchUploadAvatar`未使用 | 🟠 P1 |
| 全局 | — | ❌ `fetchEmailCaptcha`未使用 | 🟠 P1 |
| 全局 | — | ❌ `fetchGetPermissions`未使用 | 🟡 P2 |

**auth.ts API 使用情况**：13个函数，仅4个使用（`fetchRegister`、`fetchCaptcha`、`fetchLogin`、`fetchGetUserInfo`），9个未使用。

---

### 3.2 项目管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `project/list` | 列表展示(通过store) | ❌ 创建项目按钮无API、❌ 封面上传 | 🟠 P1 |
| `project/edit` | UI已搭建 | ❌ 未调用`fetchUpdateProject`，编辑保存为假操作 | 🟠 P1 |
| `project/member` | UI已搭建 | ❌ 添加/移除/角色更新为假操作 | 🟠 P1 |
| `project/scripts` | UI已搭建 | ❌ 未调用剧本列表API | 🟠 P1 |
| `project/characters` | 列表展示(通过store) | ❌ 角色 CRUD(7/8 API未使用)、❌ 分镜关联/取消关联 | 🟠 P1 |
| `project/episodes` | 分集列表 | ❌ 分集创建/编辑/删除为假操作 | 🟠 P1 |
| `project/statistics` | UI已搭建 | ❌ 未调用`fetchGetProjectStatistics` | 🟡 P2 |
| 全局 | — | ❌ 解档、状态更新、审核配置读写、项目配置更新 | 🟠 P1 |

**project.ts API 使用情况**：20个函数，11个使用，9个未使用。
**character.ts API 使用情况**：8个函数，1个使用，7个未使用。

---

### 3.3 剧本管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `script/library` | 列表展示 | ❌ 提交审核/撤回审核按钮无API、❌ 剧本创建/删除为假操作 | 🟠 P1 |
| `script/write` | 编辑器UI | ❌ 完全未调用任何API，保存/加载为本地操作 | 🟠 P1 |
| `script/decompose` | 拆解按钮 | ❌ 仅调用`fetchDecomposeStoryboard`，未调用`fetchDecomposeScript` | 🟡 P2 |
| `script/profiles` | 生成按钮 | ❌ 仅调用生成API，未调用`fetchGetCharacterProfiles`获取结果 | 🟡 P2 |
| `script/ai-review` | 部分审核 | ❌ 未调用`fetchReviewScriptContent`违规审核 | 🟠 P1 |
| `script/version` | 版本列表 | 部分实现 | 🟡 P2 |
| **无页面** | — | ❌ 剧本资产提取/提示词生成/图片生成/审核(10个API全未使用) | 🟠 P1 |
| **无页面** | — | ❌ 风格配置生成/获取、参考图分析、音色提示词 | 🟠 P1 |
| **无页面** | — | ❌ 视频提示词获取 | 🟡 P2 |

**script.ts API 使用情况**：30个函数，7个使用，23个未使用。
**script-asset.ts API 使用情况**：10个函数，0个使用，10个未使用（100%未使用）。

---

### 3.4 分镜管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `storyboard/design` | UI已搭建 | ❌ 完全依赖硬编码数据，未调用任何API | 🟠 P1 |
| `storyboard/scene` | UI已搭建 | ❌ 完全依赖硬编码数据，镜头列表/创建/排序未对接 | 🟠 P1 |
| `storyboard/preview` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🟠 P1 |
| `storyboard/batch-edit` | 列表加载 | ❌ 批量提交审核/批量操作未实现 | 🟡 P2 |
| 全局 | — | ❌ 分镜审核提交/撤回/批量提交 | 🟠 P1 |
| 全局 | — | ❌ 版本历史/回滚 | 🟠 P1 |
| 全局 | — | ❌ 配图管理(获取/添加/删除) | 🟠 P1 |
| 全局 | — | ❌ 资产关联/解除 | 🟠 P1 |
| 全局 | — | ❌ 分镜排序 | 🟡 P2 |
| 全局 | — | ❌ 分镜重建 | 🟡 P2 |

**storyboard.ts API 使用情况**：24个函数，6个使用，18个未使用。

---

### 3.5 审核中心模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `review/content` | 审核项列表+决定 | ✅ 相对完善 | — |
| `review/flow` | 路由配置查看 | ❌ 未调用`fetchUpdateReviewRouteConfig`，配置更新为假操作 | 🟠 P1 |
| `review/pending` | 待审列表 | ❌ 认领/归档/下发成果未对接API | 🟠 P1 |
| `review/detail` | UI已搭建 | ❌ 未调用`fetchGetReviewDetail` | 🟠 P1 |
| `review/reject-reasons` | 原因列表 | ❌ 添加/删除驳回原因未对接API | 🟡 P2 |
| `review/statistics` | UI已搭建 | ❌ 未调用统计/导出API | 🟡 P2 |
| 全局 | — | ❌ 批量审核决定 | 🟠 P1 |
| 全局 | — | ❌ 通用审核状态查询 | 🟡 P2 |

**review.ts API 使用情况**：20个函数，8个使用，12个未使用。

---

### 3.6 资产管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `asset/upload` | UI已搭建 | ❌ 单文件/批量/分片上传均未对接API | 🟠 P1 |
| `asset/category` | UI已搭建 | ❌ 分类CRUD和批量移动未对接API | 🟠 P1 |
| `asset/library` | 列表+删除 | ❌ 详情/更新/下载/版本管理未对接 | 🟠 P1 |
| `asset/reuse` | 团队资产列表 | ❌ 从团队库导入未对接 | 🟡 P2 |
| `asset/tags` | UI已搭建 | ❌ 标签批量添加/移除未对接API | 🟠 P1 |
| `asset/import` | UI已搭建 | ❌ 导入功能未对接API | 🟠 P1 |
| `asset/ai-generate` | 风格反推 | ✅ 部分实现 | — |
| `asset/preview` | 列表展示 | ❌ 预览功能不完整 | 🟡 P2 |
| `gpt-image/generate` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🟡 P2 |
| `gpt-image/tasks` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🟡 P2 |
| `gpt-image/models` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🟡 P2 |

**asset.ts API 使用情况**：27个函数，4个使用，23个未使用。
**image.ts API 使用情况**：6个函数，3个使用，3个未使用。

---

### 3.7 视频生成模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `video-gen/ai` | 提交生成+预览 | ✅ 相对完善 | — |
| `video-gen/task` | 任务列表+取消 | ❌ 任务详情/结果获取未对接 | 🟡 P2 |
| `video-gen/preview` | 列表展示 | ❌ 视频播放/下载为占位符 | 🟡 P2 |
| `video-gen/history` | 列表展示 | ❌ 视频播放/下载为占位符 | 🟡 P2 |
| 全局 | — | ❌ 视频提示词生成/违规检测/修复(3个API未使用) | 🟡 P2 |

**video.ts API 使用情况**：9个函数，4个使用，5个未使用。

---

### 3.8 剪辑工作台模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `editor/edit-manage` | 项目列表/创建/删除 | ❌ 项目详情未对接 | 🟡 P2 |
| `editor/timeline` | UI已搭建 | ❌ **功能缺口最大**——片段添加/更新/删除/排序全部未对接API | 🟠 P1 |
| `editor/export` | 导出+状态查询 | ✅ 相对完善 | — |

**editor.ts API 使用情况**：11个函数，6个使用，5个未使用。

---

### 3.9 团队管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `team/list` | 团队列表/切换/退出 | ❌ 申请加入/邀请码加入未对接 | 🟡 P2 |
| `team/members` | 成员列表/角色/状态/移除 | ❌ 批量导入未对接 | 🟡 P2 |
| `team/roles` | 角色CRUD+权限 | ✅ 相对完善(通过store) | — |
| `team/invite-codes` | 邀请码列表/创建/撤销 | ✅ 已实现 | — |
| `team/applications` | UI已搭建 | ❌ 申请审批通过/拒绝未对接API | 🟡 P2 |
| `team/quota` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🟡 P2 |
| `team/settings` | 团队信息更新/所有权转移 | ✅ 已实现 | — |
| 全局 | — | ❌ 成员权限查看/设置、我的申请/我的权限查询 | 🟡 P2 |

**team.ts API 使用情况**：30个函数，23个使用，7个未使用。

---

### 3.10 通知中心模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `notice/site` | 列表(通过store) | ❌ 详情/删除/标记未读/批量操作/收藏/搜索/导出均未对接 | 🟡 P2 |
| `notice/remind` | 偏好设置(通过store) | ❌ 免打扰设置/订阅管理未对接 | 🟡 P2 |
| 全局 | — | ❌ WebSocket Token获取、实时推送未实现 | 🟡 P2 |

**notification.ts API 使用情况**：22个函数，6个使用，16个未使用。

---

### 3.11 积分管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `points/billing` | UI已搭建 | ❌ 未调用积分余额API | 🟡 P2 |
| `points/record` | UI已搭建 | ❌ 未调用消费记录API | 🟡 P2 |
| `points/transactions` | 交易查询 | ✅ 已实现 | — |
| `points/token-usage` | Token用量 | ✅ 已实现 | — |
| `points/pricing` | 定价列表 | ✅ 已实现 | — |

**points.ts API 使用情况**：8个函数，3个使用，5个未使用。

---

### 3.12 工作流模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `workflow/list` | 连通性测试 | ❌ 工作流CRUD/启用禁用/批量测试未对接 | 🟡 P2 |
| `workflow/execute` | SSE流式执行 | ❌ 文件上传/阻塞执行/停止/状态查询/多模态/链式执行未对接 | 🟡 P2 |
| `workflow/catalog` | UI已搭建 | ❌ 未调用`fetchGetWorkflowCatalog` | 🟡 P2 |

**workflow.ts API 使用情况**：10个函数，2个使用，8个未使用。
**workflow-manage.ts API 使用情况**：8个函数，1个使用，7个未使用。

---

### 3.13 数据统计模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `stats/usage` | UI已搭建 | ❌ 未调用统计API | 🔵 P3 |
| `stats/analysis` | 项目分析+用户活跃 | ✅ 部分实现 | — |
| `stats/cost` | 积分流水 | ✅ 已实现 | — |
| `stats/dashboard` | UI已搭建 | ❌ 未调用统计API | 🔵 P3 |
| `stats/report` | 导出报表 | ✅ 部分实现 | — |
| `stats/ai-usage` | Token用量 | ✅ 已实现 | — |

**statistics.ts API 使用情况**：24个函数，6个使用，18个未使用。

---

### 3.14 系统管理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `system/user` | 用户列表 | ❌ 用户详情/启用禁用未对接 | 🔵 P3 |
| `system/role` | 角色列表 | ❌ 角色CRUD/权限设置为假操作 | 🔵 P3 |
| `system/menu` | 菜单列表 | ❌ 菜单CRUD为假操作 | 🔵 P3 |
| `system/user-center` | 通过store展示 | ❌ 信息修改/头像上传未对接 | 🔵 P3 |
| `system/admin-dashboard` | UI已搭建 | ❌ 图表全部占位符，未调用任何API | 🔵 P3 |
| `system/audit-logs` | UI已搭建 | ❌ 完全依赖硬编码数据 | 🔵 P3 |
| `system/billing-config` | UI已搭建 | ❌ billing.ts 6个API全未使用 | 🔵 P3 |
| `system/platform-teams` | UI已搭建 | ❌ platform-admin.ts 15个API全未使用 | 🔵 P3 |
| `system/video-models` | UI已搭建 | ❌ video-model.ts 5个API全未使用 | 🔵 P3 |
| `system/dify-workflows` | 连通性测试 | ❌ 工作流CRUD未对接 | 🔵 P3 |
| `system/runtime-config` | UI已搭建 | ❌ system-config.ts 13个API全未使用 | 🔵 P3 |
| `system/team-create` | UI已搭建 | ❌ 未对接API | 🔵 P3 |
| `system/team-invite` | UI已搭建 | ❌ 未对接API | 🔵 P3 |
| `system/team-permission` | UI已搭建 | ❌ 未对接API | 🔵 P3 |

**5个API文件完全未使用**：
- `platform-admin.ts`：15个函数，0使用
- `system-config.ts`：13个函数，0使用
- `billing.ts`：6个函数，0使用
- `video-model.ts`：5个函数，0使用
- `script-asset.ts`：10个函数，0使用

---

### 3.15 设置模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `settings/account` | UI已搭建 | ❌ 未调用`fetchUpdateProfile`/`fetchUploadAvatar` | 🔵 P3 |
| `settings/security` | UI已搭建 | ❌ 未调用`fetchResetPassword`/安全设置API | 🔵 P3 |
| `settings/danger` | UI已搭建 | ❌ 未调用账号删除/注销API | 🔵 P3 |
| `settings/system` | UI已搭建 | ❌ 未调用系统配置API | 🔵 P3 |

**设置模块 API 对接率：0%**

---

### 3.16 数据历史与AI处理模块

| 页面 | 已实现功能 | 缺失功能 | 影响等级 |
|------|-----------|---------|---------|
| `data-history/records` | 历史列表+详情 | ✅ 已实现 | — |
| `data-history/rollback` | 版本回退 | ✅ 已实现 | — |
| `ai-process/history` | 处理历史+详情 | ✅ 已实现 | — |
| `ai-process/status` | 状态查询 | ✅ 已实现 | — |

**这两个模块是项目中仅有的 API 100% 使用的模块。**

---

## 四、缺失项统计汇总

### 4.1 按影响程度分级

| 等级 | 数量 | 说明 |
|------|------|------|
| 🔴 P0 致命 | **8项** | 系统基础功能不可用（退出登录、Token刷新、忘记密码、加入团队、提示词审核模块、管理后台核心API） |
| 🟠 P1 严重 | **42项** | 核心业务流程断裂（项目CRUD、剧本全流程、分镜全流程、审核操作、资产上传/管理） |
| 🟡 P2 重要 | **28项** | 管理后台和增强功能缺失（团队管理、通知系统、视频高级功能、剪辑编辑、工作流、积分） |
| 🔵 P3 一般 | **35项** | 系统管理和设置页面（14个系统管理页、4个设置页、6个统计页） |

### 4.2 按模块统计未使用 API 数量

| 模块 | API总数 | 已使用 | 未使用 | 未使用率 |
|------|--------|--------|--------|---------|
| script-asset.ts | 10 | 0 | 10 | **100%** |
| platform-admin.ts | 15 | 0 | 15 | **100%** |
| billing.ts | 6 | 0 | 6 | **100%** |
| system-config.ts | 13 | 0 | 13 | **100%** |
| video-model.ts | 5 | 0 | 5 | **100%** |
| asset.ts | 27 | 4 | 23 | 85% |
| script.ts | 30 | 7 | 23 | 77% |
| storyboard.ts | 24 | 6 | 18 | 75% |
| notification.ts | 22 | 6 | 16 | 73% |
| statistics.ts | 24 | 6 | 18 | 75% |
| auth.ts | 13 | 4 | 9 | 69% |
| workflow.ts | 10 | 2 | 8 | 80% |
| workflow-manage.ts | 8 | 1 | 7 | 88% |
| character.ts | 8 | 1 | 7 | 88% |
| review.ts | 20 | 8 | 12 | 60% |
| project.ts | 20 | 11 | 9 | 45% |
| video.ts | 9 | 4 | 5 | 56% |
| team.ts | 30 | 23 | 7 | 23% |
| editor.ts | 11 | 6 | 5 | 45% |
| image.ts | 6 | 3 | 3 | 50% |
| points.ts | 8 | 3 | 5 | 63% |
| system-manage.ts | 5 | 3 | 2 | 40% |
| data-history.ts | 3 | 3 | 0 | 0% |
| ai-process.ts | 3 | 3 | 0 | 0% |

### 4.3 完全空壳页面清单（UI已有但0% API对接）

| 序号 | 页面路径 | 应有核心功能 |
|------|---------|-------------|
| 1 | `script/write` | 剧本编写与保存 |
| 2 | `storyboard/design` | 分镜设计与编辑 |
| 3 | `storyboard/scene` | 场景编排 |
| 4 | `storyboard/preview` | 分镜预览 |
| 5 | `asset/upload` | 素材上传 |
| 6 | `asset/category` | 分类管理 |
| 7 | `asset/tags` | 标签管理 |
| 8 | `asset/import` | 资产导入 |
| 9 | `gpt-image/generate` | 图片生成 |
| 10 | `gpt-image/tasks` | 生成任务 |
| 11 | `gpt-image/models` | 模型配置 |
| 12 | `system/admin-dashboard` | 管理仪表盘 |
| 13 | `system/audit-logs` | 审计日志 |
| 14 | `system/billing-config` | 计费配置 |
| 15 | `system/platform-teams` | 平台团队管理 |
| 16 | `system/video-models` | 视频模型配置 |
| 17 | `system/runtime-config` | 运行时配置 |
| 18 | `system/team-create` | 创建团队 |
| 19 | `system/team-invite` | 团队邀请 |
| 20 | `system/team-permission` | 团队权限 |
| 21 | `team/quota` | 资源配额 |
| 22 | `settings/account` | 账号设置 |
| 23 | `settings/security` | 安全设置 |
| 24 | `settings/danger` | 危险操作 |
| 25 | `settings/system` | 系统参数 |
| 26 | `stats/usage` | 使用统计 |
| 27 | `stats/dashboard` | 数据看板 |
| 28 | `auth/forget-password` | 忘记密码 |
| 29 | `auth/join-team` | 加入团队 |
| 30 | `editor/timeline` | 时间线编辑 |

---

## 五、修复优先级建议

### 第一阶段：修复 P0 致命问题

| 序号 | 修复项 | 涉及文件 | 工作量 |
|------|--------|---------|--------|
| 1 | 实现退出登录 | 头部用户菜单组件 + `auth.ts` | 小 |
| 2 | 实现 Token 自动刷新 | HTTP 拦截器 + `auth.ts` | 中 |
| 3 | 实现忘记密码页 | `auth/forget-password/index.vue` | 中 |
| 4 | 实现加入团队页 | `auth/join-team/index.vue` | 中 |
| 5 | 新增提示词审核 API 封装 | 新建 `src/api/prompt-review.ts` | 小 |
| 6 | 补齐管理后台缺失 API 封装 | `platform-admin.ts` 等 | 小 |

### 第二阶段：修复 P1 核心业务

| 序号 | 修复项 | 涉及模块 | 工作量 |
|------|--------|---------|--------|
| 7 | 项目管理对接 | `project/*.vue` + `project.ts` + `character.ts` | 大 |
| 8 | 剧本管理对接 | `script/*.vue` + `script.ts` + `script-asset.ts` | 大 |
| 9 | 分镜管理对接 | `storyboard/*.vue` + `storyboard.ts` | 大 |
| 10 | 审核中心对接 | `review/*.vue` + `review.ts` | 中 |
| 11 | 资产管理对接 | `asset/*.vue` + `asset.ts` | 大 |

### 第三阶段：修复 P2 管理功能

| 序号 | 修复项 | 涉及模块 | 工作量 |
|------|--------|---------|--------|
| 12 | 团队管理对接 | `team/*.vue` + `team.ts` | 中 |
| 13 | 通知系统对接 | `notice/*.vue` + `notification.ts` + WebSocket | 大 |
| 14 | 视频/剪辑对接 | `video-gen/*.vue` + `editor/*.vue` | 中 |
| 15 | 工作流对接 | `workflow/*.vue` + `workflow.ts` + `workflow-manage.ts` | 中 |

### 第四阶段：修复 P3 系统管理

| 序号 | 修复项 | 涉及模块 | 工作量 |
|------|--------|---------|--------|
| 16 | 系统管理对接 | `system/*.vue` + 5个未使用API文件 | 大 |
| 17 | 设置模块对接 | `settings/*.vue` + `auth.ts` | 中 |
| 18 | 统计报表对接 | `stats/*.vue` + `statistics.ts` | 中 |

---

## 六、附录：Store 层 API 使用情况

| Store 文件 | 导入的 API 函数 | 实际调用数 |
|------------|----------------|-----------|
| `review.ts` | `fetchGetReviewList`, `fetchGetPendingReviewCount`, `fetchGetMySubmissions` | 3/3 |
| `project.ts` | `fetchGetProjectList`, `fetchGetProjectDetail`, `fetchGetProjectMembers`, `fetchGetProjectConfig`, `fetchGetProjectEpisodes`, `fetchGetCharacterList` | 6/6 |
| `team.ts` | `fetchGetMyTeams`, `fetchGetTeamDetail`, `fetchSwitchTeam`, `fetchGetTeamMembers`, `fetchGetTeamRoles`, `fetchGetInviteCodes`, `fetchGetJoinApplications`, `fetchGetAvailablePermissions` | 6/8 |
| `notification.ts` | `fetchGetNotificationList`, `fetchGetUnreadCount`, `fetchMarkAsRead`, `fetchMarkAllAsRead`, `fetchUpdateNotificationPreference`, `fetchGetNotificationPreference` | 6/6 |

> 注：`team.ts` 中 `fetchGetInviteCodes` 和 `fetchGetJoinApplications` 已导入但未实际调用。

---

*报告结束*

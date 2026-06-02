# Draft: 项目全面分析 - UML/流程图/甘特图

## 需求确认
- **用户需求**: 查看、审查项目，检查所有元素，分析数据流向，重点检查功能类似元素之间的数据交换、同步、获取操作
- **交付物**: UML图、流程图、甘特图，分别存储在三个独立文件中

## 项目概况 (已确认)
- **项目名称**: Art Design Pro (dreamcraft-astra)
- **技术栈**: Vue 3 + TypeScript + Element Plus + Pinia + Vue Router
- **业务领域**: 短剧制作平台 (剧本→分镜→视频生成)

## 核心模块分析

### 1. API 层 (24个模块)
| 模块 | 文件 | 核心功能 |
|------|------|----------|
| project | api/project.ts | 项目CRUD、成员管理、配置管理 |
| script | api/script.ts | 剧本CRUD、审核、拆解、人物小传、资产提取 |
| storyboard | api/storyboard.ts | 分镜CRUD、审核、版本、配图、资产关联 |
| team | api/team.ts | 团队CRUD、成员管理、角色权限、邀请码 |
| review | api/review.ts | 审核任务、决策、批量操作、统计 |
| workflow | api/workflow.ts | 工作流执行、SSE流式、链式执行 |
| asset | api/asset.ts | 资产CRUD、分片上传、AI生成、团队资产 |
| video | api/video.ts | 视频生成、任务管理、提示词 |
| image | api/image.ts | 图片生成、任务管理 |
| points | api/points.ts | 积分余额、流水、Token用量 |
| notification | api/notification.ts | 通知列表、已读、偏好设置 |
| ai-process | api/ai-process.ts | AI处理状态、历史 |
| character | api/character.ts | 角色CRUD、关联分镜 |

### 2. Store 层 (11个模块)
| 模块 | 持久化 | 核心状态 |
|------|--------|----------|
| user | sessionStorage | 登录状态、Token、用户信息、锁屏 |
| project | sessionStorage | 项目列表、当前项目、分集、角色、成员 |
| project-data | 无 | 内置演示数据(项目/分集/分镜/角色/轨道) |
| script-project | 无 | 复用project-data，当前剧本项目 |
| team | 无 | 团队列表、当前团队、成员、角色、权限 |
| review | sessionStorage | 待审核数量、审核列表、我的提交 |
| notification | sessionStorage | 未读数量、通知列表、偏好设置 |
| menu | sessionStorage | 菜单状态、首页路径 |
| worktab | sessionStorage | 工作台标签页 |
| setting | localStorage | 主题设置、布局配置 |
| table | 无 | 表格配置 |

### 3. 数据流转平台 (DataFlowBus)
**核心组件**:
- `bus.ts` - 核心总线，协调所有数据流转
- `channel.ts` - 数据通道管理，支持单向/双向/广播
- `transformer.ts` - 数据转换器，内置分页/日期/空值清洗
- `monitor.ts` - 监控告警，指标采集和异常检测
- `visualizer.ts` - 可视化，生成Mermaid/JSON流转图

**内置通道**:
- `flow:api->project-list` - 项目API → 项目列表页
- `flow:api->script-list` - 剧本API → 剧本列表页
- `flow:api->asset-list` - 资产API → 资产库页
- `flow:api->review-list` - 审核API → 待审核页
- `flow:api->workflow-list` - 工作流API → 工作流列表页
- `flow:api->team-list` - 团队API → 团队列表页
- `flow:store->user-info` - 用户Store → 全局页面 (广播)
- `flow:store->settings` - 设置Store → 全局组件 (广播)
- `flow:store->project-data` - 项目数据Store → 项目相关页面 (双向)
- `flow:page->api:form-submit` - 页面表单 → API服务
- `flow:event-bus:global` - 全局事件总线 (广播)

**Store桥接**:
- team → flow:store->project-data (currentTeamId变化时通知)
- notification → flow:store->user-info (unreadCount变化时通知)
- review → flow:store->project-data (pendingCount变化时通知)
- project → flow:store->project-data (currentProjectId变化时通知)

### 4. 关键数据流向分析

#### 4.1 项目→剧本→分镜 主流程
```
ProjectStore.loadProjectDetail()
  → ScriptAPI.fetchGetScriptList(projectId)
    → StoryboardAPI.fetchGetStoryboardList(projectId)
      → StoryboardAPI.fetchDecomposeStoryboard(projectId, scriptId, episodeId)
```

#### 4.2 审核流程 (功能类似元素间数据交换)
```
Script提交审核 → ReviewAPI.fetchCreateReview()
  → ReviewAPI.fetchGetReviewList() (审核人查看)
    → ReviewAPI.fetchClaimReview() (认领)
      → ReviewAPI.fetchReviewDecision() (决策)
        → ScriptAPI.fetchGetScriptReviewStatus() (状态同步)
```

#### 4.3 团队→项目→成员 数据同步
```
TeamStore.loadTeamList()
  → TeamStore.switchTeam(teamId)
    → ProjectStore.loadProjectList() (依赖当前团队)
      → ProjectStore.loadMembers(projectId)
        → TeamStore.loadTeamMembers() (成员数据同步)
```

#### 4.4 资产关联 (分镜↔资产)
```
StoryboardAPI.fetchLinkAssetToStoryboard(storyboardId, assetId)
  ←→ AssetAPI.fetchGetProjectAssets(projectId)
  ←→ StoryboardAPI.fetchGetStoryboardAssets(storyboardId)
```

#### 4.5 AI工作流执行 (SSE流式)
```
WorkflowAPI.fetchExecuteWorkflowStream(code, params, onMessage)
  → SSE连接建立
    → 实时接收进度消息
      → 更新页面状态
        → 完成回调
```

### 5. 功能类似元素间的数据交换/同步

#### 5.1 ProjectStore vs ProjectDataStore
- **ProjectStore**: 真实API数据，持久化currentProjectId
- **ProjectDataStore**: 内置演示数据，不持久化
- **ScriptProjectStore**: 复用ProjectDataStore的项目列表
- **数据交换**: ScriptProjectStore通过storeToRefs读取ProjectDataStore.projects

#### 5.2 项目成员 vs 团队成员
- **ProjectStore.members**: 项目级成员，通过fetchGetProjectMembers获取
- **TeamStore.teamMembers**: 团队级成员，通过fetchGetTeamMembers获取
- **数据同步**: 项目成员可能来自团队成员，切换团队时需重新加载项目成员

#### 5.3 剧本审核 vs 分镜审核
- **共同审核API**: fetchGetReviewStatus(reviewType, targetId)
- **剧本审核**: fetchSubmitScriptReview() / fetchWithdrawScriptReview()
- **分镜审核**: fetchSubmitStoryboardReview() / fetchWithdrawStoryboardReview()
- **数据交换**: 共用ReviewStore的pendingCount和reviewList

#### 5.4 项目资产 vs 团队资产
- **项目资产**: AssetAPI.fetchGetProjectAssets(projectId)
- **团队资产**: AssetAPI.fetchGetTeamAssets(teamId)
- **数据交换**: fetchImportFromTeam(projectId, teamAssetIds) - 从团队库导入到项目

#### 5.5 个人积分 vs 项目积分 vs 团队积分
- **个人**: PointsAPI.fetchGetMyCredits()
- **项目**: PointsAPI.fetchGetProjectCredits(projectId)
- **团队**: PointsAPI.fetchGetTeamTokenUsage(teamId)
- **数据同步**: 积分扣减时三个维度同步更新

## 技术决策
- **UML图**: 使用Mermaid语法，包含类图、时序图、组件图
- **流程图**: 使用Mermaid语法，展示核心业务流程和数据流向
- **甘特图**: 使用Mermaid语法，展示项目开发阶段和任务依赖

## 开放问题
- 无

## 范围边界
- **包含**: 所有API模块、Store模块、数据流转平台、核心业务流程
- **排除**: 第三方库内部实现、样式细节、部署配置

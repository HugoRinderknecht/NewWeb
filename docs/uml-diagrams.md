# Art Design Pro - UML 架构图

> 基于源代码分析生成，所有图表使用 Mermaid 语法。
> 最后更新：2026-05-30

---

## 目录

1. [系统整体架构（类图）](#1-system-architecture)
2. [API 服务层（类图）](#2-api-layer)
3. [数据流转平台（类图）](#3-dataflow-platform)
4. [数据模型（类图）](#4-data-model)
5. [用户认证（时序图）](#5-user-authentication)
6. [项目数据流转（时序图）](#6-project-data-flow)
7. [审核工作流（时序图）](#7-review-workflow)
8. [工作流 SSE 执行（时序图）](#8-workflow-sse-execution)
9. [数据流转平台（组件图）](#9-dataflow-platform-component)
10. [Store 依赖关系图](#10-store-dependency-graph)
11. [业务模块分解](#11-业务模块分解)
12. [模块间数据交换关系](#12-模块间数据交换关系)
13. [项目管理子模块数据流](#13-项目管理子模块数据流)

---

## 1. 系统整体架构

应用启动和核心模块关系的高层视图。

```mermaid
classDiagram
    direction TB

    class App {
        <<Vue3 Application>>
        +bootstrap() void
        +mount(selector) void
    }

    class InitStore {
        +initStore(app) void
        <<Pinia>>
    }

    class InitRouter {
        +initRouter(app) void
        <<Vue Router>>
    }

    class SetupVueQuery {
        +setupVueQuery(app) void
        <<TanStack Query>>
    }

    class SetupGlobDirectives {
        +setupGlobDirectives(app) void
    }

    class SetupErrorHandle {
        +setupErrorHandle(app) void
    }

    class DataFlowBus {
        +init() Promise~void~
        +destroy() void
        +registerChannel(config) DataChannel
        +send(channelId, data) Promise
        +subscribe(channelId, handler) Function
        +notifyDataChange(source, action, data) void
    }

    class InitWebVitals {
        +initWebVitals() void
    }

    App --> InitStore : 1. 初始化 Store
    App --> SetupVueQuery : 2. 初始化 Vue Query
    App --> InitRouter : 3. 初始化路由
    App --> SetupGlobDirectives : 4. 注册全局指令
    App --> SetupErrorHandle : 5. 注册错误处理
    App --> DataFlowBus : 6. 初始化数据流转平台
    App --> InitWebVitals : 7. 启动性能监控

    class UserStore {
        <<Pinia Store>>
        +isLogin: boolean
        +isLock: boolean
        +info: UserInfo
        +accessToken: string
        +refreshToken: string
        +searchHistory: AppRouteRecord[]
        +logOut() void
        +setToken(accessToken, refreshToken) void
        +setUserInfo(info) void
        +checkAndClearWorktabs() void
    }

    class MenuStore {
        <<Pinia Store>>
        +homePath: string
        +menuList: AppRouteRecord[]
        +menuWidth: string
        +removeRouteFns: Function[]
        +setMenuList(list) void
        +setHomePath(path) void
        +removeAllDynamicRoutes() void
    }

    class WorktabStore {
        <<Pinia Store>>
        +current: WorkTab
        +opened: WorkTab[]
        +keepAliveExclude: string[]
        +openTab(tab) void
        +removeTab(path) void
        +removeAll() void
        +clearAll() void
        +toggleFixedTab(path) void
    }

    class Router {
        <<Vue Router>>
        +push(location) void
        +currentRoute: Route
        +getRoutes() Route[]
    }

    UserStore --> MenuStore : logOut() 清空 homePath
    UserStore --> WorktabStore : checkAndClearWorktabs()
    UserStore --> Router : logOut() 跳转登录页
    MenuStore --> Router : removeAllDynamicRoutes()
```

---

## 2. API 服务层

全部 24 个 API 模块及其端点分组。

```mermaid
classDiagram
    direction TB

    class HttpService {
        <<Axios Wrapper>>
        +get~T~(config) Promise~T~
        +post~T~(config) Promise~T~
        +put~T~(config) Promise~T~
        +del~T~(config) Promise~T~
        +request~T~(config) Promise~T~
        -axiosInstance: AxiosInstance
        -requestInterceptor() void
        -responseInterceptor() void
    }

    class AuthAPI {
        <<auth.ts>>
        +fetchLogin(params) Promise
        +fetchLogout() Promise
        +fetchRefreshToken() Promise
        +fetchGetUserInfo() Promise
    }

    class ProjectAPI {
        <<project.ts>>
        +fetchGetProjectList(params) Promise
        +fetchGetProjectDetail(id) Promise
        +fetchCreateProject(params) Promise
        +fetchUpdateProject(id, params) Promise
        +fetchDeleteProject(id) Promise
        +fetchCopyProject(id) Promise
        +fetchGetProjectMembers(id) Promise
        +fetchAddProjectMember(id, params) Promise
        +fetchGetProjectConfig(id) Promise
        +fetchGetReviewConfig(id) Promise
        +fetchGetProjectStatistics(id) Promise
    }

    class ScriptAPI {
        <<script.ts>>
        +fetchGetScriptList(projectId, params) Promise
        +fetchGetScriptDetail(id) Promise
        +fetchCreateScript(projectId, params) Promise
        +fetchUpdateScript(id, params) Promise
        +fetchDeleteScript(id) Promise
        +fetchSubmitScriptReview(id) Promise
        +fetchDecomposeScript(projectId, id) Promise
        +fetchGetProjectEpisodes(projectId) Promise
        +fetchGenerateCharacterProfiles(...) Promise
        +fetchExtractAssets(...) Promise
        +fetchGenerateStyleConfig(...) Promise
        +fetchReviewScriptContent(...) Promise
    }

    class StoryboardAPI {
        <<storyboard.ts>>
        +fetchGetStoryboardList(projectId, params) Promise
        +fetchGetStoryboardDetail(id) Promise
        +fetchCreateStoryboard(projectId, params) Promise
        +fetchUpdateStoryboard(id, params) Promise
        +fetchDeleteStoryboard(id) Promise
        +fetchBatchDeleteStoryboards(ids) Promise
        +fetchSubmitStoryboardReview(id) Promise
        +fetchDecomposeStoryboard(...) Promise
        +fetchGetSceneList(episodeId) Promise
        +fetchReorderStoryboards(sceneId, ids) Promise
    }

    class TeamAPI {
        <<team.ts>>
        +fetchGetMyTeams() Promise
        +fetchGetTeamDetail(teamId) Promise
        +fetchSwitchTeam(teamId) Promise
        +fetchGetTeamMembers(teamId, params) Promise
        +fetchGetTeamRoles(teamId) Promise
        +fetchCreateTeamRole(teamId, params) Promise
        +fetchGetInviteCodes(teamId) Promise
        +fetchCreateInviteCode(teamId, params) Promise
        +fetchGetJoinApplications(teamId) Promise
        +fetchTransferOwnership(teamId, newOwnerId) Promise
    }

    class ReviewAPI {
        <<review.ts>>
        +fetchGetReviewList(params) Promise
        +fetchGetReviewDetail(id) Promise
        +fetchCreateReview(params) Promise
        +fetchClaimReview(id) Promise
        +fetchReviewDecision(params) Promise
        +fetchBatchReviewDecision(params) Promise
        +fetchWithdrawReview(id) Promise
        +fetchArchiveReview(id) Promise
        +fetchGetPendingReviewCount() Promise
        +fetchGetMySubmissions(params) Promise
        +fetchGetReviewStatistics(projectId) Promise
    }

    class WorkflowAPI {
        <<workflow.ts>>
        +fetchExecuteWorkflow(code, params) Promise
        +fetchExecuteWorkflowStream(code, params, callbacks) Promise~AbortController~
        +fetchStopWorkflow(code, taskId) Promise
        +fetchMultimodalExecute(params) Promise
        +fetchMultimodalExecuteStream(params, callbacks) Promise
        +fetchExecuteWorkflowChain(params) Promise
        +fetchStyleInference(params) Promise
        +fetchGetWorkflowCatalog() Promise
    }

    class AssetAPI {
        <<asset.ts>>
        +fetchGetProjectAssets(projectId, params) Promise
        +fetchUploadAsset(projectId, params) Promise
        +fetchDeleteAsset(projectId, assetId) Promise
        +fetchBatchDeleteAssets(projectId, ids) Promise
        +fetchDownloadAsset(projectId, assetId) Promise
        +fetchInitChunkUpload(projectId, params) Promise
        +fetchAiGenerateAsset(projectId, params) Promise
        +fetchImportFromTeam(projectId, ids) Promise
        +fetchGetTeamAssets(teamId, params) Promise
    }

    class VideoAPI {
        <<video.ts>>
        +fetchSubmitVideoGeneration(params) Promise
        +fetchGetVideoTaskList(params) Promise
        +fetchGetVideoTaskResult(taskId) Promise
        +fetchCancelVideoTask(taskId) Promise
        +fetchGenerateVideoPrompts(...) Promise
        +fetchCheckVideoPromptViolation(...) Promise
    }

    class ImageAPI {
        <<image.ts>>
        +fetchSubmitImageGeneration(params) Promise
        +fetchGetImageTaskStatus(taskId) Promise
        +fetchGetImageTaskResult(taskId) Promise
        +fetchGetImageModels() Promise
    }

    class CharacterAPI {
        <<character.ts>>
        +fetchGetCharacterList(projectId) Promise
        +fetchCreateCharacter(projectId, data) Promise
        +fetchUpdateCharacter(projectId, id, data) Promise
        +fetchDeleteCharacter(projectId, id) Promise
        +fetchLinkCharacterToStoryboard(...) Promise
        +fetchGetCharactersByStoryboard(...) Promise
    }

    class NotificationAPI {
        <<notification.ts>>
        +fetchGetNotificationList(params) Promise
        +fetchGetUnreadCount() Promise
        +fetchMarkAsRead(id) Promise
        +fetchMarkAllAsRead() Promise
        +fetchDeleteNotification(id) Promise
        +fetchGetNotificationPreference() Promise
        +fetchGetWsToken() Promise
    }

    class PointsAPI {
        <<points.ts>>
        +fetchGetMyCredits() Promise
        +fetchGetProjectCredits(projectId) Promise
        +fetchGetPricingList() Promise
        +fetchGetMyTokenUsage() Promise
        +fetchGetTeamTokenUsage(teamId) Promise
    }

    class AiProcessAPI {
        <<ai-process.ts>>
        +fetchGetAiProcessStatus(params) Promise
        +fetchGetAiProcessHistory(params) Promise
        +fetchGetAiProcessHistoryDetail(id) Promise
    }

    class BillingAPI {
        <<billing.ts>>
        +fetchGetBillingInfo() Promise
        +fetchGetInvoiceList(params) Promise
    }

    class EditorAPI {
        <<editor.ts>>
        +fetchGetEditorConfig() Promise
        +fetchSaveEditorState(state) Promise
    }

    class DataHistoryAPI {
        <<data-history.ts>>
        +fetchGetHistoryList(params) Promise
        +fetchGetHistoryDetail(id) Promise
    }

    class ScriptAssetAPI {
        <<script-asset.ts>>
        +fetchGetScriptAssetList(params) Promise
        +fetchUploadScriptAsset(params) Promise
    }

    class StatisticsAPI {
        <<statistics.ts>>
        +fetchGetDashboardStats() Promise
        +fetchGetProjectStats(projectId) Promise
    }

    class SystemManageAPI {
        <<system-manage.ts>>
        +fetchGetSystemInfo() Promise
        +fetchGetUserList(params) Promise
    }

    class PlatformAdminAPI {
        <<platform-admin.ts>>
        +fetchGetPlatformConfig() Promise
        +fetchUpdatePlatformConfig(params) Promise
    }

    class SystemConfigAPI {
        <<system-config.ts>>
        +fetchGetConfig(key) Promise
        +fetchSetConfig(key, value) Promise
    }

    class WorkflowManageAPI {
        <<workflow-manage.ts>>
        +fetchGetWorkflowList(params) Promise
        +fetchCreateWorkflow(params) Promise
        +fetchUpdateWorkflow(id, params) Promise
        +fetchDeleteWorkflow(id) Promise
    }

    class VideoModelAPI {
        <<video-model.ts>>
        +fetchGetVideoModelList() Promise
        +fetchGetVideoModelDetail(id) Promise
    }

    HttpService <.. AuthAPI : uses
    HttpService <.. ProjectAPI : uses
    HttpService <.. ScriptAPI : uses
    HttpService <.. StoryboardAPI : uses
    HttpService <.. TeamAPI : uses
    HttpService <.. ReviewAPI : uses
    HttpService <.. WorkflowAPI : uses
    HttpService <.. AssetAPI : uses
    HttpService <.. VideoAPI : uses
    HttpService <.. ImageAPI : uses
    HttpService <.. CharacterAPI : uses
    HttpService <.. NotificationAPI : uses
    HttpService <.. PointsAPI : uses
    HttpService <.. AiProcessAPI : uses
    HttpService <.. BillingAPI : uses
    HttpService <.. EditorAPI : uses
    HttpService <.. DataHistoryAPI : uses
    HttpService <.. ScriptAssetAPI : uses
    HttpService <.. StatisticsAPI : uses
    HttpService <.. SystemManageAPI : uses
    HttpService <.. PlatformAdminAPI : uses
    HttpService <.. SystemConfigAPI : uses
    HttpService <.. WorkflowManageAPI : uses
    HttpService <.. VideoModelAPI : uses
```

---

## 3. 数据流转平台

统一数据流转平台的内部架构。

```mermaid
classDiagram
    direction TB

    class DataFlowBus {
        -config: DataFlowPlatformConfig
        -initialized: boolean
        -flowRecords: DataFlowRecord[]
        +init() Promise~void~
        +destroy() void
        +registerChannel~TInput,TOutput~(config) DataChannel
        +unregisterChannel(channelId) boolean
        +getChannel~TInput,TOutput~(channelId) DataChannel
        +getAllChannels() DataChannel[]
        +send~TInput,TOutput~(channelId, data) Promise~TOutput~
        +subscribe~T~(channelId, handler) Function
        +registerTransformer~TInput,TOutput~(definition) void
        +addAlertRule(rule) void
        +onAlert(callback) Function
        +getMetrics(channelId) DataFlowMetrics
        +generateGraph() VisualizationGraph
        +generateMermaid() string
        +bridgeStoreToChannel(storeName, channelId, getter) void
        +notifyDataChange(source, action, data) void
        -registerBuiltinChannels() void
    }

    class DataChannelManager {
        -channels: Map~string, DataChannelImpl~
        +createChannel~TInput,TOutput~(config) DataChannel
        +getChannel~TInput,TOutput~(id) DataChannel
        +destroyChannel(id) boolean
        +getAllChannels() DataChannel[]
        +getChannelsBySource(moduleId) DataChannel[]
        +getChannelsByTarget(moduleId) DataChannel[]
        +getChannelsBetween(sourceId, targetId) DataChannel[]
        +destroyAll() void
    }

    class DataChannelImpl {
        <<implements DataChannel>>
        +id: string
        +name: string
        +source: DataModuleDescriptor
        +target: DataModuleDescriptor
        +direction: DataFlowDirection
        +transformerId: string
        +status: DataFlowStatus
        +totalTransfers: number
        +failedTransfers: number
        -subscribers: ChannelSubscriber[]
        -recentRecords: DataFlowRecord[]
        +send~TInput~(data) Promise~TOutput~
        +subscribe~TOutput~(handler) Function
        +destroy() void
        +getRecentRecords(limit) DataFlowRecord[]
        -createRecord(data) DataFlowRecord
        -executeWithTimeout(promise, ms) Promise
        -notifySubscribers(data, record) Promise
    }

    class DataTransformerManager {
        -transformers: Map~string, DataTransformerDefinition~
        +register~TInput,TOutput~(definition) void
        +registerAll(definitions) void
        +unregister(id) boolean
        +get~TInput,TOutput~(id) DataTransformerDefinition
        +has(id) boolean
        +transform~TInput,TOutput~(id, data, context) Promise~TOutput~
        +reverseTransform~TInput,TOutput~(id, data, context) Promise~TInput~
        +transformChain(ids, data, context) Promise
        +getRegisteredIds() string[]
        +clear() void
    }

    class DataFlowMonitor {
        -metricsStore: Map~string, ChannelMetricsAggregate~
        -alertRules: Map~string, AlertRule~
        -alertRecords: AlertRecord[]
        -alertCallbacks: AlertCallback[]
        -windowMs: number
        -enabled: boolean
        +setEnabled(enabled) void
        +recordTransfer(record) void
        +getMetrics(channelId) DataFlowMetrics
        +getAllMetrics() Map~string, DataFlowMetrics~
        +addAlertRule(rule) void
        +removeAlertRule(ruleId) boolean
        +onAlert(callback) Function
        +getAlertRecords(options) AlertRecord[]
        +acknowledgeAlert(alertId) void
        +destroy() void
        -checkAlerts(channelId) void
        -evaluateCondition(value, operator, threshold) boolean
        -triggerAlert(rule, channelId, metrics) void
    }

    class DataFlowVisualizer {
        -enabled: boolean
        -nodePositions: Map
        +setEnabled(enabled) void
        +generateGraph() VisualizationGraph
        +printToConsole() void
        +generateMermaid() string
        +generateJSON() string
        -assessModuleHealth(moduleId) string
        -sanitizeMermaidId(id) string
    }

    DataFlowBus *-- DataChannelManager : 委托通道管理
    DataFlowBus *-- DataTransformerManager : 委托转换器管理
    DataFlowBus *-- DataFlowMonitor : 委托监控告警
    DataFlowBus *-- DataFlowVisualizer : 委托可视化
    DataChannelManager *-- DataChannelImpl : 创建和管理
    DataChannelImpl --> DataTransformerManager : 使用转换器
    DataChannelImpl --> DataFlowMonitor : 上报流转记录
    DataFlowVisualizer --> DataChannelManager : 读取通道列表
    DataFlowVisualizer --> DataFlowMonitor : 读取指标和告警

    class DataChannelConfig {
        <<interface>>
        +id: string
        +name: string
        +source: DataModuleDescriptor
        +target: DataModuleDescriptor
        +direction: DataFlowDirection
        +transformerId: string
        +monitorEnabled: boolean
        +timeout: number
    }

    class DataModuleDescriptor {
        <<interface>>
        +type: DataModuleType
        +id: string
        +name: string
    }

    class DataFlowDirection {
        <<enum>>
        ONE_WAY
        TWO_WAY
        BROADCAST
    }

    class DataFlowStatus {
        <<enum>>
        IDLE
        TRANSFERRING
        SUCCESS
        FAILED
        TIMEOUT
    }

    class AlertLevel {
        <<enum>>
        INFO
        WARNING
        ERROR
        CRITICAL
    }

    DataChannelConfig --> DataModuleDescriptor
    DataChannelConfig --> DataFlowDirection
    DataChannelImpl --> DataFlowStatus
    DataFlowMonitor --> AlertLevel
```

---

## 4. 数据模型

核心领域实体及其关系。

```mermaid
classDiagram
    direction TB

    class Project {
        +id: string
        +name: string
        +description: string
        +episodeCount: number
        +status: "active" | "archived" | "draft"
        +createTime: string
        +updateTime: string
    }

    class Episode {
        +id: string
        +number: number
        +name: string
        +projectId: string
        +status: "draft" | "writing" | "review" | "completed"
        +content: string
        +wordCount: number
        +duration: number
        +updateTime: string
    }

    class Storyboard {
        +id: string
        +code: string
        +name: string
        +source: "script" | "manual" | "ai"
        +sceneId: string
        +sceneName: string
        +description: string
        +thumbnail: string
        +shotCount: number
        +duration: number
        +status: "draft" | "designing" | "completed" | "archived"
        +order: number
        +projectId: string
        +scriptRef: string
    }

    class Character {
        +id: string
        +name: string
        +code: string
        +gender: "male" | "female" | "other"
        +age: number
        +personality: string
        +positioning: string
        +appearance: string
        +background: string
        +avatar: string
        +projectId: string
    }

    class Scene {
        +id: string
        +name: string
        +episodeId: string
    }

    class ReviewTask {
        +id: string
        +reviewType: string
        +targetId: string
        +status: string
        +submitterId: string
        +reviewerId: string
    }

    class Team {
        +teamId: string
        +teamName: string
        +isCurrent: boolean
    }

    class TeamMember {
        +userId: string
        +teamId: string
        +roleName: string
        +permissions: string[]
    }

    class Asset {
        +id: string
        +assetName: string
        +assetType: string
        +category: string
        +tags: string[]
        +fileUrl: string
        +projectId: string
    }

    class TeamAsset {
        +id: string
        +assetName: string
        +assetType: string
        +tags: string[]
        +teamId: string
    }

    class Track {
        +id: string
        +name: string
        +type: "video" | "audio"
        +muted: boolean
        +volume: number
        +clips: TimelineClip[]
    }

    class TimelineClip {
        +id: string
        +name: string
        +startTime: number
        +endTime: number
        +color: string
        +type: "video" | "audio" | "effect"
    }

    class UserInfo {
        +userId: string
        +username: string
        +nickname: string
        +avatar: string
        +roles: string[]
    }

    Project "1" --> "*" Episode : 包含分集
    Project "1" --> "*" Storyboard : 包含分镜
    Project "1" --> "*" Character : 包含角色
    Project "1" --> "*" Asset : 包含资产
    Project "1" --> "*" ReviewTask : 包含审核任务
    Episode "1" --> "*" Scene : 包含镜头
    Scene "1" --> "*" Storyboard : 包含分镜
    Team "1" --> "*" TeamMember : 包含成员
    Team "1" --> "*" TeamAsset : 团队资产库
    Track "1" --> "*" TimelineClip : 包含片段
    UserInfo --> TeamMember : 用户在团队中
```

---

## 5. 用户认证

登录流程、Token 管理和登出级联清理。

```mermaid
sequenceDiagram
    autonumber
    participant User as 用户
    participant Page as 登录页面
    participant AuthAPI as AuthAPI
    participant UserStore as UserStore
    participant MenuStore as MenuStore
    participant WorktabStore as WorktabStore
    participant Router as Vue Router
    participant HTTP as HTTP 拦截器

    Note over User, HTTP: === 登录流程 ===

    User->>Page: 输入账号密码
    Page->>Page: hashPassword(password, salt)
    Page->>AuthAPI: fetchLogin({username, password})
    AuthAPI->>HTTP: POST /api/auth/login
    HTTP-->>AuthAPI: {accessToken, refreshToken, userInfo}
    AuthAPI-->>Page: 返回登录结果

    Page->>UserStore: setToken(accessToken, refreshToken)
    Page->>UserStore: setUserInfo(userInfo)
    Page->>UserStore: setLoginStatus(true)
    Page->>WorktabStore: checkAndClearWorktabs()
    Note right of WorktabStore: 判断是否同一用户<br/>不同用户则 clearAll()

    Page->>Router: push(redirect || '/')

    Note over User, HTTP: === Token 自动注入 ===

    User->>Page: 发起页面请求
    Page->>HTTP: API 请求
    HTTP->>UserStore: 读取 accessToken
    HTTP->>HTTP: 设置 Authorization: Bearer {token}
    HTTP-->>Page: 返回响应

    Note over User, HTTP: === 401 自动登出 ===

    HTTP->>HTTP: 响应拦截器检测 401
    HTTP->>HTTP: handleUnauthorizedError() 带防抖
    HTTP->>UserStore: logOut()

    Note over UserStore, Router: === 登出级联清理 ===

    UserStore->>UserStore: 清空 info, accessToken, refreshToken
    UserStore->>UserStore: isLogin = false, isLock = false
    UserStore->>MenuStore: setHomePath('')
    UserStore->>MenuStore: resetRouterState(500)
    UserStore->>Router: push({name: 'Login', query: {redirect}})

    Note over User, HTTP: === 锁屏流程 ===

    User->>Page: 点击锁屏
    Page->>UserStore: setLockPassword(password)
    UserStore->>UserStore: hashPassword(password, lockKey)
    UserStore->>UserStore: setLockStatus(true)

    User->>Page: 输入解锁密码
    Page->>UserStore: verifyLockPassword(input)
    UserStore-->>Page: true/false
    alt 验证通过
        Page->>UserStore: setLockStatus(false)
    else 验证失败
        Page-->>User: 提示密码错误
    end
```

---

## 6. 项目数据流转

加载顺序：项目详情、剧本、分集、分镜。

```mermaid
sequenceDiagram
    autonumber
    participant Page as 项目页面
    participant ProjectStore as ProjectStore
    participant ProjectDataStore as ProjectDataStore
    participant ScriptProjectStore as ScriptProjectStore
    participant ProjectAPI as ProjectAPI
    participant ScriptAPI as ScriptAPI
    participant CharacterAPI as CharacterAPI
    participant DataFlowBus as DataFlowBus

    Note over Page, DataFlowBus: === 页面初始化加载 ===

    Page->>ProjectStore: loadProjectList()
    ProjectStore->>ProjectAPI: fetchGetProjectList(params)
    ProjectAPI-->>ProjectStore: {records, total}
    ProjectStore->>ProjectStore: projectList = records

    Page->>ProjectStore: loadProjectDetail(projectId)
    ProjectStore->>ProjectAPI: fetchGetProjectDetail(projectId)
    ProjectAPI-->>ProjectStore: projectDetail
    ProjectStore->>ProjectStore: currentProject = detail<br/>currentProjectId = projectId

    Note over Page, DataFlowBus: === 并行加载关联数据 ===

    par 加载分集
        ProjectStore->>ScriptAPI: fetchGetProjectEpisodes(projectId)
        ScriptAPI-->>ProjectStore: episodes[]
    and 加载角色
        ProjectStore->>CharacterAPI: fetchGetCharacterList(projectId)
        CharacterAPI-->>ProjectStore: characters[]
    and 加载成员
        ProjectStore->>ProjectAPI: fetchGetProjectMembers(projectId)
        ProjectAPI-->>ProjectStore: members[]
    and 加载配置
        ProjectStore->>ProjectAPI: fetchGetProjectConfig(projectId)
        ProjectAPI-->>ProjectStore: projectConfig
    end

    Note over Page, DataFlowBus: === DataFlowBus 通道桥接 ===

    DataFlowBus->>DataFlowBus: bridgeStoreToChannel('project', 'flow:store->project-data', getter)
    Note right of DataFlowBus: 监听 projectStore.currentProjectId 变化<br/>自动发送到 DataFlowBus 通道

    Note over Page, DataFlowBus: === ScriptProjectStore 复用 ProjectDataStore ===

    Page->>ScriptProjectStore: projectList (getter)
    ScriptProjectStore->>ProjectDataStore: storeToRefs(projects)
    Note right of ScriptProjectStore: ScriptProjectStore 不独立存储项目列表<br/>直接读取 ProjectDataStore.projects

    Page->>ScriptProjectStore: setCurrentProject(projectId)
    ScriptProjectStore->>ScriptProjectStore: currentProjectId = projectId

    Note over Page, DataFlowBus: === 跨 Store 联动 ===

    Page->>ProjectStore: clearCurrentProject()
    ProjectStore->>ProjectStore: 清空 currentProject, episodes, characters, members
```

---

## 7. 审核工作流

提交、认领和决策审核任务。

```mermaid
sequenceDiagram
    autonumber
    participant User as 提交者
    participant Page as 审核页面
    participant ReviewStore as ReviewStore
    participant ReviewAPI as ReviewAPI
    participant ScriptAPI as ScriptAPI
    participant StoryboardAPI as StoryboardAPI
    participant Server as 后端服务
    participant Reviewer as 审核人

    Note over User, Reviewer: === 提交审核 ===

    User->>Page: 提交剧本/分镜审核
    alt 剧本审核
        Page->>ScriptAPI: fetchSubmitScriptReview(scriptId)
        ScriptAPI->>Server: POST /api/scripts/{id}/submit-review
    else 分镜审核
        Page->>StoryboardAPI: fetchSubmitStoryboardReview(storyboardId)
        StoryboardAPI->>Server: POST /api/storyboards/{id}/submit-review
    end
    Server-->>Page: 提交成功
    Page->>ReviewStore: loadPendingCount()

    Note over User, Reviewer: === 审核人认领 ===

    Reviewer->>Page: 查看待审核列表
    Page->>ReviewStore: loadReviewList(params)
    ReviewStore->>ReviewAPI: fetchGetReviewList(params)
    ReviewAPI->>Server: GET /api/review/list
    Server-->>ReviewStore: {records, total}

    Reviewer->>Page: 认领审核任务
    Page->>ReviewAPI: fetchClaimReview(reviewId)
    ReviewAPI->>Server: POST /api/review/{id}/claim
    Server-->>Page: 认领成功

    Note over User, Reviewer: === 做出审核决定 ===

    Reviewer->>Page: 查看审核详情
    Page->>ReviewAPI: fetchGetReviewDetail(reviewId)
    ReviewAPI->>Server: GET /api/review/detail/{id}
    Server-->>Page: ReviewTask 详情

    alt 通过
        Reviewer->>Page: 审核通过
        Page->>ReviewAPI: fetchReviewDecision({reviewId, decision: 'approve', comment})
    else 驳回
        Reviewer->>Page: 审核驳回
        Page->>ReviewAPI: fetchReviewDecision({reviewId, decision: 'reject', reason, comment})
    end
    ReviewAPI->>Server: POST /api/review/decision
    Server-->>Page: 决策成功

    Page->>ReviewStore: decrementPending()
    Page->>ReviewStore: loadReviewList() 刷新列表

    Note over User, Reviewer: === 批量审核 ===

    Reviewer->>Page: 批量选择审核任务
    Page->>ReviewAPI: fetchBatchReviewDecision({items: [{reviewId, decision}]})
    ReviewAPI->>Server: POST /api/review/batch-decision
    Server-->>Page: {successCount, failCount}

    Note over User, Reviewer: === 撤回审核 ===

    User->>Page: 撤回已提交的审核
    Page->>ReviewAPI: fetchWithdrawReview(reviewId)
    ReviewAPI->>Server: POST /api/review/{id}/withdraw
    Server-->>Page: 撤回成功
```

---

## 8. 工作流 SSE 执行

工作流执行的 SSE 流式通信。

```mermaid
sequenceDiagram
    autonumber
    participant Page as 工作流页面
    participant WorkflowAPI as WorkflowAPI
    participant SSE as createSSEConnection
    participant UserStore as UserStore
    participant Server as 后端服务

    Note over Page, Server: === SSE 流式执行 ===

    Page->>Page: 准备执行参数
    Page->>WorkflowAPI: fetchExecuteWorkflowStream(code, params, callbacks)
    WorkflowAPI->>SSE: createSSEConnection({url, body, onMessage, onError, onComplete})

    SSE->>UserStore: 读取 accessToken
    SSE->>SSE: 创建 AbortController

    SSE->>Server: POST /api/dify-workflows/{code}/execute-stream<br/>Authorization: Bearer {token}<br/>Content-Type: application/json

    Server-->>SSE: HTTP 200, Content-Type: text/event-stream

    loop SSE 数据流
        Server-->>SSE: event: message\ndata: {"status":"processing",...}
        SSE->>SSE: 解析 event 和 data
        SSE->>Page: onMessage({event, data})
        Page->>Page: 更新进度和中间结果
    end

    Server-->>SSE: event: complete\ndata: {"status":"done",...}
    SSE->>Page: onComplete()
    SSE-->>Page: 返回 AbortController

    Note over Page, Server: === 主动停止执行 ===

    Page->>SSE: controller.abort()
    SSE->>Server: 中断连接
    Page->>WorkflowAPI: fetchStopWorkflow(code, taskId)
    WorkflowAPI->>Server: POST /api/dify-workflows/runs/{code}/{taskId}/stop

    Note over Page, Server: === 阻塞模式执行 ===

    Page->>WorkflowAPI: fetchExecuteWorkflow(code, params)
    WorkflowAPI->>Server: POST /api/dify-workflows/{code}/execute
    Server-->>WorkflowAPI: ExecuteResult (等待完成)
    WorkflowAPI-->>Page: 返回完整结果

    Note over Page, Server: === 链式执行 ===

    Page->>WorkflowAPI: fetchExecuteWorkflowChain(params)
    WorkflowAPI->>Server: POST /api/dify-workflows/multimodal/execute-chain
    Note right of Server: 依次执行多个工作流<br/>前一个的输出作为后一个的输入
    Server-->>WorkflowAPI: 最终执行结果
```

---

## 9. 数据流转平台组件图

数据流转平台与应用模块的集成方式。

```mermaid
graph TB
    subgraph "应用层 (Application Layer)"
        Pages["页面组件<br/>ProjectList, ScriptList,<br/>AssetLibrary, ReviewPending..."]
        Components["公共组件<br/>Forms, Tables, Charts..."]
    end

    subgraph "状态管理层 (Store Layer)"
        US["UserStore"]
        PS["ProjectStore"]
        PDS["ProjectDataStore"]
        SPS["ScriptProjectStore"]
        TS["TeamStore"]
        RS["ReviewStore"]
        NS["NotificationStore"]
        MS["MenuStore"]
        WS["WorktabStore"]
        STS["SettingStore"]
    end

    subgraph "API 服务层 (API Layer)"
        AuthAPI["AuthAPI"]
        ProjectAPI["ProjectAPI"]
        ScriptAPI["ScriptAPI"]
        StoryboardAPI["StoryboardAPI"]
        TeamAPI["TeamAPI"]
        ReviewAPI["ReviewAPI"]
        WorkflowAPI["WorkflowAPI"]
        AssetAPI["AssetAPI"]
        VideoAPI["VideoAPI"]
        ImageAPI["ImageAPI"]
        CharAPI["CharacterAPI"]
        NotifAPI["NotificationAPI"]
        PointsAPI["PointsAPI"]
        AiAPI["AiProcessAPI"]
        Others["BillingAPI, EditorAPI,<br/>DataHistoryAPI, ScriptAssetAPI,<br/>StatisticsAPI, SystemManageAPI,<br/>PlatformAdminAPI, SystemConfigAPI,<br/>WorkflowManageAPI, VideoModelAPI"]
    end

    subgraph "DataFlow 数据流转平台"
        Bus["DataFlowBus<br/>核心总线"]
        CM["ChannelManager<br/>通道管理器"]
        TM["TransformerManager<br/>转换器管理器"]
        Monitor["Monitor<br/>监控告警"]
        Vis["Visualizer<br/>可视化"]
    end

    subgraph "内置通道 (Builtin Channels)"
        Ch1["flow:api->project-list"]
        Ch2["flow:api->script-list"]
        Ch3["flow:api->asset-list"]
        Ch4["flow:api->review-list"]
        Ch5["flow:api->workflow-list"]
        Ch6["flow:api->team-list"]
        Ch7["flow:store->user-info<br/>(broadcast)"]
        Ch8["flow:store->settings<br/>(broadcast)"]
        Ch9["flow:store->project-data<br/>(two-way)"]
        Ch10["flow:page->api:form-submit"]
        Ch11["flow:event-bus:global<br/>(broadcast)"]
    end

    subgraph "内置转换器 (Builtin Transformers)"
        T1["builtin:date-format<br/>日期格式化"]
        T2["builtin:pagination-params<br/>分页参数转换"]
        T3["builtin:pagination-response<br/>分页响应转换"]
        T4["builtin:sanitize-empty<br/>空值清洗"]
    end

    subgraph "HTTP 基础设施"
        Axios["Axios 实例<br/>拦截器, 重试, 缓存"]
        SSE["SSE 连接<br/>createSSEConnection"]
    end

    Pages -->|"调用 Actions"| US
    Pages -->|"调用 Actions"| PS
    Pages -->|"调用 Actions"| RS
    Pages -->|"subscribe(chId)"| Bus

    US -->|"fetchLogin/Logout"| AuthAPI
    PS -->|"fetchProject*"| ProjectAPI
    PS -->|"fetchEpisodes"| ScriptAPI
    RS -->|"fetchReview*"| ReviewAPI
    TS -->|"fetchTeam*"| TeamAPI
    NS -->|"fetchNotif*"| NotifAPI

    Bus --> CM
    Bus --> TM
    Bus --> Monitor
    Bus --> Vis

    CM --> Ch1
    CM --> Ch2
    CM --> Ch3
    CM --> Ch4
    CM --> Ch5
    CM --> Ch6
    CM --> Ch7
    CM --> Ch8
    CM --> Ch9
    CM --> Ch10
    CM --> Ch11

    TM --> T1
    TM --> T2
    TM --> T3
    TM --> T4

    ProjectAPI --> Axios
    ScriptAPI --> Axios
    WorkflowAPI --> SSE
    Axios -->|"Bearer Token"| US

    Bus -.->|"bridgeStoreToChannel"| TS
    Bus -.->|"bridgeStoreToChannel"| NS
    Bus -.->|"bridgeStoreToChannel"| RS
    Bus -.->|"bridgeStoreToChannel"| PS
```

---

## 10. Store 依赖关系图

Pinia Store 模块依赖和跨 Store 交互。

```mermaid
graph LR
    subgraph "持久化策略"
        direction TB
        P1["sessionStorage"]
        P2["localStorage"]
        P3["不持久化"]
    end

    US["UserStore<br/>key: user<br/>storage: sessionStorage"]
    PS["ProjectStore<br/>key: project<br/>storage: sessionStorage<br/>pick: currentProjectId"]
    PDS["ProjectDataStore<br/>key: project-data<br/>不持久化 (内置 Demo 数据)"]
    SPS["ScriptProjectStore<br/>不持久化"]
    TS["TeamStore<br/>不持久化"]
    RS["ReviewStore<br/>key: review<br/>storage: sessionStorage<br/>pick: pendingCount"]
    NS["NotificationStore<br/>key: notification<br/>storage: sessionStorage<br/>pick: unreadCount"]
    MS["MenuStore<br/>key: menuStore<br/>不持久化"]
    WS["WorktabStore<br/>key: worktab<br/>storage: localStorage"]
    STS["SettingStore<br/>不持久化"]
    TBS["TableStore<br/>不持久化"]

    US -->|"logOut() 清空 homePath"| MS
    US -->|"checkAndClearWorktabs()"| WS
    US -->|"logOut() 重置路由状态"| MS

    SPS -->|"storeToRefs(projects)"| PDS
    SPS -->|"updateEpisodeCount() 写入"| PDS

    TS -->|"switchTeam() 触发"| PS
    Note1["切换团队后<br/>ProjectStore.loadProjectList()"]

    PDS -.->|"Demo 数据"| PS

    US ~~~ P1
    WS ~~~ P2
    TS ~~~ P3
    PDS ~~~ P3
    SPS ~~~ P3
    MS ~~~ P3
    STS ~~~ P3
    TBS ~~~ P3

    style US fill:#E57373,color:#fff
    style PS fill:#64B5F6,color:#fff
    style PDS fill:#81C784,color:#fff
    style SPS fill:#81C784,color:#fff
    style TS fill:#FFB74D,color:#fff
    style RS fill:#BA68C8,color:#fff
    style NS fill:#FFD54F,color:#000
    style MS fill:#4FC3F7,color:#fff
    style WS fill:#4FC3F7,color:#fff
    style STS fill:#90A4AE,color:#fff
    style TBS fill:#90A4AE,color:#fff
```

---

## 11. 业务模块分解

项目所有业务模块及其子模块的完整分解。

```mermaid
classDiagram
    direction TB

    class 项目管理模块 {
        +项目列表 list/
        +项目创建 create/
        +项目编辑 edit/
        +项目成员 member/
        +项目设置 settings/
        +项目统计 statistics/
        +分集管理 episodes/
        +角色管理 characters/
    }

    class 剧本管理模块 {
        +剧本库 library/
        +剧本编写 write/
        +剧本拆解 decompose/
        +人物小传 profiles/
        +版本管理 version/
        +AI审核 ai-review/
    }

    class 分镜管理模块 {
        +分镜设计 design/
        +分镜预览 preview/
        +镜头管理 scene/
        +批量编辑 batch-edit/
    }

    class 团队管理模块 {
        +团队列表 list/
        +团队成员 members/
        +团队角色 roles/
        +邀请码 invite-codes/
        +加入申请 applications/
        +团队设置 settings/
        +配额管理 quota/
    }

    class 审核系统模块 {
        +待审核列表 pending/
        +审核详情 detail/
        +审核内容 content/
        +审核流程 flow/
        +驳回原因 reject-reasons/
        +审核统计 statistics/
    }

    class 工作流引擎模块 {
        +工作流目录 catalog/
        +工作流列表 list/
        +工作流执行 execute/
    }

    class 资产管理模块 {
        +资产库 library/
        +资产上传 upload/
        +资产分类 category/
        +资产标签 tags/
        +资产导入 import/
        +资产复用 reuse/
        +资产预览 preview/
        +AI生成 ai-generate/
    }

    class 视频生成模块 {
        +AI生成 ai/
        +任务管理 task/
        +生成历史 history/
        +视频预览 preview/
    }

    class 图片生成模块 {
        +图片生成 generate/
        +任务管理 tasks/
        +模型管理 models/
    }

    class 积分系统模块 {
        +积分记录 record/
        +交易流水 transactions/
        +定价管理 pricing/
        +账单管理 billing/
        +Token用量 token-usage/
    }

    class 统计分析模块 {
        +统计看板 dashboard/
        +用量统计 usage/
        +成本分析 cost/
        +AI用量 ai-usage/
        +报表管理 report/
        +数据分析 analysis/
    }

    class 系统管理模块 {
        +用户管理 user/
        +角色管理 role/
        +菜单管理 menu/
        +平台团队 platform-teams/
        +工作流管理 dify-workflows/
        +视频模型 video-models/
        +计费配置 billing-config/
        +运行配置 runtime-config/
        +审计日志 audit-logs/
        +管理看板 admin-dashboard/
    }

    class 通知模块 {
        +站内通知 site/
        +消息提醒 remind/
    }

    class 编辑器模块 {
        +编辑管理 edit-manage/
        +时间线 timeline/
        +导出 export/
    }

    class AI处理模块 {
        +处理状态 status/
        +处理历史 history/
    }

    class 数据历史模块 {
        +历史记录 records/
        +版本回滚 rollback/
    }

    class 设置模块 {
        +账号设置 account/
        +安全设置 security/
        +系统设置 system/
        +危险操作 danger/
    }
```

---

## 12. 模块间数据交换关系

核心模块之间的数据流向和依赖关系。

```mermaid
classDiagram
    direction TB

    class 项目管理 {
        loadProjectList()
        loadProjectDetail()
        loadMembers()
    }

    class 剧本管理 {
        fetchGetScriptList()
        fetchDecomposeScript()
        fetchSubmitScriptReview()
    }

    class 分镜管理 {
        fetchGetStoryboardList()
        fetchDecomposeStoryboard()
        fetchSubmitStoryboardReview()
    }

    class 审核系统 {
        fetchGetReviewList()
        fetchClaimReview()
        fetchReviewDecision()
    }

    class 资产管理 {
        fetchGetProjectAssets()
        fetchUploadAsset()
        fetchImportFromTeam()
    }

    class 工作流引擎 {
        fetchExecuteWorkflow()
        fetchExecuteWorkflowStream()
        fetchExecuteWorkflowChain()
    }

    class 视频生成 {
        fetchSubmitVideoGeneration()
        fetchGenerateVideoPrompts()
    }

    class 图片生成 {
        fetchSubmitImageGeneration()
        fetchGetImageTaskResult()
    }

    class 团队管理 {
        fetchSwitchTeam()
        fetchGetTeamMembers()
    }

    class 积分系统 {
        fetchGetMyCredits()
        fetchGetPricingList()
    }

    class 通知系统 {
        fetchGetNotificationList()
        fetchMarkAsRead()
    }

    项目管理 --> 剧本管理 : 创建剧本
    剧本管理 --> 分镜管理 : 拆解为分镜
    剧本管理 --> 审核系统 : 提交审核
    分镜管理 --> 审核系统 : 提交审核
    分镜管理 --> 资产管理 : 关联资产
    分镜管理 --> 视频生成 : 生成视频
    分镜管理 --> 图片生成 : 生成配图
    工作流引擎 --> 剧本管理 : AI拆解剧本
    工作流引擎 --> 分镜管理 : AI生成分镜
    工作流引擎 --> 资产管理 : AI生成资产
    视频生成 --> 积分系统 : 消耗Token
    图片生成 --> 积分系统 : 消耗Token
    工作流引擎 --> 积分系统 : 消耗Token
    审核系统 --> 通知系统 : 审核结果通知
    团队管理 --> 项目管理 : 切换团队触发
    团队管理 --> 资产管理 : 团队资产导入
```

---

## 13. 项目管理子模块数据流

项目管理模块内部子模块间的数据流转。

```mermaid
classDiagram
    direction TB

    class 项目列表 {
        loadProjectList()
        setCurrentProject()
    }

    class 项目创建 {
        fetchCreateProject()
    }

    class 项目编辑 {
        fetchUpdateProject()
        fetchUploadProjectCover()
    }

    class 项目成员 {
        fetchGetProjectMembers()
        fetchAddProjectMember()
        fetchRemoveProjectMember()
    }

    class 项目设置 {
        fetchGetProjectConfig()
        fetchUpdateProjectConfig()
        fetchGetReviewConfig()
        fetchUpdateReviewConfig()
    }

    class 项目统计 {
        fetchGetProjectStatistics()
    }

    class 分集管理 {
        fetchGetProjectEpisodes()
        fetchCreateEpisode()
        fetchUpdateEpisode()
    }

    class 角色管理 {
        fetchGetCharacterList()
        fetchCreateCharacter()
        fetchLinkCharacterToStoryboard()
    }

    项目列表 --> 项目编辑 : 选择项目后编辑
    项目列表 --> 项目成员 : 选择项目后管理成员
    项目列表 --> 项目设置 : 选择项目后配置
    项目列表 --> 项目统计 : 选择项目后查看统计
    项目列表 --> 分集管理 : 选择项目后管理分集
    项目列表 --> 角色管理 : 选择项目后管理角色
    项目创建 --> 项目列表 : 创建后刷新列表
    项目编辑 --> 项目列表 : 编辑后刷新列表
    分集管理 --> 角色管理 : 分集关联角色
```

---

## 附录：内置数据流转通道

| 通道ID | 源模块 | 目标模块 | 流转方向 | 转换器 |
|---|---|---|---|---|
| `flow:api->project-list` | ProjectAPI | 项目列表页 | 单向 | pagination-response |
| `flow:api->script-list` | ScriptAPI | 剧本列表页 | 单向 | pagination-response |
| `flow:api->asset-list` | AssetAPI | 资产库页 | 单向 | pagination-response |
| `flow:api->review-list` | ReviewAPI | 待审核页 | 单向 | pagination-response |
| `flow:api->workflow-list` | WorkflowAPI | 工作流列表页 | 单向 | pagination-response |
| `flow:api->team-list` | TeamAPI | 团队列表页 | 单向 | pagination-response |
| `flow:store->user-info` | UserStore | 全部页面 | 广播 | - |
| `flow:store->settings` | SettingStore | 全部组件 | 广播 | - |
| `flow:store->project-data` | ProjectDataStore | 项目相关页面 | 双向 | - |
| `flow:page->api:form-submit` | 页面表单 | API 服务 | 单向 | sanitize-empty |
| `flow:event-bus:global` | 全局事件总线 | 全部组件 | 广播 | - |

## 附录：内置数据转换器

| 转换器ID | 名称 | 描述 |
|---|---|---|
| `builtin:date-format` | 日期格式化 | ISO 8601 -> zh-CN 本地化字符串 |
| `builtin:pagination-params` | 分页参数转换 | {current, size} -> {page, pageSize} |
| `builtin:pagination-response` | 分页响应转换 | 后端分页格式 -> {records, total, current, size} |
| `builtin:sanitize-empty` | 空值清洗 | 移除空字符串、空数组、空对象和 null/undefined |

## 附录：内置告警规则

| 规则ID | 名称 | 条件 | 级别 | 冷却时间 |
|---|---|---|---|---|
| `builtin:high-error-rate` | 高错误率 | errorRate > 50% | ERROR | 30s |
| `builtin:slow-transfer` | 慢流转 | avgDuration > 3000ms | WARNING | 60s |
| `builtin:high-p95` | P95 高延迟 | p95Duration > 10000ms | WARNING | 60s |

## 附录：Store 持久化策略汇总

| Store名称 | 存储键 | 存储方式 | 持久化字段 |
|---|---|---|---|
| UserStore | `user` | sessionStorage | (全部字段) |
| ProjectStore | `project` | sessionStorage | currentProjectId |
| ReviewStore | `review` | sessionStorage | pendingCount |
| NotificationStore | `notification` | sessionStorage | unreadCount |
| WorktabStore | `worktab` | localStorage | (全部字段) |
| ProjectDataStore | - | - | (不持久化, 内置数据) |
| ScriptProjectStore | - | - | (不持久化) |
| TeamStore | - | - | (不持久化) |
| MenuStore | - | - | (不持久化) |
| SettingStore | - | - | (不持久化) |
| TableStore | - | - | (不持久化) |

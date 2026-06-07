/**
 * 状态管理策略：Store / Vue Query / Route 职责边界
 *
 * 本文件定义项目中三类状态的职责划分和状态来源优先级，
 * 确保状态来源单一、可预测，避免同一数据在多处维护。
 *
 * ─────────────────────────────────────────────────────────
 *
 * ## 一、三类状态的职责划分
 *
 * | 类别         | 管理层     | 典型数据                                               | 示例                                    |
 * |-------------|-----------|-------------------------------------------------------|-----------------------------------------|
 * | 服务端状态    | Vue Query | 列表、详情、统计、关系型数据、任务状态                         | 项目列表、团队详情、审核列表、分镜数据        |
 * | 客户端 UI 状态 | Pinia     | 当前选中项、弹窗开关、视图模式、表单草稿、本地偏好               | currentProjectId、viewMode、detailOpen    |
 * | 路由状态      | Route     | 由 URL 决定的状态                                       | projectId、teamId（route params/query）   |
 *
 * ### 1. 服务端状态（归 Vue Query）
 * - 项目列表 / 团队列表 / 分镜列表 / 剧本列表 / 资产列表
 * - 项目详情 / 团队详情 / 分镜详情
 * - 统计数据 / 审核列表 / 通知列表
 * - 任务状态（AI 生成进度等）
 * - **禁止**在 Pinia Store 中缓存上述数据的副本
 *
 * ### 2. 客户端 UI 状态（归 Pinia）
 * - 当前选中项 ID（如 currentProjectId、currentEpisodeId）
 * - 弹窗 / 抽屉 / 面板开关（如 detailOpen、editorOpen）
 * - 视图模式（如 viewMode: board | list）
 * - 筛选条件（如 keyword、status）
 * - 表单草稿 / 临时编辑状态
 * - 本地偏好（如表格尺寸、主题设置）
 * - 认证状态（accessToken、isLogin）
 * - WebSocket 连接状态
 *
 * ### 3. 路由状态（归 Route）
 * - projectId（当 URL 包含 /storyboard/design/:projectId 时）
 * - teamId（当 URL 包含团队相关参数时）
 * - 其他由 URL 决定的业务标识
 * - **原则**：凡 URL 能表达的状态，优先使用 Route，不引入额外 Store 副本
 *
 * ─────────────────────────────────────────────────────────
 *
 * ## 二、状态来源优先级
 *
 * 读取状态时，按以下优先级获取：
 *
 *   Route > Vue Query > Pinia
 *
 * 1. **Route 优先**：如果 URL 中包含所需参数（如 projectId），直接从 route.params / route.query 获取
 * 2. **Vue Query 次之**：如果数据来自服务端，通过 Vue Query Hook 获取（自动缓存、刷新、去重）
 * 3. **Pinia 兜底**：仅当 Route 和 Vue Query 都无法提供时，从 Pinia Store 获取 UI 状态
 *
 * ─────────────────────────────────────────────────────────
 *
 * ## 三、业务域选择态的规范
 *
 * 项目中存在多个业务域（剧本域、分镜域、资产域），每个域有独立的项目选择器。
 * 规范如下：
 *
 * - 全局 useProjectStore.currentProjectId 作为默认兜底
 * - 各业务域通过 scoped store（如 useScriptProjectStore）维护独立选择态
 * - 读取优先级：route.params.projectId > route.query.projectId > 域 scoped store > 全局 project store
 * - 写入只写域 scoped store，不污染全局
 * - 统一通过 useCurrentProjectId() hook 或 useCurrentContext() 获取
 *
 * ─────────────────────────────────────────────────────────
 *
 * ## 四、禁止事项
 *
 * 1. 禁止在 Pinia Store 中缓存服务端数据的副本（如项目列表、团队列表）
 * 2. 禁止绕过 Vue Query 直接在 Store 中发起 API 请求
 * 3. 禁止在多个 Store 中维护同一份状态（如 projectId 在多处保存）
 * 4. 禁止 Route 已有参数时再从 Store 读取同一数据
 *
 * @module config/state-policy
 */

// ============================================================
// 状态类别枚举
// ============================================================

/** 状态管理层的分类 */
export type StateCategory = 'server' | 'client-ui' | 'route'

/** 状态来源优先级（数值越大优先级越高） */
export const STATE_SOURCE_PRIORITY = {
  pinia: 0,
  vueQuery: 1,
  route: 2
} as const

export type StateSource = keyof typeof STATE_SOURCE_PRIORITY

// ============================================================
// 状态类别判定工具
// ============================================================

/** 属于服务端状态的典型数据模式 */
export const SERVER_STATE_PATTERNS = [
  '列表', '详情', '统计', '关系型数据', '任务状态',
  'List', 'Detail', 'Stats', 'Relations', 'TaskStatus'
] as const

/** 属于客户端 UI 状态的典型数据模式 */
export const CLIENT_UI_STATE_PATTERNS = [
  '当前选中项', '弹窗开关', '视图模式', '表单草稿', '本地偏好',
  'CurrentId', 'Open', 'Visible', 'Mode', 'Draft', 'Preference'
] as const

/** 属于路由状态的典型数据模式 */
export const ROUTE_STATE_PATTERNS = [
  'projectId', 'teamId', 'scriptId', 'episodeId',
  '由 URL 决定的业务标识'
] as const

// ============================================================
// 业务域定义
// ============================================================

/** 项目中的业务域 */
export type BusinessDomain = 'script' | 'storyboard' | 'asset' | 'global'

/** 业务域对应的 scoped store 名称映射 */
export const DOMAIN_SCOPED_STORE_MAP: Record<BusinessDomain, string> = {
  global: 'project',
  script: 'script-project',
  storyboard: 'storyboard-project',
  asset: 'asset-project'
} as const

/** 业务域对应的路由前缀 */
export const DOMAIN_ROUTE_PREFIX_MAP: Record<BusinessDomain, string> = {
  global: '',
  script: '/script',
  storyboard: '/storyboard',
  asset: '/asset'
} as const

// ============================================================
// 状态来源解析策略
// ============================================================

/**
 * 上下文 ID 的解析策略
 *
 * 定义如何从 Route / Store 中解析出当前业务上下文 ID
 */
export interface ContextIdResolutionPolicy {
  /** 状态键名（如 projectId, teamId） */
  key: string
  /** Route params 中的键名 */
  routeParamKey?: string
  /** Route query 中的键名 */
  routeQueryKey?: string
  /** 全局 Store 中的状态路径 */
  globalStorePath?: string
  /** 是否支持业务域 scoped store 回退 */
  domainScoped?: boolean
}

/** 当前已定义的上下文 ID 解析策略 */
export const CONTEXT_ID_POLICIES: Record<string, ContextIdResolutionPolicy> = {
  projectId: {
    key: 'projectId',
    routeParamKey: 'projectId',
    routeQueryKey: 'projectId',
    globalStorePath: 'project.currentProjectId',
    domainScoped: true
  },
  teamId: {
    key: 'teamId',
    routeQueryKey: 'teamId',
    globalStorePath: 'team.currentTeamId',
    domainScoped: false
  }
} as const

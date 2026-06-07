/**
 * 缓存策略集中配置
 *
 * 本文件收敛项目中所有缓存层的策略常量和配置，明确各层职责边界。
 * 修改缓存参数时请在此处统一调整，避免分散在各模块中难以维护。
 *
 * ## 缓存层级与职责边界
 *
 * | 层级         | 职责                                     | 适用场景                           |
 * |-------------|------------------------------------------|-----------------------------------|
 * | Vue Query   | 应用层缓存：staleTime/gcTime/自动刷新/窗口聚焦重取 | 所有由 Vue Query 管理的数据请求（主缓存） |
 * | HTTP 请求去重 | 并发请求去重：同一 GET 请求只发一次网络请求          | 所有 GET 请求（默认启用）              |
 * | HTTP TTL 缓存 | HTTP 层响应缓存：按 TTL 缓存 GET 响应数据       | 不使用 Vue Query 的特殊场景（默认禁用）    |
 * | TableCache  | 表格数据缓存：分页/搜索条件级别的缓存管理           | 不使用 Vue Query 的简单表格场景         |
 * | PWA Cache   | 离线资源缓存：静态资源预缓存                     | 仅静态资源，业务 API 不缓存             |
 *
 * ## 核心原则
 *
 * 1. **Vue Query 优先**：凡是由 Vue Query 管理的请求，不再使用其他缓存层
 * 2. **HTTP 层仅去重**：HTTP 层的 LRU 响应缓存默认禁用，仅保留请求去重能力
 * 3. **TableCache 仅兜底**：仅在不使用 Vue Query 的特殊场景下启用 TableCache
 * 4. **PWA 不缓存 API**：业务 API 始终走网络，避免陈旧数据和缓存污染
 *
 * @module config/cache-policy
 * @author Dreamcraft_Astra Team
 */

// ============================================================
// Vue Query 缓存配置
// ============================================================

/** 默认 staleTime：数据被视为"新鲜"的时间（毫秒），期间不会重新请求 */
export const VUE_QUERY_DEFAULT_STALE_TIME = 5 * 60 * 1000 // 5 分钟

/** 默认 gcTime：缓存数据在内存中保留的时间（毫秒），超时后自动回收 */
export const VUE_QUERY_DEFAULT_GC_TIME = 10 * 60 * 1000 // 10 分钟

/** 列表页 staleTime：列表数据变化较频繁，使用较短的 staleTime */
export const VUE_QUERY_LIST_STALE_TIME = 2 * 60 * 1000 // 2 分钟

/** 详情页 staleTime：详情数据相对稳定，使用较长的 staleTime */
export const VUE_QUERY_DETAIL_STALE_TIME = 10 * 60 * 1000 // 10 分钟

/** 字典/配置 staleTime：字典数据极少变化，使用较长的 staleTime */
export const VUE_QUERY_DICT_STALE_TIME = 30 * 60 * 1000 // 30 分钟

// ============================================================
// HTTP 层缓存配置
// ============================================================

/**
 * HTTP 层 LRU 响应缓存开关。
 * 设为 0 表示禁用 HTTP 层响应缓存，由 Vue Query 统一管理缓存生命周期。
 * 仅在明确不使用 Vue Query 的特殊场景下设为正整数启用。
 */
export const HTTP_RESPONSE_CACHE_MAX_SIZE = 0

/**
 * HTTP 层默认 cacheTTL（毫秒）。
 * 仅在 HTTP_RESPONSE_CACHE_MAX_SIZE > 0 时生效。
 * 此值应小于等于 VUE_QUERY_DEFAULT_STALE_TIME，避免 HTTP 缓存比 Vue Query 缓存更久。
 */
export const HTTP_DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 分钟

// ============================================================
// TableCache 配置
// ============================================================

/**
 * TableCache 使用条件说明：
 *
 * TableCache 仅用于不使用 Vue Query 的特殊场景，例如：
 * - 无需全局缓存管理的简单表格
 * - 需要细粒度分页/搜索条件级别缓存管理的场景
 *
 * 当 useTable 配置了 queryKey 时，TableCache 不会创建，
 * 缓存统一由 Vue Query 管理。
 */

/** TableCache 默认缓存时间（毫秒） */
export const TABLE_CACHE_DEFAULT_TIME = 5 * 60 * 1000 // 5 分钟

/** TableCache 默认最大缓存条数 */
export const TABLE_CACHE_DEFAULT_MAX_SIZE = 50

// ============================================================
// PWA 缓存配置
// ============================================================

/**
 * PWA 缓存策略原则：
 *
 * - 业务 API 使用 NetworkOnly：始终从网络获取最新数据
 * - 静态资源使用预缓存（globPatterns）：JS/CSS/图片等
 * - 如需缓存特定静态数据接口（如字典、配置），应单独添加规则并使用 StaleWhileRevalidate
 *
 * ⚠️ 不要将业务 API 改为 NetworkFirst 或 CacheFirst，
 * 这会导致陈旧数据和缓存污染问题，且与 Vue Query 缓存产生冲突。
 */

/** PWA API 缓存策略：NetworkOnly = 始终走网络，不缓存 */
export const PWA_API_CACHE_HANDLER = 'NetworkOnly' as const

/** PWA 静态数据接口缓存策略：StaleWhileRevalidate = 先返回缓存，后台更新 */
export const PWA_STATIC_DATA_CACHE_HANDLER = 'StaleWhileRevalidate' as const

/** PWA 静态数据接口缓存过期时间（秒） */
export const PWA_STATIC_DATA_CACHE_MAX_AGE_SECONDS = 24 * 60 * 60 // 24 小时

/** PWA 静态数据接口最大缓存条数 */
export const PWA_STATIC_DATA_CACHE_MAX_ENTRIES = 20

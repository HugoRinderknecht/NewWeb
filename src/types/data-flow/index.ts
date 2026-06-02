/**
 * 统一数据流转平台 - 类型定义
 *
 * 提供数据流转平台所需的全部类型约束，包括：
 * - 数据通道定义
 * - 数据流转记录
 * - 数据转换器接口
 * - 监控与告警类型
 * - 可视化节点与边
 *
 * @module types/data-flow
 */

// ============================================================
// 基础类型
// ============================================================

/** 数据流转方向 */
export enum DataFlowDirection {
  /** 单向：源 -> 目标 */
  ONE_WAY = 'one-way',
  /** 双向：源 <-> 目标 */
  TWO_WAY = 'two-way',
  /** 广播：源 -> 多目标 */
  BROADCAST = 'broadcast'
}

/** 数据流转状态 */
export enum DataFlowStatus {
  /** 空闲 */
  IDLE = 'idle',
  /** 传输中 */
  TRANSFERRING = 'transferring',
  /** 成功 */
  SUCCESS = 'success',
  /** 失败 */
  FAILED = 'failed',
  /** 超时 */
  TIMEOUT = 'timeout'
}

/** 告警级别 */
export enum AlertLevel {
  /** 信息 */
  INFO = 'info',
  /** 警告 */
  WARNING = 'warning',
  /** 错误 */
  ERROR = 'error',
  /** 严重 */
  CRITICAL = 'critical'
}

/** 数据模块类型 */
export enum DataModuleType {
  /** 页面组件 */
  PAGE = 'page',
  /** 公共组件 */
  COMPONENT = 'component',
  /** API 服务层 */
  API = 'api',
  /** 状态管理 */
  STORE = 'store',
  /** Hook */
  HOOK = 'hook',
  /** 工具函数 */
  UTILITY = 'utility',
  /** WebSocket */
  WEBSOCKET = 'websocket',
  /** 事件总线 */
  EVENT_BUS = 'event-bus',
  /** 本地存储 */
  STORAGE = 'storage'
}

// ============================================================
// 数据通道类型
// ============================================================

/** 数据通道配置 */
export interface DataChannelConfig<TInput = unknown, TOutput = unknown> {
  /** 通道唯一标识 */
  id: string
  /** 通道名称 */
  name: string
  /** 通道描述 */
  description?: string
  /** 数据源模块 */
  source: DataModuleDescriptor
  /** 数据目标模块 */
  target: DataModuleDescriptor
  /** 流转方向 */
  direction: DataFlowDirection
  /** 输入数据类型守卫（可选，用于运行时校验） */
  inputGuard?: (data: unknown) => data is TInput
  /** 输出数据类型守卫（可选，用于运行时校验） */
  outputGuard?: (data: unknown) => data is TOutput
  /** 数据转换器ID（可选，关联到 DataTransformer） */
  transformerId?: string
  /** 是否启用监控 */
  monitorEnabled?: boolean
  /** 超时时间（毫秒），0 表示不超时 */
  timeout?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
}

/** 数据模块描述符 */
export interface DataModuleDescriptor {
  /** 模块类型 */
  type: DataModuleType
  /** 模块标识（如文件路径、组件名、Store ID 等） */
  id: string
  /** 模块名称 */
  name?: string
}

/** 数据通道实例（运行时） */
export interface DataChannel<TInput = unknown, TOutput = unknown>
  extends DataChannelConfig<TInput, TOutput> {
  /** 通道创建时间 */
  createdAt: number
  /** 最后活跃时间 */
  lastActiveAt: number
  /** 总流转次数 */
  totalTransfers: number
  /** 失败次数 */
  failedTransfers: number
  /** 当前状态 */
  status: DataFlowStatus
  /** 发送数据 */
  send: (data: TInput) => Promise<TOutput>
  /** 订阅数据（用于双向/广播通道） */
  subscribe: (handler: DataFlowHandler<TOutput>) => () => void
  /** 销毁通道 */
  destroy: () => void
}

// ============================================================
// 数据流转记录类型
// ============================================================

/** 数据流转记录 */
export interface DataFlowRecord {
  /** 记录唯一标识 */
  id: string
  /** 通道ID */
  channelId: string
  /** 流转状态 */
  status: DataFlowStatus
  /** 输入数据摘要（不存储完整数据，避免内存泄漏） */
  inputSummary: DataSummary
  /** 输出数据摘要 */
  outputSummary?: DataSummary
  /** 错误信息 */
  error?: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 耗时（毫秒） */
  duration?: number
  /** 是否经过转换 */
  transformed: boolean
  /** 转换器ID */
  transformerId?: string
}

/** 数据摘要（用于监控和日志，不存储完整数据） */
export interface DataSummary {
  /** 数据类型 */
  type: string
  /** 数据大小估算（字节） */
  size: number
  /** 字段列表（对象类型） */
  fields?: string[]
  /** 数组长度（数组类型） */
  length?: number
  /** 数据哈希（用于去重检测） */
  hash?: string
}

// ============================================================
// 数据转换器类型
// ============================================================

/** 数据转换器定义 */
export interface DataTransformerDefinition<TInput = unknown, TOutput = unknown> {
  /** 转换器唯一标识 */
  id: string
  /** 转换器名称 */
  name: string
  /** 转换器描述 */
  description?: string
  /** 源数据格式描述 */
  inputFormat: string
  /** 目标数据格式描述 */
  outputFormat: string
  /** 转换函数 */
  transform: (data: TInput, context?: TransformContext) => TOutput | Promise<TOutput>
  /** 反向转换函数（可选，用于双向通道） */
  reverseTransform?: (data: TOutput, context?: TransformContext) => TInput | Promise<TInput>
  /** 校验函数（可选，用于验证转换结果） */
  validate?: (output: TOutput) => boolean
}

/** 转换上下文 */
export interface TransformContext {
  /** 通道ID */
  channelId: string
  /** 流转记录ID */
  recordId: string
  /** 额外参数 */
  params?: Record<string, unknown>
}

// ============================================================
// 监控与告警类型
// ============================================================

/** 监控指标 */
export interface DataFlowMetrics {
  /** 通道ID */
  channelId: string
  /** 统计时间窗口（毫秒） */
  windowMs: number
  /** 窗口内流转次数 */
  transferCount: number
  /** 窗口内失败次数 */
  failureCount: number
  /** 窗口内平均耗时（毫秒） */
  avgDuration: number
  /** 窗口内最大耗时（毫秒） */
  maxDuration: number
  /** 窗口内最小耗时（毫秒） */
  minDuration: number
  /** 窗口内 P95 耗时（毫秒） */
  p95Duration: number
  /** 吞吐量（次/秒） */
  throughput: number
  /** 错误率 */
  errorRate: number
  /** 最后更新时间 */
  updatedAt: number
}

/** 告警规则 */
export interface AlertRule {
  /** 规则唯一标识 */
  id: string
  /** 规则名称 */
  name: string
  /** 规则描述 */
  description?: string
  /** 告警级别 */
  level: AlertLevel
  /** 适用的通道ID列表（空数组表示全部通道） */
  channelIds: string[]
  /** 规则条件 */
  condition: AlertCondition
  /** 是否启用 */
  enabled: boolean
  /** 冷却时间（毫秒），避免同一告警频繁触发 */
  cooldownMs: number
  /** 上次触发时间 */
  lastTriggeredAt?: number
}

/** 告警条件 */
export interface AlertCondition {
  /** 监控指标类型 */
  metric: 'errorRate' | 'avgDuration' | 'maxDuration' | 'minDuration' | 'p95Duration' | 'failureCount' | 'transferCount' | 'throughput'
  /** 比较运算符 */
  operator: '>' | '>=' | '<' | '<=' | '==' | '!='
  /** 阈值 */
  threshold: number
  /** 持续时间（毫秒），条件持续满足该时间后才触发 */
  durationMs?: number
}

/** 告警记录 */
export interface AlertRecord {
  /** 记录唯一标识 */
  id: string
  /** 触发的规则ID */
  ruleId: string
  /** 告警级别 */
  level: AlertLevel
  /** 告警消息 */
  message: string
  /** 关联的通道ID */
  channelId: string
  /** 触发时的指标快照 */
  metrics: DataFlowMetrics
  /** 触发时间 */
  triggeredAt: number
  /** 是否已确认 */
  acknowledged: boolean
}

/** 告警回调函数 */
export type AlertCallback = (alert: AlertRecord) => void

// ============================================================
// 数据流转处理器
// ============================================================

/** 数据流转处理函数 */
export type DataFlowHandler<T = unknown> = (data: T, record: DataFlowRecord) => void | Promise<void>

// ============================================================
// 可视化类型
// ============================================================

/** 可视化节点 */
export interface VisualizationNode {
  /** 模块描述符 */
  module: DataModuleDescriptor
  /** 节点位置 X */
  x: number
  /** 节点位置 Y */
  y: number
  /** 节点宽度 */
  width: number
  /** 节点高度 */
  height: number
  /** 关联的通道数量 */
  channelCount: number
  /** 健康状态 */
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
}

/** 可视化边 */
export interface VisualizationEdge {
  /** 通道配置 */
  channel: DataChannelConfig
  /** 流转方向 */
  direction: DataFlowDirection
  /** 当前状态 */
  status: DataFlowStatus
  /** 最近指标 */
  metrics?: DataFlowMetrics
  /** 是否有活跃告警 */
  hasAlert: boolean
}

/** 可视化图 */
export interface VisualizationGraph {
  /** 节点列表 */
  nodes: VisualizationNode[]
  /** 边列表 */
  edges: VisualizationEdge[]
  /** 生成时间 */
  generatedAt: number
}

// ============================================================
// 平台配置类型
// ============================================================

/** 数据流转平台配置 */
export interface DataFlowPlatformConfig {
  /** 是否启用平台（开发环境可关闭） */
  enabled: boolean
  /** 是否启用监控 */
  monitorEnabled: boolean
  /** 是否启用可视化 */
  visualizerEnabled: boolean
  /** 监控时间窗口（毫秒） */
  monitorWindowMs: number
  /** 最大流转记录保留数量 */
  maxRecords: number
  /** 默认超时时间（毫秒） */
  defaultTimeout: number
  /** 默认最大重试次数 */
  defaultMaxRetries: number
  /** 告警回调 */
  onAlert?: AlertCallback
}

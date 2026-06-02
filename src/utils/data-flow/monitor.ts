/**
 * 统一数据流转平台 - 监控与告警
 *
 * 提供数据流转过程的实时监控和异常告警：
 * - 流转指标采集与聚合
 * - 告警规则管理
 * - 告警触发与通知
 * - 历史指标查询
 *
 * @module utils/data-flow/monitor
 */

import type {
  DataFlowMetrics,
  AlertRule,
  AlertRecord,
  AlertCallback,
  DataFlowRecord,
  DataFlowStatus,
  AlertLevel
} from '@/types/data-flow'

/** 指标存储条目 */
interface MetricsEntry {
  timestamp: number
  duration: number
  status: DataFlowStatus
}

/** 通道指标聚合 */
interface ChannelMetricsAggregate {
  entries: MetricsEntry[]
  lastCalculated: number
  cached: DataFlowMetrics | null
}

/**
 * 数据流转监控器
 *
 * 负责采集数据流转指标、管理告警规则、
 * 检测异常并触发告警回调。
 */
export class DataFlowMonitor {
  /** 指标存储：channelId -> 聚合数据 */
  private metricsStore = new Map<string, ChannelMetricsAggregate>()

  /** 告警规则 */
  private alertRules = new Map<string, AlertRule>()

  /** 告警记录 */
  private alertRecords: AlertRecord[] = []

  /** 告警回调列表 */
  private alertCallbacks: AlertCallback[] = []

  /** 监控时间窗口（毫秒） */
  private windowMs: number

  /** 最大告警记录数 */
  private maxAlertRecords: number

  /** 是否启用监控 */
  private enabled: boolean

  constructor(options?: {
    windowMs?: number
    maxAlertRecords?: number
    enabled?: boolean
  }) {
    this.windowMs = options?.windowMs ?? 60000
    this.maxAlertRecords = options?.maxAlertRecords ?? 1000
    this.enabled = options?.enabled ?? true
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  // ============================================================
  // 指标采集
  // ============================================================

  /**
   * 记录一次数据流转
   * @param record 流转记录
   */
  recordTransfer(record: DataFlowRecord): void {
    if (!this.enabled) return

    const channelId = record.channelId
    let aggregate = this.metricsStore.get(channelId)
    if (!aggregate) {
      aggregate = { entries: [], lastCalculated: 0, cached: null }
      this.metricsStore.set(channelId, aggregate)
    }

    aggregate.entries.push({
      timestamp: record.startTime,
      duration: record.duration ?? 0,
      status: record.status
    })

    // 清理过期条目
    const cutoff = Date.now() - this.windowMs * 3
    aggregate.entries = aggregate.entries.filter(
      (e) => e.timestamp > cutoff
    )

    // 检查告警
    this.checkAlerts(channelId)
  }

  /**
   * 获取通道指标
   * @param channelId 通道ID
   */
  getMetrics(channelId: string): DataFlowMetrics | null {
    const aggregate = this.metricsStore.get(channelId)
    if (!aggregate) return null

    const now = Date.now()
    // 使用缓存（1秒内不重复计算）
    if (aggregate.cached && now - aggregate.lastCalculated < 1000) {
      return aggregate.cached
    }

    const windowStart = now - this.windowMs
    const windowEntries = aggregate.entries.filter(
      (e) => e.timestamp > windowStart
    )

    if (windowEntries.length === 0) {
      return aggregate.cached
    }

    const transferCount = windowEntries.length
    const failureCount = windowEntries.filter(
      (e) => e.status === 'failed' || e.status === 'timeout'
    ).length
    const durations = windowEntries.map((e) => e.duration).sort((a, b) => a - b)
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / transferCount
    const p95Index = Math.ceil(transferCount * 0.95) - 1
    const p95Duration = durations[Math.max(0, p95Index)] ?? 0

    const metrics: DataFlowMetrics = {
      channelId,
      windowMs: this.windowMs,
      transferCount,
      failureCount,
      avgDuration: Math.round(avgDuration * 100) / 100,
      maxDuration: durations[durations.length - 1] ?? 0,
      minDuration: durations[0] ?? 0,
      p95Duration,
      throughput: Math.round((transferCount / this.windowMs) * 1000 * 100) / 100,
      errorRate: transferCount > 0 ? Math.round((failureCount / transferCount) * 10000) / 100 : 0,
      updatedAt: now
    }

    aggregate.cached = metrics
    aggregate.lastCalculated = now

    return metrics
  }

  /**
   * 获取所有通道的指标
   */
  getAllMetrics(): Map<string, DataFlowMetrics> {
    const result = new Map<string, DataFlowMetrics>()
    for (const channelId of this.metricsStore.keys()) {
      const metrics = this.getMetrics(channelId)
      if (metrics) result.set(channelId, metrics)
    }
    return result
  }

  // ============================================================
  // 告警规则管理
  // ============================================================

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule)
  }

  /**
   * 移除告警规则
   */
  removeAlertRule(ruleId: string): boolean {
    return this.alertRules.delete(ruleId)
  }

  /**
   * 启用/禁用告警规则
   */
  toggleAlertRule(ruleId: string, enabled: boolean): void {
    const rule = this.alertRules.get(ruleId)
    if (rule) rule.enabled = enabled
  }

  /**
   * 注册告警回调
   */
  onAlert(callback: AlertCallback): () => void {
    this.alertCallbacks.push(callback)
    return () => {
      const index = this.alertCallbacks.indexOf(callback)
      if (index > -1) this.alertCallbacks.splice(index, 1)
    }
  }

  /**
   * 获取告警记录
   */
  getAlertRecords(options?: {
    channelId?: string
    level?: AlertLevel
    acknowledged?: boolean
    limit?: number
  }): AlertRecord[] {
    let records = [...this.alertRecords]
    if (options?.channelId) {
      records = records.filter((r) => r.channelId === options.channelId)
    }
    if (options?.level) {
      records = records.filter((r) => r.level === options.level)
    }
    if (options?.acknowledged !== undefined) {
      records = records.filter((r) => r.acknowledged === options.acknowledged)
    }
    if (options?.limit) {
      records = records.slice(-options.limit)
    }
    return records
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string): void {
    const record = this.alertRecords.find((r) => r.id === alertId)
    if (record) record.acknowledged = true
  }

  /**
   * 确认所有告警
   */
  acknowledgeAllAlerts(): void {
    this.alertRecords.forEach((r) => (r.acknowledged = true))
  }

  // ============================================================
  // 内部方法
  // ============================================================

  /** 检查告警条件 */
  private checkAlerts(channelId: string): void {
    const metrics = this.getMetrics(channelId)
    if (!metrics) return

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue
      if (rule.channelIds.length > 0 && !rule.channelIds.includes(channelId)) continue

      // 冷却检查
      if (rule.lastTriggeredAt && rule.cooldownMs > 0) {
        if (Date.now() - rule.lastTriggeredAt < rule.cooldownMs) continue
      }

      const metricValue = metrics[rule.condition.metric]
      const threshold = rule.condition.threshold
      const conditionMet = this.evaluateCondition(
        metricValue,
        rule.condition.operator,
        threshold
      )

      if (conditionMet) {
        this.triggerAlert(rule, channelId, metrics)
      }
    }
  }

  /** 评估条件 */
  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case '>': return value > threshold
      case '>=': return value >= threshold
      case '<': return value < threshold
      case '<=': return value <= threshold
      case '==': return value === threshold
      case '!=': return value !== threshold
      default: return false
    }
  }

  /** 触发告警 */
  private triggerAlert(
    rule: AlertRule,
    channelId: string,
    metrics: DataFlowMetrics
  ): void {
    const alert: AlertRecord = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ruleId: rule.id,
      level: rule.level,
      message: `[DataFlow 告警] ${rule.name}: 通道 "${channelId}" 的 ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold}（当前值: ${metrics[rule.condition.metric]}）`,
      channelId,
      metrics,
      triggeredAt: Date.now(),
      acknowledged: false
    }

    this.alertRecords.push(alert)
    rule.lastTriggeredAt = Date.now()

    // 限制记录数量
    if (this.alertRecords.length > this.maxAlertRecords) {
      this.alertRecords = this.alertRecords.slice(-this.maxAlertRecords)
    }

    // 通知回调
    this.alertCallbacks.forEach((cb) => {
      try {
        cb(alert)
      } catch (e) {
        console.error('[DataFlow] 告警回调执行失败:', e)
      }
    })
  }

  /**
   * 清理指定通道的指标数据
   */
  clearChannelMetrics(channelId: string): void {
    this.metricsStore.delete(channelId)
  }

  /**
   * 清理所有指标数据
   */
  clearAllMetrics(): void {
    this.metricsStore.clear()
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.metricsStore.clear()
    this.alertRules.clear()
    this.alertRecords = []
    this.alertCallbacks = []
  }
}

/** 全局监控器实例 */
export const dataFlowMonitor = new DataFlowMonitor()

// ============================================================
// 内置告警规则
// ============================================================

/** 错误率超过 50% */
dataFlowMonitor.addAlertRule({
  id: 'builtin:high-error-rate',
  name: '高错误率',
  description: '通道错误率超过 50%',
  level: 'error' as AlertLevel,
  channelIds: [],
  condition: { metric: 'errorRate', operator: '>', threshold: 50 },
  enabled: true,
  cooldownMs: 30000
})

/** 平均耗时超过 3 秒 */
dataFlowMonitor.addAlertRule({
  id: 'builtin:slow-transfer',
  name: '慢流转',
  description: '通道平均耗时超过 3000ms',
  level: 'warning' as AlertLevel,
  channelIds: [],
  condition: { metric: 'avgDuration', operator: '>', threshold: 3000 },
  enabled: true,
  cooldownMs: 60000
})

/** P95 耗时超过 10 秒 */
dataFlowMonitor.addAlertRule({
  id: 'builtin:high-p95',
  name: 'P95 高延迟',
  description: '通道 P95 耗时超过 10000ms',
  level: 'warning' as AlertLevel,
  channelIds: [],
  condition: { metric: 'p95Duration', operator: '>', threshold: 10000 },
  enabled: true,
  cooldownMs: 60000
})

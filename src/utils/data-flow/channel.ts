/**
 * 统一数据流转平台 - 数据通道
 *
 * 提供标准化的数据接口定义和通道管理：
 * - 通道创建、注册与生命周期管理
 * - 类型安全的数据发送与订阅
 * - 数据校验与转换集成
 * - 超时与重试机制
 *
 * @module utils/data-flow/channel
 */

import type {
  DataChannelConfig,
  DataChannel,
  DataModuleDescriptor,
  DataFlowDirection,
  DataFlowHandler,
  DataFlowRecord,
  DataFlowStatus,
  DataSummary
} from '@/types/data-flow'
import { dataTransformerManager } from './transformer'
import { dataFlowMonitor } from './monitor'

/** 生成唯一ID */
function generateId(): string {
  return `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 生成记录ID */
function generateRecordId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 计算数据摘要 */
function computeSummary(data: unknown): DataSummary {
  if (data === null || data === undefined) {
    return { type: 'null', size: 0 }
  }
  if (typeof data === 'string') {
    return { type: 'string', size: data.length * 2, length: data.length }
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return { type: typeof data, size: 8 }
  }
  if (Array.isArray(data)) {
    return {
      type: 'array',
      size: JSON.stringify(data).length * 2,
      length: data.length
    }
  }
  if (typeof data === 'object') {
    const fields = Object.keys(data as Record<string, unknown>)
    return {
      type: 'object',
      size: JSON.stringify(data).length * 2,
      fields
    }
  }
  return { type: typeof data, size: 0 }
}

/** 通道订阅者 */
interface ChannelSubscriber<T = unknown> {
  id: string
  handler: DataFlowHandler<T>
}

/**
 * 数据通道实现
 *
 * 封装了数据发送、订阅、转换、校验、超时和重试等完整生命周期。
 */
class DataChannelImpl<TInput = unknown, TOutput = unknown>
  implements DataChannel<TInput, TOutput> {
  // 配置属性
  id: string
  name: string
  description?: string
  source: DataModuleDescriptor
  target: DataModuleDescriptor
  direction: DataFlowDirection
  inputGuard?: (data: unknown) => data is TInput
  outputGuard?: (data: unknown) => data is TOutput
  transformerId?: string
  monitorEnabled?: boolean
  timeout?: number
  maxRetries?: number
  metadata?: Record<string, unknown>

  // 运行时属性
  createdAt: number
  lastActiveAt: number
  totalTransfers = 0
  failedTransfers = 0
  status: DataFlowStatus = 'idle' as DataFlowStatus

  /** 订阅者列表 */
  private subscribers: ChannelSubscriber<TOutput>[] = []

  /** 通道是否已销毁 */
  private destroyed = false

  /** 流转记录缓存（用于监控） */
  private recentRecords: DataFlowRecord[] = []

  constructor(config: DataChannelConfig<TInput, TOutput>) {
    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.source = config.source
    this.target = config.target
    this.direction = config.direction
    this.inputGuard = config.inputGuard
    this.outputGuard = config.outputGuard
    this.transformerId = config.transformerId
    this.monitorEnabled = config.monitorEnabled
    this.timeout = config.timeout
    this.maxRetries = config.maxRetries
    this.metadata = config.metadata
    this.createdAt = Date.now()
    this.lastActiveAt = this.createdAt
  }

  /**
   * 发送数据
   * @param data 输入数据
   * @returns 转换后的输出数据
   */
  async send(data: TInput): Promise<TOutput> {
    if (this.destroyed) {
      throw new Error(`[DataFlow] 通道 "${this.id}" 已销毁`)
    }

    const record = this.createRecord(data)
    this.status = 'transferring' as DataFlowStatus
    this.lastActiveAt = Date.now()

    try {
      // 输入校验
      if (this.inputGuard && !this.inputGuard(data)) {
        throw new Error(`[DataFlow] 通道 "${this.id}" 输入数据校验失败`)
      }

      // 数据转换
      let output: TOutput
      if (this.transformerId) {
        output = await this.executeWithTimeout(
          dataTransformerManager.transform<TInput, TOutput>(
            this.transformerId,
            data,
            { channelId: this.id, recordId: record.id }
          ),
          this.timeout ?? 0
        )
        record.transformed = true
        record.transformerId = this.transformerId
      } else {
        output = data as unknown as TOutput
      }

      // 输出校验
      if (this.outputGuard && !this.outputGuard(output)) {
        throw new Error(`[DataFlow] 通道 "${this.id}" 输出数据校验失败`)
      }

      // 更新记录
      record.status = 'success' as DataFlowStatus
      record.endTime = Date.now()
      record.duration = record.endTime - record.startTime
      record.outputSummary = computeSummary(output)

      // 通知订阅者
      await this.notifySubscribers(output, record)

      this.totalTransfers++
      this.status = 'success' as DataFlowStatus

      return output
    } catch (error) {
      record.status = 'failed' as DataFlowStatus
      record.endTime = Date.now()
      record.duration = record.endTime - record.startTime
      record.error = error instanceof Error ? error.message : String(error)

      this.failedTransfers++
      this.status = 'failed' as DataFlowStatus

      throw error
    } finally {
      this.recentRecords.push(record)
      if (this.recentRecords.length > 100) {
        this.recentRecords = this.recentRecords.slice(-50)
      }

      // 上报监控
      if (this.monitorEnabled) {
        dataFlowMonitor.recordTransfer(record)
      }
    }
  }

  /**
   * 订阅数据
   * @param handler 数据处理函数
   * @returns 取消订阅函数
   */
  subscribe(handler: DataFlowHandler<TOutput>): () => void {
    if (this.destroyed) {
      console.warn(`[DataFlow] 通道 "${this.id}" 已销毁，无法订阅`)
      return () => {}
    }

    const subscriberId = generateId()
    this.subscribers.push({ id: subscriberId, handler })

    return () => {
      this.subscribers = this.subscribers.filter((s) => s.id !== subscriberId)
    }
  }

  /**
   * 销毁通道
   */
  destroy(): void {
    this.destroyed = true
    this.subscribers = []
    this.recentRecords = []
    this.status = 'idle' as DataFlowStatus
  }

  /**
   * 获取最近的流转记录
   */
  getRecentRecords(limit?: number): DataFlowRecord[] {
    return limit
      ? this.recentRecords.slice(-limit)
      : [...this.recentRecords]
  }

  // ============================================================
  // 内部方法
  // ============================================================

  /** 创建流转记录 */
  private createRecord(data: TInput): DataFlowRecord {
    return {
      id: generateRecordId(),
      channelId: this.id,
      status: 'transferring' as DataFlowStatus,
      inputSummary: computeSummary(data),
      startTime: Date.now(),
      transformed: false
    }
  }

  /** 带超时执行 */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    if (timeoutMs <= 0) return promise

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`[DataFlow] 通道 "${this.id}" 操作超时 (${timeoutMs}ms)`))
      }, timeoutMs)

      promise.then(
        (result) => {
          clearTimeout(timer)
          resolve(result)
        },
        (error) => {
          clearTimeout(timer)
          reject(error)
        }
      )
    })
  }

  /** 通知订阅者 */
  private async notifySubscribers(
    data: TOutput,
    record: DataFlowRecord
  ): Promise<void> {
    const promises = this.subscribers.map(async (sub) => {
      try {
        await sub.handler(data, record)
      } catch (e) {
        console.error(
          `[DataFlow] 通道 "${this.id}" 订阅者 "${sub.id}" 处理失败:`,
          e
        )
      }
    })
    await Promise.all(promises)
  }
}

// ============================================================
// 通道管理器
// ============================================================

/**
 * 数据通道管理器
 *
 * 负责通道的注册、查询、生命周期管理。
 */
export class DataChannelManager {
  /** 已注册的通道 */
  private channels = new Map<string, DataChannelImpl>()

  /**
   * 创建并注册数据通道
   * @param config 通道配置
   * @returns 通道实例
   */
  createChannel<TInput, TOutput>(
    config: DataChannelConfig<TInput, TOutput>
  ): DataChannel<TInput, TOutput> {
    if (this.channels.has(config.id)) {
      console.warn(`[DataFlow] 通道 "${config.id}" 已存在，将覆盖`)
      this.destroyChannel(config.id)
    }

    const channel = new DataChannelImpl(config)
    this.channels.set(config.id, channel as DataChannelImpl)
    return channel as unknown as DataChannel<TInput, TOutput>
  }

  /**
   * 获取通道
   * @param id 通道ID
   */
  getChannel<TInput = unknown, TOutput = unknown>(
    id: string
  ): DataChannel<TInput, TOutput> | undefined {
    return this.channels.get(id) as
      | DataChannel<TInput, TOutput>
      | undefined
  }

  /**
   * 销毁通道
   * @param id 通道ID
   */
  destroyChannel(id: string): boolean {
    const channel = this.channels.get(id)
    if (channel) {
      channel.destroy()
      this.channels.delete(id)
      return true
    }
    return false
  }

  /**
   * 获取所有通道
   */
  getAllChannels(): DataChannel[] {
    return Array.from(this.channels.values()) as DataChannel[]
  }

  /**
   * 获取指定模块作为源的通道
   * @param moduleId 模块ID
   */
  getChannelsBySource(moduleId: string): DataChannel[] {
    return this.getAllChannels().filter((ch) => ch.source.id === moduleId)
  }

  /**
   * 获取指定模块作为目标的通道
   * @param moduleId 模块ID
   */
  getChannelsByTarget(moduleId: string): DataChannel[] {
    return this.getAllChannels().filter((ch) => ch.target.id === moduleId)
  }

  /**
   * 获取连接两个模块的通道
   * @param sourceId 源模块ID
   * @param targetId 目标模块ID
   */
  getChannelsBetween(sourceId: string, targetId: string): DataChannel[] {
    return this.getAllChannels().filter(
      (ch) => ch.source.id === sourceId && ch.target.id === targetId
    )
  }

  /**
   * 销毁所有通道
   */
  destroyAll(): void {
    this.channels.forEach((ch) => ch.destroy())
    this.channels.clear()
  }
}

/** 全局通道管理器实例 */
export const dataChannelManager = new DataChannelManager()

/**
 * 统一数据流转平台 - 统一导出
 *
 * 提供数据流转平台的统一入口，包含：
 * - DataFlowBus 核心总线
 * - DataChannelManager 通道管理
 * - DataTransformerManager 转换器管理
 * - DataFlowMonitor 监控告警
 * - DataFlowVisualizer 可视化
 * - 全部类型定义
 * - Vue 组合式 API（composable）
 *
 * @module utils/data-flow
 */

// 核心总线
export { DataFlowBus, dataFlowBus } from './bus'

// 通道管理
export { DataChannelManager, dataChannelManager } from './channel'

// 转换器管理
export {
  DataTransformerManager,
  dataTransformerManager,
  createEnumTransformer
} from './transformer'

// 监控告警
export { DataFlowMonitor, dataFlowMonitor } from './monitor'

// 可视化
export { DataFlowVisualizer, dataFlowVisualizer } from './visualizer'

// 类型定义（仅类型导出）
export type {
  DataFlowDirection,
  DataFlowStatus,
  AlertLevel,
  DataModuleType,
  DataChannelConfig,
  DataModuleDescriptor,
  DataChannel,
  DataFlowRecord,
  DataSummary,
  DataTransformerDefinition,
  TransformContext,
  DataFlowMetrics,
  AlertRule,
  AlertCondition,
  AlertRecord,
  AlertCallback,
  DataFlowHandler,
  VisualizationNode,
  VisualizationEdge,
  VisualizationGraph,
  DataFlowPlatformConfig
} from '@/types/data-flow'

// 枚举值导出（方便使用）
export { DataFlowDirection as FlowDirection } from '@/types/data-flow'
export { DataFlowStatus as FlowStatus } from '@/types/data-flow'
export { AlertLevel as AlertLevelEnum } from '@/types/data-flow'
export { DataModuleType as ModuleType } from '@/types/data-flow'

// ============================================================
// Vue Composable
// ============================================================

import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue'
import { dataFlowBus } from './bus'
import { dataFlowMonitor } from './monitor'
import type {
  DataFlowHandler,
  DataFlowMetrics,
  DataFlowRecord,
  AlertRecord,
  AlertCallback,
  VisualizationGraph,
  DataChannelConfig,
  DataTransformerDefinition,
  AlertRule
} from '@/types/data-flow'

/**
 * 数据流转组合式 API
 *
 * 在 Vue 组件中使用数据流转平台的便捷方式。
 *
 * ## 使用示例
 *
 * ```vue
 * <script setup lang="ts">
 * import { useDataFlow } from '@/utils/data-flow'
 *
 * const { send, subscribe, getMetrics } = useDataFlow('my-channel')
 *
 * // 发送数据
 * await send(data)
 *
 * // 订阅数据
 * subscribe((data, record) => {
 *   console.log('收到:', data)
 * })
 *
 * // 获取指标
 * const metrics = getMetrics()
 * </script>
 * ```
 */
export function useDataFlow<TInput = unknown, TOutput = unknown>(
  channelId: string
) {
  /** 通道指标 */
  const metrics: Ref<DataFlowMetrics | null> = ref(null)

  /** 最近流转记录 */
  const recentRecords: Ref<DataFlowRecord[]> = ref([])

  /** 告警记录 */
  const alerts: Ref<AlertRecord[]> = ref([])

  /** 取消订阅函数列表 */
  const unsubscribers: (() => void)[] = []

  /**
   * 通过通道发送数据
   */
  async function send(data: TInput): Promise<TOutput> {
    return dataFlowBus.send<TInput, TOutput>(channelId, data)
  }

  /**
   * 订阅通道数据
   */
  function subscribe(handler: DataFlowHandler<TOutput>): void {
    const unsubscribe = dataFlowBus.subscribe<TOutput>(channelId, handler)
    unsubscribers.push(unsubscribe)
  }

  /**
   * 获取通道指标
   */
  function getMetrics(): DataFlowMetrics | null {
    metrics.value = dataFlowMonitor.getMetrics(channelId)
    return metrics.value
  }

  /**
   * 获取告警记录
   */
  function getAlerts(): AlertRecord[] {
    alerts.value = dataFlowMonitor.getAlertRecords({ channelId })
    return alerts.value
  }

  /**
   * 确认告警
   */
  function acknowledgeAlert(alertId: string): void {
    dataFlowMonitor.acknowledgeAlert(alertId)
  }

  // 生命周期管理
  onMounted(() => {
    // 初始获取指标
    getMetrics()
    getAlerts()
  })

  onBeforeUnmount(() => {
    // 清理所有订阅
    unsubscribers.forEach((unsub) => unsub())
    unsubscribers.length = 0
  })

  return {
    send,
    subscribe,
    getMetrics,
    metrics,
    getAlerts,
    alerts,
    acknowledgeAlert,
    recentRecords
  }
}

/**
 * 数据流转平台管理组合式 API
 *
 * 用于管理数据流转平台的全局操作（注册通道、转换器、告警规则等）。
 *
 * ## 使用示例
 *
 * ```vue
 * <script setup lang="ts">
 * import { useDataFlowPlatform } from '@/utils/data-flow'
 *
 * const { registerChannel, printFlowGraph, generateMermaid } = useDataFlowPlatform()
 *
 * // 注册自定义通道
 * registerChannel({
 *   id: 'my-channel',
 *   name: '我的通道',
 *   source: { type: 'api', id: 'my-api' },
 *   target: { type: 'page', id: 'my-page' },
 *   direction: 'one-way'
 * })
 *
 * // 打印流转图
 * printFlowGraph()
 * </script>
 * ```
 */
export function useDataFlowPlatform() {
  /**
   * 初始化平台
   */
  function init(): void {
    dataFlowBus.init()
  }

  /**
   * 注册数据通道
   */
  function registerChannel<TInput, TOutput>(
    config: DataChannelConfig<TInput, TOutput>
  ) {
    return dataFlowBus.registerChannel(config)
  }

  /**
   * 注册数据转换器
   */
  function registerTransformer<TInput, TOutput>(
    definition: DataTransformerDefinition<TInput, TOutput>
  ) {
    dataFlowBus.registerTransformer(definition)
  }

  /**
   * 添加告警规则
   */
  function addAlertRule(rule: AlertRule) {
    dataFlowBus.addAlertRule(rule)
  }

  /**
   * 注册告警回调
   */
  function onAlert(callback: AlertCallback) {
    return dataFlowBus.onAlert(callback)
  }

  /**
   * 获取所有通道
   */
  function getAllChannels() {
    return dataFlowBus.getAllChannels()
  }

  /**
   * 获取所有指标
   */
  function getAllMetrics() {
    return dataFlowBus.getAllMetrics()
  }

  /**
   * 获取告警记录
   */
  function getAlertRecords(options?: {
    channelId?: string
    acknowledged?: boolean
    limit?: number
  }) {
    return dataFlowBus.getAlertRecords(options)
  }

  /**
   * 打印流转图到控制台
   */
  function printFlowGraph() {
    dataFlowBus.printFlowGraph()
  }

  /**
   * 生成 Mermaid 流程图
   */
  function generateMermaid() {
    return dataFlowBus.generateMermaid()
  }

  /**
   * 生成可视化图数据
   */
  function generateGraph(): VisualizationGraph {
    return dataFlowBus.generateGraph()
  }

  return {
    init,
    registerChannel,
    registerTransformer,
    addAlertRule,
    onAlert,
    getAllChannels,
    getAllMetrics,
    getAlertRecords,
    printFlowGraph,
    generateMermaid,
    generateGraph
  }
}

// Mutation 集成
export { useDataFlowMutation, useDataFlowInvalidation } from './useDataFlowMutation'

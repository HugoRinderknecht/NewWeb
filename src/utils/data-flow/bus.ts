/**
 * 统一数据流转平台 - 核心总线
 *
 * DataFlowBus 是整个数据流转平台的中央协调器，提供：
 * - 统一的数据流转入口
 * - 通道注册与管理
 * - 数据发送与订阅
 * - 与现有 Store/API/组件的桥接
 * - 平台生命周期管理
 *
 * @module utils/data-flow/bus
 */

import type {
  DataFlowPlatformConfig,
  DataChannelConfig,
  DataChannel,
  DataModuleType,
  DataTransformerDefinition,
  AlertRule,
  AlertCallback,
  DataFlowHandler,
  DataFlowRecord,
  DataFlowMetrics,
  VisualizationGraph
} from '@/types/data-flow'
import { DataFlowDirection, DataFlowStatus } from '@/types/data-flow'
import { dataChannelManager } from './channel'
import { dataTransformerManager } from './transformer'
import { dataFlowMonitor } from './monitor'
import { dataFlowVisualizer } from './visualizer'

/** 默认平台配置 */
const DEFAULT_CONFIG: DataFlowPlatformConfig = {
  enabled: true,
  monitorEnabled: true,
  visualizerEnabled: true,
  monitorWindowMs: 60000,
  maxRecords: 10000,
  defaultTimeout: 30000,
  defaultMaxRetries: 0
}

/**
 * 数据流转总线
 *
 * 作为统一数据流转平台的核心入口，整合了通道管理、
 * 数据转换、监控告警和可视化等全部能力。
 *
 * ## 使用示例
 *
 * ```typescript
 * import { dataFlowBus } from '@/utils/data-flow'
 *
 * // 1. 注册数据通道
 * dataFlowBus.registerChannel({
 *   id: 'project-list-api',
 *   name: '项目列表数据流',
 *   source: { type: 'api', id: 'project-api', name: '项目API' },
 *   target: { type: 'page', id: 'project-list', name: '项目列表页' },
 *   direction: DataFlowDirection.ONE_WAY,
 *   transformerId: 'builtin:pagination-response',
 *   monitorEnabled: true
 * })
 *
 * // 2. 发送数据
 * const result = await dataFlowBus.send('project-list-api', apiResponse)
 *
 * // 3. 订阅数据
 * dataFlowBus.subscribe('project-list-api', (data, record) => {
 *   console.log('收到数据:', data)
 * })
 *
 * // 4. 查看流转图
 * dataFlowBus.printFlowGraph()
 * ```
 */
export class DataFlowBus {
  /** 平台配置 */
  private config: DataFlowPlatformConfig

  /** 是否已初始化 */
  private initialized = false

  /** 全局流转记录 */
  private flowRecords: DataFlowRecord[] = []

  constructor(config?: Partial<DataFlowPlatformConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // 注册全局告警回调
    if (this.config.onAlert) {
      dataFlowMonitor.onAlert(this.config.onAlert)
    }

    // 同步监控启用状态
    dataFlowMonitor.setEnabled(this.config.monitorEnabled)
    dataFlowVisualizer.setEnabled(this.config.visualizerEnabled)
  }

  // ============================================================
  // 平台生命周期
  // ============================================================

  /**
   * 初始化数据流转平台
   *
   * 注册项目内置的数据通道，建立模块间的数据流转关系。
   * 应在应用启动时调用。
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('[DataFlow] 平台已初始化，跳过重复初始化')
      return
    }

    if (!this.config.enabled) {
      console.info('[DataFlow] 平台已禁用')
      return
    }

    this.registerBuiltinChannels()

    try {
      const [{ useTeamStore }, { useNotificationStore }, { useReviewStore }, { useProjectStore }] =
        await Promise.all([
          import('@/store/modules/team'),
          import('@/store/modules/notification'),
          import('@/store/modules/review'),
          import('@/store/modules/project')
        ])

      const teamStore = useTeamStore()
      const notificationStore = useNotificationStore()
      const reviewStore = useReviewStore()
      const projectStore = useProjectStore()

      this.bridgeStoreToChannel('team', 'flow:store->project-data', () => teamStore.currentTeamId)
      this.bridgeStoreToChannel('notification', 'flow:store->user-info', () => notificationStore.unreadCount)
      this.bridgeStoreToChannel('review', 'flow:store->project-data', () => reviewStore.pendingCount)
      this.bridgeStoreToChannel('project', 'flow:store->project-data', () => projectStore.currentProjectId)
    } catch (error) {
      console.warn('[DataFlowBus] Store桥接失败:', error)
    }

    this.initialized = true

    if (import.meta.env.DEV) {
      console.info(
        '%c[DataFlow] 统一数据流转平台已初始化 ✅',
        'color: #4CAF50; font-weight: bold;'
      )
    }
  }

  /**
   * 销毁数据流转平台
   */
  destroy(): void {
    dataChannelManager.destroyAll()
    dataTransformerManager.clear()
    dataFlowMonitor.destroy()
    this.flowRecords = []
    this.initialized = false
  }

  // ============================================================
  // 通道管理
  // ============================================================

  /**
   * 注册数据通道
   * @param config 通道配置
   * @returns 通道实例
   */
  registerChannel<TInput = unknown, TOutput = unknown>(
    config: DataChannelConfig<TInput, TOutput>
  ): DataChannel<TInput, TOutput> {
    // 填充默认值
    const fullConfig: DataChannelConfig<TInput, TOutput> = {
      ...config,
      monitorEnabled: config.monitorEnabled ?? this.config.monitorEnabled,
      timeout: config.timeout ?? this.config.defaultTimeout,
      maxRetries: config.maxRetries ?? this.config.defaultMaxRetries
    }

    return dataChannelManager.createChannel(fullConfig)
  }

  /**
   * 注销数据通道
   * @param channelId 通道ID
   */
  unregisterChannel(channelId: string): boolean {
    return dataChannelManager.destroyChannel(channelId)
  }

  /**
   * 获取通道
   * @param channelId 通道ID
   */
  getChannel<TInput = unknown, TOutput = unknown>(
    channelId: string
  ): DataChannel<TInput, TOutput> | undefined {
    return dataChannelManager.getChannel<TInput, TOutput>(channelId)
  }

  /**
   * 获取所有通道
   */
  getAllChannels(): DataChannel[] {
    return dataChannelManager.getAllChannels()
  }

  // ============================================================
  // 数据发送与订阅
  // ============================================================

  /**
   * 通过通道发送数据
   * @param channelId 通道ID
   * @param data 输入数据
   * @returns 转换后的输出数据
   */
  async send<TInput = unknown, TOutput = unknown>(
    channelId: string,
    data: TInput
  ): Promise<TOutput> {
    const channel = dataChannelManager.getChannel<TInput, TOutput>(channelId)
    if (!channel) {
      throw new Error(`[DataFlow] 通道 "${channelId}" 不存在`)
    }
    return channel.send(data)
  }

  /**
   * 订阅通道数据
   * @param channelId 通道ID
   * @param handler 数据处理函数
   * @returns 取消订阅函数
   */
  subscribe<T = unknown>(
    channelId: string,
    handler: DataFlowHandler<T>
  ): () => void {
    const channel = dataChannelManager.getChannel(channelId)
    if (!channel) {
      console.warn(`[DataFlow] 通道 "${channelId}" 不存在，无法订阅`)
      return () => {}
    }
    return channel.subscribe(handler as DataFlowHandler<unknown>)
  }

  // ============================================================
  // 转换器管理
  // ============================================================

  /**
   * 注册数据转换器
   * @param definition 转换器定义
   */
  registerTransformer<TInput, TOutput>(
    definition: DataTransformerDefinition<TInput, TOutput>
  ): void {
    dataTransformerManager.register(definition)
  }

  /**
   * 批量注册转换器
   */
  registerTransformers(definitions: DataTransformerDefinition[]): void {
    dataTransformerManager.registerAll(definitions)
  }

  // ============================================================
  // 监控与告警
  // ============================================================

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    dataFlowMonitor.addAlertRule(rule)
  }

  /**
   * 注册告警回调
   */
  onAlert(callback: AlertCallback): () => void {
    return dataFlowMonitor.onAlert(callback)
  }

  /**
   * 获取通道指标
   */
  getMetrics(channelId: string): DataFlowMetrics | null {
    return dataFlowMonitor.getMetrics(channelId)
  }

  /**
   * 获取所有通道指标
   */
  getAllMetrics(): Map<string, DataFlowMetrics> {
    return dataFlowMonitor.getAllMetrics()
  }

  /**
   * 获取告警记录
   */
  getAlertRecords(options?: {
    channelId?: string
    acknowledged?: boolean
    limit?: number
  }): import('@/types/data-flow').AlertRecord[] {
    return dataFlowMonitor.getAlertRecords(options)
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string): void {
    dataFlowMonitor.acknowledgeAlert(alertId)
  }

  // ============================================================
  // 可视化
  // ============================================================

  /**
   * 生成可视化图
   */
  generateGraph(): VisualizationGraph {
    return dataFlowVisualizer.generateGraph()
  }

  /**
   * 在控制台输出数据流转图
   */
  printFlowGraph(): void {
    dataFlowVisualizer.printToConsole()
  }

  /**
   * 生成 Mermaid 格式流程图
   */
  generateMermaid(): string {
    return dataFlowVisualizer.generateMermaid()
  }

  /**
   * 生成 JSON 格式流转图数据
   */
  generateFlowJSON(): string {
    return dataFlowVisualizer.generateJSON()
  }

  // ============================================================
  // 流转记录
  // ============================================================

  /**
   * 获取流转记录
   * @param options 筛选选项
   */
  getFlowRecords(options?: {
    channelId?: string
    status?: DataFlowStatus
    limit?: number
  }): DataFlowRecord[] {
    let records = [...this.flowRecords]
    if (options?.channelId) {
      records = records.filter((r) => r.channelId === options.channelId)
    }
    if (options?.status) {
      records = records.filter((r) => r.status === options.status)
    }
    if (options?.limit) {
      records = records.slice(-options.limit)
    }
    return records
  }

  // ============================================================
  // 内置通道注册
  // ============================================================

  /** 注册项目内置的数据通道 */
  private registerBuiltinChannels(): void {
    // API -> 页面 的数据流通道
    const apiToPageChannels: DataChannelConfig[] = [
      {
        id: 'flow:api->project-list',
        name: '项目列表数据流',
        description: '项目API -> 项目列表页',
        source: { type: 'api' as DataModuleType, id: 'api:project', name: '项目API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:project-list', name: '项目列表页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      },
      {
        id: 'flow:api->script-list',
        name: '剧本列表数据流',
        description: '剧本API -> 剧本列表页',
        source: { type: 'api' as DataModuleType, id: 'api:script', name: '剧本API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:script-list', name: '剧本列表页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      },
      {
        id: 'flow:api->asset-list',
        name: '资产列表数据流',
        description: '资产API -> 资产库页',
        source: { type: 'api' as DataModuleType, id: 'api:asset', name: '资产API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:asset-library', name: '资产库页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      },
      {
        id: 'flow:api->review-list',
        name: '审核列表数据流',
        description: '审核API -> 审核列表页',
        source: { type: 'api' as DataModuleType, id: 'api:review', name: '审核API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:review-pending', name: '待审核页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      },
      {
        id: 'flow:api->workflow-list',
        name: '工作流列表数据流',
        description: '工作流API -> 工作流列表页',
        source: { type: 'api' as DataModuleType, id: 'api:workflow', name: '工作流API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:workflow-list', name: '工作流列表页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      },
      {
        id: 'flow:api->team-list',
        name: '团队列表数据流',
        description: '团队API -> 团队列表页',
        source: { type: 'api' as DataModuleType, id: 'api:team', name: '团队API服务' },
        target: { type: 'page' as DataModuleType, id: 'page:team-list', name: '团队列表页' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:pagination-response',
        monitorEnabled: true
      }
    ]

    // Store -> 页面 的数据流通道
    const storeToPageChannels: DataChannelConfig[] = [
      {
        id: 'flow:store->user-info',
        name: '用户信息数据流',
        description: '用户Store -> 需要用户信息的页面',
        source: { type: 'store' as DataModuleType, id: 'store:user', name: '用户Store' },
        target: { type: 'page' as DataModuleType, id: 'page:*', name: '全局页面' },
        direction: DataFlowDirection.BROADCAST,
        monitorEnabled: true
      },
      {
        id: 'flow:store->settings',
        name: '设置数据流',
        description: '设置Store -> 需要设置的组件',
        source: { type: 'store' as DataModuleType, id: 'store:setting', name: '设置Store' },
        target: { type: 'component' as DataModuleType, id: 'component:*', name: '全局组件' },
        direction: DataFlowDirection.BROADCAST,
        monitorEnabled: true
      },
      {
        id: 'flow:store->project-data',
        name: '项目数据流',
        description: '项目数据Store -> 项目相关页面',
        source: { type: 'store' as DataModuleType, id: 'store:project-data', name: '项目数据Store' },
        target: { type: 'page' as DataModuleType, id: 'page:project-*', name: '项目相关页面' },
        direction: DataFlowDirection.TWO_WAY,
        monitorEnabled: true
      }
    ]

    // 页面 -> API 的数据流通道（表单提交等）
    const pageToApiChannels: DataChannelConfig[] = [
      {
        id: 'flow:page->api:form-submit',
        name: '表单提交数据流',
        description: '页面表单 -> API服务（通用）',
        source: { type: 'page' as DataModuleType, id: 'page:*', name: '页面' },
        target: { type: 'api' as DataModuleType, id: 'api:*', name: 'API服务' },
        direction: DataFlowDirection.ONE_WAY,
        transformerId: 'builtin:sanitize-empty',
        monitorEnabled: true
      }
    ]

    // 事件总线通道
    const eventBusChannels: DataChannelConfig[] = [
      {
        id: 'flow:event-bus:global',
        name: '全局事件总线',
        description: 'mitt 事件总线的全局命令通道',
        source: { type: 'event-bus' as DataModuleType, id: 'mitt:global', name: '全局事件总线' },
        target: { type: 'component' as DataModuleType, id: 'component:*', name: '全局组件' },
        direction: DataFlowDirection.BROADCAST,
        monitorEnabled: false
      }
    ]

    const allChannels = [
      ...apiToPageChannels,
      ...storeToPageChannels,
      ...pageToApiChannels,
      ...eventBusChannels
    ]

    for (const config of allChannels) {
      this.registerChannel(config)
    }

    for (const config of allChannels) {
      this.subscribe(config.id, (data) => {
        if (import.meta.env.DEV) {
          console.info(
            `%c[DataFlow] 通道 "${config.id}" 收到数据:`,
            'color: #2196F3;',
            data
          )
        }
        dataFlowMonitor.recordTransfer({
          id: `${config.id}-${Date.now()}`,
          channelId: config.id,
          status: DataFlowStatus.SUCCESS,
          inputSummary: { type: 'auto', size: 1 },
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 0,
          transformed: false
        })
      })
    }
  }
  bridgeStoreToChannel(storeName: string, channelId: string, getter: () => any) {
    import('vue').then(({ watch }) => {
      watch(getter, (newVal, oldVal) => {
        this.send(channelId, {
          source: `store:${storeName}`,
          action: 'update',
          data: newVal,
          prevData: oldVal,
          timestamp: Date.now()
        }).catch(() => {})
      })
    })
  }

  notifyDataChange(source: string, action: string, data?: any) {
    const channelMap: Record<string, string> = {
      'project': 'flow:api->project-list',
      'script': 'flow:api->script-list',
      'asset': 'flow:api->asset-list',
      'review': 'flow:api->review-list',
      'workflow': 'flow:api->workflow-list',
      'team': 'flow:api->team-list'
    }
    const channelId = channelMap[source]
    if (channelId) {
      this.send(channelId, { source, action, data, timestamp: Date.now() }).catch(() => {})
    }
  }
}

/** 全局数据流转总线实例 */
export const dataFlowBus = new DataFlowBus()

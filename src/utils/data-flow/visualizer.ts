/**
 * 统一数据流转平台 - 可视化
 *
 * 提供数据流转的可视化展示能力：
 * - 自动生成数据流转图
 * - 模块健康状态检测
 * - 控制台可视化输出
 * - DevTools 集成支持
 *
 * @module utils/data-flow/visualizer
 */

import type {
  VisualizationGraph,
  VisualizationNode,
  VisualizationEdge,
  DataModuleDescriptor,
  DataFlowDirection,
  DataFlowStatus
} from '@/types/data-flow'
import { dataChannelManager } from './channel'
import { dataFlowMonitor } from './monitor'

/** 模块类型对应的颜色 */
const MODULE_COLORS: Record<string, string> = {
  page: '#4FC3F7',
  component: '#81C784',
  api: '#FFB74D',
  store: '#E57373',
  hook: '#BA68C8',
  utility: '#90A4AE',
  websocket: '#4DD0E1',
  'event-bus': '#FFD54F',
  storage: '#A1887F'
}

/** 模块类型对应的图标 */
const MODULE_ICONS: Record<string, string> = {
  page: '📄',
  component: '🧩',
  api: '🌐',
  store: '💾',
  hook: '🪝',
  utility: '🔧',
  websocket: '🔌',
  'event-bus': '📡',
  storage: '📦'
}

/** 方向对应的箭头 */
const DIRECTION_ARROWS: Record<string, string> = {
  'one-way': '→',
  'two-way': '↔',
  broadcast: '⇉'
}

/** 状态对应的颜色 */
const STATUS_COLORS: Record<string, string> = {
  idle: '#9E9E9E',
  transferring: '#2196F3',
  success: '#4CAF50',
  failed: '#F44336',
  timeout: '#FF9800'
}

/**
 * 数据流转可视化器
 *
 * 负责生成数据流转图、检测模块健康状态、
 * 提供控制台输出和 DevTools 集成。
 */
export class DataFlowVisualizer {
  /** 是否启用可视化 */
  private enabled: boolean

  /** 模块位置缓存 */
  private nodePositions = new Map<string, { x: number; y: number }>()

  constructor(options?: { enabled?: boolean }) {
    this.enabled = options?.enabled ?? true
  }

  /**
   * 启用/禁用可视化
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 生成可视化图
   * @returns 可视化图数据
   */
  generateGraph(): VisualizationGraph {
    const channels = dataChannelManager.getAllChannels()
    const moduleMap = new Map<string, DataModuleDescriptor>()

    // 收集所有模块
    for (const channel of channels) {
      const sourceKey = `${channel.source.type}:${channel.source.id}`
      const targetKey = `${channel.target.type}:${channel.target.id}`
      if (!moduleMap.has(sourceKey)) moduleMap.set(sourceKey, channel.source)
      if (!moduleMap.has(targetKey)) moduleMap.set(targetKey, channel.target)
    }

    // 生成节点
    const nodes: VisualizationNode[] = []
    let index = 0
    const modulesPerRow = 4
    const nodeWidth = 180
    const nodeHeight = 80
    const horizontalGap = 60
    const verticalGap = 80

    for (const [key, module] of moduleMap) {
      const row = Math.floor(index / modulesPerRow)
      const col = index % modulesPerRow

      // 使用缓存位置或自动布局
      const cached = this.nodePositions.get(key)
      const x = cached?.x ?? col * (nodeWidth + horizontalGap) + 40
      const y = cached?.y ?? row * (nodeHeight + verticalGap) + 40

      // 计算关联通道数
      const channelCount = channels.filter(
        (ch) =>
          ch.source.id === module.id ||
          ch.target.id === module.id
      ).length

      // 健康状态检测
      const healthStatus = this.assessModuleHealth(module.id)

      nodes.push({
        module,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        channelCount,
        healthStatus
      })

      index++
    }

    // 生成边
    const edges: VisualizationEdge[] = channels.map((channel) => {
      const metrics = dataFlowMonitor.getMetrics(channel.id)
      const hasAlert = dataFlowMonitor
        .getAlertRecords({ channelId: channel.id, acknowledged: false })
        .length > 0

      return {
        channel,
        direction: channel.direction as DataFlowDirection,
        status: channel.status as DataFlowStatus,
        metrics: metrics ?? undefined,
        hasAlert
      }
    })

    return {
      nodes,
      edges,
      generatedAt: Date.now()
    }
  }

  /**
   * 在控制台输出数据流转图（文本形式）
   */
  printToConsole(): void {
    if (!this.enabled) return

    const graph = this.generateGraph()

    console.group('%c📊 数据流转图', 'font-size: 16px; font-weight: bold;')

    // 输出模块概览
    console.group('%c📦 模块概览', 'color: #4FC3F7; font-weight: bold;')
    for (const node of graph.nodes) {
      const icon = MODULE_ICONS[node.module.type] || '❓'
      const color = MODULE_COLORS[node.module.type] || '#999'
      const healthIcon =
        node.healthStatus === 'healthy'
          ? '✅'
          : node.healthStatus === 'degraded'
            ? '⚠️'
            : '❌'
      console.log(
        `%c${icon} ${node.module.name || node.module.id}%c [${node.module.type}] ${healthIcon} (${node.channelCount} 通道)`,
        `color: ${color}; font-weight: bold;`,
        'color: inherit;'
      )
    }
    console.groupEnd()

    // 输出数据流
    console.group('%c🔄 数据流', 'color: #FFB74D; font-weight: bold;')
    for (const edge of graph.edges) {
      const arrow = DIRECTION_ARROWS[edge.direction] || '→'
      const statusColor = STATUS_COLORS[edge.status] || '#999'
      const sourceName = edge.channel.source.name || edge.channel.source.id
      const targetName = edge.channel.target.name || edge.channel.target.id
      const alertTag = edge.hasAlert ? ' 🚨' : ''
      const metricsInfo = edge.metrics
        ? ` | ${edge.metrics.transferCount}次 | 平均${edge.metrics.avgDuration}ms | 错误率${edge.metrics.errorRate}%`
        : ''

      console.log(
        `%c${sourceName} %c${arrow}%c ${targetName}%c [${edge.channel.name}]${alertTag}${metricsInfo}`,
        'font-weight: bold;',
        `color: ${statusColor}; font-weight: bold;`,
        'font-weight: bold;',
        'color: inherit;'
      )
    }
    console.groupEnd()

    // 输出告警
    const unacknowledgedAlerts = dataFlowMonitor.getAlertRecords({
      acknowledged: false
    })
    if (unacknowledgedAlerts.length > 0) {
      console.group('%c🚨 未确认告警', 'color: #F44336; font-weight: bold;')
      for (const alert of unacknowledgedAlerts) {
        const levelIcon =
          alert.level === 'critical'
            ? '🔴'
            : alert.level === 'error'
              ? '🟠'
              : alert.level === 'warning'
                ? '🟡'
                : '🔵'
        console.log(`${levelIcon} ${alert.message}`)
      }
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * 生成 Mermaid 格式的流程图
   * @returns Mermaid 语法字符串
   */
  generateMermaid(): string {
    const graph = this.generateGraph()
    const lines: string[] = ['graph TD']

    // 节点定义
    for (const node of graph.nodes) {
      const nodeId = this.sanitizeMermaidId(node.module.id)
      const label = node.module.name || node.module.id
      const typeLabel = node.module.type
      const healthIcon =
        node.healthStatus === 'healthy'
          ? '✓'
          : node.healthStatus === 'degraded'
            ? '⚠'
            : '✗'
      lines.push(`  ${nodeId}["${label}<br/><small>${typeLabel} ${healthIcon}</small>"]`)
    }

    lines.push('')

    // 边定义
    for (const edge of graph.edges) {
      const sourceId = this.sanitizeMermaidId(edge.channel.source.id)
      const targetId = this.sanitizeMermaidId(edge.channel.target.id)
      const label = edge.channel.name
      const statusClass =
        edge.status === 'success'
          ? 'success'
          : edge.status === 'failed'
            ? 'failed'
            : edge.status === 'transferring'
              ? 'active'
              : ''

      const arrow =
        edge.direction === 'two-way'
          ? '<-->'
          : edge.direction === 'broadcast'
            ? '-->'
            : '-->'

      lines.push(
        `  ${sourceId} ${arrow}|"${label}"| ${targetId}${statusClass ? `:::${statusClass}` : ''}`
      )
    }

    // 样式
    lines.push('')
    lines.push('classDef success stroke:#4CAF50,stroke-width:2px')
    lines.push('classDef failed stroke:#F44336,stroke-width:2px')
    lines.push('classDef active stroke:#2196F3,stroke-width:2px,stroke-dasharray: 5 5')

    return lines.join('\n')
  }

  /**
   * 生成 JSON 格式的流转图数据
   * @returns JSON 字符串
   */
  generateJSON(): string {
    const graph = this.generateGraph()
    return JSON.stringify(graph, null, 2)
  }

  /**
   * 评估模块健康状态
   * @param moduleId 模块ID
   */
  private assessModuleHealth(
    moduleId: string
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const channels = dataChannelManager.getAllChannels().filter(
      (ch) => ch.source.id === moduleId || ch.target.id === moduleId
    )

    if (channels.length === 0) return 'healthy'

    let hasFailed = false
    let hasWarning = false

    for (const channel of channels) {
      const metrics = dataFlowMonitor.getMetrics(channel.id)
      if (!metrics) continue

      if (metrics.errorRate > 50) {
        hasFailed = true
        break
      }
      if (metrics.errorRate > 20 || metrics.avgDuration > 3000) {
        hasWarning = true
      }
    }

    if (hasFailed) return 'unhealthy'
    if (hasWarning) return 'degraded'
    return 'healthy'
  }

  /** 清理 Mermaid ID（移除特殊字符） */
  private sanitizeMermaidId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_')
  }
}

/** 全局可视化器实例 */
export const dataFlowVisualizer = new DataFlowVisualizer()

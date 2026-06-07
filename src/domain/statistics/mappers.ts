/**
 * 统计领域 DTO → ViewModel 映射函数
 *
 * 纯函数，不依赖 Vue 响应式。
 * 将后端 DTO 转换为面向 UI 展示的 ViewModel。
 *
 * @module domain/statistics/mappers
 */

import type { MetricCardViewModel, KpiCardViewModel } from '../types'
import type {
  DashboardCardViewModel,
  OutputBarData,
  TrendLineData,
  ResourcePieData,
  RadarData,
  ScatterData,
  HeatmapData,
  CostItemViewModel,
  FeatureDistributionData,
  ModelDistributionData,
  ProjectBarData,
  TokenItemViewModel,
  SalesOverviewViewModel
} from './types'

/** 功能图标映射 */
const FEATURE_ICON_MAP: Record<string, string> = {
  AI视频生成: 'ri:movie-line',
  语音合成: 'ri:mic-line',
  AI图像生成: 'ri:image-line',
  剧本生成: 'ri:file-text-line',
  分镜生成: 'ri:gallery-line',
  其他功能: 'ri:apps-line'
}

/**
 * 将 dashboard + realtime + projectList 数据映射为仪表盘卡片 ViewModel
 */
export function mapDashboardCards(
  dashboardData: Api.Statistics.DashboardData | null | undefined,
  realtimeData: Api.Statistics.RealtimeData | null | undefined,
  projectListTotal?: number
): DashboardCardViewModel[] {
  const activeUserSum =
    dashboardData?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ?? 0
  return [
    {
      label: '项目总数',
      value: projectListTotal ?? dashboardData?.totalProjects ?? 0,
      decimals: 0,
      change: dashboardData?.ownedProjectsChange ?? '+0%',
      icon: 'ri:folder-3-line'
    },
    {
      label: '视频总数',
      value: dashboardData?.totalVideos ?? 0,
      decimals: 0,
      change: '+0%',
      icon: 'ri:movie-line'
    },
    {
      label: '活跃用户',
      value: realtimeData?.activeUsers ?? activeUserSum,
      decimals: 0,
      change: dashboardData?.weeklyChange ?? '+0%',
      icon: 'ri:team-line'
    },
    {
      label: '积分余额',
      value: dashboardData?.creditsBalance ?? 0,
      decimals: 0,
      change: dashboardData?.creditsBalanceChange ?? '+0%',
      icon: 'ri:coins-line'
    }
  ]
}

/**
 * 将项目分析列表映射为柱状图数据
 */
export function mapOutputBarData(
  projectAnalysisList: Api.Statistics.ProjectAnalysisItem[] | null | undefined
): OutputBarData {
  const list = projectAnalysisList || []
  if (!list.length) {
    return [
      { name: '项目数', data: [] },
      { name: '视频数', data: [] }
    ]
  }
  return [
    { name: '项目数', data: list.map(() => 1) },
    { name: '视频数', data: list.map((i) => i.totalVideos || 0) }
  ]
}

/**
 * 将活跃用户数据映射为折线图数据
 */
export function mapTrendLineData(
  dashboardData: Api.Statistics.DashboardData | null | undefined
): TrendLineData {
  if (dashboardData?.activeUsers?.values?.length) {
    return [{ name: '活跃用户', data: dashboardData.activeUsers.values }]
  }
  return [{ name: '活跃用户', data: [] }]
}

/**
 * 将 dashboard 数据映射为资源占比环形图数据
 */
export function mapResourcePieData(
  dashboardData: Api.Statistics.DashboardData | null | undefined
): ResourcePieData {
  if (!dashboardData) return []
  return [
    { value: dashboardData.totalVideos ?? 0, name: '视频资源' },
    { value: dashboardData.totalStoryboards ?? 0, name: '分镜资源' },
    { value: dashboardData.totalAssets ?? 0, name: '素材资源' }
  ]
}

/**
 * 将活跃度排行映射为雷达图数据
 */
export function mapRadarData(
  activityRankList: Api.Statistics.UserActivityRankItem[] | null | undefined
): RadarData {
  const ranks = activityRankList || []
  if (!ranks.length) return []
  const avg = ranks.reduce(
    (acc, r) => {
      acc.active += r.activeDays || 0
      acc.score += r.contributionScore || 0
      return acc
    },
    { active: 0, score: 0 }
  )
  const total = ranks.length
  const avgActive = Math.min(100, Math.round(avg.active / total || 0))
  const avgScore = Math.min(100, Math.round(avg.score / total || 0))
  return [
    {
      name: '团队平均',
      value: [avgActive, avgScore, avgScore, avgActive, avgScore, avgActive]
    }
  ]
}

/**
 * 将项目分析列表映射为散点图数据
 */
export function mapScatterData(
  projectAnalysisList: Api.Statistics.ProjectAnalysisItem[] | null | undefined
): ScatterData {
  const list = projectAnalysisList || []
  return list.map((i) => ({
    value: [i.totalVideos || 0, i.totalStoryboards || 0] as [number, number]
  }))
}

/**
 * 将活动数据映射为热力图数据
 */
export function mapHeatmapData(
  realtimeData: Api.Statistics.RealtimeData | null | undefined
): HeatmapData {
  const activities = realtimeData?.data?.activities || []
  if (!activities.length) return []
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0))
  activities.forEach((_, idx) => {
    const day = idx % 7
    const hour = idx % 6
    matrix[day][hour] += 1
  })
  const result: [number, number, number][] = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      result.push([j, i, matrix[i][j]])
    }
  }
  return result
}

/**
 * 将积分数据映射为核心指标（费用统计页）
 */
export function mapCoreMetrics(
  creditsData: Api.Statistics.CreditsData | null | undefined,
  myCreditsData: Api.Points.CreditInfo | null | undefined,
  transactions: any[] | null | undefined
): MetricCardViewModel[] {
  const totalSpent = creditsData?.totalSpent ?? myCreditsData?.totalSpent ?? 0
  const balance = creditsData?.balance ?? myCreditsData?.balance ?? 0
  const recent = creditsData?.recentTransactions ?? []
  const dailyAvg = recent.length
    ? Math.round(recent.reduce((sum, t) => sum + (t.amount || 0), 0) / recent.length)
    : 0
  return [
    {
      label: '总积分消耗',
      value: totalSpent,
      decimals: 0,
      change: '+0%',
      icon: 'ri:coin-line'
    },
    {
      label: '总费用(元)',
      value: Number((totalSpent / 100).toFixed(2)),
      decimals: 2,
      change: '+0%',
      icon: 'ri:money-cny-circle-line'
    },
    {
      label: '剩余积分',
      value: balance,
      decimals: 0,
      change: '+0%',
      icon: 'ri:wallet-3-line'
    },
    {
      label: '日均消耗',
      value: dailyAvg,
      decimals: 0,
      change: '+0%',
      icon: 'ri:bar-chart-box-line'
    }
  ]
}

/**
 * 将交易记录映射为费用列表
 */
export function mapCostList(
  transactionsData: Api.Common.PaginatedResponse<Api.Points.TransactionRecord> | any[] | null | undefined
): CostItemViewModel[] {
  const records = Array.isArray(transactionsData)
    ? transactionsData
    : transactionsData?.records || []
  return records.map((item: any) => {
    const feature = item.source || item.feature || item.description || '其他功能'
    const credits = Math.abs(Number(item.amount ?? item.credits ?? 0))
    return {
      id: item.id,
      feature,
      icon: item.icon || FEATURE_ICON_MAP[feature] || 'ri:apps-line',
      projectName: item.projectName || '-',
      type: item.type === 'earn' ? '充值' : feature,
      credits,
      amount: item.amount != null ? `¥${(credits / 100).toFixed(2)}` : '-',
      usageCount: item.usageCount || 1,
      date: item.createTime || item.date || ''
    }
  })
}

/**
 * 将交易记录按功能类型聚合
 */
export function mapFeatureDistribution(
  costList: CostItemViewModel[]
): FeatureDistributionData {
  const aggMap = new Map<string, number>()
  costList.forEach((item) => {
    const key = item.feature || '其他功能'
    aggMap.set(key, (aggMap.get(key) || 0) + (item.credits || 0))
  })
  return Array.from(aggMap.entries()).map(([name, value]) => ({ name, value }))
}

/**
 * 将 Token 记录按模型聚合
 */
export function mapModelDistribution(
  tokenRecords: TokenItemViewModel[]
): ModelDistributionData {
  const map = new Map<string, number>()
  tokenRecords.forEach((item) => {
    if (!item.model) return
    map.set(item.model, (map.get(item.model) || 0) + (item.totalTokens || 0))
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

/**
 * 将 Token 记录按项目聚合
 */
export function mapProjectBarData(
  tokenRecords: TokenItemViewModel[]
): ProjectBarData {
  const map = new Map<string, number>()
  tokenRecords.forEach((item) => {
    if (!item.projectName) return
    map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
  })
  return [
    {
      name: 'Token 消耗',
      data: Array.from(map.values())
    }
  ]
}

/**
 * 将 Token 记录原始数据映射为 TokenItemViewModel 列表
 */
export function mapTokenList(
  tokenRecordsData: any
): TokenItemViewModel[] {
  const raw: any = tokenRecordsData
  const records: any[] = Array.isArray(raw) ? raw : raw?.records || []
  return records.map((item) => ({
    id: item.id,
    projectName: item.projectName || item.source || '',
    model: item.model || '',
    requestType: item.requestType || '',
    inputTokens: item.inputTokens || 0,
    outputTokens: item.outputTokens || 0,
    totalTokens: item.totalTokens || 0,
    cost: typeof item.cost === 'number' ? String(item.cost) : item.cost || '',
    requestTime: item.requestTime || item.createTime || ''
  }))
}

/**
 * 将 AI 用量核心指标映射（从 dashboard + token 列表派生）
 */
export function mapAiUsageCoreMetrics(
  dashboardData: Api.Statistics.DashboardData | null | undefined,
  tokenList: TokenItemViewModel[]
): MetricCardViewModel[] {
  const totalInput = tokenList.reduce((sum, it) => sum + (it.inputTokens || 0), 0)
  const totalOutput = tokenList.reduce((sum, it) => sum + (it.outputTokens || 0), 0)
  const totalTokens = tokenList.reduce((sum, it) => sum + (it.totalTokens || 0), 0)
  const totalRequests = tokenList.length
  const change = dashboardData?.weeklyChange ?? '+0%'
  return [
    {
      label: '总 Token 消耗',
      value: totalTokens,
      decimals: 0,
      change,
      icon: 'ri:coins-line'
    },
    {
      label: '总请求次数',
      value: totalRequests,
      decimals: 0,
      change,
      icon: 'ri:send-plane-line'
    },
    {
      label: 'Input Tokens',
      value: totalInput,
      decimals: 0,
      change,
      icon: 'ri:arrow-down-circle-line'
    },
    {
      label: 'Output Tokens',
      value: totalOutput,
      decimals: 0,
      change,
      icon: 'ri:arrow-up-circle-line'
    }
  ]
}

/**
 * 将工作台 KPI 卡片数据映射
 */
export function mapKpiCards(
  dashboardData: Api.Statistics.DashboardData | null | undefined,
  realtimeData: Api.Statistics.RealtimeData | null | undefined,
  projectListTotal?: number
): KpiCardViewModel[] {
  const totalProjects =
    projectListTotal ?? dashboardData?.totalProjects ?? 0
  const activeUserSum =
    realtimeData?.activeUsers ??
    dashboardData?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ??
    0
  return [
    {
      des: '项目总数',
      icon: 'ri:folder-3-line',
      num: totalProjects,
      change: dashboardData?.ownedProjectsChange ?? '+0%',
      tone: 'primary' as const
    },
    {
      des: '活跃用户',
      icon: 'ri:team-line',
      num: activeUserSum,
      change: dashboardData?.weeklyChange ?? '+0%',
      tone: 'info' as const
    },
    {
      des: '视频资源',
      icon: 'ri:movie-line',
      num: dashboardData?.totalVideos ?? 0,
      change: '+0%',
      tone: 'success' as const
    },
    {
      des: '积分余额',
      icon: 'ri:coins-line',
      num: dashboardData?.creditsBalance ?? 0,
      change: dashboardData?.creditsBalanceChange ?? '+0%',
      tone: 'warning' as const
    }
  ]
}

/**
 * 将积分概览数据映射为 SalesOverviewViewModel
 */
export function mapSalesOverview(
  trendData: Api.Statistics.TrendData | null | undefined,
  creditsData: Api.Statistics.CreditsData | null | undefined,
  dashboardData: Api.Statistics.DashboardData | null | undefined
): SalesOverviewViewModel {
  const xAxisData = trendData?.dates ?? trendData?.data?.labels ?? []
  const data = trendData?.metrics?.[0]?.values ?? trendData?.data?.values ?? []
  const remainingCredits = creditsData?.balance ?? dashboardData?.creditsBalance ?? 0
  const totalSpent = creditsData?.totalSpent ?? 0

  let monthChange = '+0%'
  if (creditsData) {
    const totalEarned = creditsData.totalEarned
    if (totalEarned !== 0) {
      const ratio = ((totalEarned - creditsData.totalSpent) / totalEarned) * 100
      monthChange = `${ratio >= 0 ? '+' : ''}${ratio.toFixed(0)}%`
    }
  }

  return { xAxisData, data, remainingCredits, monthChange, totalSpent }
}

/**
 * 从 dashboard 数据提取月份 X 轴
 */
export function mapMonthXAxis(
  dashboardData: Api.Statistics.DashboardData | null | undefined
): string[] {
  const labels = dashboardData?.activeUsers?.labels
  if (labels?.length) return labels
  return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
}

/**
 * 从趋势数据提取 X 轴
 */
export function mapTrendXAxis(
  trendData: Api.Statistics.TrendData | null | undefined
): string[] {
  if (trendData?.dates?.length) return trendData.dates
  if (trendData?.data?.labels?.length) return trendData.data.labels
  return []
}

/**
 * 从趋势数据提取折线数据
 */
export function mapTrendLineDataFromTrend(
  trendData: Api.Statistics.TrendData | null | undefined,
  fallbackName: string = '积分消耗'
): import('@/types/component/chart').LineDataItem[] {
  if (trendData?.metrics?.length) {
    return trendData.metrics.map((m) => ({ name: m.name, data: m.values || [] }))
  }
  if (trendData?.data?.values?.length) {
    return [{ name: fallbackName, data: trendData.data.values }]
  }
  return []
}

/**
 * 从 Token 列表提取项目分布 X 轴
 */
export function mapProjectXAxis(
  tokenRecords: TokenItemViewModel[]
): string[] {
  const map = new Map<string, number>()
  tokenRecords.forEach((item) => {
    if (!item.projectName) return
    map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
  })
  return Array.from(map.keys())
}

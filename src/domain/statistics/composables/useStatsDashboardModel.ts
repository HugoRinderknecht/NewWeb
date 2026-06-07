import type { EChartsOption } from '@/plugins/echarts'
import { useChartOps } from '@/hooks/core/useChart'
import type {
  BarDataItem,
  LineDataItem,
  PieDataItem,
  RadarDataItem,
  ScatterDataItem
} from '@/types/component/chart'
import {
  useStatsDashboard,
  useStatsRealtime,
  useProjectAnalysis,
  useUserActivityRank
} from '@/api/queries/statistics'

export interface DashboardCard {
  label: string
  value: number
  decimals: number
  change: string
  icon: string
}

export function useStatsDashboardModel() {
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStatsDashboard()
  const { data: realtimeData } = useStatsRealtime({ refetchInterval: 60 * 1000 })
  const { data: projectAnalysis } = useProjectAnalysis()
  const { data: activityRank } = useUserActivityRank()

  const isLoading = computed(() => dashboardLoading.value)
  const hasError = computed(() => !!dashboardError.value)
  const errorMessage = computed(() => {
    if (!dashboardError.value) return ''
    return (dashboardError.value as Error)?.message || '加载看板数据失败，请稍后重试'
  })

  const dashboardCards = computed<DashboardCard[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    const realtime = realtimeData.value as Api.Statistics.RealtimeData | null
    const activeUserSum = data?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ?? 0
    return [
      {
        label: '项目总数',
        value: data?.totalProjects ?? 0,
        decimals: 0,
        change: data?.ownedProjectsChange ?? '+0%',
        icon: 'ri:folder-3-line'
      },
      {
        label: '视频总数',
        value: data?.totalVideos ?? 0,
        decimals: 0,
        change: '+0%',
        icon: 'ri:movie-line'
      },
      {
        label: '活跃用户',
        value: realtime?.activeUsers ?? activeUserSum,
        decimals: 0,
        change: data?.weeklyChange ?? '+0%',
        icon: 'ri:team-line'
      },
      {
        label: '积分余额',
        value: data?.creditsBalance ?? 0,
        decimals: 0,
        change: data?.creditsBalanceChange ?? '+0%',
        icon: 'ri:coins-line'
      }
    ]
  })

  const monthXAxis = computed(() => {
    const labels = (dashboardData.value as Api.Statistics.DashboardData | null)?.activeUsers?.labels
    if (labels?.length) return labels
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  })

  const trendXAxis = computed(() => monthXAxis.value)

  const outputBarData = computed<BarDataItem[]>(() => {
    const list = (projectAnalysis.value as Api.Statistics.ProjectAnalysisItem[] | null) || []
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
  })

  const trendLineData = computed<LineDataItem[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    if (data?.activeUsers?.values?.length) {
      return [{ name: '活跃用户', data: data.activeUsers.values }]
    }
    return [{ name: '活跃用户', data: [] }]
  })

  const resourcePieData = computed<PieDataItem[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    if (!data) return []
    return [
      { value: data.totalVideos ?? 0, name: '视频资源' },
      { value: data.totalStoryboards ?? 0, name: '分镜资源' },
      { value: data.totalAssets ?? 0, name: '素材资源' }
    ]
  })

  const radarIndicators = [
    { name: '活跃度', max: 100 },
    { name: '贡献度', max: 100 },
    { name: '产出量', max: 100 },
    { name: '响应速度', max: 100 },
    { name: '协作效率', max: 100 },
    { name: '稳定性', max: 100 }
  ]

  const radarData = computed<RadarDataItem[]>(() => {
    const ranks = (activityRank.value as Api.Statistics.UserActivityRankItem[] | null) || []
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
  })

  const scatterData = computed<ScatterDataItem[]>(() => {
    const list = (projectAnalysis.value as Api.Statistics.ProjectAnalysisItem[] | null) || []
    return list.map((i) => ({
      value: [i.totalVideos || 0, i.totalStoryboards || 0] as [number, number]
    }))
  })

  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const heatmapData = computed<[number, number, number][]>(() => {
    const realtime = realtimeData.value as Api.Statistics.RealtimeData | null
    const activities = realtime?.data?.activities || []
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
  })

  const generateHeatmapOptions = (): EChartsOption => {
    const themeColor = useChartOps().themeColor
    const max = heatmapData.value.length ? Math.max(...heatmapData.value.map((d) => d[2]), 1) : 1
    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          return `${days[params.value[1]]} ${hours[params.value[0]]}<br/>活跃度: ${params.value[2]}`
        }
      },
      grid: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 60
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { fontSize: 12 }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true },
        axisLabel: { fontSize: 12 }
      },
      visualMap: {
        min: 0,
        max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#e0f2fe', '#7dd3fc', '#0ea5e9', themeColor]
        },
        itemWidth: 12,
        itemHeight: 80
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData.value,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  return {
    isLoading,
    hasError,
    errorMessage,
    dashboardCards,
    monthXAxis,
    trendXAxis,
    outputBarData,
    trendLineData,
    resourcePieData,
    radarIndicators,
    radarData,
    scatterData,
    heatmapData,
    generateHeatmapOptions
  }
}

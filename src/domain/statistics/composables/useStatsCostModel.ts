import type { LineDataItem, BarDataItem, PieDataItem } from '@/types/component/chart'
import type { ColumnOption } from '@/types/component'
import {
  useStatsCredits,
  useMyCredits,
  useCreditTransactions,
  useStatsTrends
} from '@/api/queries/statistics'
import { useTeamStore } from '@/store/modules/team'

export interface CostItem {
  id: string | number
  feature: string
  icon: string
  projectName: string
  type: string
  credits: number
  amount: string
  usageCount: number
  date: string
}

export interface CoreMetric {
  label: string
  value: number
  decimals: number
  change: string
  icon: string
}

export function useStatsCostModel() {
  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  const trendPeriod = ref<'day' | 'week' | 'month'>('day')

  const typeOptions = [
    { label: 'AI视频生成', value: 'AI视频生成' },
    { label: '语音合成', value: '语音合成' },
    { label: 'AI图像生成', value: 'AI图像生成' },
    { label: '剧本生成', value: '剧本生成' },
    { label: '分镜生成', value: '分镜生成' }
  ]

  const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    AI视频生成: 'primary',
    语音合成: 'success',
    AI图像生成: 'warning',
    剧本生成: 'danger',
    分镜生成: 'info',
    其他功能: 'info'
  }

  const featureIconMap: Record<string, string> = {
    AI视频生成: 'ri:movie-line',
    语音合成: 'ri:mic-line',
    AI图像生成: 'ri:image-line',
    剧本生成: 'ri:file-text-line',
    分镜生成: 'ri:gallery-line',
    其他功能: 'ri:apps-line'
  }

  const { data: creditsData, isLoading: creditsLoading, error: creditsError } = useStatsCredits()
  const { data: myCreditsData, isLoading: myCreditsLoading, error: myCreditsError } = useMyCredits()
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError
  } = useCreditTransactions()
  const trendParams = computed(() => ({
    eventType: 'cost',
    granularity: trendPeriod.value
  }))
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError
  } = useStatsTrends(teamId, trendParams)

  const isLoading = computed(
    () =>
      creditsLoading.value ||
      myCreditsLoading.value ||
      transactionsLoading.value ||
      trendsLoading.value
  )

  const hasError = computed(
    () =>
      !!creditsError.value ||
      !!myCreditsError.value ||
      !!transactionsError.value ||
      !!trendsError.value
  )

  const errorMessage = computed(() => {
    const err =
      creditsError.value || myCreditsError.value || transactionsError.value || trendsError.value
    if (!err) return ''
    return (err as Error)?.message || '加载费用数据失败，请稍后重试'
  })

  const coreMetrics = computed<CoreMetric[]>(() => {
    const credits = creditsData.value as Api.Statistics.CreditsData | null
    const my = myCreditsData.value as Api.Points.CreditInfo | null
    const totalSpent = credits?.totalSpent ?? my?.totalSpent ?? 0
    const balance = credits?.balance ?? my?.balance ?? 0
    const recent = credits?.recentTransactions ?? []
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
  })

  const trendXAxis = computed<string[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    if (trends?.dates?.length) return trends.dates
    if (trends?.data?.labels?.length) return trends.data.labels
    return []
  })

  const trendLineData = computed<LineDataItem[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    if (trends?.metrics?.length) {
      return trends.metrics.map((m) => ({ name: m.name, data: m.values || [] }))
    }
    if (trends?.data?.values?.length) {
      return [{ name: '积分消耗', data: trends.data.values }]
    }
    return []
  })

  const costList = computed<CostItem[]>(() => {
    const data =
      transactionsData.value as Api.Common.PaginatedResponse<Api.Points.TransactionRecord> | null
    const records = Array.isArray(data) ? data : data?.records || []
    return records.map((item: any) => {
      const feature = item.source || item.feature || item.description || '其他功能'
      const credits = Math.abs(Number(item.amount ?? item.credits ?? 0))
      return {
        id: item.id,
        feature,
        icon: item.icon || featureIconMap[feature] || 'ri:apps-line',
        projectName: item.projectName || '-',
        type: item.type === 'earn' ? '充值' : feature,
        credits,
        amount: item.amount != null ? `¥${(credits / 100).toFixed(2)}` : '-',
        usageCount: item.usageCount || 1,
        date: item.createTime || item.date || ''
      } as CostItem
    })
  })

  const featureDistributionData = computed<PieDataItem[]>(() => {
    const aggMap = new Map<string, number>()
    costList.value.forEach((item) => {
      const key = item.feature || '其他功能'
      aggMap.set(key, (aggMap.get(key) || 0) + (item.credits || 0))
    })
    return Array.from(aggMap.entries()).map(([name, value]) => ({ name, value }))
  })

  const forecastXAxis = computed<string[]>(() => trendXAxis.value)
  const forecastBarData = computed<BarDataItem[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    const values = trends?.metrics?.[0]?.values || trends?.data?.values || []
    if (!values.length) {
      return [
        { name: '预测消耗', data: [] },
        { name: '实际消耗', data: [] }
      ]
    }
    const avg = values.reduce((a, b) => a + (b || 0), 0) / values.length
    const forecast = values.map((_, idx) => Math.round(avg * (1 + idx * 0.05)))
    return [
      { name: '实际消耗', data: values },
      { name: '预测消耗', data: forecast }
    ]
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'feature', label: '功能模块', minWidth: 160 },
    { prop: 'projectName', label: '项目', minWidth: 160 },
    { prop: 'type', label: '类型', width: 120 },
    { prop: 'credits', label: '消耗积分', width: 130 },
    { prop: 'amount', label: '金额', width: 100 },
    { prop: 'usageCount', label: '使用次数', width: 100 },
    { prop: 'date', label: '日期', width: 120 }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const searchQuery = ref('')
  const filterType = ref('')

  const filteredCostList = computed(() => {
    let result = costList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.feature.toLowerCase().includes(q) || item.projectName.toLowerCase().includes(q)
      )
    }
    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }
    const total = result.length
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    nextTick(() => {
      pagination.total = total
    })
    return result.slice(start, end)
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return {
    isLoading,
    hasError,
    errorMessage,
    coreMetrics,
    trendPeriod,
    trendXAxis,
    trendLineData,
    costList,
    featureDistributionData,
    forecastXAxis,
    forecastBarData,
    columns,
    pagination,
    searchQuery,
    filterType,
    typeOptions,
    typeTagMap,
    filteredCostList,
    handleSizeChange,
    handleCurrentChange,
    formatNumber
  }
}

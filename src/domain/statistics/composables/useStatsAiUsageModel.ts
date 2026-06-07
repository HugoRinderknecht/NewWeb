import type { LineDataItem, BarDataItem, PieDataItem } from '@/types/component/chart'
import type { ColumnOption } from '@/types/component'
import { useTokenUsageRecords, useStatsTrends, useStatsDashboard } from '@/api/queries/statistics'
import { useTeamStore } from '@/store/modules/team'

export interface TokenItem {
  id: string | number
  projectName: string
  model: string
  requestType: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: string
  requestTime: string
}

export interface CoreMetric {
  label: string
  value: number
  decimals: number
  change: string
  icon: string
}

export function useStatsAiUsageModel() {
  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)
  const trendPeriod = ref<'day' | 'week' | 'month'>('day')

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const modelOptions = [
    { label: 'GPT-4o', value: 'GPT-4o' },
    { label: 'GPT-4o-mini', value: 'GPT-4o-mini' },
    { label: 'Claude 3.5', value: 'Claude 3.5' },
    { label: 'Midjourney', value: 'Midjourney' }
  ]

  const modelTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'GPT-4o': 'primary',
    'GPT-4o-mini': 'success',
    'Claude 3.5': 'warning',
    Midjourney: 'danger',
    其他模型: 'info'
  }

  const tokenQueryParams = computed<Api.Common.CommonSearchParams>(() => ({
    current: pagination.current,
    size: pagination.size
  }))

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStatsDashboard()

  const trendParams = computed(() => ({
    eventType: 'ai_usage',
    granularity: trendPeriod.value
  }))

  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError
  } = useStatsTrends(teamId, trendParams)

  const {
    data: tokenRecordsData,
    isLoading: tokenLoading,
    error: tokenError
  } = useTokenUsageRecords(tokenQueryParams)

  const isLoading = computed(
    () => dashboardLoading.value || trendsLoading.value || tokenLoading.value
  )

  const hasError = computed(
    () => !!dashboardError.value || !!trendsError.value || !!tokenError.value
  )

  const errorMessage = computed(() => {
    const err = dashboardError.value || trendsError.value || tokenError.value
    if (!err) return ''
    return (err as Error)?.message || '加载 AI 用量数据失败，请稍后重试'
  })

  const tokenList = computed<TokenItem[]>(() => {
    const raw: any = tokenRecordsData.value
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
  })

  const coreMetrics = computed<CoreMetric[]>(() => {
    const dashboard = dashboardData.value as Api.Statistics.DashboardData | null
    const list = tokenList.value
    const totalInput = list.reduce((sum, it) => sum + (it.inputTokens || 0), 0)
    const totalOutput = list.reduce((sum, it) => sum + (it.outputTokens || 0), 0)
    const totalTokens = list.reduce((sum, it) => sum + (it.totalTokens || 0), 0)
    const totalRequests = list.length
    const change = dashboard?.weeklyChange ?? '+0%'
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
  })

  const trendXAxis = computed<string[]>(() => {
    const data = trendsData.value as Api.Statistics.TrendData | null
    return data?.dates || []
  })

  const trendLineData = computed<LineDataItem[]>(() => {
    const data = trendsData.value as Api.Statistics.TrendData | null
    const metrics = data?.metrics || []
    return metrics.map((m) => ({
      name: m.name,
      data: m.values || []
    }))
  })

  const modelDistributionData = computed<PieDataItem[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.model) return
      map.set(item.model, (map.get(item.model) || 0) + (item.totalTokens || 0))
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  })

  const projectXAxis = computed<string[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.projectName) return
      map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
    })
    return Array.from(map.keys())
  })

  const projectBarData = computed<BarDataItem[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.projectName) return
      map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
    })
    return [
      {
        name: 'Token 消耗',
        data: Array.from(map.values())
      }
    ]
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'projectName', label: '项目', minWidth: 180 },
    { prop: 'model', label: '模型', width: 160 },
    { prop: 'requestType', label: '请求类型', width: 140 },
    { prop: 'inputTokens', label: 'Input Tokens', width: 130 },
    { prop: 'outputTokens', label: 'Output Tokens', width: 140 },
    { prop: 'totalTokens', label: '总 Tokens', width: 130 },
    { prop: 'cost', label: '费用', width: 100 },
    { prop: 'requestTime', label: '请求时间', width: 160 }
  ]

  const searchQuery = ref('')
  const filterModel = ref('')

  const filteredTokenList = computed(() => {
    let result = tokenList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.projectName.toLowerCase().includes(q) || item.model.toLowerCase().includes(q)
      )
    }
    if (filterModel.value) {
      result = result.filter((item) => item.model === filterModel.value)
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
    return (num || 0).toLocaleString()
  }

  return {
    isLoading,
    hasError,
    errorMessage,
    coreMetrics,
    trendPeriod,
    trendXAxis,
    trendLineData,
    modelDistributionData,
    projectXAxis,
    projectBarData,
    columns,
    pagination,
    searchQuery,
    filterModel,
    modelOptions,
    modelTagMap,
    filteredTokenList,
    handleSizeChange,
    handleCurrentChange,
    formatNumber
  }
}

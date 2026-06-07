import { useStatsTrends, useStatsCredits, useStatsDashboard } from '@/api/queries'
import { useTeamStore } from '@/store/modules/team'

export function useSalesOverviewModel() {
  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  const trendParams = computed<Omit<Api.Statistics.TrendParams, 'teamId'>>(() => ({
    eventType: 'credits',
    granularity: 'day',
    metrics: ['credits']
  }))
  const { data: trendData } = useStatsTrends(teamId, trendParams)

  const { data: creditsData } = useStatsCredits()
  const { data: dashboardData } = useStatsDashboard()

  const xAxisData = computed<string[]>(() => {
    if (!trendData.value) return []
    return trendData.value.dates ?? trendData.value.data?.labels ?? []
  })

  const data = computed<number[]>(() => {
    if (!trendData.value) return []
    return trendData.value.metrics?.[0]?.values ?? trendData.value.data?.values ?? []
  })

  const remainingCredits = computed(() => {
    if (creditsData.value) return creditsData.value.balance
    return dashboardData.value?.creditsBalance ?? 0
  })

  const monthChange = computed(() => {
    const data = creditsData.value
    if (!data) return '+0%'
    if (data.totalEarned === 0) return '+0%'
    const ratio = ((data.totalEarned - data.totalSpent) / data.totalEarned) * 100
    return `${ratio >= 0 ? '+' : ''}${ratio.toFixed(0)}%`
  })

  const totalSpent = computed(() => creditsData.value?.totalSpent ?? 0)

  return {
    xAxisData,
    data,
    remainingCredits,
    monthChange,
    totalSpent
  }
}

import { useStatsDashboard, useProjectList, useStatsRealtime } from '@/api/queries'

export interface CardDataItem {
  des: string
  icon: string
  num: number
  change: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}

export function useDashboardCardListModel(
  props: {
    start?: number
    count?: number
    columns?: 2 | 3 | 4
  } = {}
) {
  const { start = 0, count = 4, columns = 4 } = props

  const { data: dashboardData } = useStatsDashboard()
  const { data: projectData } = useProjectList({ current: 1, size: 1 })
  const { data: realtimeData } = useStatsRealtime()

  const fullList = computed<CardDataItem[]>(() => {
    const totalProjects =
      (projectData.value as any)?.total ?? dashboardData.value?.totalProjects ?? 0

    const activeUserSum =
      realtimeData.value?.activeUsers ??
      dashboardData.value?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ??
      0

    return [
      {
        des: '项目总数',
        icon: 'ri:folder-3-line',
        num: totalProjects,
        change: dashboardData.value?.ownedProjectsChange ?? '+0%',
        tone: 'primary'
      },
      {
        des: '活跃用户',
        icon: 'ri:team-line',
        num: activeUserSum,
        change: dashboardData.value?.weeklyChange ?? '+0%',
        tone: 'info'
      },
      {
        des: '视频资源',
        icon: 'ri:movie-line',
        num: dashboardData.value?.totalVideos ?? 0,
        change: '+0%',
        tone: 'success'
      },
      {
        des: '积分余额',
        icon: 'ri:coins-line',
        num: dashboardData.value?.creditsBalance ?? 0,
        change: dashboardData.value?.creditsBalanceChange ?? '+0%',
        tone: 'warning'
      }
    ]
  })

  const displayList = computed<CardDataItem[]>(() => fullList.value.slice(start, start + count))

  const columnSpan = computed(() => {
    if (columns === 2) return { xs: 24, sm: 12, md: 12, lg: 12 }
    if (columns === 3) return { xs: 24, sm: 12, md: 8, lg: 8 }
    return { xs: 24, sm: 12, md: 12, lg: 6 }
  })

  return {
    fullList,
    displayList,
    columnSpan
  }
}

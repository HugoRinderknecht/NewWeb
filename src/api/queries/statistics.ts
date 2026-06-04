import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetDashboard,
  fetchGetRealtimeData,
  fetchGetTrends,
  fetchGetCredits,
  fetchGetAlerts,
  fetchGetTeamRanking,
  fetchGetTeamWorkload,
  fetchGetUserContribution,
  fetchGetUserActivity,
  fetchGetProjectCompletion,
  fetchGetScheduledReports,
  fetchCreateScheduledReport,
  fetchUpdateScheduledReport,
  fetchDeleteScheduledReport,
  fetchCreateCustomReport,
  fetchExportReport,
  fetchGetProjectVideoStats,
  fetchGetProjectUsage,
  fetchGetProjectUsageDetail,
  fetchGetProjectStoryboardStats,
  fetchGetProjectResources,
  fetchGetProjectAiUsage,
  fetchGetProjectAnalysis,
  fetchGetUserActivityRank
} from '@/api/statistics'
import {
  fetchGetCreditTransactions,
  fetchGetTokenUsageRecords,
  fetchGetMyCredits
} from '@/api/points'

const QUERY_KEY = 'statistics' as const

/** 仪表盘核心指标 */
export function useStatsDashboard(teamId?: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard', teamId] as const,
    queryFn: async () => {
      const res = await fetchGetDashboard()
      return res ?? null
    },
    staleTime: 60 * 1000
  })
}

/** 实时数据 */
export function useStatsRealtime(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'realtime'] as const,
    queryFn: async () => {
      const res = await fetchGetRealtimeData()
      return res ?? null
    },
    staleTime: 30 * 1000,
    refetchInterval: options?.refetchInterval ?? 60 * 1000
  })
}

/** 趋势图表 */
export function useStatsTrends(
  teamId: MaybeRefOrGetter<string | undefined>,
  params: MaybeRefOrGetter<Omit<Api.Statistics.TrendParams, 'teamId'> | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'trends', teamId, params] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const p = toValue(params)
      if (!p?.eventType) return null
      const res = await fetchGetTrends(id, p)
      return res ?? null
    },
    enabled: () => !!toValue(teamId) && !!toValue(params)?.eventType
  })
}

/** 积分余额 */
export function useStatsCredits() {
  return useQuery({
    queryKey: [QUERY_KEY, 'credits'] as const,
    queryFn: async () => {
      const res = await fetchGetCredits()
      return res ?? null
    }
  })
}

/** 我的积分 */
export function useMyCredits() {
  return useQuery({
    queryKey: [QUERY_KEY, 'my-credits'] as const,
    queryFn: async () => {
      const res = await fetchGetMyCredits()
      return res ?? null
    }
  })
}

/** 数据预警 */
export function useStatsAlerts() {
  return useQuery({
    queryKey: [QUERY_KEY, 'alerts'] as const,
    queryFn: async () => {
      const res = await fetchGetAlerts()
      return res ?? []
    }
  })
}

/** 团队排名 */
export function useStatsTeamRanking() {
  return useQuery({
    queryKey: [QUERY_KEY, 'team-ranking'] as const,
    queryFn: async () => {
      const res = await fetchGetTeamRanking()
      return res ?? []
    }
  })
}

/** 团队工作量 */
export function useTeamWorkload(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'team-workload', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetTeamWorkload(id)
      return res ?? null
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 用户贡献度 */
export function useUserContribution(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'user-contribution', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      const res = await fetchGetUserContribution(id)
      return res ?? []
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 用户活跃度 */
export function useUserActivity(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'user-activity', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      const res = await fetchGetUserActivity(id)
      return res ?? []
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 项目完成率 */
export function useProjectCompletion(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-completion', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetProjectCompletion(id)
      return res ?? null
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 项目分析列表 */
export function useProjectAnalysis() {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-analysis'] as const,
    queryFn: async () => {
      const res = await fetchGetProjectAnalysis()
      return res ?? []
    }
  })
}

/** 用户活跃度排行 */
export function useUserActivityRank() {
  return useQuery({
    queryKey: [QUERY_KEY, 'user-activity-rank'] as const,
    queryFn: async () => {
      const res = await fetchGetUserActivityRank()
      return res ?? []
    }
  })
}

/** 项目用量概览 */
export function useProjectUsage(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-usage', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectUsage(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 项目用量详情 */
export function useProjectUsageDetail(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Statistics.ProjectUsageDetailParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-usage-detail', projectId, params] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectUsageDetail(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 项目视频统计 */
export function useProjectVideoStats(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-video-stats', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectVideoStats(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 项目分镜统计 */
export function useProjectStoryboardStats(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-storyboard-stats', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectStoryboardStats(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 项目资源消耗 */
export function useProjectResources(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-resources', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectResources(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 项目 AI 使用统计 */
export function useProjectAiUsage(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-ai-usage', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectAiUsage(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 积分交易记录 */
export function useCreditTransactions(
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'credit-transactions', params] as const,
    queryFn: async () => {
      const res = await fetchGetCreditTransactions(toValue(params))
      return res ?? null
    }
  })
}

/** Token 使用记录 */
export function useTokenUsageRecords(
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'token-usage-records', params] as const,
    queryFn: async () => {
      const res = await fetchGetTokenUsageRecords(toValue(params))
      return res ?? null
    }
  })
}

/** 定时报表列表 */
export function useScheduledReports(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'scheduled-reports', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      const res = await fetchGetScheduledReports(id)
      return res ?? []
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 创建定时报表 */
export function useCreateScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; data: Api.Statistics.CreateScheduledReportParams }) =>
      fetchCreateScheduledReport(payload.teamId, payload.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'scheduled-reports', variables.teamId]
      })
    }
  })
}

/** 更新定时报表 */
export function useUpdateScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      teamId: string
      id: string
      data: Api.Statistics.UpdateScheduledReportParams
    }) => fetchUpdateScheduledReport(payload.teamId, payload.id, payload.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'scheduled-reports', variables.teamId]
      })
    }
  })
}

/** 删除定时报表 */
export function useDeleteScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; id: string }) =>
      fetchDeleteScheduledReport(payload.teamId, payload.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'scheduled-reports', variables.teamId]
      })
    }
  })
}

/** 创建自定义报表 */
export function useCreateCustomReport() {
  return useMutation({
    mutationFn: (payload: { teamId: string; data: Api.Statistics.CustomReportParams }) =>
      fetchCreateCustomReport(payload.teamId, payload.data)
  })
}

/** 导出报表 */
export function useExportReport() {
  return useMutation({
    mutationFn: (payload: { teamId: string; data?: Api.Statistics.ExportParams }) =>
      fetchExportReport(payload.teamId, payload.data)
  })
}

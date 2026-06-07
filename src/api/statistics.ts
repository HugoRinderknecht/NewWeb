import { getApiAdapter } from './adapter'

export function fetchGetDashboard() {
  return getApiAdapter().get<Api.Statistics.DashboardData>('/api/statistics/dashboard')
}

export function fetchGetRealtimeData() {
  return getApiAdapter().get<Api.Statistics.RealtimeData>('/api/statistics/realtime')
}

export function fetchGetTrends(
  teamId: string,
  params?: Omit<Api.Statistics.TrendParams, 'teamId'>
) {
  return getApiAdapter().get<Api.Statistics.TrendData>(
    `/api/statistics/teams/${teamId}/trends`,
    params
  )
}

export function fetchGetPlatformTrends(params?: Omit<Api.Statistics.TrendParams, 'teamId'>) {
  return getApiAdapter().get<Api.Statistics.TrendData>('/api/statistics/trends', params)
}

export function fetchGetCredits() {
  return getApiAdapter().get<Api.Statistics.CreditsData>('/api/statistics/credits')
}

export function fetchGetAlerts() {
  return getApiAdapter().get<Api.Statistics.AlertItem[]>('/api/statistics/alerts')
}

export function fetchGetTeamRanking() {
  return getApiAdapter().get<Api.Statistics.TeamRankingItem[]>('/api/statistics/teams/ranking')
}

export function fetchGetTeamWorkload(teamId: string) {
  return getApiAdapter().get<Api.Statistics.TeamWorkload>(
    `/api/statistics/teams/${teamId}/workload`
  )
}

export function fetchGetUserContribution(teamId: string) {
  return getApiAdapter().get<Api.Statistics.UserContributionItem[]>(
    `/api/statistics/teams/${teamId}/users/contribution`
  )
}

export function fetchGetUserActivity(teamId: string) {
  return getApiAdapter().get<Api.Statistics.UserActivityItem[]>(
    `/api/statistics/teams/${teamId}/users/activity`
  )
}

export function fetchGetProjectCompletion(teamId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectCompletion>(
    `/api/statistics/teams/${teamId}/projects/completion`
  )
}

export function fetchGetScheduledReports(teamId: string) {
  return getApiAdapter().get<Api.Statistics.ScheduledReportItem[]>(
    `/api/statistics/teams/${teamId}/reports/scheduled`
  )
}

export function fetchCreateScheduledReport(
  teamId: string,
  data: Api.Statistics.CreateScheduledReportParams
) {
  return getApiAdapter().post<Api.Statistics.ScheduledReportItem>(
    `/api/statistics/teams/${teamId}/reports/scheduled`,
    data
  )
}

export function fetchUpdateScheduledReport(
  teamId: string,
  id: string,
  data: Api.Statistics.UpdateScheduledReportParams
) {
  return getApiAdapter().put<Api.Statistics.ScheduledReportItem>(
    `/api/statistics/teams/${teamId}/reports/scheduled/${id}`,
    data
  )
}

export function fetchDeleteScheduledReport(teamId: string, id: string) {
  return getApiAdapter().del<void>(`/api/statistics/teams/${teamId}/reports/scheduled/${id}`)
}

export function fetchCreateCustomReport(teamId: string, data: Api.Statistics.CustomReportParams) {
  return getApiAdapter().post<Blob>(`/api/statistics/teams/${teamId}/reports/custom`, data, {
    responseType: 'blob'
  })
}

export function fetchExportReport(teamId: string, data?: Api.Statistics.ExportParams) {
  return getApiAdapter().post<Blob>(`/api/statistics/teams/${teamId}/export`, data, {
    responseType: 'blob'
  })
}

export function fetchGetProjectVideoStats(projectId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectVideoStats>(
    `/api/statistics/projects/${projectId}/videos`
  )
}

export function fetchGetProjectUsage(projectId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectUsage>(
    `/api/statistics/projects/${projectId}/usage`
  )
}

export function fetchGetProjectUsageDetail(
  projectId: string,
  params?: Api.Statistics.ProjectUsageDetailParams
) {
  return getApiAdapter().get<Api.Statistics.ProjectUsageDetail>(
    `/api/statistics/projects/${projectId}/usage/detail`,
    params
  )
}

export function fetchGetProjectStoryboardStats(projectId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectStoryboardStats>(
    `/api/statistics/projects/${projectId}/storyboards`
  )
}

export function fetchGetProjectResources(projectId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectResources>(
    `/api/statistics/projects/${projectId}/resources`
  )
}

export function fetchGetProjectAiUsage(projectId: string) {
  return getApiAdapter().get<Api.Statistics.ProjectAiUsage>(
    `/api/statistics/projects/${projectId}/ai-usage`
  )
}

export function fetchGetProjectAnalysis() {
  return getApiAdapter().get<Api.Statistics.ProjectAnalysisItem[]>(
    '/api/statistics/projects/analysis'
  )
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchGetUserActivityRank() {
  return getApiAdapter().get<Api.Statistics.UserActivityRankItem[]>(
    '/api/statistics/users/activity-rank'
  )
}

import request from '@/utils/http'

export function fetchGetDashboard() {
  return request.get<Api.Statistics.DashboardData>({
    url: '/api/statistics/dashboard'
  })
}

export function fetchGetRealtimeData() {
  return request.get<Api.Statistics.RealtimeData>({
    url: '/api/statistics/realtime'
  })
}

export function fetchGetTrends(params?: Api.Statistics.TrendParams) {
  return request.get<Api.Statistics.TrendData>({
    url: '/api/statistics/trends',
    params
  })
}

export function fetchGetCredits() {
  return request.get<Api.Statistics.CreditsData>({
    url: '/api/statistics/credits'
  })
}

export function fetchGetAlerts() {
  return request.get<Api.Statistics.AlertItem[]>({
    url: '/api/statistics/alerts'
  })
}

export function fetchGetTeamRanking() {
  return request.get<Api.Statistics.TeamRankingItem[]>({
    url: '/api/statistics/teams/ranking'
  })
}

export function fetchGetTeamWorkload(teamId: string) {
  return request.get<Api.Statistics.TeamWorkload>({
    url: `/api/statistics/teams/${teamId}/workload`
  })
}

export function fetchGetUserContribution(teamId: string) {
  return request.get<Api.Statistics.UserContributionItem[]>({
    url: `/api/statistics/teams/${teamId}/users/contribution`
  })
}

export function fetchGetUserActivity(teamId: string) {
  return request.get<Api.Statistics.UserActivityItem[]>({
    url: `/api/statistics/teams/${teamId}/users/activity`
  })
}

export function fetchGetProjectCompletion(teamId: string) {
  return request.get<Api.Statistics.ProjectCompletion>({
    url: `/api/statistics/teams/${teamId}/projects/completion`
  })
}

export function fetchGetScheduledReports(teamId: string) {
  return request.get<Api.Statistics.ScheduledReportItem[]>({
    url: `/api/statistics/teams/${teamId}/reports/scheduled`
  })
}

export function fetchCreateScheduledReport(teamId: string, data: Api.Statistics.CreateScheduledReportParams) {
  return request.post<Api.Statistics.ScheduledReportItem>({
    url: `/api/statistics/teams/${teamId}/reports/scheduled`,
    data
  })
}

export function fetchUpdateScheduledReport(teamId: string, id: string, data: Api.Statistics.UpdateScheduledReportParams) {
  return request.put<Api.Statistics.ScheduledReportItem>({
    url: `/api/statistics/teams/${teamId}/reports/scheduled/${id}`,
    data
  })
}

export function fetchDeleteScheduledReport(teamId: string, id: string) {
  return request.del<void>({
    url: `/api/statistics/teams/${teamId}/reports/scheduled/${id}`
  })
}

export function fetchCreateCustomReport(teamId: string, data: Api.Statistics.CustomReportParams) {
  return request.post<Blob>({
    url: `/api/statistics/teams/${teamId}/reports/custom`,
    data
  })
}

export function fetchExportReport(teamId: string, data?: Api.Statistics.ExportParams) {
  return request.post<Blob>({
    url: `/api/statistics/teams/${teamId}/export`,
    data,
    responseType: 'blob'
  } as any)
}

export function fetchGetProjectVideoStats(projectId: string) {
  return request.get<Api.Statistics.ProjectVideoStats>({
    url: `/api/statistics/projects/${projectId}/videos`
  })
}

export function fetchGetProjectUsage(projectId: string) {
  return request.get<Api.Statistics.ProjectUsage>({
    url: `/api/statistics/projects/${projectId}/usage`
  })
}

export function fetchGetProjectUsageDetail(projectId: string, params?: Api.Statistics.ProjectUsageDetailParams) {
  return request.get<Api.Statistics.ProjectUsageDetail>({
    url: `/api/statistics/projects/${projectId}/usage/detail`,
    params
  })
}

export function fetchGetProjectStoryboardStats(projectId: string) {
  return request.get<Api.Statistics.ProjectStoryboardStats>({
    url: `/api/statistics/projects/${projectId}/storyboards`
  })
}

export function fetchGetProjectResources(projectId: string) {
  return request.get<Api.Statistics.ProjectResources>({
    url: `/api/statistics/projects/${projectId}/resources`
  })
}

export function fetchGetProjectAiUsage(projectId: string) {
  return request.get<Api.Statistics.ProjectAiUsage>({
    url: `/api/statistics/projects/${projectId}/ai-usage`
  })
}

export function fetchGetProjectAnalysis() {
  return request.get<Api.Statistics.ProjectAnalysisItem[]>({
    url: '/api/statistics/projects/analysis'
  })
}

export function fetchGetUserActivityRank() {
  return request.get<Api.Statistics.UserActivityRankItem[]>({
    url: '/api/statistics/users/activity-rank'
  })
}

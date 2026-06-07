import { getApiAdapter } from './adapter'

export function fetchGetReviewList(params?: Api.Review.ReviewSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Review.ReviewTask>>(
    '/api/review/list',
    params
  )
}

export function fetchGetReviewItems(params?: Api.Review.ReviewSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Review.ReviewItem>>(
    '/api/review/items',
    params
  )
}

/** 文档中类型名为 ReviewDetailVO */
export function fetchGetReviewDetail(id: string) {
  return getApiAdapter().get<Api.Review.ReviewTask>(`/api/review/detail/${id}`)
}

export function fetchCreateReview(params: Api.Review.CreateReviewParams) {
  return getApiAdapter().post<Api.Review.ReviewTask>('/api/review/create', params)
}

export function fetchClaimReview(id: string) {
  return getApiAdapter().post<void>(`/api/review/${id}/claim`)
}

export function fetchReviewDecision(params: Api.Review.DecisionParams) {
  return getApiAdapter().post<void>('/api/review/decision', params)
}

export function fetchBatchReviewDecision(params: Api.Review.BatchDecisionParams) {
  return getApiAdapter().post<Api.Review.BatchDecisionResult>('/api/review/batch-decision', params)
}

export function fetchWithdrawReview(id: string) {
  return getApiAdapter().post<void>(`/api/review/${id}/withdraw`)
}

export function fetchArchiveReview(id: string) {
  return getApiAdapter().post<void>(`/api/review/${id}/archive`)
}

export function fetchDispatchReview(id: string, target: 'art' | 'video' | 'edit' | 'audio') {
  return getApiAdapter().post<void>(`/api/review/${id}/dispatch`, undefined, { params: { target } })
}

/** 文档中类型名为 ReviewDetailVO */
export function fetchGetReviewStatus(
  reviewType: 'storyboard' | 'video' | 'first_frame' | 'script' | 'image' | 'prompt' | 'asset',
  targetId: string
) {
  return getApiAdapter().get<Api.Review.ReviewStatusVO>(
    `/api/review/status/${reviewType}/${targetId}`
  )
}

export function fetchGetPendingReviewCount() {
  return getApiAdapter().get<number>('/api/review/pending-count')
}

export function fetchGetMySubmissions(params?: Api.Review.ReviewSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Review.ReviewTask>>(
    '/api/review/my-submissions',
    params
  )
}

export function fetchGetReviewStatistics(
  projectId: string,
  params?: { startDate?: string; endDate?: string }
) {
  return getApiAdapter().get<Api.Review.ReviewStatistics>(
    `/api/review/projects/${projectId}/statistics`,
    params
  )
}

export function fetchExportReviewRecords(projectId: string, params?: Api.Review.ExportParams) {
  return getApiAdapter().post<string>(`/api/review/projects/${projectId}/export`, undefined, {
    params
  })
}

export function fetchGetRejectReasons(projectId: string) {
  return getApiAdapter().get<Api.Review.RejectReason[]>(
    `/api/review/projects/${projectId}/reject-reasons`
  )
}

export function fetchAddRejectReason(projectId: string, params: Api.Review.RejectReasonParams) {
  return getApiAdapter().post<Api.Review.RejectReason>(
    `/api/review/projects/${projectId}/reject-reasons`,
    params
  )
}

export function fetchDeleteRejectReason(projectId: string, reasonId: string) {
  return getApiAdapter().del<void>(`/api/review/projects/${projectId}/reject-reasons/${reasonId}`)
}

export function fetchGetReviewRouteConfig(projectId: string) {
  return getApiAdapter().get<Api.Review.RouteConfig>(
    `/api/review/projects/${projectId}/route-config`
  )
}

export function fetchUpdateReviewRouteConfig(projectId: string, params: Api.Review.RouteConfig) {
  return getApiAdapter().put<void>(`/api/review/projects/${projectId}/route-config`, params)
}

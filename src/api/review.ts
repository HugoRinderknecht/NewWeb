import request from '@/utils/http'

/**
 * 查询审核任务列表
 * @param params 查询参数
 */
export function fetchGetReviewList(params?: Api.Review.ReviewSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Review.ReviewTask>>({
    url: '/api/review/list',
    params
  })
}

/**
 * 查询审核项列表（含内容）
 * @param params 查询参数
 */
export function fetchGetReviewItems(params?: Api.Review.ReviewSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Review.ReviewItem>>({
    url: '/api/review/items',
    params
  })
}

/**
 * 获取审核任务详情
 * @param id 审核任务ID
 */
export function fetchGetReviewDetail(id: string) {
  return request.get<Api.Review.ReviewTask>({
    url: `/api/review/detail/${id}`
  })
}

/**
 * 创建审核任务
 * @param params 创建参数
 */
export function fetchCreateReview(params: Api.Review.CreateReviewParams) {
  return request.post<Api.Review.ReviewTask>({
    url: '/api/review/create',
    params
  })
}

/**
 * 认领审核
 * @param id 审核任务ID
 */
export function fetchClaimReview(id: string) {
  return request.post<void>({
    url: `/api/review/${id}/claim`
  })
}

/**
 * 做出审核决定
 * @param params 决策参数
 */
export function fetchReviewDecision(params: Api.Review.DecisionParams) {
  return request.post<void>({
    url: '/api/review/decision',
    params
  })
}

/**
 * 批量审核决定
 * @param params 批量决策参数
 */
export function fetchBatchReviewDecision(params: Api.Review.BatchDecisionParams) {
  return request.post<Api.Review.BatchDecisionResult>({
    url: '/api/review/batch-decision',
    params
  })
}

/**
 * 撤回审核
 * @param id 审核任务ID
 */
export function fetchWithdrawReview(id: string) {
  return request.post<void>({
    url: `/api/review/${id}/withdraw`
  })
}

/**
 * 归档入库
 * @param id 审核任务ID
 */
export function fetchArchiveReview(id: string) {
  return request.post<void>({
    url: `/api/review/${id}/archive`
  })
}

/**
 * 下发成果
 * @param id 审核任务ID
 */
export function fetchDispatchReview(id: string) {
  return request.post<void>({
    url: `/api/review/${id}/dispatch`
  })
}

/**
 * 通用审核状态查询
 * @param reviewType 审核类型
 * @param targetId 目标ID
 */
export function fetchGetReviewStatus(reviewType: string, targetId: string) {
  return request.get<Api.Review.ReviewStatusVO>({
    url: `/api/review/status/${reviewType}/${targetId}`
  })
}

/**
 * 获取待审核数量
 */
export function fetchGetPendingReviewCount() {
  return request.get<number>({
    url: '/api/review/pending-count'
  })
}

/**
 * 查询我的提交
 * @param params 查询参数
 */
export function fetchGetMySubmissions(params?: Api.Review.ReviewSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Review.ReviewTask>>({
    url: '/api/review/my-submissions',
    params
  })
}

/**
 * 获取审核统计
 * @param projectId 项目ID
 */
export function fetchGetReviewStatistics(projectId: string) {
  return request.get<Api.Review.ReviewStatistics>({
    url: `/api/review/projects/${projectId}/statistics`
  })
}

/**
 * 导出审核记录
 * @param projectId 项目ID
 * @param params 导出参数
 */
export function fetchExportReviewRecords(projectId: string, params?: Api.Review.ExportParams) {
  return request.post<Blob>({
    url: `/api/review/projects/${projectId}/export`,
    params,
    responseType: 'blob'
  } as any)
}

/**
 * 获取驳回原因列表
 * @param projectId 项目ID
 */
export function fetchGetRejectReasons(projectId: string) {
  return request.get<Api.Review.RejectReason[]>({
    url: `/api/review/projects/${projectId}/reject-reasons`
  })
}

/**
 * 添加驳回原因
 * @param projectId 项目ID
 * @param params 原因参数
 */
export function fetchAddRejectReason(projectId: string, params: Api.Review.RejectReasonParams) {
  return request.post<Api.Review.RejectReason>({
    url: `/api/review/projects/${projectId}/reject-reasons`,
    params
  })
}

/**
 * 删除驳回原因
 * @param projectId 项目ID
 * @param reasonId 原因ID
 */
export function fetchDeleteRejectReason(projectId: string, reasonId: string) {
  return request.del<void>({
    url: `/api/review/projects/${projectId}/reject-reasons/${reasonId}`
  })
}

/**
 * 获取审核路由配置
 * @param projectId 项目ID
 */
export function fetchGetReviewRouteConfig(projectId: string) {
  return request.get<Api.Review.RouteConfig>({
    url: `/api/review/projects/${projectId}/route-config`
  })
}

/**
 * 更新审核路由配置
 * @param projectId 项目ID
 * @param params 配置参数
 */
export function fetchUpdateReviewRouteConfig(projectId: string, params: Api.Review.RouteConfig) {
  return request.put<void>({
    url: `/api/review/projects/${projectId}/route-config`,
    params
  })
}

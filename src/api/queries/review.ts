import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetReviewList,
  fetchGetReviewItems,
  fetchGetReviewDetail,
  fetchCreateReview,
  fetchClaimReview,
  fetchReviewDecision,
  fetchBatchReviewDecision,
  fetchWithdrawReview,
  fetchArchiveReview,
  fetchDispatchReview,
  fetchGetReviewStatus,
  fetchGetPendingReviewCount,
  fetchGetMySubmissions,
  fetchGetReviewStatistics,
  fetchGetRejectReasons,
  fetchAddRejectReason,
  fetchDeleteRejectReason,
  fetchGetReviewRouteConfig,
  fetchUpdateReviewRouteConfig
} from '@/api/review'

const QUERY_KEY = 'reviews' as const

// ==================== 查询 ====================

/** 审核任务列表（分页） */
export function useReviewList(
  params?: MaybeRefOrGetter<Api.Review.ReviewSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params] as const,
    queryFn: async () => {
      const res = await fetchGetReviewList(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 审核项列表（分页） */
export function useReviewItems(
  params?: MaybeRefOrGetter<Api.Review.ReviewSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'items', params] as const,
    queryFn: async () => {
      const res = await fetchGetReviewItems(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 审核任务详情 */
export function useReviewDetail(id: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id] as const,
    queryFn: async () => {
      const reviewId = toValue(id)
      if (!reviewId) return null
      return await fetchGetReviewDetail(reviewId)
    },
    enabled: () => !!toValue(id),
    staleTime: 60 * 1000
  })
}

/** 审核状态（按类型查询） */
export function useReviewStatus(
  reviewType: MaybeRefOrGetter<string | undefined>,
  targetId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'status', reviewType, targetId] as const,
    queryFn: async () => {
      const type = toValue(reviewType)
      const tid = toValue(targetId)
      if (!type || !tid) return null
      return await fetchGetReviewStatus(type, tid)
    },
    enabled: () => !!toValue(reviewType) && !!toValue(targetId),
    staleTime: 30 * 1000
  })
}

/** 待审核数量 */
export function usePendingReviewCount() {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending-count'] as const,
    queryFn: async () => {
      const res = await fetchGetPendingReviewCount()
      return typeof res === 'number' ? res : 0
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000
  })
}

/** 我的提交（分页） */
export function useMySubmissions(
  params?: MaybeRefOrGetter<Api.Review.ReviewSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'my-submissions', params] as const,
    queryFn: async () => {
      const res = await fetchGetMySubmissions(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 项目审核统计 */
export function useReviewStatistics(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      return await fetchGetReviewStatistics(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 驳回原因列表 */
export function useRejectReasons(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'reject-reasons', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      return await fetchGetRejectReasons(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 5 * 60 * 1000
  })
}

/** 审核路由配置 */
export function useReviewRouteConfig(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'route-config', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      return await fetchGetReviewRouteConfig(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 5 * 60 * 1000
  })
}

// ==================== 增删改 ====================

/** 创建审核任务 */
export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Review.CreateReviewParams) => fetchCreateReview(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'pending-count'] })
    }
  })
}

/** 认领审核 */
export function useClaimReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchClaimReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
    }
  })
}

/** 审核决策 */
export function useReviewDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Review.DecisionParams) => fetchReviewDecision(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'pending-count'] })
    }
  })
}

/** 批量审核决策 */
export function useBatchReviewDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Review.BatchDecisionParams) => fetchBatchReviewDecision(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'pending-count'] })
    }
  })
}

/** 撤回审核 */
export function useWithdrawReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchWithdrawReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
    }
  })
}

/** 归档审核 */
export function useArchiveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchArchiveReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
    }
  })
}

/** 指派审核 */
export function useDispatchReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchDispatchReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list'] })
    }
  })
}

/** 新增驳回原因 */
export function useAddRejectReason() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Review.RejectReasonParams }) =>
      fetchAddRejectReason(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'reject-reasons', variables.projectId] })
    }
  })
}

/** 删除驳回原因 */
export function useDeleteRejectReason() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; reasonId: string }) =>
      fetchDeleteRejectReason(payload.projectId, payload.reasonId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'reject-reasons', variables.projectId] })
    }
  })
}

/** 更新审核路由配置 */
export function useUpdateReviewRouteConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Review.RouteConfig }) =>
      fetchUpdateReviewRouteConfig(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'route-config', variables.projectId] })
    }
  })
}

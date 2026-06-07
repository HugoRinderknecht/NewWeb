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

import { reviewKeys } from './keys'

// ==================== 查询 ====================

/** 审核任务列表（分页） */
export function useReviewList(
  params?: MaybeRefOrGetter<Api.Review.ReviewSearchParams | undefined>
) {
  return useQuery({
    queryKey: reviewKeys.list(params),
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
    queryKey: reviewKeys.items(params),
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
    queryKey: reviewKeys.detail(id),
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
    queryKey: reviewKeys.status(reviewType, targetId),
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
    queryKey: reviewKeys.pendingCount(),
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
    queryKey: reviewKeys.mySubmissions(params),
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
    queryKey: reviewKeys.statistics(projectId),
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
    queryKey: reviewKeys.rejectReasons(projectId),
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
    queryKey: reviewKeys.routeConfig(projectId),
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
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reviewKeys.pendingCount() })
    }
  })
}

/** 认领审核 */
export function useClaimReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchClaimReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
    }
  })
}

/** 审核决策 */
export function useReviewDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Review.DecisionParams) => fetchReviewDecision(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reviewKeys.pendingCount() })
    }
  })
}

/** 批量审核决策 */
export function useBatchReviewDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Review.BatchDecisionParams) => fetchBatchReviewDecision(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reviewKeys.pendingCount() })
    }
  })
}

/** 撤回审核 */
export function useWithdrawReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchWithdrawReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
    }
  })
}

/** 归档审核 */
export function useArchiveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchArchiveReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
    }
  })
}

/** 指派审核 */
export function useDispatchReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchDispatchReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
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
      queryClient.invalidateQueries({ queryKey: reviewKeys.rejectReasons(variables.projectId) })
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
      queryClient.invalidateQueries({ queryKey: reviewKeys.rejectReasons(variables.projectId) })
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
      queryClient.invalidateQueries({ queryKey: reviewKeys.routeConfig(variables.projectId) })
    }
  })
}
